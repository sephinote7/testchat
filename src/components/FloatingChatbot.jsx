import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const FloatingChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'chat', 'settings'
  const [chatHistory, setChatHistory] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aiStyle, setAiStyle] = useState('empathetic'); // 'realistic' or 'empathetic'
  
  const navigate = useNavigate();

  // USER 역할이 아니면 챗봇 표시하지 않음
  if (user.role !== 'USER') {
    return null;
  }

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setCurrentView('home');
    }
  };

  const handleCategoryClick = (category) => {
    let botResponse = '';
    let links = [];

    switch (category) {
      case 'resume':
        botResponse = '이력서/자소서 가이드로 안내합니다...';
        links = [
          { label: 'INFO 링크', path: '/info' },
          { label: '이력서 가이드', path: '/info/d_guide' },
          { label: '자소서 가이드', path: '/info/cover_guide' }
        ];
        break;
      case 'signup':
        botResponse = '회원가입 페이지로 이동합니다...';
        links = [
          { label: '로그인 페이지 링크', path: '/member/signin' },
          { label: '회원가입', path: '/member/signup' }
        ];
        break;
      case 'counseling':
        botResponse = '상담사 찾기 페이지로 이동합니다...';
        links = [
          { label: '상담사 페이지 링크', path: '/chat/counselor' },
          { label: 'AI 상담', path: '/chat/withai' },
          { label: '전화 상담', path: '/chat/counselor' }
        ];
        break;
      default:
        break;
    }

    const newMessage = {
      type: 'bot',
      text: botResponse,
      links: links,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    // 이전 대화 내역을 지우고 새로운 메시지만 표시
    setChatHistory([newMessage]);
    setCurrentView('chat');
  };

  const handleLinkClick = (path) => {
    navigate(path);
    setIsOpen(false);
    setChatHistory([]);
    setCurrentView('home');
  };

  const handleResetChat = () => {
    setChatHistory([]);
    setCurrentView('home');
  };

  const handleSaveSettings = () => {
    // TODO: 설정 저장 로직
    alert('설정이 저장되었습니다.');
    setCurrentView('home');
  };

  // 홈 화면
  const renderHome = () => (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <img src="/logo.png" alt="고민순삭" className="w-8 h-8" onError={(e) => e.target.style.display = 'none'} />
        <h2 className="text-lg font-bold text-gray-800">고민순삭 도우미</h2>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* 봇 메시지 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-start gap-2 mb-3">
            <div className="w-8 h-8 bg-[#2f80ed] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-600">고민순삭 도우미</span>
          </div>
          <p className="text-sm text-gray-800 mb-3">
            안녕하세요, 고민순삭 도우미입니다.
            <br />
            무엇을 도와드릴까요?
          </p>
          
          {/* 버튼들 */}
          <div className="space-y-2">
            <button
              onClick={() => handleCategoryClick('resume')}
              className="w-full px-4 py-2.5 text-sm font-medium text-[#2f80ed] bg-white border-2 border-[#2f80ed] rounded-xl hover:bg-blue-50 transition-colors"
            >
              이력서/자소서 가이드
            </button>
            <button
              onClick={() => handleCategoryClick('signup')}
              className="w-full px-4 py-2.5 text-sm font-medium text-[#2f80ed] bg-white border-2 border-[#2f80ed] rounded-xl hover:bg-blue-50 transition-colors"
            >
              회원가입관련
            </button>
            <button
              onClick={() => handleCategoryClick('counseling')}
              className="w-full px-4 py-2.5 text-sm font-medium text-[#2f80ed] bg-white border-2 border-[#2f80ed] rounded-xl hover:bg-blue-50 transition-colors"
            >
              상담관련
            </button>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-around p-4 border-t border-gray-200 bg-white rounded-b-3xl">
        <button
          onClick={() => setCurrentView('home')}
          className="flex flex-col items-center gap-1 text-[#2f80ed]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">홈</span>
        </button>
        <button
          onClick={() => setCurrentView('chat')}
          className="flex flex-col items-center gap-1 text-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs font-medium">채팅</span>
        </button>
        <button
          onClick={() => setCurrentView('settings')}
          className="flex flex-col items-center gap-1 text-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-medium">설정</span>
        </button>
      </div>
    </div>
  );

  // 채팅 화면
  const renderChat = () => (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <img src="/logo.png" alt="고민순삭" className="w-8 h-8" onError={(e) => e.target.style.display = 'none'} />
        <h2 className="text-lg font-bold text-gray-800">고민순삭 도우미</h2>
      </div>

      {/* 채팅 내역 */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">대화 내역이 없습니다</p>
          </div>
        ) : (
          chatHistory.map((message, index) => (
            <div key={index} className="space-y-3">
              {/* 봇 메시지 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-200">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 bg-[#2f80ed] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">고민순삭 도우미</span>
                </div>
                <p className="text-sm text-gray-800 mb-3">{message.text}</p>
                
                {message.links && message.links.length > 0 && (
                  <div className="space-y-2">
                    {message.links.map((link, linkIndex) => (
                      <button
                        key={linkIndex}
                        onClick={() => handleLinkClick(link.path)}
                        className="block w-full text-left px-3 py-2 text-sm text-[#2f80ed] hover:text-[#2670d4] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-around p-4 border-t border-gray-200 bg-white rounded-b-3xl">
        <button
          onClick={() => setCurrentView('home')}
          className="flex flex-col items-center gap-1 text-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">홈</span>
        </button>
        <button
          onClick={() => setCurrentView('chat')}
          className="flex flex-col items-center gap-1 text-[#2f80ed]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs font-medium">채팅</span>
        </button>
        <button
          onClick={() => setCurrentView('settings')}
          className="flex flex-col items-center gap-1 text-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-medium">설정</span>
        </button>
      </div>
    </div>
  );

  // 설정 화면
  const renderSettings = () => (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="bg-[#2f80ed] text-white p-4 rounded-t-3xl">
        <h2 className="text-xl font-bold">설정</h2>
      </div>

      {/* 설정 내용 */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* 대화 내역 초기화 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-800">대화 내역 초기화</span>
          </div>
          <button
            onClick={handleResetChat}
            className="px-4 py-1.5 text-sm text-[#2f80ed] border border-[#2f80ed] rounded-lg hover:bg-blue-50 transition-colors"
          >
            초기화
          </button>
        </div>

        {/* 알림 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-sm font-medium text-gray-800">알림</span>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notificationsEnabled ? 'bg-[#2ed3c6]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                notificationsEnabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        {/* AI 채팅 스타일 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium text-gray-800">AI 채팅 스타일</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAiStyle('realistic')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl border-2 transition-colors ${
                aiStyle === 'realistic'
                  ? 'bg-[#2f80ed] text-white border-[#2f80ed]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#2f80ed]'
              }`}
            >
              현실적인
            </button>
            <button
              onClick={() => setAiStyle('empathetic')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl border-2 transition-colors ${
                aiStyle === 'empathetic'
                  ? 'bg-[#2f80ed] text-white border-[#2f80ed]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#2f80ed]'
              }`}
            >
              공감하는
            </button>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setCurrentView('home')}
            className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSaveSettings}
            className="flex-1 px-6 py-3 text-sm font-medium text-white bg-[#2f80ed] rounded-xl hover:bg-[#2670d4] transition-colors"
          >
            저장
          </button>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-around p-4 border-t border-gray-200 bg-white rounded-b-3xl">
        <button
          onClick={() => setCurrentView('home')}
          className="flex flex-col items-center gap-1 text-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">홈</span>
        </button>
        <button
          onClick={() => setCurrentView('chat')}
          className="flex flex-col items-center gap-1 text-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs font-medium">채팅</span>
        </button>
        <button
          onClick={() => setCurrentView('settings')}
          className="flex flex-col items-center gap-1 text-[#2f80ed]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-medium">설정</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 hidden lg:block"
          onClick={toggleChatbot}
        />
      )}

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="fixed bottom-32 right-8 w-[420px] h-[600px] bg-gradient-to-b from-[#e8eef7] to-[#f3f7ff] rounded-3xl shadow-2xl z-50 hidden lg:block animate-slideUp">
          {currentView === 'home' && renderHome()}
          {currentView === 'chat' && renderChat()}
          {currentView === 'settings' && renderSettings()}
        </div>
      )}

      {/* 플로팅 버튼 */}
      <div className="fixed bottom-8 right-8 z-50 hidden lg:block">
        <button
          onClick={toggleChatbot}
          className={`w-20 h-20 rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
            isOpen
              ? 'bg-gray-600'
              : 'bg-[#2f80ed] hover:bg-[#2670d4] hover:scale-105'
          }`}
        >
          {isOpen ? (
            // X 아이콘 (닫기)
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // 홈 아이콘 + 텍스트
            <>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium text-white">홈</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default FloatingChatbot;
