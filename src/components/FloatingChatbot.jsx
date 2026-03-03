import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const DISCLAIMER_TEXT =
  "저희 고민순삭 어시스턴트 '순삭이'는 웹사이트를 기반으로 유용한 답변을 제공합니다. 그러나 때로는 부정확한 정보가 포함되거나 사람의 확인이 필요할 수 있습니다. 약속, 제안, 또는 협박을 할 권한이 없습니다. 중요한 문의사항에 대해선 정보를 확인하거나 고객 지원 팀에 문의해 주세요.";

// 고민순삭 홈페이지 이용 안내용 컨텍스트 (백엔드 @testchatpy 로 전달)
const SITE_CONTEXT = [
  '이 서비스는 고민순삭 홈페이지입니다. 취업, 커리어, 상담 관련 정보를 제공합니다.',
  '주요 메뉴: INFO(가이드), 회원가입/로그인, AI 상담(/chat/withai), 상담사 찾기(/chat/counselor), 1:1 상담 채팅(/chat/cnslchat/:id) 등이 있습니다.',
  '사용자는 상담사 목록에서 상담사를 선택하고 상세 프로필을 확인한 뒤, 텍스트 상담을 신청할 수 있습니다.',
  "순삭이는 고민순삭 홈페이지 이용 방법, 메뉴 위치, 기능 설명과 같이 사이트와 직접적으로 관련된 질문에만 답변해야 합니다.",
  '회사 정책, 법률, 건강, 금융 등 홈페이지와 직접적으로 관련 없는 주제에 대해서는 답변을 거절하고 고객센터나 공식 안내를 확인하도록 안내해야 합니다.',
];

const FloatingChatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isOpen]);

  const ensureIntroMessage = () => {
    if (messages.length > 0) return;

    const now = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setMessages([
      {
        id: `intro-${Date.now()}`,
        sender: 'bot',
        text: [
          '안녕하세요, 고민순삭 어시스턴트 순삭이입니다.',
          '고민순삭 홈페이지 이용 방법과 메뉴 위치 등 사이트 관련 질문에만 답변을 드릴 수 있어요.',
          '원하시는 내용을 아래에 자유롭게 입력해 주세요.',
        ].join(' '),
        timestamp: now,
        quickActions: [
          {
            label: '이력서/자소서 가이드 보기',
            path: '/info',
          },
          {
            label: '상담사 찾기',
            path: '/chat/counselor',
          },
          {
            label: 'AI 상담 바로가기',
            path: '/chat/withai',
          },
        ],
      },
    ]);
  };

  const openChat = () => {
    setIsOpen(true);
    ensureIntroMessage();
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const handleNavigateLink = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleQuickAction = (path, label) => {
    const now = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage = {
      id: `user-quick-${Date.now()}`,
      sender: 'user',
      text: `${label} 페이지로 이동할게요.`,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMessage]);
    handleNavigateLink(path);
  };

  const buildChatHistoryForBackend = (allMessages) =>
    allMessages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

  const buildSummaryText = (allMessages, answerText) => {
    const reversed = [...allMessages].reverse();
    const lastUser = reversed.find((m) => m.sender === 'user');
    const questionPart = lastUser ? `최근 질문: ${lastUser.text}` : '';
    const answerPart = answerText ? ` / 답변: ${answerText}` : '';
    const combined = `${questionPart}${answerPart}`.trim() || '고민순삭 챗봇 대화 기록';
    if (combined.length > 150) return `${combined.slice(0, 147)}...`;
    return combined;
  };

  const sendMessageToBackend = async (messageText, nextMessages) => {
    try {
      const endpoint =
        import.meta.env.VITE_TESTCHATPY_CHAT_ENDPOINT || '/api/testchatpy/chat';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          history: buildChatHistoryForBackend(nextMessages),
          siteContext: SITE_CONTEXT,
          source: 'gominsunsak-web',
        }),
      });

      let data;
      if (!response.ok) {
        let errorBody = null;
        try {
          errorBody = await response.json();
        } catch {
          // ignore
        }
        const detail =
          (errorBody && (errorBody.error || errorBody.message)) ||
          response.statusText ||
          'Unknown error';
        throw new Error(`챗봇 서버 응답 오류 (${response.status} ${detail})`);
      } else {
        data = await response.json();
      }
      const now = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const answer =
        data.answer ||
        '죄송합니다. 지금은 정확한 답변을 드리기 어렵습니다. 잠시 후 다시 시도해 주세요.';

      const nowMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: answer,
        timestamp: now,
      };

      // 로그인된 회원이면 bot_msg 테이블에 jsonb로 대화 저장
      if (user?.isLogin && user.email) {
        try {
          const conversationForSave = [...nextMessages, nowMessage];
          const summaryText = data.summary || buildSummaryText(conversationForSave, answer);

          await supabase.from('bot_msg').insert({
            member_id: user.email,
            msg_data: conversationForSave,
            summary: summaryText,
          });
        } catch (e) {
          // 저장 실패는 UI 흐름을 막지 않음
          console.warn('bot_msg 저장 실패:', e);
        }
      }

      setMessages((prev) => [
        ...prev,
        nowMessage,
      ]);
    } catch (error) {
      // 콘솔에는 구체적인 오류 로그 남김 (예: 405 Method Not Allowed)
      // eslint-disable-next-line no-console
      console.error('FloatingChatbot sendMessageToBackend error:', error);

      const now = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const detail =
        error instanceof Error && error.message
          ? ` (${error.message})`
          : '';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          sender: 'bot',
          text:
            '지금은 챗봇 서버와 통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요. 문제가 계속되면 고객 지원 팀에 문의해 주세요.' +
            detail,
          timestamp: now,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    const now = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: now,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue('');
    setIsSending(true);

    await sendMessageToBackend(trimmed, nextMessages);
  };

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-xs text-gray-400">
          아직 대화가 없습니다. 하단 입력창에 고민순삭 홈페이지 관련 질문을 입력해 보세요.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'bot' && (
              <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-main-02 text-[11px] font-semibold text-white">
                AI
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed shadow-sm sm:text-sm ${
                message.sender === 'user'
                  ? 'bg-white text-gray-800 border border-gray-200'
                  : 'bg-white text-gray-800 border border-main-02/30'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>

              {message.quickActions && message.quickActions.length > 0 && (
                <div className="mt-3 space-y-1">
                  {message.quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => handleQuickAction(action.path, action.label)}
                      className="block w-full rounded-lg bg-main-01 px-3 py-2 text-left text-[11px] font-medium text-main-02 hover:bg-main-02/10"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {message.timestamp && (
                <div className="mt-1 text-[10px] text-gray-400">
                  {message.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <>
      {/* 플로팅 챗봇 패널 (모바일 + PC 공통) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 sm:items-end sm:justify-end">
          {/* 모바일/태블릿: 하단 시트, PC: 우측 하단 카드 */}
          <div className="mb-0 w-full max-w-md px-3 sm:mb-8 sm:px-8">
            <div className="flex h-[860px] max-h-[calc(100vh-40px)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[600px] sm:max-h-[600px] sm:w-[390px]">
              {/* 상단 헤더 (파란색, X 버튼) */}
              <div className="flex h-[72px] items-center justify-between bg-main-02 px-4 text-white">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                    AI
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">고민순삭 어시스턴트 순삭이</span>
                    <span className="text-[10px] text-white/80">
                      고민순삭 홈페이지 이용을 도와드릴게요
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeChat}
                  aria-label="챗봇 닫기"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* 채팅 영역 */}
              <div className="flex-1 overflow-y-auto bg-main-01 px-3 py-3 text-[13px] text-gray-800 sm:h-[380px] sm:flex-none sm:px-4 sm:py-4 sm:text-sm">
                {renderMessages()}
              </div>

              {/* 입력 영역 + 고지 문구 */}
              <div className="border-t border-gray-200 bg-white px-3 py-2 sm:h-[148px] sm:flex-none sm:px-4 sm:py-3">
                <form
                  onSubmit={handleSubmit}
                  className="mb-2 flex h-[70px] items-end gap-2"
                >
                  <textarea
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="고민순삭 홈페이지 이용 관련 질문을 입력해 주세요."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    className="min-h-[40px] max-h-24 flex-1 resize-none overflow-y-auto rounded-xl border border-gray-300 px-3 py-2 text-[13px] leading-relaxed outline-none focus:border-main-02 focus:ring-1 focus:ring-main-02 sm:text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputValue.trim()}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors ${
                      isSending || !inputValue.trim()
                        ? 'bg-gray-300'
                        : 'bg-main-02 hover:bg-main-02/90'
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  </button>
                </form>
                <p className="text-[10px] leading-snug text-gray-500">
                  {DISCLAIMER_TEXT}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 (모바일 / PC 공통) */}
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-main-02 text-white shadow-xl transition-transform hover:scale-105 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
          aria-label="고민순삭 챗봇 열기"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5C21.0034 12.8199 20.6321 14.1152 19.93 15.24C19.0831 16.6514 17.7923 17.7365 16.2541 18.3078C14.7159 18.8791 13.0259 18.9026 11.4723 18.3741L7 20L8.10457 16.0523C7.41024 14.9044 7.03955 13.5755 7.037 12.22C7.037 8.497 9.962 5.5 13.5 5.5C15.2141 5.48777 16.8582 6.1511 18.0826 7.35914C19.307 8.56717 20.012 10.2251 20 11.94L21 11.5Z" />
          </svg>
        </button>
      )}
    </>
  );
};

export default FloatingChatbot;
