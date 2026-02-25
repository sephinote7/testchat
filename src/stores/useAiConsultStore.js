import { create } from 'zustand';

/**
 * AI 상담 진행 중인 cnsl_id 저장.
 * 뒤로 가기 후 /chat 진입 시 진행 중이던 상담으로 복귀할 수 있도록 함.
 */
export const useAiConsultStore = create((set) => ({
  activeCnslId: null,
  setActiveCnslId: (cnslId) => set({ activeCnslId: cnslId ?? null }),
  clearActiveCnslId: () => set({ activeCnslId: null }),
}));
