import { authApi } from '../axios/Auth';

// 상담사 상담 내역 조회
export const getMyCnslList = async (page = 0, size = 10, token) => {
  const response = await authApi.get('/api/mypage/cnsllist', {
    params: { page, size },
  });
  return response.data;
};
