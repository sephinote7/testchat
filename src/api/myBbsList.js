import { authApi } from '../axios/Auth';

export const getMyBbsList = async (keyword = '', page = 0, size = 20) => {
  const { data } = await authApi.get('/api/mypage/postlist', {
    params: {
      keyword,
      page,
      size,
      sort: 'created_at,desc',
    },
  });
  return data;
};
