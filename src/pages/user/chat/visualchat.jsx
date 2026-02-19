import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

// TODO: DB 연동
// - 상담/예약 정보: GET /api/counsels/:id 또는 /api/reservations/:id
// - 상대방 정보: member 테이블 (nickname, mbti, persona, profile)
// - cnsler(SYSTEM)는 member.profile 참조, 이름은 member.nickname
// - WebRTC 시그널링 및 원격 스트림 연동

const VisualChat = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 예: /chat/visualchat/:id
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const isSystem = user?.role === 'COUNSELOR';

  // 더미: 상담 정보 (API 연동 시 sessionId로 조회 후 교체)
  const [counselInfo] = useState({
    title: '나너무많은일이있었어힘들다...',
    startedAt: '2026.01.14 16:00',
    // USER(예약자) 정보 - SYSTEM이 보는 상대, member 테이블 nickname/mbti/persona
    userInfo: {
      nickname: '임상미',
      mbti: 'ENFP',
      gender: '여성',
      age: 28,
      persona: '',
    },
    // SYSTEM(상담사) 정보 - USER가 보는 상대, member.profile 사용
    systemInfo: {
      nickname: '가물치',
      mbti: 'INTP',
      gender: '남성',
      age: 32,
      profile: '/counselor-profile.jpg',
      persona:
        '[web발신] 너는나를초혼해야한다나는발동도로9가야수많은케이드프로틀틀이올렸으므...',
    },
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'SYSTEM',
      senderName: '가물치',
      text: '요즘 너무 힘들고 무기력증이 심해서 많이 힘이 드네요',
      time: '16:10',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [inCall, setInCall] = useState(false);
  const [recordingReady, setRecordingReady] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const localStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const oppositeInfo = isSystem ? counselInfo.userInfo : counselInfo.systemInfo;

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
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `화상상담_녹화_${counselInfo.startedAt.replace(/[\s.:]/g, '-')}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;
    const senderName = isSystem ? counselInfo.systemInfo.nickname : counselInfo.userInfo.nickname;
    const senderRole = isSystem ? 'SYSTEM' : 'USER';
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: senderRole,
        senderName,
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

  const layout = (
    <>
      {/* 상단: 제목 + 상태 + 뒤로가기 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">화상 상담</h1>
        <div className="flex items-center gap-3">
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
      <p className="text-sm text-gray-500 mb-6">상담시작: {counselInfo.startedAt}</p>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* 좌측 패널: 상담 내용 + 상대방 정보 + 페르소나 + 채팅 */}
        <div className="lg:w-[480px] xl:w-[520px] flex flex-col min-h-0 bg-white rounded-2xl shadow-lg p-6">
          <section className="mb-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-1">상담 내용</h2>
            <p className="font-medium text-gray-800">{counselInfo.title}</p>
            <p className="text-xs text-gray-500 mt-1">예약자: {counselInfo.userInfo.nickname}</p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              상담 주제 및 배경에 대한 상세 텍스트가 표시됩니다. (API 연동 시 연동)
            </p>
          </section>

          <section className="mb-4 pb-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">상담자 정보</h2>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {oppositeInfo.profile ? (
                  <img
                    src={oppositeInfo.profile}
                    alt={oppositeInfo.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-bold">
                    {oppositeInfo.nickname?.slice(0, 1) || '?'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{oppositeInfo.nickname}</p>
                <p className="text-sm text-gray-600">MBTI {oppositeInfo.mbti}</p>
                <p className="text-sm text-gray-600">
                  {oppositeInfo.gender}/{oppositeInfo.age}세
                </p>
              </div>
            </div>
          </section>

          {oppositeInfo.persona && (
            <section className="mb-4 pb-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">상담자 페르소나</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {oppositeInfo.persona}
              </p>
            </section>
          )}

          {/* 채팅 영역 */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              {messages.map((msg) => (
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
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="그 외 문의는 어디서 해야하나요"
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
        </div>

        {/* 우측 패널: 화상 (상대 크게, 내 작게) */}
        <div className="flex-1 min-h-[280px] lg:min-h-0 bg-gray-900 rounded-2xl shadow-lg overflow-hidden relative flex flex-col">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            {/* 상대방(원격) 화면 - 크게 */}
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
                    통화 시작
                  </button>
                )}
                {!isSystem && (
                  <p className="mt-4 text-sm">상담사가 통화를 시작할 때까지 기다려 주세요.</p>
                )}
              </div>
            )}
          </div>
          {/* 내 화면 - 작게 오버레이 */}
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

      {/* 하단: 녹화 다운로드, 통화 종료 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
        <button
          type="button"
          onClick={downloadRecording}
          disabled={!recordingReady}
          className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-300 transition"
        >
          녹화 다운로드
        </button>
        {inCall && (
          <button
            type="button"
            onClick={endCall}
            className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            통화 종료
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* 모바일: 전체 폭 390, 콘텐츠 358 */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] px-4 py-4">
        <div className="max-w-[358px] mx-auto flex flex-col min-h-[calc(100vh-2rem)]">{layout}</div>
      </div>

      {/* PC: 전체 폭 1920, 콘텐츠 1520 */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-8 flex flex-col min-h-screen">{layout}</div>
      </div>
    </>
  );
};

export default VisualChat;
