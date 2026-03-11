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
