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
      // updater: 배열 또는 (prevMessages) => newMessages 형태 모두 허용
      setMessages: (updater) =>
        set((state) => {
          const prev = Array.isArray(state.messages) ? state.messages : [];
          const next =
            typeof updater === 'function' ? updater(prev) : updater || [];
          return { messages: Array.isArray(next) ? next : prev };
        }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'floating-chatbot-messages',
    },
  ),
);

