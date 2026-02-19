import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import counselors from './counselorData';

// TODO: DB 연동 가이드
// 이 페이지는 상담사와의 1:1 채팅 화면입니다
//
// DB 연동 시 필요한 작업:
// 1. 예약 정보 및 상담사 정보 조회
//    - API: GET /api/counselors/:counselorId
//    - API: GET /api/reservations/:userId/counselor/:counselorId
//
// 2. 채팅 세션 시작/재개
//    - API: POST /api/chat/counselor/sessions
//    - 요청: { counselorId, userId, reservationId }
//    - 응답: { sessionId, status }
//
// 3. 이전 채팅 기록 불러오기
//    - API: GET /api/chat/counselor/sessions/:sessionId/messages
//
// 4. WebSocket 연결 (실시간 메시지)
//    - ws://your-domain/api/chat/counselor/:sessionId
//    - 이벤트: message, typing, read

const CounselorChat = () => {
  const { c_id } = useParams();

  // TODO: DB 연동 시 counselors를 API로 조회
  const counselor = useMemo(() => counselors.find((item) => item.id === c_id), [c_id]);

  const [input, setInput] = useState('');

  // TODO: DB 연동 시 초기 메시지를 API로 불러오기
  const [messages, setMessages] = useState(() => [
    {
      id: 'c-1',
      role: 'counselor',
      text: '안녕하세요. 예약해주셔서 감사합니다. 어떤 고민이 있으신가요?',
    },
  ]);
  const endRef = useRef(null);

  const cannedReplies = useMemo(
    () => [
      '말씀해주신 내용을 조금 더 구체적으로 알려주실 수 있을까요?',
      '그 상황에서 가장 힘들었던 감정은 무엇이었나요?',
      '지금 할 수 있는 작은 행동부터 같이 정해볼까요?',
      '최근 비슷한 상황이 반복된 적이 있었나요?',
    ],
    []
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  if (!counselor) {
    return (
      <>
        {/* MOBILE */}
        <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white pb-[90px]">
          <header className="bg-[#2f80ed] h-16 flex items-center justify-center text-white font-bold text-lg">
            상담 채팅
          </header>
          <main className="px-[18px] pt-6 text-center text-[14px] text-[#6b7280]">
            상담사 정보를 찾을 수 없습니다.
            <div className="mt-4">
              <Link to="/chat/counselor" className="text-[#2f80ed] font-semibold">
                상담사 목록으로
              </Link>
            </div>
          </main>
        </div>

        {/* PC */}
        <div className="hidden lg:flex w-full min-h-screen bg-[#f3f7ff] items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">상담사 정보를 찾을 수 없습니다</h2>
            <Link to="/chat/counselor" className="text-[#2f80ed] text-lg font-semibold hover:underline">
              상담사 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleSend = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // TODO: DB 연동 시 API 호출로 대체
    // const handleSend = async (event) => {
    //   event.preventDefault();
    //   const trimmed = input.trim();
    //   if (!trimmed) return;
    //
    //   try {
    //     // 사용자 메시지 즉시 표시
    //     const tempUserMessage = {
    //       id: `temp-${Date.now()}`,
    //       role: 'user',
    //       text: trimmed,
    //       status: 'sending'
    //     };
    //     setMessages(prev => [...prev, tempUserMessage]);
    //     setInput('');
    //
    //     // WebSocket으로 메시지 전송 (또는 HTTP API)
    //     const response = await fetch(`/api/chat/counselor/sessions/${sessionId}/messages`, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         message: trimmed,
    //         senderId: user.id,
    //         timestamp: new Date().toISOString()
    //       })
    //     });
    //
    //     const { message } = await response.json();
    //
    //     // 임시 메시지를 실제 메시지로 교체
    //     setMessages(prev => [
    //       ...prev.filter(m => m.id !== tempUserMessage.id),
    //       message
    //     ]);
    //
    //     // 상담사의 응답은 WebSocket을 통해 실시간으로 수신
    //   } catch (error) {
    //     console.error('메시지 전송 실패:', error);
    //     alert('메시지 전송에 실패했습니다.');
    //   }
    // };

    const nextUser = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    const reply =
      trimmed.includes('?') || trimmed.length > 15
        ? '좋아요. 그 부분을 중심으로 함께 정리해볼게요. 최근에 가장 비슷했던 상황이 있었나요?'
        : cannedReplies[Math.floor(Math.random() * cannedReplies.length)];
    const nextCounselor = { id: `c-${Date.now() + 1}`, role: 'counselor', text: reply };

    setMessages((prev) => [...prev, nextUser, nextCounselor]);
    setInput('');
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex flex-col">
        <header className="bg-[#2f80ed] h-16 flex items-center justify-center text-white font-bold text-lg">
          {counselor.name} 상담
        </header>

        <main className="px-[18px] pt-4 flex-1 overflow-y-auto pb-[132px]">
          <div className="flex flex-col gap-3 pb-6">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col gap-1">
                <p className={`text-[11px] text-[#6b7280] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.role === 'user' ? '나' : counselor.name}
                </p>
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-[16px] px-3 py-2 text-[13px] leading-5 border ${
                      message.role === 'user'
                        ? 'bg-[#e9f7ff] border-[#b8dcff] text-[#1d4ed8]'
                        : 'bg-[#eef2ff] border-[#c7d2fe] text-[#1e3a8a]'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={endRef} className="scroll-mb-[132px]" />
          </div>
        </main>

        <form
          onSubmit={handleSend}
          className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-[18px] pb-4 bg-white border-t border-[#e5e7eb]"
        >
          <div className="flex items-center gap-2 pt-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="메시지를 입력하세요"
              className="flex-1 h-10 rounded-[12px] border border-[#dbe3f1] px-3 text-[13px] bg-white"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-[12px] bg-[#2f80ed] text-white text-[13px] font-semibold"
            >
              전송
            </button>
          </div>
        </form>
      </div>

      {/* PC */}
      <div className="hidden lg:flex w-full min-h-screen bg-[#f3f7ff]">
        <div className="w-full max-w-[1520px] mx-auto flex flex-col">
          {/* HEADER */}
          <header className="bg-gradient-to-r from-[#2f80ed] to-[#1d4ed8] h-20 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {counselor.name.slice(0, 1)}
              </div>
              <div className="flex flex-col items-start">
                <span>{counselor.name} 상담사</span>
                <span className="text-sm font-normal opacity-90">{counselor.tags.join(' · ')}</span>
              </div>
            </div>
          </header>

          {/* CHAT CONTAINER */}
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="w-full max-w-[1400px] h-[800px] bg-white rounded-3xl shadow-2xl flex flex-col mx-8">
              {/* CHAT HEADER */}
              <div className="bg-gradient-to-r from-[#eef2ff] to-[#e0e7ff] py-6 px-8 rounded-t-3xl border-b-2 border-[#2f80ed]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e9efff] to-[#d1e0ff] flex items-center justify-center text-[#2f80ed] font-bold text-2xl shadow-md">
                      {counselor.name.slice(0, 1)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-1">{counselor.name} 상담사</h2>
                      <p className="text-sm text-gray-600">{counselor.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-medium text-blue-700">상담 진행 중</span>
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
              <main className="flex-1 overflow-y-auto px-12 py-8 bg-gradient-to-b from-gray-50 to-white">
                <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-2">
                      <p
                        className={`text-sm font-medium text-gray-600 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {message.role === 'user' ? '👤 나' : `👨‍⚕️ ${counselor.name}`}
                      </p>
                      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-6 py-4 text-base leading-relaxed shadow-md ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-[#e9f7ff] to-[#dbeafe] border-2 border-[#2f80ed]/30 text-[#1d4ed8]'
                              : 'bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] border-2 border-[#6366f1]/30 text-[#1e3a8a]'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
              </main>

              {/* INPUT FORM */}
              <form onSubmit={handleSend} className="px-12 py-6 bg-white border-t-2 border-gray-100 rounded-b-3xl">
                <div className="flex items-center gap-4 max-w-[1100px] mx-auto">
                  <input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 h-14 rounded-xl border-2 border-gray-300 px-6 text-base bg-white focus:outline-none focus:border-[#2f80ed] transition-colors placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="h-14 px-10 rounded-xl bg-gradient-to-r from-[#2f80ed] to-[#1d4ed8] text-white text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    전송
                  </button>
                </div>
                <p className="text-sm text-gray-500 text-center mt-3">
                  전문 상담사와의 1:1 상담입니다. 편안하게 대화해주세요.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CounselorChat;
