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
      setMessages: (messages) => set({ messages }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'floating-chatbot-messages',
    },
  ),
);

