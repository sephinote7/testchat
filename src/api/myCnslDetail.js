import { authApi } from '../axios/Auth';

export const getCnslDetail = async (cnslId) => {
  try {
    const response = await authApi.get(`/api/mypage/cnsllist/${cnslId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || '상담 내역을 불러오지 못했습니다.';
    console.error('API Error:', message);
    throw new Error(message);
  }
};

/** AI 상담 채팅 내역 조회 (Spring 프록시 → Python API). 반환: list[0].msg_data.content = [{ speaker, text, timestamp }, ...] */
export const getAiChatMessages = async (cnslId) => {
  const response = await authApi.get(`/api/ai/chat/${cnslId}`);
  const list = response.data;
  const first = Array.isArray(list) ? list[0] : list;
  const content = first?.msg_data?.content;
  return Array.isArray(content) ? content : [];
};
