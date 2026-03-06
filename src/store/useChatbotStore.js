import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 플로팅 챗봇 대화 내용 저장용 스토어.
 * - 새로고침 / 재방문 시에도 마지막 대화가 유지되도록 localStorage에 보관.
 */
export const useChatbotStore = create(
  persist(
    (set) => ({
      messages: [],
      currentBotId: null,
      // updater: 배열 또는 (prevMessages) => newMessages 형태 모두 허용
      setMessages: (updater) =>
        set((state) => {
          const prev = Array.isArray(state.messages) ? state.messages : [];
          const next =
            typeof updater === 'function' ? updater(prev) : updater || [];
          return { messages: Array.isArray(next) ? next : prev };
        }),
      clearMessages: () => set({ messages: [] }),
      setCurrentBotId: (id) => set({ currentBotId: id ?? null }),
      clearCurrentBotId: () => set({ currentBotId: null }),

      // 설정 (설정 화면·알림용)
      notificationsEnabled: true,
      setNotificationsEnabled: (v) => set({ notificationsEnabled: !!v }),
      /** 알림 탭 마지막 확인 시각(ISO). null이면 아직 확인 전 */
      notificationsLastSeenAt: null,
      setNotificationsLastSeenAt: (iso) =>
        set({ notificationsLastSeenAt: iso ? String(iso) : null }),
      /** 알림 탭 마지막으로 확인한 cnsl_reg.cnsl_id (새 알림 계산용) */
      notificationsLastSeenId: null,
      setNotificationsLastSeenId: (id) =>
        set({
          notificationsLastSeenId:
            typeof id === 'number' && Number.isFinite(id) ? id : null,
        }),
      aiStyle: 'empathetic', // 'empathetic' | 'realistic'
      setAiStyle: (v) =>
        set({ aiStyle: v === 'realistic' ? 'realistic' : 'empathetic' }),
    }),
    {
      name: 'floating-chatbot-messages',
    },
  ),
);

