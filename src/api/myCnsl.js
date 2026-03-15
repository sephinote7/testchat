import { authApi } from '../axios/Auth';

// 상담 내역 조회 (cnslTp: '3'=AI상담만, 'counselor'=상담사상담만, 미지정=전체)
export const getMyCnslList = async (page = 0, size = 10, cnslTp = null) => {
  const params = { page, size };
  if (cnslTp != null && cnslTp !== '') params.cnslTp = cnslTp;
  const response = await authApi.get('/api/mypage/cnsllist', { params });
  return response.data;
};
