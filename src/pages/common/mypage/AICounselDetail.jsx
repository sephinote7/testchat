import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const AICounselDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // TODO: DB 연동 시 API 호출로 대체 필요
  // - AI 상담 상세 정보 조회: GET /api/counsels/ai/:id
  // - 메시지 전송: POST /api/counsels/ai/:id/messages
  // - 상담 완료: PUT /api/counsels/ai/:id/complete
  // - 상담 상태 값:
  //   * '상담 중' - 메시지 입력창 및 '상담 완료하기' 버튼 표시
  //   * '상담 완료' - 메시지만 표시 (입력 불가)

  // 더미 데이터 (id에 따라 다른 데이터)
  const getCounselDetail = (counselId) => {
    if (counselId === '1') {
      return {
        id: counselId,
        title: 'AI 상담사와의 상담 내용',
        date: '2026.01.12',
        status: '상담 완료',
        messages: [
          {
            id: 1,
            sender: 'ai',
            message:
              '안녕하세요, 트로스트 고객센터입니다\n어떠에서 회원 분들을 선택하세요.\n* 고객센터 운영시간 : 평일 10시-17시\n(점심시간 12시-13시 30분, 주말 및 공휴일 제외)',
            time: '오후 4:06',
          },
          {
            id: 2,
            sender: 'user',
            message: '명상 / ASMR',
            time: '오후 4:08',
          },
          {
            id: 3,
            sender: 'ai',
            message:
              '안녕하세요, 트로스트 고객센터입니다\n어떠에서 회원 분들을 선택하세요.\n* 고객센터 운영시간 : 평일 10시-17시\n(점심시간 12시-13시 30분, 주말 및 공휴일 제외)',
            time: '오후 4:06',
          },
          {
            id: 4,
            sender: 'user',
            message: '명상 / ASMR',
            time: '오후 4:08',
          },
          {
            id: 5,
            sender: 'ai',
            message:
              '안녕하세요, 트로스트 고객센터입니다\n어떠에서 회원 분들을 선택하세요.\n* 고객센터 운영시간 : 평일 10시-17시\n(점심시간 12시-13시 30분, 주말 및 공휴일 제외)',
            time: '오후 4:06',
          },
          {
            id: 6,
            sender: 'user',
            message: '명상 / ASMR',
            time: '오후 4:08',
          },
        ],
      };
    } else if (counselId === '2') {
      return {
        id: counselId,
        title: 'AI 상담사와의 상담',
        date: '2026.01.12',
        status: '상담 중',
        messages: [
          {
            id: 1,
            sender: 'ai',
            message:
              '안녕하세요, 트로스트 고객센터입니다\n어떠에서 회원 분들을 선택하세요.\n* 고객센터 운영시간 : 평일 10시-17시\n(점심시간 12시-13시 30분, 주말 및 공휴일 제외)',
            time: '오후 4:06',
          },
          {
            id: 2,
            sender: 'user',
            message: '명상 / ASMR',
            time: '오후 4:08',
          },
          {
            id: 3,
            sender: 'ai',
            message:
              '안녕하세요, 트로스트 고객센터입니다\n어떠에서 회원 분들을 선택하세요.\n* 고객센터 운영시간 : 평일 10시-17시\n(점심시간 12시-13시 30분, 주말 및 공휴일 제외)',
            time: '오후 4:06',
          },
        ],
      };
    } else {
      // 기본 데이터
      return {
        id: counselId,
        title: 'AI 상담사와의 상담 내용',
        date: '2026.01.12',
        status: '상담 완료',
        messages: [
          {
            id: 1,
            sender: 'ai',
            message: '안녕하세요! AI 상담사입니다. 무엇을 도와드릴까요?',
            time: '오후 2:00',
          },
          {
            id: 2,
            sender: 'user',
            message: '상담이 필요해서 연락드렸어요.',
            time: '오후 2:01',
          },
        ],
      };
    }
  };

  const counselDetail = getCounselDetail(id);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 메시지가 변경되면 스크롤 이동
  useEffect(() => {
    scrollToBottom();
  }, [counselDetail.messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // TODO: DB 연동 시 API 호출 추가
      // try {
      //   const response = await fetch(`/api/counsels/ai/${id}/messages`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       message: newMessage,
      //       userId: user.id,
      //       timestamp: new Date().toISOString()
      //     })
      //   });
      //   const aiResponse = await response.json();
      //   // AI 응답을 messages 배열에 추가
      //   setCounselDetail(prev => ({
      //     ...prev,
      //     messages: [...prev.messages, userMessage, aiResponse]
      //   }));
      // } catch (error) {
      //   console.error('메시지 전송 실패:', error);
      // }

      console.log('메시지 전송:', newMessage);
      setNewMessage('');
    }
  };

  const handleCompleteCounsel = () => {
    // TODO: DB 연동 시 API 호출 추가
    // try {
    //   await fetch(`/api/counsels/ai/${id}/complete`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       userId: user.id,
    //       completedAt: new Date().toISOString()
    //     })
    //   });
    // } catch (error) {
    //   console.error('상담 완료 실패:', error);
    //   return;
    // }

    alert('상담이 완료되었습니다.');
    navigate('/mypage/clist');
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] mx-auto bg-[#f3f7ff] fixed inset-0 flex flex-col">
        {/* HEADER */}
        <header className="bg-[#2563eb] h-14 flex items-center justify-center px-5 relative flex-shrink-0">
          <Link to="/mypage/clist" className="absolute left-5 text-white text-xl">
            ←
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#2563eb] font-bold text-sm">★</span>
            </div>
            <span className="text-white font-bold text-lg">고민순삭</span>
          </div>
        </header>

        {/* 뒤로가기 버튼 */}
        <div className="px-5 pt-4 pb-2 flex-shrink-0 bg-[#f3f7ff]">
          <Link
            to="/mypage/clist"
            className="inline-flex items-center gap-1 text-sm text-[#2563eb] border border-[#2563eb] px-3 py-1.5 rounded-lg bg-white"
          >
            <span>←</span>
            <span>뒤로가기</span>
          </Link>
        </div>

        {/* TITLE */}
        <div className="px-5 pb-3 flex-shrink-0 bg-[#f3f7ff]">
          <h1 className="text-xl font-bold text-gray-800">{counselDetail.title}</h1>
        </div>

        {/* CHAT MESSAGES - 스크롤 가능한 영역 */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-2" style={{ minHeight: 0 }}>
          <div className="space-y-4 pb-4">
            {counselDetail.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.sender === 'ai' && (
                    <div className="flex items-center gap-2 mb-2 ml-1">
                      <div className="w-7 h-7 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div
                    className={`relative px-4 py-3 shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-white text-gray-800 border border-gray-300 rounded-2xl rounded-br-sm'
                        : 'bg-[#2ed3c6] text-white rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex-shrink-0 bg-white border-t">
          {counselDetail.status === '상담 중' ? (
            // 상담 중일 때 - 입력창 (네비게이션 바 높이 56px 고려)
            <div className="px-4 py-3 pb-20">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="그 외 문의"
                  className="flex-1 h-12 px-4 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#2ed3c6]"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-12 h-12 bg-[#2ed3c6] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#26bfb3] transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          ) : (
            // 상담 완료일 때 - 하단 여백 (네비게이션 바 고려)
            <div className="h-20" />
          )}
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8 px-[200px]">
            <h1 className="text-[30px] font-semibold text-gray-800">{counselDetail.title}</h1>
            <button
              onClick={() => navigate('/mypage/clist')}
              className="px-8 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
            >
              뒤로 가기
            </button>
          </div>

          {/* CHAT CONTAINER */}
          <div className="w-[1520px] mx-auto bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-[800px]">
            {/* CHAT HEADER */}
            <div className="bg-[#2ed3c6] py-6 px-8 text-center flex-shrink-0">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#2ed3c6]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <span className="text-white font-bold text-xl">AI 상담사 순삭이(가칭)</span>
              </div>
              <p className="text-white text-base">오늘은 어떤 고민이 있으신가요</p>
            </div>

            {/* MESSAGES AREA */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 bg-[#f9fafb]" style={{ minHeight: 0 }}>
              <div className="max-w-[1200px] mx-auto space-y-6">
                {counselDetail.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`relative px-6 py-4 shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-br-sm'
                            : 'bg-[#2ed3c6] text-white rounded-2xl rounded-tl-sm'
                        }`}
                      >
                        <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-sm text-gray-500 mt-2 px-2">{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* INPUT AREA */}
            {counselDetail.status === '상담 중' && (
              <div className="flex-shrink-0 bg-white border-t p-6">
                <div className="max-w-[1200px] mx-auto">
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="그 외 문의"
                      className="flex-1 h-14 px-6 bg-white border border-gray-300 rounded-full text-base focus:outline-none focus:border-[#2ed3c6]"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="w-14 h-14 bg-[#2ed3c6] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#26bfb3] transition-colors"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCompleteCounsel}
                      className="px-12 py-3 bg-[#2563eb] text-white rounded-xl text-base font-normal hover:bg-[#1d4ed8] transition-colors"
                    >
                      상담 완료하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AICounselDetail;
