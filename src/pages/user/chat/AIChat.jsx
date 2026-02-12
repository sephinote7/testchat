import React, { useEffect, useMemo, useRef, useState } from 'react';

// TODO: DB 연동 가이드
// 이 페이지는 AI 상담 채팅 화면입니다
//
// DB 연동 시 필요한 작업:
// 1. 채팅 세션 시작
//    - API: POST /api/chat/ai/sessions
//    - 요청: { userId: string }
//    - 응답: { sessionId: string, createdAt: string }
//
// 2. 이전 채팅 기록 불러오기 (재접속 시)
//    - API: GET /api/chat/ai/sessions/:sessionId/messages
//    - 응답: { messages: [{ id, role, text, timestamp }] }
//
// 3. 메시지 전송 및 AI 응답 받기
//    - API: POST /api/chat/ai/sessions/:sessionId/messages
//    - 요청: {
//        message: string,
//        timestamp: string
//      }
//    - 응답: {
//        userMessage: { id, role: 'user', text, timestamp },
//        aiMessage: { id, role: 'ai', text, timestamp }
//      }
//
// 4. 채팅 종료
//    - API: PUT /api/chat/ai/sessions/:sessionId/complete
//    - 요청: { completedAt: string }
//
// 5. WebSocket 연결 (실시간 응답)
//    - URL: ws://your-domain/api/chat/ai/:sessionId
//    - 메시지 전송 후 실시간으로 AI 응답 수신

const AIChat = () => {
  const [input, setInput] = useState('');
  const [showStartModal, setShowStartModal] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // TODO: DB 연동 시 sessionId 저장 필요
  // const [sessionId, setSessionId] = useState(null);

  // TODO: DB 연동 시 초기 메시지를 빈 배열로 시작하고 API로 불러오기
  const [messages, setMessages] = useState([
    {
      id: 'ai-1',
      role: 'ai',
      text: '안녕하세요. 고민을 알려주시면 차근차근 함께 정리해드릴게요.',
    },
    {
      id: 'user-1',
      role: 'user',
      text: '오늘 하루 스트레스가 많았어요. 어떻게 정리하면 좋을까요?',
    },
    {
      id: 'ai-2',
      role: 'ai',
      text: '스트레스가 쌓인 원인을 하나씩 적어볼까요? 우선 오늘 가장 힘들었던 순간을 알려주세요.',
    },
  ]);
  const endRef = useRef(null);

  // TODO: DB 연동 시 세션 시작 및 이전 채팅 불러오기
  // useEffect(() => {
  //   const initChat = async () => {
  //     try {
  //       // 새 세션 시작 또는 기존 세션 복구
  //       const response = await fetch('/api/chat/ai/sessions', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ userId: user.id })
  //       });
  //       const { sessionId } = await response.json();
  //       setSessionId(sessionId);
  //
  //       // 이전 채팅 기록 불러오기
  //       const messagesResponse = await fetch(`/api/chat/ai/sessions/${sessionId}/messages`);
  //       const { messages } = await messagesResponse.json();
  //       setMessages(messages);
  //     } catch (error) {
  //       console.error('채팅 초기화 실패:', error);
  //     }
  //   };
  //   initChat();
  // }, []);

  const cannedReplies = useMemo(
    () => [
      '지금 느끼는 감정을 한 문장으로 표현해볼까요?',
      '가장 부담이 되는 부분을 먼저 골라보면 좋아요.',
      '오늘 있었던 일 중 마음이 무거웠던 순간을 알려주세요.',
      '지금 상황에서 내가 조절할 수 있는 것과 없는 것을 나눠볼까요?',
    ],
    []
  );

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
    //       sending: true
    //     };
    //     setMessages(prev => [...prev, tempUserMessage]);
    //     setInput('');
    //
    //     // API로 메시지 전송 및 AI 응답 받기
    //     const response = await fetch(`/api/chat/ai/sessions/${sessionId}/messages`, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         message: trimmed,
    //         timestamp: new Date().toISOString()
    //       })
    //     });
    //
    //     const { userMessage, aiMessage } = await response.json();
    //
    //     // 임시 메시지를 실제 메시지로 교체
    //     setMessages(prev => [
    //       ...prev.filter(m => m.id !== tempUserMessage.id),
    //       userMessage,
    //       aiMessage
    //     ]);
    //   } catch (error) {
    //     console.error('메시지 전송 실패:', error);
    //     alert('메시지 전송에 실패했습니다.');
    //   }
    // };

    const nextUserMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const replyText =
      trimmed.includes('?') || trimmed.length > 15
        ? '좋아요. 조금 더 구체적으로 어떤 상황이었는지 알려줄래요?'
        : cannedReplies[Math.floor(Math.random() * cannedReplies.length)];

    const nextAiMessage = {
      id: `ai-${Date.now() + 1}`,
      role: 'ai',
      text: replyText,
    };

    setMessages((prev) => [...prev, nextUserMessage, nextAiMessage]);
    setInput('');
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleStartChat = () => {
    if (!agreedToTerms) {
      alert('상기 내용을 확인해주세요.');
      return;
    }
    // TODO: DB 연동 시 포인트 차감 API 호출
    setShowStartModal(false);
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex flex-col">
        {/* 시작 모달 */}
        {showStartModal && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* 헤더 */}
            <header className="bg-[#2563eb] h-14 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <span className="text-white text-xl leading-none font-bold">★</span>
                <span className="text-white text-lg font-bold">고민순삭</span>
              </div>
            </header>

            {/* 컨텐츠 */}
            <div className="flex-1 bg-[#f3f7ff] px-6 py-8 flex flex-col items-center justify-start pt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">누구와 상담을 하고 싶으세요?</h2>

              {/* 모달 카드 */}
              <div className="w-full bg-white rounded-3xl shadow-xl p-6 mb-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 mb-4 flex items-center justify-center">
                    <div className="text-[#2ed3c6] text-5xl">💬</div>
                  </div>
                  <div className="text-center mb-2">
                    <p className="text-sm text-gray-600 mb-1">Healing Therapy</p>
                    <p className="text-2xl font-bold text-gray-800">고민순삭</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 text-center mb-4">꼭 확인해 주세요!</h3>
                <p className="text-sm text-gray-700 text-center leading-relaxed mb-6">
                  본 상담은 AI 상담사와 진행되며, 상담 시작 버튼을 누르면 즉시 포인트가 차감됩니다.
                </p>

                <label className="flex items-center justify-center gap-2 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 accent-[#ef4444]"
                  />
                  <span className="text-sm text-gray-700">상기 내용을 확인하였습니다</span>
                </label>

                <button
                  onClick={handleStartChat}
                  disabled={!agreedToTerms}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
                    agreedToTerms
                      ? 'bg-[#2563eb] hover:bg-[#1d4ed8]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  상담 시작
                </button>
              </div>

              {/* 하단 안내 문구 */}
              <div className="w-full space-y-3 text-center">
                <p className="text-xs text-gray-600">AI 상담 관련 향상 서비스</p>
                <p className="text-xs text-gray-500">고민, 커리어, 취업 까지 혼자 고민하지 마세요.</p>
                <p className="text-xs text-gray-500">* 고민순삭의 AI상담은 병원, 정신과적 진료가 아닐뿐더러 행동합니다.</p>
                <p className="text-xs text-gray-500">AI 상담은 참고용으로 제공되며,</p>
                <p className="text-xs text-gray-500">전문 상담사 개입이 **필요하다고 생각 경우 즉시 바랍니다.</p>
                <p className="text-xs text-gray-500 mt-4">© 2026 고민순삭 All rights reserved.</p>
              </div>
            </div>
          </div>
        )}
        <header className="bg-[#2ed3c6] h-16 flex items-center justify-center text-white font-bold text-lg">
          AI 상담
        </header>

        <main className="px-[18px] pt-4 flex-1 overflow-y-auto pb-[132px]">
          <div className="flex flex-col gap-3 pb-6">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col gap-1">
                <p className={`text-[11px] text-[#6b7280] ${message.role === 'ai' ? 'text-left' : 'text-right'}`}>
                  {message.role === 'ai' ? 'AI 상담사' : '사용자'}
                </p>
                <div className={`flex ${message.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[75%] rounded-[16px] px-3 py-2 text-[13px] leading-5 border ${
                      message.role === 'ai'
                        ? 'bg-[#f0fffd] border-[#b7f2ec] text-[#0f766e]'
                        : 'bg-[#e9f7ff] border-[#b8dcff] text-[#1d4ed8]'
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
              className="h-10 px-4 rounded-[12px] bg-[#2ed3c6] text-white text-[13px] font-semibold"
            >
              전송
            </button>
          </div>
        </form>
      </div>

      {/* PC */}
      <div className="hidden lg:flex w-full min-h-screen bg-[#f3f7ff]">
        {/* 시작 모달 */}
        {showStartModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl shadow-2xl max-w-[500px] w-full p-8">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 mb-4 flex items-center justify-center">
                  <div className="text-[#2ed3c6] text-6xl">💬</div>
                </div>
                <div className="text-center mb-2">
                  <p className="text-base text-gray-600 mb-1">Healing Therapy</p>
                  <p className="text-3xl font-bold text-gray-800">고민순삭</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">꼭 확인해 주세요!</h3>
              <p className="text-base text-gray-700 text-center leading-relaxed mb-8">
                본 상담은 AI 상담사와 진행되며, 상담 시작 버튼을 누르면 즉시 포인트가 차감됩니다.
              </p>

              <label className="flex items-center justify-center gap-3 mb-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-6 h-6 accent-[#ef4444]"
                />
                <span className="text-base text-gray-700">상기 내용을 확인하였습니다</span>
              </label>

              <button
                onClick={handleStartChat}
                disabled={!agreedToTerms}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
                  agreedToTerms
                    ? 'bg-[#2563eb] hover:bg-[#1d4ed8]'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                상담 시작
              </button>

              <div className="mt-6 space-y-2 text-center">
                <p className="text-xs text-gray-600">AI 상담 관련 향상 서비스</p>
                <p className="text-xs text-gray-500">고민, 커리어, 취업 까지 혼자 고민하지 마세요.</p>
                <p className="text-xs text-gray-500">* 고민순삭의 AI상담은 병원, 정신과적 진료가 아닙니다.</p>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-[1520px] mx-auto flex flex-col items-center">
          {/* HEADER */}
          <header className="w-full max-w-[1400px] bg-gradient-to-r from-[#2ed3c6] to-[#26b8ad] h-20 flex items-center justify-between px-8 text-white font-bold text-2xl shadow-lg rounded-t-3xl mt-12 mx-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <span>AI 상담</span>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-base font-normal transition-colors"
            >
              뒤로 가기
            </button>
          </header>

          {/* CHAT CONTAINER */}
          <div className="w-full max-w-[1400px] h-[800px] bg-white rounded-b-3xl shadow-2xl flex flex-col mx-8 mb-12">
              {/* CHAT HEADER */}
              <div className="bg-gradient-to-r from-[#f0fffd] to-[#e6fffe] py-6 px-8 border-b-2 border-[#2ed3c6]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">AI와 함께하는 상담</h2>
                    <p className="text-sm text-gray-600">편안하게 고민을 나눠보세요</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-green-700">상담 가능</span>
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
                          message.role === 'ai' ? 'text-left' : 'text-right'
                        }`}
                      >
                        {message.role === 'ai' ? '🤖 AI 상담사' : '👤 나'}
                      </p>
                      <div className={`flex ${message.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-6 py-4 text-base leading-relaxed shadow-md ${
                            message.role === 'ai'
                              ? 'bg-gradient-to-br from-[#f0fffd] to-[#e6fffe] border-2 border-[#2ed3c6]/30 text-[#0f766e]'
                              : 'bg-gradient-to-br from-[#e9f7ff] to-[#dbeafe] border-2 border-[#2f80ed]/30 text-[#1d4ed8]'
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
                    className="flex-1 h-14 rounded-xl border-2 border-gray-300 px-6 text-base bg-white focus:outline-none focus:border-[#2ed3c6] transition-colors placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="h-14 px-10 rounded-xl bg-gradient-to-r from-[#2ed3c6] to-[#26b8ad] text-white text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    전송
                  </button>
                </div>
                <p className="text-sm text-gray-500 text-center mt-3">AI는 학습 중이며, 답변이 부정확할 수 있습니다.</p>
              </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;
