import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// TODO: DB 연동 가이드
// 이 페이지는 상담사가 내담자와 1:1 채팅하는 화면입니다
//
// DB 연동 시 필요한 작업:
// 1. 내담자 정보 조회
//    - API: GET /api/counselors/me/clients/:clientId
//    - 응답: { id, name, mbti, age, gender, ... }
//
// 2. 상담 세션 정보 조회
//    - API: GET /api/counselors/me/counsels/client/:clientId/session
//    - 응답: { sessionId, counselId, status, ... }
//
// 3. 이전 채팅 기록 불러오기
//    - API: GET /api/counselors/me/counsels/:counselId/messages
//    - 응답: { messages: [...] }
//
// 4. WebSocket 연결 (실시간 메시지)
//    - ws://your-domain/api/chat/counselor/:counselId
//    - 이벤트: message, typing, read
//
// 5. 메시지 전송
//    - API: POST /api/counselors/me/counsels/:counselId/messages
//    - 요청: { message: string, senderType: 'counselor' }

const CounselorClientChat = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const messagesEndRef = useRef(null);

  // ========== 더미 데이터 시작 (DB 연동 시 아래 전체 삭제) ==========
  // 내담자 정보
  const [clientInfo] = useState({
    id: clientId,
    name: '임살미',
    mbti: 'ENFP',
    age: 28,
    gender: '여성',
  });

  // 채팅 메시지
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'counselor',
      senderName: '가을치',
      text: '안녕하세요 임살미님!\n#코인만담 #파이어족 되기 #워라밸잡기',
      time: '오전 4:06',
    },
    {
      id: 2,
      sender: 'client',
      senderName: '임살미',
      text: '안녕하세요 상담사님. 저 요즘 너무 힘들어요...',
      time: '오전 4:08',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  // ========== 더미 데이터 끝 (여기까지 삭제) ==========

  // TODO: DB 연동 시 useEffect로 채팅 기록 불러오기
  // useEffect(() => {
  //   const fetchChatHistory = async () => {
  //     try {
  //       const response = await fetch(`/api/counselors/me/counsels/client/${clientId}/messages`);
  //       const data = await response.json();
  //       setMessages(data.messages);
  //     } catch (error) {
  //       console.error('채팅 기록 불러오기 실패:', error);
  //     }
  //   };
  //   fetchChatHistory();
  // }, [clientId]);

  // TODO: DB 연동 시 WebSocket 연결
  // useEffect(() => {
  //   const ws = new WebSocket(`ws://your-domain/api/chat/counselor/${clientId}`);
  //
  //   ws.onmessage = (event) => {
  //     const newMessage = JSON.parse(event.data);
  //     setMessages((prev) => [...prev, newMessage]);
  //   };
  //
  //   return () => ws.close();
  // }, [clientId]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // TODO: DB 연동 시 API 호출
    // const response = await fetch(`/api/counselors/me/counsels/${counselId}/messages`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     message: inputMessage,
    //     senderType: 'counselor'
    //   })
    // });

    const newMessage = {
      id: messages.length + 1,
      sender: 'counselor',
      senderName: '가을치',
      text: inputMessage,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden min-h-screen bg-gray-50 flex flex-col">
        {/* 헤더 */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-lg">{clientInfo.name}님과의 상담</h1>
              <p className="text-xs text-blue-100">
                {clientInfo.mbti} · {clientInfo.gender} · {clientInfo.age}세
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-cyan-400 rounded-md text-xs font-semibold">진행중</div>
        </div>

        {/* 채팅 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'counselor' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] ${
                  msg.sender === 'counselor' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300'
                } rounded-lg p-3`}
              >
                <p className="text-xs font-semibold mb-1">{msg.senderName}</p>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'counselor' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* PC VERSION */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-8">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white p-6 rounded-t-3xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {clientInfo.name.slice(0, 1)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{clientInfo.name}님과의 상담</h1>
                  <p className="text-sm text-blue-100">
                    {clientInfo.mbti} · {clientInfo.gender} · {clientInfo.age}세
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-cyan-400 rounded-full">
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span className="text-base font-bold">상담 진행 중</span>
              </div>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="bg-white rounded-b-3xl shadow-xl flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto px-12 py-8 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'counselor' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[60%] ${
                      msg.sender === 'counselor' ? 'bg-blue-500 text-white' : 'bg-gray-100 border border-gray-200'
                    } rounded-2xl p-5`}
                  >
                    <p className="text-sm font-semibold mb-2">{msg.senderName}</p>
                    <p className="text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <p className={`text-sm mt-2 ${msg.sender === 'counselor' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="p-8 border-t bg-gray-50 rounded-b-3xl">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 border-2 border-gray-300 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white px-10 py-4 rounded-xl text-lg font-bold hover:shadow-xl transition-all transform hover:scale-105"
                >
                  전송
                </button>
              </div>
              <p className="text-sm text-gray-500 text-center mt-3">
                전문 상담사로서 내담자와 1:1 상담 중입니다. 신중하게 응답해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CounselorClientChat;
