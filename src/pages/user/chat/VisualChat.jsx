import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

// DB role → UI role 정규화: member / cnsler → USER / SYSTEM
function normalizeRole(rawRole) {
  if (!rawRole) return rawRole;
  const lower = rawRole.toLowerCase();

  if (lower === 'member') return 'USER';
  if (lower === 'cnsler' || lower === 'counselor') return 'SYSTEM';

  if (lower === 'user' || lower === 'system') {
    return lower.toUpperCase();
  }

  // 그 외 값들은 일단 대문자로만 노출
  return rawRole.toUpperCase();
}

// member row → UI에서 사용하기 좋은 형태로 매핑
function mapMemberRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    role: normalizeRole(row.role), // USER 또는 SYSTEM
    nickname: row.nickname,
    mbti: row.mbti,
    persona: row.persona,
    profile: row.profile,
  };
}

/**
 * 화상 상담 UI 페이지
 *
 * 라우트 예시:
 * <Route
 *   path="/chat/visualchat/:chatId"
 *   element={
 *     <ProtectedRoute allowRoles={['USER']}>
 *       <VisualChat />
 *     </ProtectedRoute>
 *   }
 * />
 *
 * - chat_msg 테이블의 chat_id를 URL 파라미터(chatId)로 사용
 * - 해당 row의 member_id / cnsler_id(이메일 문자열)를 기준으로
 *   로그인 사용자가 USER 인지 SYSTEM 인지 판별
 * - member 테이블의 email 컬럼을 기준으로 두 참여자의 정보를 조회하여
 *   USER / SYSTEM 각각의 정보를 UI에 표시
 */
const VisualChat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [other, setOther] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 채팅 ID 입력 및 통화/요약 상태
  const [chatIdInput, setChatIdInput] = useState(chatId || '');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoRefMobile = useRef(null);
  const videoRefPc = useRef(null);

  useEffect(() => {
    const init = async () => {
      if (!chatId) {
        setErrorMsg('유효하지 않은 상담방입니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        // 1) 현재 로그인한 사용자 정보 (Supabase Auth)
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setErrorMsg('로그인 정보가 없습니다. 다시 로그인해 주세요.');
          setLoading(false);
          return;
        }
        const currentEmail = user.email;

        // 2) chat_msg 에서 현재 채팅방 정보 조회
        const { data: chatRow, error: chatError } = await supabase
          .from('chat_msg')
          .select('chat_id, member_id, cnsler_id')
          .eq('chat_id', chatId)
          .single();

        if (chatError || !chatRow) {
          console.error('chat_msg 조회 실패', chatError);
          setErrorMsg('해당 상담방 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const { member_id, cnsler_id } = chatRow;

        // 3) 로그인 사용자가 이 상담방에 속해 있는지 확인 (이메일 기준)
        const isMemberSide = member_id === currentEmail;
        const isCnslerSide = cnsler_id === currentEmail;

        if (!isMemberSide && !isCnslerSide) {
          setErrorMsg('해당 상담방에 대한 접근 권한이 없습니다.');
          setLoading(false);
          return;
        }

        const partnerEmail = isMemberSide ? cnsler_id : member_id;

        // 4) member 테이블에서 두 참여자 정보 조회 (email 기준)
        const { data: memberRows, error: memberError } = await supabase
          .from('member')
          .select('id, email, role, nickname, mbti, persona, profile')
          .in('email', [currentEmail, partnerEmail]);

        if (memberError || !memberRows || memberRows.length < 2) {
          console.error('member 조회 실패', memberError);
          setErrorMsg('상담 참여자 정보를 불러오는 데 실패했습니다.');
          setLoading(false);
          return;
        }

        const myRow = memberRows.find((m) => m.email === currentEmail);
        const partnerRow = memberRows.find((m) => m.email === partnerEmail);

        if (!myRow || !partnerRow) {
          setErrorMsg('상담 참여자 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const meMapped = mapMemberRow(myRow);
        const otherMapped = mapMemberRow(partnerRow);

        // 5) 이 방에서의 최종 역할을 USER / SYSTEM 으로 강제 설정
        let finalMe = { ...meMapped };
        let finalOther = { ...otherMapped };

        if (isMemberSide) {
          // 로그인 사용자가 member_id → USER
          finalMe.role = 'USER';
          finalOther.role = 'SYSTEM';
        } else if (isCnslerSide) {
          // 로그인 사용자가 cnsler_id → SYSTEM
          finalMe.role = 'SYSTEM';
          finalOther.role = 'USER';
        }

        setMe(finalMe);
        setOther(finalOther);
      } catch (error) {
        console.error('VisualChat 초기화 오류', error);
        setErrorMsg('상담 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [chatId]);

  // URL 파라미터 변경 시 채팅 ID 입력값 동기화
  useEffect(() => {
    setChatIdInput(chatId || '');
  }, [chatId]);

  // 공통 로딩 / 에러 뷰
  if (loading) {
    return (
      <>
        {/* MOBILE */}
        <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex items-center justify-center">
          <p className="text-sm text-gray-500">상담 정보를 불러오는 중입니다...</p>
        </div>

        {/* PC */}
        <div className="hidden lg:flex w-full min-h-screen bg-main-01 items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl px-16 py-12 text-center">
            <p className="text-lg text-gray-600">상담 정보를 불러오는 중입니다...</p>
          </div>
        </div>
      </>
    );
  }

  if (errorMsg) {
    return (
      <>
        {/* MOBILE */}
        <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex items-center justify-center">
          <p className="text-sm text-red-500">{errorMsg}</p>
        </div>

        {/* PC */}
        <div className="hidden lg:flex w-full min-h-screen bg-main-01 items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl px-16 py-12 text-center">
            <p className="text-lg text-red-500">{errorMsg}</p>
          </div>
        </div>
      </>
    );
  }

  if (!me || !other) {
    return (
      <>
        {/* MOBILE */}
        <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex items-center justify-center">
          <p className="text-sm text-gray-500">상담 참여자 정보를 찾을 수 없습니다.</p>
        </div>

        {/* PC */}
        <div className="hidden lg:flex w-full min-h-screen bg-main-01 items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl px-16 py-12 text-center">
            <p className="text-lg text-gray-600">상담 참여자 정보를 찾을 수 없습니다.</p>
          </div>
        </div>
      </>
    );
  }

  const isMeUser = me.role === 'USER';
  const isMeSystem = me.role === 'SYSTEM';
  const userMember = isMeUser ? me : other;
  const systemMember = isMeUser ? other : me;
  const peer = isMeUser ? systemMember : userMember;
  const peerRoleLabel = isMeUser ? 'SYSTEM' : 'USER';

  const attachStreamToVideos = (stream) => {
    [videoRefMobile.current, videoRefPc.current].forEach((videoEl) => {
      if (videoEl) {
        // eslint-disable-next-line no-param-reassign
        videoEl.srcObject = stream;
        videoEl
          .play()
          .catch(() => {
            // autoplay 에러는 무시
          });
      }
    });
  };

  const handleStartCall = async () => {
    if (!isMeSystem || isCallActive) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setMediaStream(stream);
      setIsCallActive(true);
      setSummary('');
      setHasRecording(false);

      attachStreamToVideos(stream);

      if (typeof MediaRecorder !== 'undefined') {
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        recordedChunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = () => {
          setIsRecording(false);
          if (recordedChunksRef.current.length > 0) {
            setHasRecording(true);
          }
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      }
    } catch (error) {
      console.error('통화 시작 실패:', error);
      setErrorMsg('통화 시작 중 오류가 발생했습니다.');
      setIsCallActive(false);
      setIsRecording(false);
      setMediaStream(null);
    }
  };

  const handleEndCall = () => {
    if (!isCallActive) return;

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }

    setIsCallActive(false);
  };

  const handleSummarize = async () => {
    if (!hasRecording || recordedChunksRef.current.length === 0) {
      setSummary('녹화된 음성이 없습니다.');
      return;
    }

    try {
      setIsSummarizing(true);
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();

      if (isMeSystem) {
        formData.append('audio_cnsler', blob, 'cnsler.webm');
      } else {
        formData.append('audio_user', blob, 'user.webm');
      }

      const msgPayload = [
        {
          type: 'chat',
          speaker: isMeSystem ? 'cnsler' : 'user',
          text: '화상 상담 세션',
          timestamp: String(Date.now()),
        },
      ];
      formData.append('msg_data', JSON.stringify(msgPayload));

      const apiUrl = import.meta.env.VITE_SUMMARIZE_API_URL || 'http://localhost:8000/api/summarize';
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('요약 API 호출 실패');
      }

      const data = await response.json();
      setSummary(data.summary || '요약이 생성되었습니다.');
    } catch (error) {
      console.error('요약 생성 오류:', error);
      setSummary('요약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleChatIdConnect = () => {
    const trimmed = (chatIdInput || '').trim();
    if (!trimmed) return;
    navigate(`/chat/visualchat/${trimmed}`);
  };

  return (
    <>
      {/* MOBILE 레이아웃: 가로 390 기준, 컨텐츠 폭 358 근처 */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex flex-col">
        {/* 상단 헤더 */}
        <header className="bg-main-02 h-16 flex items-center justify-center text-white font-bold text-lg">
          화상 상담
        </header>

        {/* 메인: 채팅 ID 입력 + 상대 정보 + 영상 */}
        <main className="flex-1 flex flex-col px-[16px] pt-4 pb-24 gap-4">
          {/* 채팅 ID 연결 */}
          <section className="flex items-center gap-2">
            <input
              type="text"
              value={chatIdInput}
              onChange={(event) => setChatIdInput(event.target.value)}
              placeholder="채팅 ID를 입력하세요"
              className="flex-1 h-9 rounded-[10px] border border-[#dbe3f1] px-2 text-[12px] bg-white"
            />
            <button
              type="button"
              onClick={handleChatIdConnect}
              className="h-9 px-3 rounded-[10px] bg-main-02 text-white text-[12px] font-semibold"
            >
              연결
            </button>
          </section>

          {/* 상대 정보 + 영상 */}
          <section className="flex-1 flex flex-col gap-3">
            <h2 className="text-[13px] text-[#4b5563] font-semibold">
              {peerRoleLabel === 'SYSTEM' ? '상담사 정보' : '내담자 정보'}
            </h2>
            <div className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-[12px] text-[#374151]">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center justify-center px-2 py-[2px] rounded-full text-[10px] font-semibold ${
                    peerRoleLabel === 'SYSTEM'
                      ? 'bg-[#eef2ff] text-[#4f46e5]'
                      : 'bg-[#ecfdf5] text-[#047857]'
                  }`}
                >
                  {peerRoleLabel}
                </span>
                <span className="font-semibold text-[13px]">{peer.nickname}</span>
              </div>
              {peerRoleLabel === 'SYSTEM' && systemMember.profile && (
                <p className="mt-1 leading-relaxed whitespace-pre-line">{systemMember.profile}</p>
              )}
              {peerRoleLabel === 'USER' && (
                <>
                  {peer.mbti && (
                    <p className="text-[11px] text-[#6b7280] mb-1">MBTI: {peer.mbti}</p>
                  )}
                  {peer.persona && (
                    <p className="leading-relaxed whitespace-pre-line">{peer.persona}</p>
                  )}
                </>
              )}
            </div>

            <div className="w-full aspect-4/3 rounded-2xl bg-[#020617] flex items-center justify-center text-white text-sm overflow-hidden">
              <video
                ref={videoRefMobile}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            </div>
          </section>
        </main>

        {/* 하단 컨트롤 바: 모바일 Nav(하단 탭) 위에 오도록 bottom-14 사용 */}
        <footer className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pb-4">
          <div className="flex items-center justify-center gap-3 bg-white/90 backdrop-blur border border-[#e5e7eb] rounded-2xl px-4 py-3 shadow-lg">
            <button
              type="button"
              onClick={isCallActive ? handleEndCall : handleStartCall}
              disabled={!isMeSystem && !isCallActive}
              className={`flex-1 h-10 rounded-full text-[13px] font-semibold ${
                isCallActive
                  ? 'bg-[#ef4444] text-white'
                  : isMeSystem
                  ? 'bg-main-02 text-white'
                  : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
              }`}
            >
              {isCallActive ? '통화 종료' : '통화 시작'}
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-[#e5e7eb] text-[#111827] text-[12px] font-semibold"
            >
              Mic
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-[#e5e7eb] text-[#111827] text-[12px] font-semibold"
            >
              Cam
            </button>
          </div>
        </footer>
      </div>

      {/* PC 레이아웃: 가로 1920 기준, 컨텐츠 폭 1520 */}
      <div className="hidden lg:flex w-full min-h-screen bg-main-01">
        <div className="w-full max-w-[1520px] mx-auto flex flex-col">
          {/* 상단 헤더 영역 */}
          <header className="bg-linear-to-r from-main-02 to-[#1d4ed8] h-20 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            <div className="w-full max-w-[1400px] flex items-center justify-between px-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                  {peer.nickname?.slice(0, 1) || '상'}
                </div>
                <div className="flex flex-col">
                  <span>
                    {peer.nickname} {peerRoleLabel === 'SYSTEM' ? '상담사' : '내담자'}
                  </span>
                  <span className="text-sm font-normal opacity-90">
                    실시간 화상 상담이 진행 중입니다.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isCallActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                  }`}
                />
                <span className="text-sm font-medium text-blue-700">
                  {isCallActive ? '연결됨' : '대기 중'}
                </span>
              </div>
            </div>
          </header>

          {/* 채팅 ID 입력 영역 */}
          <div className="px-8 pt-4">
            <div className="w-full max-w-[1400px] mx-auto flex items-center gap-3">
              <input
                type="text"
                value={chatIdInput}
                onChange={(event) => setChatIdInput(event.target.value)}
                placeholder="채팅 ID를 입력하세요"
                className="flex-1 h-10 rounded-xl border border-gray-300 px-3 text-sm bg-white"
              />
              <button
                type="button"
                onClick={handleChatIdConnect}
                className="h-10 px-4 rounded-xl bg-main-02 text-white text-sm font-semibold shadow-sm"
              >
                연결
              </button>
            </div>
          </div>

          {/* 메인 컨텐츠: 상대 정보 + 영상 */}
          <main className="flex-1 flex items-center justify-center py-8">
            <div className="w-full max-w-[1400px] h-[760px] bg-white rounded-3xl shadow-2xl flex flex-col mx-8">
              {/* 상단 설명 영역 */}
              <div className="bg-linear-to-r from-[#eef2ff] to-[#e0e7ff] py-5 px-8 rounded-t-3xl border-b-2 border-main-02/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#e9efff] to-[#d1e0ff] flex items-center justify-center text-main-02 font-bold text-2xl shadow-md">
                      {peer.nickname?.slice(0, 1) || '상'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-1">
                        {peer.nickname} {peerRoleLabel === 'SYSTEM' ? '상담사' : '내담자'}
                      </h2>
                      {peerRoleLabel === 'SYSTEM' && systemMember.profile && (
                        <p className="text-sm text-gray-600 line-clamp-2">{systemMember.profile}</p>
                      )}
                      {peerRoleLabel === 'USER' && peer.persona && (
                        <p className="text-sm text-gray-600 line-clamp-2">{peer.persona}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 영상 + 정보 레이아웃 */}
              <section className="flex-1 grid grid-cols-2 gap-6 px-8 py-6 bg-linear-to-b from-gray-50 to-white">
                {/* 좌측: 상대 정보 */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-5 py-4 text-sm text-[#374151] shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold ${
                          peerRoleLabel === 'SYSTEM'
                            ? 'bg-[#eef2ff] text-[#4f46e5]'
                            : 'bg-[#ecfdf5] text-[#047857]'
                        }`}
                      >
                        {peerRoleLabel}
                      </span>
                      <span className="font-semibold text-[15px]">{peer.nickname}</span>
                    </div>
                    {peerRoleLabel === 'SYSTEM' && systemMember.profile && (
                      <p className="leading-relaxed whitespace-pre-line">{systemMember.profile}</p>
                    )}
                    {peerRoleLabel === 'USER' && (
                      <>
                        {peer.mbti && (
                          <p className="text-[12px] text-[#6b7280] mb-1">MBTI: {peer.mbti}</p>
                        )}
                        {peer.persona && (
                          <p className="leading-relaxed whitespace-pre-line">{peer.persona}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 우측: 화상 영상 */}
                <div className="flex flex-col gap-4">
                  <div className="flex-1 rounded-3xl bg-[#020617] flex items-center justify-center text-white text-lg overflow-hidden">
                    <video
                      ref={videoRefPc}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                  </div>
                </div>
              </section>

              {/* 하단 컨트롤 바 + AI 요약 */}
              <footer className="px-8 py-5 bg-white border-t-2 border-gray-100 rounded-b-3xl">
                <div className="flex flex-col gap-4 max-w-[900px] mx-auto">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={isCallActive ? handleEndCall : handleStartCall}
                      disabled={!isMeSystem && !isCallActive}
                      className={`flex-1 h-12 rounded-full text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${
                        isCallActive
                          ? 'bg-[#ef4444] text-white'
                          : isMeSystem
                          ? 'bg-main-02 text-white'
                          : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
                      }`}
                    >
                      {isCallActive ? '통화 종료' : '통화 시작'}
                    </button>
                    <button
                      type="button"
                      className="w-12 h-12 rounded-full bg-[#e5e7eb] text-[#111827] text-sm font-semibold shadow-sm hover:bg-[#d1d5db] transition-colors"
                    >
                      Mic
                    </button>
                    <button
                      type="button"
                      className="w-12 h-12 rounded-full bg-[#e5e7eb] text-[#111827] text-sm font-semibold shadow-sm hover:bg-[#d1d5db] transition-colors"
                    >
                      Cam
                    </button>
                  </div>

                  <div className="mt-2 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-5 py-4 text-sm text-[#374151]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">AI 상담 요약</h3>
                      <button
                        type="button"
                        onClick={handleSummarize}
                        disabled={!hasRecording || isSummarizing}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          hasRecording && !isSummarizing
                            ? 'bg-main-02 text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isSummarizing ? '요약 중...' : '요약 생성'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {summary
                        ? summary
                        : '통화 종료 후 녹음된 음성을 기반으로 AI 요약을 생성할 수 있습니다.'}
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default VisualChat;

