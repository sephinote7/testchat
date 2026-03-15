import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAiConsultStore } from '../../../stores/useAiConsultStore';
import { useAuthStore } from '../../../store/auth.store';
import { BASE_URL } from '../../../api/config';
import { getHeaders } from '../../../api/axiosInstance';

// AI 상담: testchatpy API 연동. /chat/withai 또는 /chat/withai/:cnslId
// GET/POST 반환: msg_data.content 배열 (speaker, text, type, timestamp)

// Spring 백엔드 JWT 인증. /api/ai/chat/* 호출 시 Authorization: Bearer 필요.
const AI_CHAT_API_BASE = (BASE_URL || '').replace(/\/$/, '');
const SITE_LOGO_URL =
  'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/f_logo.png';

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
  // cnslId가 이미 있는 URL(/chat/withai/:cnslId)로 들어온 경우에는 모달을 띄우지 않음
  const [showStartModal, setShowStartModal] = useState(() => !urlCnslId);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const storeEmail = useAuthStore((s) => s.email);
  const storeLoginStatus = useAuthStore((s) => s.loginStatus);
  const [memberProfile, setMemberProfile] = useState({
    mbti: null,
    persona: null,
  });
  const [showProfileRequiredModal, setShowProfileRequiredModal] = useState(false);
  const [profileCheckDone, setProfileCheckDone] = useState(false);
  const [activeCheckDone, setActiveCheckDone] = useState(false);
  const [loadingChat, setLoadingChat] = useState(!!cnslId);
  const [messages, setMessages] = useState([]);
  const [cnslInfo, setCnslInfo] = useState(null); // { id, stat, startAt, endAt }
  const [timeNoticeSent, setTimeNoticeSent] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [isEndingChat, setIsEndingChat] = useState(false);
  const endRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const { setActiveCnslId, clearActiveCnslId } = useAiConsultStore();
  const activeCnslId = useAiConsultStore((s) => s.activeCnslId);

  const useAiApi = Boolean(cnslId && AI_CHAT_API_BASE);
  const shouldRedirectToActive = !cnslId && activeCnslId;

  // cnslId 없을 때만: 진행 중 상담 조회 완료 후 모달 표시 여부 결정 (재진입 시 모달 플래시 방지)
  useEffect(() => {
    if (cnslId) {
      setActiveCheckDone(true);
      return;
    }
    if (!userEmail) {
      setActiveCheckDone(true);
      return;
    }
    (async () => {
      try {
        const { data } = await supabase
          .from('cnsl_reg')
          .select('cnsl_id')
          .eq('member_id', userEmail)
          .eq('cnsl_tp', '3')
          .eq('cnsl_stat', 'C')
          .order('cnsl_id', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data?.cnsl_id) {
          setActiveCnslId(data.cnsl_id);
        }
      } catch {
        /* ignore */
      } finally {
        setActiveCheckDone(true);
      }
    })();
  }, [cnslId, userEmail, setActiveCnslId]);

  useEffect(() => {
    // Supabase Auth 미사용. Spring(auth.store)의 이메일만 사용.
    if (storeLoginStatus && storeEmail) setUserEmail(storeEmail);
    else setUserEmail('');
  }, [storeEmail, storeLoginStatus]);

  // member 테이블에서 mbti, persona 조회 (상담 참고용) — Supabase public.member 기준 email 컬럼
  useEffect(() => {
    if (!userEmail) {
      setProfileCheckDone(true);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase
          .from('member')
          .select('mbti, persona')
          // public.member PK는 member_id(varchar)=이메일, email 컬럼 없음
          .eq('member_id', userEmail)
          .maybeSingle();
        if (error) return;
        if (data) {
          const mbtiVal = data.mbti != null ? String(data.mbti).trim() : '';
          const personaVal = data.persona != null ? String(data.persona).trim() : '';
          setMemberProfile({
            mbti: mbtiVal || null,
            persona: personaVal || null,
          });
        } else {
          // 프로필 정보가 없어도 AI 상담은 진행 가능
        }
      } catch {
        // ignore
      } finally {
        // mbti/persona는 optional. 안내 모달은 띄우지 않음.
        setShowProfileRequiredModal(false);
        setProfileCheckDone(true);
      }
    })();
  }, [userEmail]);

  // cnsl_reg 정보 조회 (상담 상태/시작·종료 시간)
  useEffect(() => {
    if (!cnslId) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('cnsl_reg')
          .select('cnsl_id, cnsl_dt, cnsl_start_time, cnsl_end_time, cnsl_stat')
          .eq('cnsl_id', cnslId)
          .maybeSingle();
        if (error) {
          console.warn('cnsl_reg 조회 실패:', error);
          return;
        }
        if (!data) return;
        // cnsl_dt(날짜) + cnsl_start_time/cnsl_end_time(시간)을 조합. 시간만 쓰면 오늘 날짜로 잡혀 자정 넘김(23:13→00:13) 시 endAt이 과거로 인식됨.
        const parseDateTime = (dateStr, timeStr) => {
          if (!dateStr || !timeStr) return null;
          const datePart = String(dateStr).trim().slice(0, 10);
          const timePart = String(timeStr).trim();
          const timeMatch = timePart.match(/^(\d{2}):(\d{2}):(\d{2})/);
          if (!timeMatch) return null;
          const [_, h, m, s] = timeMatch;
          const iso = `${datePart}T${h}:${m}:${s}`;
          const d = new Date(iso);
          return Number.isNaN(d.getTime()) ? null : d;
        };
        const startAt = parseDateTime(data.cnsl_dt, data.cnsl_start_time);
        let endAt = parseDateTime(data.cnsl_dt, data.cnsl_end_time);
        if (startAt && endAt && endAt.getTime() <= startAt.getTime()) {
          endAt = new Date(endAt.getTime() + 24 * 60 * 60 * 1000);
        }
        setCnslInfo({
          id: data.cnsl_id,
          stat: data.cnsl_stat || 'C',
          startAt,
          endAt,
        });
        if ((data.cnsl_stat || 'C') === 'C') {
          setActiveCnslId(data.cnsl_id);
        }
      } catch (e) {
        console.warn('cnsl_reg 조회 오류:', e);
      }
    })();
  }, [cnslId]);

  useEffect(() => {
    if (!cnslId || !AI_CHAT_API_BASE) return;
    (async () => {
      try {
        const headers = getHeaders();
        const res = await fetch(`${AI_CHAT_API_BASE}/api/ai/chat/${cnslId}`, {
          credentials: 'include',
          headers: headers.Authorization ? { Authorization: headers.Authorization } : {},
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
            {
              id: 'ai-welcome',
              role: 'ai',
              text:
                '안녕하세요. 고민을 함께 정리해 드리는 AI 상담사입니다. ' +
                '첫 답변까지는 5~10초 정도 시간이 걸릴 수 있으니 잠시만 기다려 주세요. ' +
                '지금 가장 신경 쓰이는 고민이나 걱정을 편하게 적어 주세요.',
            },
          ]);
        }
      } catch (e) {
        console.warn('AI 채팅 기록 로드 실패:', e);
      } finally {
        setLoadingChat(false);
      }
    })();
  }, [cnslId]);

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    if (cnslInfo?.stat === 'D') {
      alert('이미 종료된 상담입니다. 새로운 AI 상담을 시작해 주세요.');
      return;
    }

    if (useAiApi && userEmail) {
      setInput('');
      const tempUser = {
        id: `temp-${Date.now()}`,
        role: 'user',
        text: trimmed,
      };
      setMessages((prev) => [...prev, tempUser]);
      setAiThinking(true);
      try {
        const headers = getHeaders();
        const res = await fetch(`${AI_CHAT_API_BASE}/api/ai/chat/${cnslId}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(headers.Authorization && { Authorization: headers.Authorization }),
          },
          body: JSON.stringify({
            content: trimmed,
            mbti: memberProfile.mbti || undefined,
            persona: memberProfile.persona || undefined,
          }),
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
      } finally {
        setAiThinking(false);
      }
      return;
    }

    // cnslId 없는 상태에서는 먼저 상담을 생성/선택해야 한다.
    alert('상담을 시작한 뒤 메시지를 보낼 수 있습니다.');
  };

  useEffect(() => {
    if (!endRef.current) return;

    // 새 메시지가 추가된 경우에만 스크롤 동작
    if (messages.length <= prevMessagesLengthRef.current) {
      prevMessagesLengthRef.current = messages.length;
      return;
    }
    prevMessagesLengthRef.current = messages.length;

    const container = endRef.current.parentElement?.parentElement;
    if (container && typeof container.scrollTo === 'function') {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      endRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [messages]);

  const handleEndChat = async () => {
    if (!cnslId || isEndingChat) return;
    setIsEndingChat(true);
    // 종료 처리에 시간이 걸릴 수 있음 안내
    const toast = document.createElement('div');
    toast.textContent = '상담 종료 처리 중입니다. 완료까지 잠시 기다려 주세요.';
    toast.className =
      'fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap';
    document.body.appendChild(toast);
    const removeToast = () => {
      toast.remove();
    };
    const removeTimeout = setTimeout(removeToast, 3000);
    try {
      let summaryForCnsl = null;

      // 1) msg_data로 AI 요약 생성 후 ai_msg.summary 저장 (반드시 먼저 호출)
      if (AI_CHAT_API_BASE) {
        try {
          const headers = getHeaders();
          const res = await fetch(`${AI_CHAT_API_BASE}/api/ai/chat/${cnslId}/summary`, {
            method: 'POST',
            credentials: 'include',
            headers: { ...(headers.Authorization && { Authorization: headers.Authorization }) },
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data) {
            // cnsl_content(cnsl_reg용), summary(ai_msg용)는 백엔드에서 text로 반환됨. 문자열만 사용.
            const cc = typeof data.cnsl_content === 'string' ? data.cnsl_content.trim() : '';
            const sm = typeof data.summary === 'string' ? data.summary.trim() : '';
            summaryForCnsl = cc || sm || null;
          } else if (!res.ok) {
            console.warn('AI 요약 생성 실패:', res.status, data);
          }
        } catch (e) {
          console.warn('AI 요약 생성 실패:', e);
        }
      }

      // 2) cnsl_reg: cnsl_stat=D, cnsl_content=요약(한 줄)으로 업데이트
      const updatePayload = { cnsl_stat: 'D' };
      if (summaryForCnsl) updatePayload.cnsl_content = summaryForCnsl;

      const { error } = await supabase.from('cnsl_reg').update(updatePayload).eq('cnsl_id', cnslId);
      if (error) {
        console.error('상담 종료 실패:', error);
        clearTimeout(removeTimeout);
        removeToast();
        alert('상담 종료에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        setIsEndingChat(false);
        return;
      }
      clearActiveCnslId();
      clearTimeout(removeTimeout);
      removeToast();
      alert('상담이 종료되었습니다.');
      navigate('/chat');
    } catch (e) {
      console.error('상담 종료 중 오류:', e);
      clearTimeout(removeTimeout);
      removeToast();
      alert('상담 종료 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      setIsEndingChat(false);
    }
  };

  const handleEndChatRef = useRef(handleEndChat);
  handleEndChatRef.current = handleEndChat;

  // 상담 종료 20분 전 안내 / 1시간 경과 시 자동 종료
  useEffect(() => {
    if (!cnslInfo?.endAt || cnslInfo?.stat === 'D') return;

    const checkRemaining = () => {
      const now = new Date();
      const diffMs = cnslInfo.endAt.getTime() - now.getTime();
      const diffMin = diffMs / 60000;

      if (diffMin <= 0) {
        setTimeNoticeSent(true);
        alert('상담 시간(1시간)이 종료되었습니다. 상담을 마무리합니다.');
        handleEndChatRef.current?.();
        return;
      }

      if (diffMin <= 20 && !timeNoticeSent) {
        setMessages((prev) => [
          ...prev,
          {
            id: `time-notice-${Date.now()}`,
            role: 'ai',
            text: '상담 종료까지 약 20분 남았습니다. 마무리하고 싶은 내용을 정리해 보세요.',
          },
        ]);
        setTimeNoticeSent(true);
      }
    };

    checkRemaining();
    const interval = setInterval(checkRemaining, 60 * 1000);
    return () => clearInterval(interval);
  }, [cnslInfo, timeNoticeSent]);

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
      const email = (storeLoginStatus ? storeEmail : '').trim();
      if (!email) {
        alert('로그인 후 이용 가능합니다.');
        return;
      }

      const now = new Date();
      const pad2 = (n) => String(n).padStart(2, '0');
      const formatLocalTime = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
      const formatLocalDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

      // cnsl_dt(date), cnsl_start_time/time, cnsl_end_time/time 은 timezone 없이 저장되므로 로컬 시간 기준으로 넣는다.
      const cnslDt = formatLocalDate(now);
      const cnslStartTime = formatLocalTime(now);
      const cnslEndTime = formatLocalTime(new Date(now.getTime() + 60 * 60 * 1000));

      const { data, error } = await supabase
        .from('cnsl_reg')
        .insert({
          member_id: email,
          cnsler_id: null,
          cnsl_tp: '3', // AI 즉시 상담
          cnsl_cate: '1', // AI 상담 카테고리 고정
          cnsl_dt: cnslDt,
          cnsl_start_time: cnslStartTime,
          cnsl_end_time: cnslEndTime,
          cnsl_title: 'AI 즉시 상담',
          cnsl_content: null, // 종료 시 요약으로 채움
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

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/chat');
    }
  };

  const handleProfileRequiredEdit = () => {
    setShowProfileRequiredModal(false);
    navigate('/mypage/editinfo');
  };

  const handleProfileRequiredCancel = () => {
    setShowProfileRequiredModal(false);
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/chat');
    }
  };

  const loading = useAiApi && loadingChat;

  // 프로필 유무와 상관없이 진행 중 상담은 바로 리다이렉트
  if (shouldRedirectToActive && profileCheckDone) {
    return <Navigate to={`/chat/withai/${activeCnslId}`} replace />;
  }

  return (
    <>
      {/* mbti/persona는 선택 입력. 미입력이어도 상담 진행 */}

      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex flex-col">
        {showStartModal && (cnslId || !activeCnslId) && (cnslId || activeCheckDone) && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <header className="bg-[#2563eb] h-14 flex items-center justify-center">
              <img src={SITE_LOGO_URL} alt="고민순삭" className="h-8 w-auto object-contain" />
            </header>
            <div className="flex-1 bg-[#f3f7ff] px-6 py-8 flex flex-col items-center justify-start pt-16">
              <div className="w-full bg-white rounded-3xl shadow-xl p-6 mb-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 mb-4 flex items-center justify-center">
                    <img src={SITE_LOGO_URL} alt="고민순삭" className="w-full h-full object-contain" />
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
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-1/3 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium bg-white"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleStartChat}
                    disabled={!agreedToTerms}
                    className={`flex-1 py-3 rounded-xl text-white font-bold text-lg transition-all ${
                      agreedToTerms ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    상담 시작
                  </button>
                </div>
              </div>
              <div className="w-full space-y-3 text-center">
                <p className="text-xs text-gray-600">AI 상담 관련 향상 서비스</p>
                <p className="text-xs text-gray-500">고민, 커리어, 취업 까지 혼자 고민하지 마세요.</p>
                <p className="text-xs text-gray-500">
                  ※ 고민순삭의 AI상담은 법적, 정신과적 진단의 처방을 대체하지 않습니다.
                </p>
                <p className="text-xs text-gray-500">
                AI 상담은 참고용으로 제공되며, 긴급 상황시 ***109(자살 예방 상담전화)***에 문의 하시기 바랍니다.
                </p>
                <p className="text-xs text-gray-500 mt-4">© 2026 고민순삭 All rights reserved.</p>
              </div>
            </div>
          </div>
        )}
        <header className="bg-[#2ed3c6] h-16 flex items-center justify-between px-4 text-white font-bold text-lg">
          <span>AI 상담</span>
          {cnslId && (
            <button
              type="button"
              onClick={handleEndChat}
              disabled={isEndingChat}
              className="h-9 px-4 rounded-lg bg-white/20 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEndingChat ? '종료 처리 중...' : '상담 종료'}
            </button>
          )}
        </header>
        <main className="px-[18px] pt-4 flex-1 overflow-y-auto pb-[132px]">
          {!cnslId && !activeCheckDone ? (
            <div className="flex items-center justify-center min-h-[240px] text-gray-500">상담 정보 확인 중...</div>
          ) : loading ? (
            <div className="flex items-center justify-center min-h-[240px] text-gray-500">불러오는 중...</div>
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
              {aiThinking && (
                <div className="flex justify-start text-[11px] text-gray-400 pl-2">
                  AI 상담사가 답변을 준비하고 있습니다...
                </div>
              )}
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
              disabled={isEndingChat}
              className="flex-1 h-10 rounded-[12px] border border-[#dbe3f1] px-3 text-[13px] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isEndingChat}
              className="h-10 px-4 rounded-[12px] bg-[#2ed3c6] text-white text-[13px] font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              전송
            </button>
          </div>
        </form>
      </div>

      {/* PC */}
      <div className="hidden lg:flex w-full min-h-screen bg-[#f3f7ff]">
        {showStartModal && (cnslId || !activeCnslId) && (cnslId || activeCheckDone) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl shadow-2xl max-w-[500px] w-full p-8">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 mb-4 flex items-center justify-center">
                  <img src={SITE_LOGO_URL} alt="고민순삭" className="w-full h-full object-contain" />
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
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-1/3 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium bg-white"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleStartChat}
                  disabled={!agreedToTerms}
                  className={`flex-1 py-3 rounded-xl text-white font-bold text-lg transition-all ${
                    agreedToTerms ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  상담 시작
                </button>
              </div>
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
              onClick={() => navigate('/chat', { state: { fromBack: true } })}
              disabled={isEndingChat}
              className="px-6 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-base font-normal transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/20"
            >
              뒤로 가기
            </button>
          </header>
          <div className="w-full max-w-[1400px] h-[800px] bg-white rounded-b-3xl shadow-2xl flex flex-col mx-8 mb-12">
            <div className="bg-gradient-to-r from-[#f0fffd] to-[#e6fffe] py-6 px-8 border-b-2 border-[#2ed3c6]/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">AI와 함께하는 상담</h2>
                  <p className="text-sm text-gray-600">
                    고민과 걱정을 함께 정리해 보세요. 첫 답변까지 조금 시간이 걸릴 수 있습니다.
                  </p>
                </div>
                {cnslId && (
                  <button
                    type="button"
                    onClick={handleEndChat}
                    disabled={isEndingChat}
                    className={`max-w-[70%] rounded-2xl px-6 py-4 text-base leading-relaxed shadow-md border-2 transition-colors ${
                      isEndingChat
                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 text-red-700 hover:from-red-100 hover:to-red-200'
                    }`}
                  >
                    {isEndingChat ? '종료 처리 중...' : '상담 종료'}
                  </button>
                )}
              </div>
            </div>
            <main className="flex-1 overflow-y-auto px-12 py-8 bg-gradient-to-b from-gray-50 to-white">
              {!cnslId && !activeCheckDone ? (
                <div className="flex items-center justify-center min-h-[300px] text-gray-500">상담 정보 확인 중...</div>
              ) : loading ? (
                <div className="flex items-center justify-center min-h-[300px] text-gray-500">불러오는 중...</div>
              ) : (
                <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-2">
                      <p
                        className={`text-sm font-medium text-gray-600 ${message.role === 'ai' ? 'text-left' : 'text-right'}`}
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
                  {aiThinking && (
                    <div className="flex justify-start text-sm text-gray-400 pl-1">
                      AI 상담사가 답변을 준비하고 있습니다...
                    </div>
                  )}
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
                  disabled={isEndingChat}
                  className="flex-1 h-14 rounded-xl border-2 border-gray-300 px-6 text-base bg-white focus:outline-none focus:border-[#2ed3c6] transition-colors placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isEndingChat}
                  className="h-14 px-10 rounded-xl bg-gradient-to-r from-[#2ed3c6] to-[#26b8ad] text-white text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100"
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
