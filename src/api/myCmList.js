import { authApi } from '../axios/Auth';

export const fetchMyCommentList = async (page = 0, size = 20, keyword = '') => {
  try {
    const response = await authApi.get('/api/mypage/commentlist', {
      params: {
        // 컴포넌트에서 전달한 검색어가 여기에 담겨 서버로 날아갑니다.
        keyword: keyword,
        page: page,
        size: size,
        sort: 'createdAt,desc',
      },
    });
    return response.data;
  } catch (error) {
    console.error('댓글 목록을 불러오는데 실패했습니다:', error);
    throw error;
  }
};
