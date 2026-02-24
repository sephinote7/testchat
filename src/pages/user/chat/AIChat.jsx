import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

// AI 상담: testchatpy API 연동. /chat/withai 또는 /chat/withai/:cnslId
// GET/POST 반환: msg_data.content 배열 (speaker, text, type, timestamp)

const AI_CHAT_API_BASE = (import.meta.env.VITE_AI_CHAT_API_URL || import.meta.env.VITE_SUMMARY_API_URL || 'https://testchatpy.onrender.com').replace(/\/$/, '');

function msgDataContentToMessages(content) {
  if (!Array.isArray(content)) return [];
  return content.map((item, i) => ({
    id: `msg-${item.timestamp ?? i}`,
    role: item.speaker === 'user' ? 'user' : 'ai',
    text: item.text ?? '',
  }));
}

const AIChat = () => {
  const navigate = useNavigate();
  const { cnslId: urlCnslId } = useParams();
  const cnslId = urlCnslId ? Number(urlCnslId) : null;
  const [input, setInput] = useState('');
  const [showStartModal, setShowStartModal] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loadingChat, setLoadingChat] = useState(!!cnslId);
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);

  const useAiApi = Boolean(cnslId && AI_CHAT_API_BASE);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    })();
  }, []);

  useEffect(() => {
    if (!cnslId || !AI_CHAT_API_BASE || !userEmail) {
      if (cnslId && AI_CHAT_API_BASE && !userEmail) setLoadingChat(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${AI_CHAT_API_BASE}/api/ai/chat/${cnslId}`, {
          headers: { 'X-User-Email': userEmail },
        });
        if (!res.ok) {
          setLoadingChat(false);
          return;
        }
        const list = await res.json();
        const first = Array.isArray(list) ? list[0] : list;
        const content = first?.msg_data?.content;
        if (Array.isArray(content) && content.length > 0) {
          setMessages(msgDataContentToMessages(content));
        } else {
          setMessages([
            { id: 'ai-welcome', role: 'ai', text: '안녕하세요. 고민을 알려주시면 차근차근 함께 정리해드릴게요.' },
          ]);
        }
      } catch (e) {
        console.warn('AI 채팅 기록 로드 실패:', e);
      } finally {
        setLoadingChat(false);
      }
    })();
  }, [cnslId, userEmail]);

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    if (useAiApi && userEmail) {
      setInput('');
      const tempUser = { id: `temp-${Date.now()}`, role: 'user', text: trimmed };
      setMessages((prev) => [...prev, tempUser]);
      try {
        const res = await fetch(`${AI_CHAT_API_BASE}/api/ai/chat/${cnslId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': userEmail,
          },
          body: JSON.stringify({ content: trimmed }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setMessages((prev) => prev.filter((m) => m.id !== tempUser.id));
          setInput(trimmed);
          return;
        }
        const data = await res.json();
        const content = data?.msg_data?.content;
        if (Array.isArray(content)) {
          setMessages(msgDataContentToMessages(content));
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== tempUser.id));
          setInput(trimmed);
        }
      } catch (e) {
        console.warn('AI 전송 실패:', e);
        setMessages((prev) => prev.filter((m) => m.id !== tempUser.id));
        setInput(trimmed);
      }
      return;
    }

    // cnslId 없음: 로컬 인사 1개만 (실제 대화는 testchatpy 연동 시에만)
    const nextUserMessage = { id: `user-${Date.now()}`, role: 'user', text: trimmed };
    const nextAiMessage = {
      id: `ai-${Date.now() + 1}`,
      role: 'ai',
      text: '상담을 이용하시려면 로그인 후 AI 상담 링크(상담 ID 포함)로 접속해 주세요.',
    };
    setMessages((prev) => [...prev, nextUserMessage, nextAiMessage]);
    setInput('');
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleStartChat = async () => {
    if (!agreedToTerms) {
      alert('상기 내용을 확인해주세요.');
      return;
    }

    // 이미 cnslId가 있는 경우(예: 다른 페이지에서 세션 생성 후 진입)는 단순히 모달만 닫고 진행
    if (cnslId) {
      setShowStartModal(false);
      return;
    }

    // 새 AI 즉시 상담: cnsl_reg에 한 건 생성 (cnsl_tp=3, 상담사 없이 진행)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = (user?.email || '').trim();
      if (!email) {
        alert('로그인 후 이용 가능합니다.');
        return;
      }

      const now = new Date();
      const cnslDt = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const cnslStartTime = now.toISOString(); // 타임존 포함 ISO 문자열

      const { data, error } = await supabase
        .from('cnsl_reg')
        .insert({
          member_id: email,
          cnsler_id: null,
          cnsl_tp: '3', // AI 즉시 상담
          cnsl_cate: 'DAILY',
          cnsl_dt: cnslDt,
          cnsl_start_time: cnslStartTime,
          cnsl_title: 'AI 즉시 상담',
          cnsl_content: 'AI 즉시 상담 요청',
          cnsl_stat: 'C', // 진행 중
          cnsl_todo_yn: 'Y',
        })
        .select('cnsl_id')
        .single();

      if (error || !data?.cnsl_id) {
        console.error('cnsl_reg 생성 실패:', error);
        alert('상담 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }

      // 생성된 상담 ID로 라우팅 → /chat/withai/:cnslId 에서 testchatpy와 연동
      setShowStartModal(false);
      navigate(`/chat/withai/${data.cnsl_id}`, { replace: true });
    } catch (e) {
      console.error('AI 즉시 상담 생성 중 오류:', e);
      alert('상담 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const loading = useAiApi && loadingChat;

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex flex-col">
        {showStartModal && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <header className="bg-[#2563eb] h-14 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <span className="text-white text-xl leading-none font-bold">★</span>
                <span className="text-white text-lg font-bold">고민순삭</span>
              </div>
            </header>
            <div className="flex-1 bg-[#f3f7ff] px-6 py-8 flex flex-col items-center justify-start pt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">누구와 상담을 하고 싶으세요?</h2>
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
                    agreedToTerms ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  상담 시작
                </button>
              </div>
              <div className="w-full space-y-3 text-center">
                <p className="text-xs text-gray-600">AI 상담 관련 향상 서비스</p>
                <p className="text-xs text-gray-500">고민, 커리어, 취업 까지 혼자 고민하지 마세요.</p>
                <p className="text-xs text-gray-500">* 고민순삭의 AI상담은 병원, 정신과적 진료가 아닐뿐더러 행동합니다.</p>
                <p className="text-xs text-gray-500">AI 상담은 참고용으로 제공되며, 전문 상담사 개입이 필요하다고 생각 경우 즉시 바랍니다.</p>
                <p className="text-xs text-gray-500 mt-4">© 2026 고민순삭 All rights reserved.</p>
              </div>
            </div>
          </div>
        )}
        <header className="bg-[#2ed3c6] h-16 flex items-center justify-center text-white font-bold text-lg">
          AI 상담
        </header>
        <main className="px-[18px] pt-4 flex-1 overflow-y-auto pb-[132px]">
          {loading ? (
            <div className="flex justify-center py-8 text-gray-500">대화 불러오는 중...</div>
          ) : (
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
          )}
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
            <button type="submit" className="h-10 px-4 rounded-[12px] bg-[#2ed3c6] text-white text-[13px] font-semibold">
              전송
            </button>
          </div>
        </form>
      </div>

      {/* PC */}
      <div className="hidden lg:flex w-full min-h-screen bg-[#f3f7ff]">
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
                  agreedToTerms ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-gray-300 cursor-not-allowed'
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
          <div className="w-full max-w-[1400px] h-[800px] bg-white rounded-b-3xl shadow-2xl flex flex-col mx-8 mb-12">
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
            <main className="flex-1 overflow-y-auto px-12 py-8 bg-gradient-to-b from-gray-50 to-white">
              {loading ? (
                <div className="flex justify-center py-12 text-gray-500">대화 불러오는 중...</div>
              ) : (
                <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-2">
                      <p className={`text-sm font-medium text-gray-600 ${message.role === 'ai' ? 'text-left' : 'text-right'}`}>
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
              )}
            </main>
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
