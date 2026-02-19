import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';

/**
 * 화상 상담 페이지
 * - 상담 내용: cnsl_reg (cnsl_title, cnsl_content, cnsl_start_time)
 * - 예약자(USER) 화면: 상대방 = "상담사" (cnsler_reg.cnsler_id → member)
 * - SYSTEM(상담사) 화면: 상대방 = "상담자" (cnsler_reg.member_id → member)
 * - 상담자 정보: member (nickname, gender M/F→남성/여성, 나이 from birth, persona)
 * - 상담사 정보: member (nickname, profile)
 * - 채팅: 하단 분리, 예시 없음
 * - 통화 걸기(상담사만) / 통화 종료
 */
function calcAge(birth) {
  if (!birth) return null;
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age;
}

function formatGender(gender) {
  if (!gender) return '';
  const g = String(gender).toUpperCase();
  if (g === 'M') return '남성';
  if (g === 'F') return '여성';
  return gender;
}

function formatStartTime(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const VisualChat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // 접속자 구분: member 테이블의 role 사용. 이메일로 counselor/client 매칭 후 role 대조 → SYSTEM이면 상담사, USER면 상담자
  const currentUserEmail = (user?.email || '').trim().toLowerCase();
  const isSystem = (() => {
    if (!counselInfo || !currentUserEmail) return false;
    const counselorEmail = (counselInfo.counselor?.email || '').trim().toLowerCase();
    const clientEmail = (counselInfo.client?.email || '').trim().toLowerCase();
    if (counselorEmail === currentUserEmail) {
      return String(counselInfo.counselor?.role || '').toUpperCase() === 'SYSTEM';
    }
    if (clientEmail === currentUserEmail) {
      return String(counselInfo.client?.role || '').toUpperCase() === 'SYSTEM';
    }
    return false;
  })();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counselInfo, setCounselInfo] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [inCall, setInCall] = useState(false);
  const [recordingReady, setRecordingReady] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const localStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    if (!id) {
      setError('상담 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // cnsl_reg 한 테이블에 상담 정보 + cnsler_id(상담사), member_id(상담자) 포함
        const { data: cnslRow, error: cnslErr } = await supabase
          .from('cnsl_reg')
          .select('cnsl_id, cnsl_title, cnsl_content, cnsl_start_time, cnsler_id, member_id')
          .eq('cnsl_id', id)
          .maybeSingle();

        if (cnslErr) throw cnslErr;
        if (!cnslRow) {
          setError('해당 상담 정보가 없습니다.');
          setLoading(false);
          return;
        }

        if (!cnslRow.cnsler_id || !cnslRow.member_id) {
          setError('상담사/상담자 매칭 정보가 없습니다.');
          setLoading(false);
          return;
        }

        // cnsl_reg의 cnsler_id, member_id는 이메일 값 → member는 email로 조회, role로 상담사(SYSTEM)/상담자(USER) 구분
        const { data: members, error: memErr } = await supabase
          .from('member')
          .select('id, email, role, nickname, gender, birth, persona, profile')
          .in('email', [String(cnslRow.cnsler_id), String(cnslRow.member_id)]);

        if (memErr) throw memErr;

        const cnslerEmail = String(cnslRow.cnsler_id).trim().toLowerCase();
        const memberEmail = String(cnslRow.member_id).trim().toLowerCase();
        const counselor = members?.find((m) => (m.email || '').trim().toLowerCase() === cnslerEmail) || {};
        const client = members?.find((m) => (m.email || '').trim().toLowerCase() === memberEmail) || {};

        setCounselInfo({
          cnsl_id: cnslRow.cnsl_id,
          title: cnslRow.cnsl_title || '',
          content: cnslRow.cnsl_content || '',
          startedAt: formatStartTime(cnslRow.cnsl_start_time),
          startedAtRaw: cnslRow.cnsl_start_time,
          counselor: {
            id: counselor.id,
            email: counselor.email || cnslRow.cnsler_id || '',
            role: counselor.role ?? '',
            nickname: counselor.nickname || '',
            profile: counselor.profile || null,
          },
          client: {
            id: client.id,
            email: client.email || cnslRow.member_id || '',
            role: client.role ?? '',
            nickname: client.nickname || '',
            gender: formatGender(client.gender),
            age: calcAge(client.birth),
            persona: client.persona || '',
          },
        });
      } catch (e) {
        console.error('화상상담 데이터 로드 실패:', e);
        setError(e?.message || '데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setInCall(true);
      setRecordingReady(false);
      setRecordedBlob(null);
      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000,
      });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setRecordingReady(true);
      };
      recorder.start(1000);
    } catch (err) {
      console.error('미디어 장치 오류:', err);
      alert('카메라/마이크 접근을 허용해주세요.');
    }
  };

  const endCall = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setInCall(false);
  };

  const downloadRecording = () => {
    if (!recordedBlob || !counselInfo) return;
    const dateStr = (counselInfo.startedAtRaw || '').replace(/[\s.:]/g, '-') || '녹화';
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `화상상담_녹화_${dateStr}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;
    const senderRole = isSystem ? 'SYSTEM' : 'USER';
    const senderName = isSystem
      ? counselInfo?.counselor?.nickname
      : counselInfo?.client?.nickname;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: senderRole,
        senderName: senderName || (senderRole === 'SYSTEM' ? '상담사' : '상담자'),
        text: trimmed,
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
        로딩 중...
      </div>
    );
  }

  if (error || !counselInfo) {
    return (
      <div className="max-w-[1520px] mx-auto px-8 py-8">
        <p className="text-red-600">{error || '상담 정보가 없습니다.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  const oppositeLabel = isSystem ? '상담자' : '상담사';
  const oppositeInfo = isSystem ? counselInfo.client : counselInfo.counselor;

  const layout = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">화상 상담</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {inCall ? (
            <button
              type="button"
              onClick={endCall}
              className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              통화 종료
            </button>
          ) : isSystem ? (
            <button
              type="button"
              onClick={startCall}
              className="px-5 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition"
            >
              통화 걸기
            </button>
          ) : null}
          {inCall && (
            <span className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold">
              상담 진행 중
            </span>
          )}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            뒤로 가기
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        상담 시작: {counselInfo.startedAt}
      </p>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* 좌측: 상담 내용 + 상대방 정보 (상담자/상담사 구분) */}
        <div className="lg:w-[480px] xl:w-[520px] flex flex-col min-h-0 bg-white rounded-2xl shadow-lg p-6">
          <section className="mb-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-1">상담 내용</h2>
            <p className="font-medium text-gray-800">{counselInfo.title}</p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">
              {counselInfo.content || '(내용 없음)'}
            </p>
          </section>

          <section className="mb-4 pb-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              {oppositeLabel} 정보
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {!isSystem && counselInfo.counselor.profile && /^\s*(https?:\/\/|\/)/.test(String(counselInfo.counselor.profile)) ? (
                  <img
                    src={counselInfo.counselor.profile}
                    alt={counselInfo.counselor.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-bold">
                    {oppositeInfo.nickname?.slice(0, 1) || '?'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{oppositeInfo.nickname || '-'}</p>
                {isSystem && (
                  <p className="text-sm text-gray-600">
                    {counselInfo.client.gender}
                    {counselInfo.client.age != null && ` / ${counselInfo.client.age}세`}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 상담자 로그인 시: 상담사 정보 아래에 member.profile 내용(텍스트) */}
          {!isSystem && (
            <section className="mb-4 pb-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">상담사 프로필</h2>
              {counselInfo.counselor.profile && !/^\s*(https?:\/\/|\/)/.test(String(counselInfo.counselor.profile)) ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {counselInfo.counselor.profile}
                </p>
              ) : (
                <p className="text-sm text-gray-500">(프로필 이미지로만 등록된 경우)</p>
              )}
            </section>
          )}

          {isSystem && counselInfo.client.persona && (
            <section className="mb-4 pb-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">상담자 페르소나</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {counselInfo.client.persona}
              </p>
            </section>
          )}
        </div>

        {/* 우측: 화상 영역 + 통화 걸기/종료 */}
        <div className="flex-1 min-h-[280px] lg:min-h-0 bg-gray-900 rounded-2xl shadow-lg overflow-hidden relative flex flex-col">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!inCall && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80">
                <p className="text-lg">화상 통화 영역</p>
                {isSystem && (
                  <button
                    type="button"
                    onClick={startCall}
                    className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-semibold"
                  >
                    통화 걸기
                  </button>
                )}
                {!isSystem && (
                  <p className="mt-4 text-sm">상담사가 통화를 걸 때까지 기다려 주세요.</p>
                )}
              </div>
            )}
          </div>
          {inCall && (
            <div className="absolute right-4 bottom-4 w-[160px] h-[120px] lg:w-[240px] lg:h-[180px] rounded-xl overflow-hidden border-2 border-white shadow-xl bg-gray-700">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 하단: 통화 걸기(상담사·미연결 시) / 통화 종료(연결 시) + 녹화 다운로드 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center gap-3">
          {!inCall && isSystem && (
            <button
              type="button"
              onClick={startCall}
              className="px-6 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition"
            >
              통화 걸기
            </button>
          )}
          {inCall && (
            <button
              type="button"
              onClick={endCall}
              className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              통화 종료
            </button>
          )}
          <button
            type="button"
            onClick={downloadRecording}
            disabled={!recordingReady}
            className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-300 transition"
          >
            녹화 다운로드
          </button>
        </div>
      </div>

      {/* 채팅: 하단 분리 */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col min-h-0" style={{ minHeight: '200px' }}>
        <div className="px-4 py-2 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">채팅</h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 p-4 min-h-[160px] max-h-[280px]">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">메시지를 입력해 보내주세요.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === (isSystem ? 'SYSTEM' : 'USER') ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    msg.sender === (isSystem ? 'SYSTEM' : 'USER')
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-xs font-semibold opacity-90">{msg.senderName}</p>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-80">{msg.time}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4 border-t border-gray-100">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="메시지를 입력하세요"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
            aria-label="전송"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] px-4 py-4">
        <div className="max-w-[358px] mx-auto flex flex-col min-h-[calc(100vh-2rem)]">{layout}</div>
      </div>
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-8 flex flex-col min-h-screen">{layout}</div>
      </div>
    </>
  );
};

export default VisualChat;
