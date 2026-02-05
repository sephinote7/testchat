import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'visualchat_messages';

/**
 * 채팅 메시지 하나의 형태
 * @typedef {{ id: string, from: 'me' | 'remote', text: string, time: number }} ChatMessage
 */

/**
 * 현재 대화의 저장소 키 생성 (1:1이므로 두 ID 정렬 후 하나의 키로 통일)
 */
function getStorageKey(myId, remoteId) {
  if (!myId || !remoteId) return null;
  return `${STORAGE_KEY}_${[myId, remoteId].sort().join('_')}`;
}

/** @type {() => ChatMessage[]} */
function loadMessagesFromStorage(myId, remoteId) {
  const key = getStorageKey(myId, remoteId);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @param {string} key @param {ChatMessage[]} messages */
function saveMessagesToStorage(key, messages) {
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (e) {
    console.warn('Failed to save chat to localStorage', e);
  }
}

export const useChatStore = create(
  persist(
    (set, get) => ({
      // Peer / 통화 상태
      myId: '',
      connectedRemoteId: null,
      cnslId: null, // 상담 ID (통화 종료 시 Supabase 저장용)
      status: 'idle',
      errorMessage: '',

      // 채팅 메시지 (현재 대화)
      messages: [],

      setMyId: (myId) => set({ myId }),
      setCnslId: (cnslId) => set({ cnslId }),

      setConnectedRemoteId: (connectedRemoteId) => {
        const { myId } = get();
        const key = getStorageKey(myId, get().connectedRemoteId);
        const newKey = getStorageKey(myId, connectedRemoteId);
        if (key !== newKey) {
          const nextMessages = connectedRemoteId
            ? loadMessagesFromStorage(myId, connectedRemoteId)
            : [];
          set({ connectedRemoteId, messages: nextMessages });
        } else {
          set({ connectedRemoteId });
        }
      },

      setStatus: (status) => set({ status }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),

      addMessage: (message) => {
        const msg = {
          id:
            message.id ??
            `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          from: message.from,
          text: message.text,
          time: message.time ?? Date.now(),
        };
        set((state) => {
          const next = [...state.messages, msg];
          const key = getStorageKey(state.myId, state.connectedRemoteId);
          saveMessagesToStorage(key, next);
          return { messages: next };
        });
      },

      clearMessages: () => {
        set((state) => {
          const key = getStorageKey(state.myId, state.connectedRemoteId);
          saveMessagesToStorage(key, []);
          return { messages: [] };
        });
      },

      loadMessagesForSession: () => {
        const { myId, connectedRemoteId } = get();
        set({ messages: loadMessagesFromStorage(myId, connectedRemoteId) });
      },

      resetCallState: () =>
        set({
          connectedRemoteId: null,
          status: 'idle',
          errorMessage: '',
        }),
      getMessagesForApi: () => get().messages,
    }),
    {
      name: 'visualchat_ui',
      partialize: (state) => ({}), // 메시지는 위에서 직접 localStorage에 저장
    }
  )
);
