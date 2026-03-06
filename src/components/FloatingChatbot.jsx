import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useChatbotStore } from '../store/useChatbotStore';

const DISCLAIMER_TEXT =
  "저희 고민순삭 어시스턴트 '순삭이'는 웹사이트를 기반으로 유용한 답변을 제공합니다. 그러나 때로는 부정확한 정보가 포함되거나 사람의 확인이 필요할 수 있습니다.";

/** cnsl_reg.cnsl_tp 라벨 */
function getCnslTpLabel(tp) {
  const t = String(tp || '').trim();
  const map = {
    1: '게시판 상담',
    2: '전화 상담',
    3: 'AI 상담',
    4: '채팅 상담',
    5: '화상 상담',
  };
  return map[t] || '상담';
}

/** 제목 길이 제한 후 말줄임 */
function truncateTitle(title, maxLen = 24) {
  const s = String(title || '').trim();
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen)}...`;
}

/** 설정 화면: 챗봇 내용 초기화, 알림 토글, AI 상담 스타일, 취소/저장 */
function SettingsPanel({
  draft,
  onDraftChange,
  onClearHistory,
  onCancel,
  onSave,
}) {
  const [saveMessage, setSaveMessage] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClearClick = () => {
    setConfirmOpen(true);
  };

  const handleSave = () => {
    onSave();
    setSaveMessage(true);
  };

  useEffect(() => {
    if (!saveMessage) return;
    const t = setTimeout(() => setSaveMessage(false), 2000);
    return () => clearTimeout(t);
  }, [saveMessage]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-white px-4 py-4">
      <div className="space-y-4">
        {/* 챗봇 내용 초기화 */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 119 9 9 9 0 01-9-9z" />
                <path d="M12 8v4l2 2" />
              </svg>
            </span>
            <span className="text-sm font-medium text-gray-800">
              챗봇 내용 초기화
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearClick}
            className="text-sm font-medium text-main-02 underline hover:no-underline"
          >
            초기화
          </button>
        </div>
        {/* 알림 */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13 21a1 1 0 01-2 0" />
              </svg>
            </span>
            <span className="text-sm font-medium text-gray-800">알림</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.notificationsEnabled}
            onClick={() =>
              onDraftChange((prev) => ({
                ...prev,
                notificationsEnabled: !prev.notificationsEnabled,
              }))
            }
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
              draft.notificationsEnabled
                ? 'border-main-02 bg-main-02'
                : 'border-gray-300 bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                draft.notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {/* AI 상담 스타일 */}
        <div className="border-b border-gray-100 pb-3">
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </span>
            <span className="text-sm font-medium text-gray-800">
              AI 상담 스타일
            </span>
          </div>
          <div className="flex gap-2 pl-11">
            <button
              type="button"
              onClick={() =>
                onDraftChange((prev) => ({ ...prev, aiStyle: 'realistic' }))
              }
              className={`rounded-lg border px-3 py-2 text-sm ${
                draft.aiStyle === 'realistic'
                  ? 'border-main-02 bg-main-02 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              현실적인
            </button>
            <button
              type="button"
              onClick={() =>
                onDraftChange((prev) => ({ ...prev, aiStyle: 'empathetic' }))
              }
              className={`rounded-lg border px-3 py-2 text-sm ${
                draft.aiStyle === 'empathetic'
                  ? 'border-main-02 bg-main-02 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              공감하는
            </button>
          </div>
          <p className="mt-1.5 pl-11 text-xs text-gray-500 sm:text-[12px]">
            {draft.aiStyle === 'realistic'
              ? '현실적인 상황에 맞는 조언을 제공합니다.'
              : '감정에 공감하며 따뜻한 답변을 제공합니다.'}
          </p>
        </div>
      </div>
      {saveMessage && (
        <p className="mt-2 text-center text-sm text-main-02">저장되었습니다.</p>
      )}
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-lg bg-main-02 py-2.5 text-sm font-medium text-white hover:bg-main-02/90"
        >
          저장
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="w-[320px] rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              챗봇 내용 초기화
            </h3>
            <p className="mb-4 text-xs text-gray-600">
              현재 챗봇 대화 내용이 모두 삭제됩니다. 계속 진행하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setConfirmOpen(false);
                }}
                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 알림 탭: 진행 예정(A)/진행중(C) 상담 목록, 클릭 시 해당 상담으로 이동 */
function NotificationsPanel({ userEmail, onNavigate }) {
  const [list, setList] = useState({ scheduled: [], inProgress: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | scheduled | inProgress
  const [panelOpen, setPanelOpen] = useState(true); // 나의 상담 접기/펼치기

  useEffect(() => {
    if (!userEmail) {
      setList({ scheduled: [], inProgress: [] });
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from('cnsl_reg')
      .select('cnsl_id, cnsl_stat, cnsl_tp, cnsl_title, cnsl_dt')
      .or(`member_id.eq.${userEmail},cnsler_id.eq.${userEmail}`)
      .in('cnsl_stat', ['A', 'C'])
      .order('cnsl_dt', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        setLoading(false);
        if (err) {
          setError(err.message);
          setList({ scheduled: [], inProgress: [] });
          return;
        }
        const rows = Array.isArray(data) ? data : [];
        const now = new Date();
        const scheduled = rows.filter((r) => {
          const stat = String(r.cnsl_stat || '').toUpperCase();
          if (stat !== 'A') return false;
          if (!r.cnsl_dt) return false;
          const dt = new Date(r.cnsl_dt);
          if (Number.isNaN(dt.getTime())) return false;
          // 현재 시각 이후의 상담만 "진행 예정"에 표시
          return dt.getTime() > now.getTime();
        });
        const inProgress = rows.filter(
          (r) => String(r.cnsl_stat || '').toUpperCase() === 'C',
        );
        setList({ scheduled, inProgress });
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setError('목록을 불러오는데 실패했습니다.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  const goToConsult = (cnslId, cnslTp) => {
    const id = Number(cnslId);
    if (Number.isNaN(id)) return;
    const tp = String(cnslTp || '').trim();
    if (tp === '3') {
      onNavigate(`/chat/withai/${id}`);
    } else if (tp === '4') {
      onNavigate(`/chat/cnslchat/${id}`);
    } else if (tp === '5') {
      onNavigate(`/chat/visualchat/${id}`);
    } else {
      onNavigate(`/chat/cnslchat/${id}`);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return Number.isNaN(d.getTime())
        ? ''
        : d.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
    } catch {
      return '';
    }
  };

  if (!userEmail) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-main-01 px-4 py-6 text-center text-sm text-gray-600">
        <p>로그인하면 진행 예정·진행중인 상담 알림을 볼 수 있어요.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-main-01 px-4 py-6 text-sm text-gray-500">
        <span>알림 목록 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-main-01 px-4 py-6 text-sm text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  const hasAny = list.scheduled.length > 0 || list.inProgress.length > 0;

  const renderItem = (r) => (
    <li key={r.cnsl_id}>
      <button
        type="button"
        onClick={() => goToConsult(r.cnsl_id, r.cnsl_tp)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left shadow-sm hover:bg-gray-50"
      >
        <span
          className="block truncate text-sm font-medium text-gray-800"
          title={r.cnsl_title || `상담 #${r.cnsl_id}`}
        >
          {truncateTitle(r.cnsl_title || `상담 #${r.cnsl_id}`)}
        </span>
        <span className="mt-0.5 block sm text-gray-500">
          {getCnslTpLabel(r.cnsl_tp)} / {formatDate(r.cnsl_dt)}
        </span>
      </button>
    </li>
  );

  const totalCount = list.inProgress.length + list.scheduled.length;

  const sortedAll = [...list.inProgress, ...list.scheduled].sort((a, b) => {
    const ad = a.cnsl_dt ? new Date(a.cnsl_dt).getTime() : 0;
    const bd = b.cnsl_dt ? new Date(b.cnsl_dt).getTime() : 0;
    return bd - ad;
  });

  const sortedScheduled = [...list.scheduled].sort((a, b) => {
    const ad = a.cnsl_dt ? new Date(a.cnsl_dt).getTime() : 0;
    const bd = b.cnsl_dt ? new Date(b.cnsl_dt).getTime() : 0;
    return bd - ad;
  });

  const sortedInProgress = [...list.inProgress].sort((a, b) => {
    const ad = a.cnsl_dt ? new Date(a.cnsl_dt).getTime() : 0;
    const bd = b.cnsl_dt ? new Date(b.cnsl_dt).getTime() : 0;
    return bd - ad;
  });

  let displayList = [];
  if (filter === 'scheduled') displayList = sortedScheduled;
  else if (filter === 'inProgress') displayList = sortedInProgress;
  else displayList = sortedAll;

  const limitedList = displayList.slice(0, 10);

  if (!hasAny) {
    return (
      <div className="flex flex-1 min-h-0 flex-col bg-main-01 px-4 py-4">
        <div className="mb-3 flex items-center justify-between border-b border-main-02 pb-2">
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            className="flex w-full items-center justify-between text-left"
          >
            <h4 className="text-sm font-semibold text-main-02">
              나의 상담 (0건)
            </h4>
            <span className="text-gray-500" aria-hidden>
              {panelOpen ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </span>
          </button>
        </div>
        {panelOpen && (
          <>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-[5px] border border-main-02 bg-main-02 py-1.5 text-xs font-medium text-white"
              >
                전체
              </button>
              <button
                type="button"
                className="flex-1 rounded-[5px] border border-gray-300 bg-white py-1.5 text-xs font-medium text-gray-700"
              >
                예약
              </button>
              <button
                type="button"
                className="flex-1 rounded-[5px] border border-gray-300 bg-white py-1.5 text-xs font-medium text-gray-700"
              >
                진행중
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/mypage/clist')}
                className="flex-1 rounded-[5px] border border-gray-300 bg-white py-1.5 text-xs font-medium text-gray-700"
              >
                더보기
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ul className="space-y-2">
                <li>
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-3 text-center text-xs text-gray-500">
                    현재 등록된 상담이 없습니다.
                  </div>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-main-01 px-4 py-4">
      <div className="mb-3 flex items-center justify-between border-b border-main-02 pb-2">
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          className="flex w-full items-center justify-between text-left"
        >
          <h4 className="text-sm font-semibold text-main-02">
            나의 상담 ({totalCount}건)
          </h4>
          <span className="text-gray-500" aria-hidden>
            {panelOpen ? (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </span>
        </button>
      </div>
      {panelOpen && (
        <>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`flex-1 rounded-[5px] border py-1.5 text-xs font-medium ${
                filter === 'all'
                  ? 'border-main-02 bg-main-02 text-white'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setFilter('scheduled')}
              className={`flex-1 rounded-[5px] border py-1.5 text-xs font-medium ${
                filter === 'scheduled'
                  ? 'border-main-02 bg-main-02 text-white'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              예약
            </button>
            <button
              type="button"
              onClick={() => setFilter('inProgress')}
              className={`flex-1 rounded-[5px] border py-1.5 text-xs font-medium ${
                filter === 'inProgress'
                  ? 'border-main-02 bg-main-02 text-white'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              진행중
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/mypage/clist')}
              className="flex-1 rounded-[5px] border border-gray-300 bg-white py-1.5 text-xs font-medium text-gray-700"
            >
              더보기
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ul className="space-y-2">{limitedList.map(renderItem)}</ul>
          </div>
        </>
      )}
    </div>
  );
}

// 고민순삭 홈페이지 이용 안내용 컨텍스트 (백엔드 @testchatpy 로 전달)
const SITE_CONTEXT = [
  '이 서비스는 고민순삭 홈페이지입니다. 취업, 커리어, 상담 관련 정보를 제공합니다.',
  '주요 메뉴: INFO(가이드), 회원가입/로그인, AI 상담, 상담사 찾기, 1:1 상담 채팅 등이 있습니다.',
  '사용자는 상담사 목록에서 상담사를 선택하고 상세 프로필을 확인한 뒤, 텍스트 상담을 신청할 수 있습니다.',
  '순삭이는 고민순삭 홈페이지 이용 방법, 메뉴 위치, 기능 설명과 같이 사이트와 직접적으로 관련된 질문에만 답변해야 합니다.',
  '회사 정책, 법률, 건강, 금융 등 홈페이지와 직접적으로 관련 없는 주제에 대해서는 답변을 거절하고 고객센터나 공식 안내를 확인하도록 안내해야 합니다.',
];

const FloatingChatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const {
    messages: storeMessages,
    setMessages,
    clearMessages,
    currentBotId,
    setCurrentBotId,
    clearCurrentBotId,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationsLastSeenId,
    setNotificationsLastSeenId,
    aiStyle,
    setAiStyle,
  } = useChatbotStore();
  const messages = Array.isArray(storeMessages) ? storeMessages : [];
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  /** 플로팅 박스 하단 푸터 탭: chat(홈) | notifications(알림) | settings(설정) */
  const [chatView, setChatView] = useState('chat');
  /** 설정 화면 편집용 로컬 상태 (저장 시 스토어에 반영) */
  const [settingsDraft, setSettingsDraft] = useState({
    notificationsEnabled: true,
    aiStyle: 'empathetic',
  });
  /** 진행 예정/진행중 상담 건수 (알림 레드닷·플로팅 버튼 배지용) */
  const [notificationCount, setNotificationCount] = useState(0);

  const headerSubtitle =
    chatView === 'notifications'
      ? '나의 상담 및 활동 알림'
      : chatView === 'settings'
        ? '쾌적한 상담을 위한 환경 설정'
        : '고민순삭 홈페이지 이용을 도와드릴게요';

  const messagesEndRef = useRef(null);
  const summaryTimeoutRef = useRef(null);

  const markNotificationsAsRead = () => {
    if (!notificationsEnabled || !user?.email) return;

    // UI에서는 즉시 배지 제거
    setNotificationCount(0);

    // 현재 기준으로 사용자가 가진 A/C 상담 중 가장 최근 cnsl_id를 "마지막 읽은 지점"으로 저장
    supabase
      .from('cnsl_reg')
      .select('cnsl_id')
      .or(`member_id.eq.${user.email},cnsler_id.eq.${user.email}`)
      .in('cnsl_stat', ['A', 'C'])
      .order('cnsl_id', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.cnsl_id) {
          const idNum = Number(data.cnsl_id);
          if (!Number.isNaN(idNum)) {
            setNotificationsLastSeenId(idNum);
          }
        } else {
          setNotificationsLastSeenId(null);
        }
      })
      .catch(() => {
        // 실패해도 치명적이지 않으므로 무시
      });
  };

  const createIntroMessage = () => {
    const now = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      id: `intro-${Date.now()}`,
      sender: 'bot',
      text: [
        '안녕하세요, 고민순삭 어시스턴트 순삭이입니다.',
        '고민순삭 홈페이지 이용 방법과 메뉴 위치 등 사이트 관련 질문에만 답변을 드릴 수 있어요.',
        '답변 생성까지 5~10초 정도 걸릴 수 있으니 잠시만 기다려 주세요.',
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
    };
  };

  const ensureIntroMessage = () => {
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [createIntroMessage()];
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isOpen]);

  useEffect(
    () => () => {
      if (summaryTimeoutRef.current) {
        clearTimeout(summaryTimeoutRef.current);
      }
    },
    [],
  );

  // 설정 탭 진입 시 스토어 값으로 로컬 드래프트 동기화
  useEffect(() => {
    if (chatView === 'settings') {
      setSettingsDraft({
        notificationsEnabled: !!notificationsEnabled,
        aiStyle: aiStyle === 'realistic' ? 'realistic' : 'empathetic',
      });
    }
  }, [chatView, notificationsEnabled, aiStyle]);

  // 알림 탭 진입 시 '확인' 처리: 배지(레드닷/숫자) 제거
  useEffect(() => {
    if (chatView !== 'notifications') return;
    markNotificationsAsRead();
  }, [chatView]);

  // 알림 건수 조회 (푸터 레드닷·플로팅 버튼 배지)
  useEffect(() => {
    if (!user?.email || !notificationsEnabled) {
      setNotificationCount(0);
      return;
    }
    let cancelled = false;
    const baseQuery = supabase
      .from('cnsl_reg')
      .select('cnsl_id', { count: 'exact', head: true })
      .or(`member_id.eq.${user.email},cnsler_id.eq.${user.email}`)
      .in('cnsl_stat', ['A', 'C']);

    const query =
      typeof notificationsLastSeenId === 'number' &&
      Number.isFinite(notificationsLastSeenId)
        ? baseQuery.gt('cnsl_id', notificationsLastSeenId)
        : baseQuery;

    query
      .then(({ count, error: err }) => {
        if (cancelled) return;
        if (!err && typeof count === 'number') setNotificationCount(count);
        else setNotificationCount(0);
      })
      .catch(() => {
        if (!cancelled) setNotificationCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email, isOpen, notificationsEnabled, notificationsLastSeenId]);

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

  // Supabase 저장용 포맷으로 변환: id, quickActions 제거, sender -> speaker
  const toStorageMessages = (allMessages) =>
    (Array.isArray(allMessages) ? allMessages : []).map((m) => ({
      speaker: m.sender === 'user' ? 'user' : 'bot',
      text: m.text,
      timestamp: m.timestamp,
    }));

  // summary: 어떤 질문/요구를 했고, 어떤 답변/기능을 사용했는지 JSON 형식으로 정리
  const buildSummaryText = (storageMessages) => {
    const msgs = Array.isArray(storageMessages) ? storageMessages : [];
    if (!msgs.length) {
      return {
        category: '기타',
        user_intent: '',
        unresolved_needs: '',
        satisfaction_signal: '중립',
        action_items: '',
      };
    }

    const userMsgs = msgs.filter((m) => m.speaker === 'user');
    const botMsgs = msgs.filter((m) => m.speaker === 'bot');

    const firstUser = userMsgs[0];
    const lastUser = userMsgs[userMsgs.length - 1];
    const lastBot = botMsgs[botMsgs.length - 1];

    const questionSummary = firstUser
      ? firstUser.text.length > 60
        ? `${firstUser.text.slice(0, 57)}...`
        : firstUser.text
      : '';

    const requirementSummary =
      userMsgs.length > 1 && lastUser && lastUser !== firstUser
        ? lastUser.text.length > 60
          ? `${lastUser.text.slice(0, 57)}...`
          : lastUser.text
        : '';

    const answerSummary = lastBot
      ? lastBot.text.length > 80
        ? `${lastBot.text.slice(0, 77)}...`
        : lastBot.text
      : '';

    // category 판별
    const joinedText = msgs.map((m) => m.text).join(' ');
    const lower = joinedText.toLowerCase();
    let category = '기타';
    if (lower.includes('상담사')) {
      category = '상담사 조회';
    } else if (
      lower.includes('회원가입') ||
      lower.includes('로그인') ||
      lower.includes('포인트') ||
      lower.includes('마이페이지') ||
      lower.includes('ai 상담') ||
      lower.includes('이용 방법')
    ) {
      category = '이용 방법';
    }

    // 사용자 주요 목적 요약
    const user_intent = questionSummary;

    // 해결되지 않은 요구사항 추정
    let unresolved_needs = '';
    const lastUserText = (lastUser?.text || '').toLowerCase();
    if (joinedText.includes('정확한 답변을 드리기 어렵')) {
      unresolved_needs = '일부 질문에 대해 정확한 답변을 제공하지 못했습니다.';
    } else if (lastUser && lastUser.text.includes('?')) {
      unresolved_needs =
        lastUser.text.length > 80
          ? `${lastUser.text.slice(0, 77)}...`
          : lastUser.text;
    } else {
      unresolved_needs = '명확하게 드러난 미해결 요구사항은 없습니다.';
    }

    // 만족도 신호
    let satisfaction_signal = '중립';
    if (
      lastUserText.includes('감사') ||
      lastUserText.includes('고맙') ||
      lastUserText.includes('도움')
    ) {
      satisfaction_signal = '긍정';
    } else if (
      lastUserText.includes('별로') ||
      lastUserText.includes('실망') ||
      lastUserText.includes('짜증') ||
      lastUserText.includes('해결이 안')
    ) {
      satisfaction_signal = '부정';
    }

    // 안내한 기능 요약 → action_items 힌트
    const usedFeatures = [];
    if (lower.includes('ai 상담')) usedFeatures.push('AI 상담');
    if (lower.includes('상담사 찾기')) usedFeatures.push('상담사 찾기');
    if (lower.includes('회원가입')) usedFeatures.push('회원가입');
    if (lower.includes('포인트') || lower.includes('마이페이지'))
      usedFeatures.push('포인트/마이페이지');
    if (
      lower.includes('이력서') ||
      lower.includes('자소서') ||
      lower.includes('자기소개서')
    )
      usedFeatures.push('이력서/자소서 가이드');

    let action_items = '';
    if (category === '상담사 조회') {
      action_items =
        '상담사 검색/추천 UX와 안내 문구가 사용자의 기대에 맞는지 점검이 필요합니다.';
    } else if (category === '이용 방법') {
      action_items =
        '회원가입, 포인트, AI 상담 등 주요 메뉴 이용 가이드를 FAQ/가이드 페이지에 보완하는 것을 검토하세요.';
    }
    if (!action_items && usedFeatures.length) {
      action_items = `사용자가 주로 이용한 기능: ${usedFeatures.join(', ')}. 관련 안내와 실제 동작이 일치하는지 점검이 필요합니다.`;
    }
    if (!action_items) {
      action_items = '특별한 운영자 개입이 필요한 이슈는 크게 보이지 않습니다.';
    }

    return {
      category,
      user_intent,
      unresolved_needs,
      satisfaction_signal,
      action_items,
    };
  };

  const buildQuickActionsFromAnswer = (answer) => {
    const actions = [];
    const lower = answer.toLowerCase();

    if (lower.includes('회원가입')) {
      actions.push({
        label: '회원가입으로 이동하기 >',
        path: '/member/signup',
      });
    }

    if (
      lower.includes('ai 상담') ||
      lower.includes('ai상담') ||
      lower.includes('이력서') ||
      lower.includes('자소서') ||
      lower.includes('자기소개서')
    ) {
      actions.push({
        label: 'AI 상담으로 이동하기 >',
        path: '/chat/withai',
      });
      actions.push({
        label: '이력서/자소서 가이드 보기 >',
        path: '/info/d_guide',
      });
    }

    if (lower.includes('상담사 찾기') || lower.includes('상담사')) {
      actions.push({
        label: '상담사 찾기 페이지로 이동하기 >',
        path: '/chat/counselor',
      });
    }

    if (
      lower.includes('포인트 잔액') ||
      (lower.includes('포인트') && lower.includes('잔액'))
    ) {
      actions.push({
        label: '포인트 잔액 확인하기 >',
        path: '/mypage',
      });
    }

    if (lower.includes('포인트 충전')) {
      actions.push({
        label: '포인트 충전 페이지로 이동하기 >',
        path: '/mypage/point-charge',
      });
    }

    if (
      lower.includes('포인트 사용내역') ||
      lower.includes('포인트 사용 내역')
    ) {
      actions.push({
        label: '포인트 사용내역 보기 >',
        path: '/mypage/point-usage',
      });
    }

    return actions;
  };

  const saveConversationToSupabase = async (
    conversation,
    summary,
    endSession = false,
  ) => {
    if (!user?.isLogin || !user.email) return;
    try {
      const storageMessages = toStorageMessages(conversation);
      // 1) 진행 중 row가 있으면 msg_data(+ summary)만 업데이트
      if (currentBotId && !endSession) {
        const { error } = await supabase
          .from('bot_msg')
          .update({
            msg_data: storageMessages,
          })
          .eq('bot_id', currentBotId);
        if (error) {
          // eslint-disable-next-line no-console
          console.warn('bot_msg 업데이트 실패:', error);
        }
        return;
      }

      // 2) 새 세션 생성 또는 세션 종료 시 최종 저장
      const payload = {
        member_id: user.email,
        msg_data: storageMessages,
        created_at: new Date().toISOString(),
      };
      if (typeof summary === 'string') {
        payload.summary = summary;
      }
      const { data, error } = await supabase
        .from('bot_msg')
        .insert(payload)
        .select('bot_id')
        .single();

      if (error) {
        // eslint-disable-next-line no-console
        console.warn('bot_msg 저장 실패:', error);
      } else if (!endSession && data?.bot_id) {
        setCurrentBotId(data.bot_id);
      } else if (endSession) {
        clearCurrentBotId();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('bot_msg 저장 실패:', e);
    }
  };

  const scheduleSummarySave = (conversation) => {
    if (!user?.isLogin || !user.email) return;
    if (summaryTimeoutRef.current) {
      clearTimeout(summaryTimeoutRef.current);
    }
    summaryTimeoutRef.current = setTimeout(
      () => {
        const storageMessages = toStorageMessages(conversation);
        const summaryObject = buildSummaryText(storageMessages);
        // 세션 종료로 간주하고 최종 row를 새로 저장 (요약 포함) 후 currentBotId 초기화
        saveConversationToSupabase(
          conversation,
          JSON.stringify(summaryObject),
          true,
        );
      },
      5 * 60 * 1000,
    );
  };

  const sendMessageToBackend = async (messageText, nextMessages, pendingId) => {
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

      const quickActions = buildQuickActionsFromAnswer(answer);

      const nowMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: answer,
        timestamp: now,
        ...(quickActions.length ? { quickActions } : {}),
      };

      if (user?.isLogin && user.email) {
        const conversationForSave = [...nextMessages, nowMessage];
        // 실시간 msg_data 저장
        saveConversationToSupabase(conversationForSave);
        // 마지막 답장에서 5분 뒤 summary 업데이트
        scheduleSummarySave(conversationForSave);
      }

      setMessages((prev) => {
        const base = Array.isArray(prev) ? prev : [];
        const withoutPending = base.filter((m) => m.id !== pendingId);
        return [...withoutPending, nowMessage];
      });
    } catch (error) {
      // 콘솔에는 구체적인 오류 로그 남김 (예: 405 Method Not Allowed)
      // eslint-disable-next-line no-console
      console.error('FloatingChatbot sendMessageToBackend error:', error);

      const now = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const detail =
        error instanceof Error && error.message ? ` (${error.message})` : '';

      setMessages((prev) => {
        const base = Array.isArray(prev) ? prev : [];
        const withoutPending = base.filter((m) => m.id !== pendingId);
        return [
          ...withoutPending,
          {
            id: `bot-error-${Date.now()}`,
            sender: 'bot',
            text:
              '지금은 챗봇 서버와 통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요. 문제가 계속되면 고객 지원 팀에 문의해 주세요.' +
              detail,
            timestamp: now,
          },
        ];
      });
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

    const baseId = Date.now();
    const userMessage = {
      id: `user-${baseId}`,
      sender: 'user',
      text: trimmed,
      timestamp: now,
    };

    const pendingId = `bot-pending-${baseId}`;
    const pendingMessage = {
      id: pendingId,
      sender: 'bot',
      text: '순삭이가 답변을 준비하고 있어요. 최대 5~10초 정도 걸릴 수 있습니다.',
      timestamp: now,
    };

    const nextMessages = [...messages, userMessage, pendingMessage];
    setMessages(nextMessages);
    setInputValue('');
    setIsSending(true);

    await sendMessageToBackend(trimmed, nextMessages, pendingId);
  };

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-xs text-gray-400">
          아직 대화가 없습니다. 하단 입력창에 고민순삭 홈페이지 관련 질문을
          입력해 보세요.
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
                      onClick={() =>
                        handleQuickAction(action.path, action.label)
                      }
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
                    <span className="text-sm font-semibold">
                      고민순삭 어시스턴트 순삭이
                    </span>
                    <span className="sm text-white/80">{headerSubtitle}</span>
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

              {/* 메인 콘텐츠: 채팅 / 알림 목록 / 설정 */}
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {chatView === 'chat' && (
                  <>
                    <div className="flex-1 min-h-0 overflow-y-auto bg-main-01 px-3 py-3 text-[13px] text-gray-800 sm:px-4 sm:py-4 sm:text-sm">
                      {renderMessages()}
                    </div>
                    {/* 입력 영역 + 고지 문구 (채팅 뷰에서만) */}
                    <div className="border-t border-gray-200 bg-white px-3 py-3 sm:flex-none sm:px-4 sm:py-1">
                      <form
                        onSubmit={handleSubmit}
                        className="mb-2 flex h-[50px] items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (messages.length > 0) {
                              const conversation = [...messages];
                              const storageMessages =
                                toStorageMessages(conversation);
                              const summaryObject =
                                buildSummaryText(storageMessages);
                              // 홈 버튼 클릭 시도 세션 종료로 간주해 요약 저장
                              saveConversationToSupabase(
                                conversation,
                                JSON.stringify(summaryObject),
                                true,
                              );
                              if (summaryTimeoutRef.current) {
                                clearTimeout(summaryTimeoutRef.current);
                              }
                            }
                            clearMessages();
                            setMessages([createIntroMessage()]);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50"
                          aria-label="처음 안내 보기"
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
                            <path d="M3 12L12 3l9 9" />
                            <path d="M9 21V12h6v9" />
                          </svg>
                        </button>
                        <textarea
                          rows={1}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="메시지를 입력해 주세요."
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
                      <p className="xs leading-snug text-gray-500">
                        {DISCLAIMER_TEXT}
                      </p>
                    </div>
                  </>
                )}
                {chatView === 'notifications' && (
                  <NotificationsPanel
                    userEmail={user?.email}
                    onNavigate={handleNavigateLink}
                  />
                )}
                {chatView === 'settings' && (
                  <SettingsPanel
                    draft={settingsDraft}
                    onDraftChange={setSettingsDraft}
                    onClearHistory={() => {
                      clearMessages();
                      setMessages([createIntroMessage()]);
                      setChatView('chat');
                    }}
                    onCancel={() => setChatView('chat')}
                    onSave={() => {
                      setNotificationsEnabled(
                        settingsDraft.notificationsEnabled,
                      );
                      setAiStyle(settingsDraft.aiStyle);
                    }}
                  />
                )}
              </div>

              {/* 하단 푸터 (PC 기준 60px, 글씨 잘리지 않도록) */}
              <footer className="flex h-16 shrink-0 items-center justify-between border-t border-gray-200 bg-main-01 px-2 py-2 sm:h-[60px] sm:justify-around sm:px-3">
                <button
                  type="button"
                  onClick={() => setChatView('chat')}
                  className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 text-xs sm:min-w-[80px] sm:gap-1 sm:py-2 sm:text-sm sm:whitespace-nowrap ${
                    chatView === 'chat'
                      ? 'text-main-02 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label="홈"
                >
                  <svg
                    className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                    viewBox="0 0 24 24"
                    fill={chatView === 'chat' ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                  <span className="truncate text-xs sm:text-sm">홈</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatView('notifications');
                    markNotificationsAsRead();
                  }}
                  className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 text-xs sm:min-w-[80px] sm:gap-1 sm:py-2 sm:text-sm sm:whitespace-nowrap ${
                    chatView === 'notifications'
                      ? 'text-main-02 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label="알림"
                >
                  {notificationCount > 0 && (
                    <span
                      className="absolute right-1/4 top-1.5 h-2 w-2 rounded-full bg-red-500 sm:right-[30%] sm:top-2"
                      aria-hidden
                    />
                  )}
                  <svg
                    className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                    viewBox="0 0 24 24"
                    fill={
                      chatView === 'notifications' ? 'currentColor' : 'none'
                    }
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13 21a1 1 0 01-2 0" />
                  </svg>
                  <span className="truncate text-xs sm:text-sm">알림</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChatView('settings')}
                  className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 text-xs sm:min-w-[80px] sm:gap-1 sm:py-2 sm:text-sm sm:whitespace-nowrap ${
                    chatView === 'settings'
                      ? 'text-main-02 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label="설정"
                >
                  <svg
                    className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                    viewBox="0 0 24 24"
                    fill={chatView === 'settings' ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-1.51a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h1.51a1.65 1.65 0 001-1.51 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1V3a2 2 0 012-2 2 2 0 012 2v1.51a1.65 1.65 0 001 1 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001 1h1.51a2 2 0 012 2 2 2 0 01-2 2h-1.51a1.65 1.65 0 00-1 1.51z" />
                  </svg>
                  <span className="truncate text-xs sm:text-sm">설정</span>
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 (모바일 / PC 공통, 알림 있을 때 우상단 숫자 배지) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-3 z-40 sm:bottom-6 sm:right-6">
          <button
            type="button"
            onClick={openChat}
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-main-02 text-white shadow-xl transition-transform hover:scale-105 sm:h-16 sm:w-16"
            aria-label="고민순삭 챗봇 열기"
          >
            {notificationCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow sm:-right-0.5 sm:-top-0.5 sm:h-5 sm:min-w-[22px] sm:text-xs"
                aria-label={`알림 ${notificationCount}건`}
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
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
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
