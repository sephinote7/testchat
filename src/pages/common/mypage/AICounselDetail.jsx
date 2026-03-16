import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getCnslDetail, getAiChatMessages } from '../../../api/myCnslDetail';
import useAuth from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';

/** API 메시지 형식(speaker, text, timestamp) → UI 형식(sender, message, time) */
function toDisplayMessages(content) {
  if (!Array.isArray(content)) return [];
  return content.map((item, i) => {
    const d = item.timestamp ? new Date(item.timestamp) : null;
    const timeStr = d
      ? d.toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : '';
    return {
      id: `msg-${item.timestamp ?? i}`,
      sender: item.speaker === 'user' ? 'user' : 'ai',
      message: item.text ?? '',
      time: timeStr,
    };
  });
}

const AICounselDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken: token } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [headerInfo, setHeaderInfo] = useState(null); // { title, date, status }
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        let detailRes = await getCnslDetail(Number(id)).catch(() => null);
        // Spring 404 시 Supabase cnsl_reg에서 상세 보완
        if (!detailRes) {
          const { data: regRow } = await supabase
            .from('cnsl_reg')
            .select('cnsl_id, cnsl_title, cnsl_stat, created_at')
            .eq('cnsl_id', Number(id))
            .maybeSingle();
          if (regRow) {
            detailRes = {
              cnsl_title: regRow.cnsl_title,
              created_at: regRow.created_at,
              cnsl_stat: regRow.cnsl_stat,
            };
          }
        }
        const content = await getAiChatMessages(Number(id)).catch(() => []);
        if (cancelled) return;
        const title =
          detailRes?.cnsl_title ?? detailRes?.cnslTitle ?? 'AI 상담 내역';
        const createdAt = detailRes?.created_at ?? detailRes?.createdAt;
        const dateStr = createdAt
          ? new Date(createdAt)
              .toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\. /g, '.')
              .replace(/\.$/, '')
          : '';
        const stat = detailRes?.cnsl_stat ?? detailRes?.cnslStat ?? '';
        const status =
          typeof stat === 'string'
            ? stat
            : stat === 'C'
              ? '상담 중'
              : stat === 'D'
                ? '상담 완료'
                : '';
        setHeaderInfo({ title, date: dateStr, status });
        setMessages(toDisplayMessages(Array.isArray(content) ? content : []));
      } catch (e) {
        if (!cancelled) {
          setLoadError(e?.message || '상담 내용을 불러올 수 없습니다.');
          setMessages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const scrollToBottom = () => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage('');
    }
  };

  const handleCompleteCounsel = () => {
    alert('상담이 완료되었습니다.');
    navigate('/mypage/clist');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f7ff] flex items-center justify-center">
        <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="min-h-screen bg-[#f3f7ff] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-600 text-center">{loadError}</p>
        <button
          type="button"
          onClick={() => navigate('/mypage/clist')}
          className="px-6 py-2 bg-[#2563eb] text-white rounded-xl"
        >
          목록으로
        </button>
      </div>
    );
  }

  const title = headerInfo?.title ?? 'AI 상담 내역';
  const date = headerInfo?.date ?? '';
  const status = headerInfo?.status ?? '';

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] mx-auto bg-[#f3f7ff] fixed inset-0 flex flex-col">
        {/* HEADER */}
        <header className="bg-[#2563eb] h-14 flex items-center justify-center px-5 relative flex-shrink-0">
          <Link
            to="/mypage/clist"
            className="absolute left-5 text-white text-xl"
          >
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
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>

        {/* CHAT MESSAGES - 스크롤 가능한 영역 */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-2"
          style={{ minHeight: 0 }}
        >
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                저장된 대화 내용이 없습니다.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="flex items-center gap-2 mb-2 ml-1">
                        <div className="w-7 h-7 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
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
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex-shrink-0 bg-white border-t">
          {status === '상담 중' ? (
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
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[30px] font-semibold text-gray-800">{title}</h1>
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
                  <svg
                    className="w-6 h-6 text-[#2ed3c6]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <span className="text-white font-bold text-xl">
                  AI 상담사 순삭이
                </span>
              </div>
              <p className="text-white text-base">
                오늘은 어떤 고민이 있으신가요
              </p>
            </div>

            {/* MESSAGES AREA */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-8 bg-[#f9fafb]"
              style={{ minHeight: 0 }}
            >
              <div className="max-w-[1200px] mx-auto space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    저장된 대화 내용이 없습니다.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`relative px-6 py-4 shadow-sm ${
                            msg.sender === 'user'
                              ? 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-br-sm'
                              : 'bg-[#2ed3c6] text-white rounded-2xl rounded-tl-sm'
                          }`}
                        >
                          <p className="text-base leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 mt-2 px-2">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* INPUT AREA */}
            {status === '상담 중' && (
              <div className="flex-shrink-0 bg-white border-t p-6">
                <div className="max-w-[1200px] mx-auto">
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && handleSendMessage()
                      }
                      placeholder="그 외 문의"
                      className="flex-1 h-14 px-6 bg-white border border-gray-300 rounded-full text-base focus:outline-none focus:border-[#2ed3c6]"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="w-14 h-14 bg-[#2ed3c6] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#26bfb3] transition-colors"
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
