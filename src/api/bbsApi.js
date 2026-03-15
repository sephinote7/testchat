import axios from 'axios';
import { BASE_URL } from './config';
import { authApi } from '../axios/Auth';
import { mlAuthApi } from '../axios/MlAuth';

// [실시간 인기글. 5xx 시 빈 배열 반환해 UI에서 "서버 오류" 대신 빈 목록 표시]
export const getRealtimePopularPosts = async (period) => {
  try {
    const { data } = await authApi.get(`/api/bbs_popularPostRealtimeList`, {
      params: {
        period,
      },
    });

    return Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
  } catch (error) {
    const status = error?.response?.status;
    if (status != null && status >= 500) {
      console.warn('getRealtimePopularPosts: 서버 일시 오류(5xx), 빈 목록 반환', status);
      return { list: [], serverError: true };
    }
    console.error('getRealtimePopularPosts error:', error?.message ?? error);
    throw error;
  }
};

// [주간 인기글. 5xx 시 빈 배열 반환]
export const getWeeklyPopularPosts = async (period) => {
  try {
    const { data } = await authApi.get(`/api/bbs_popularPostWeeklyList`, {
      params: {
        period,
      },
    });

    return Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
  } catch (error) {
    const status = error?.response?.status;
    if (status != null && status >= 500) {
      console.warn('getWeeklyPopularPosts: 서버 일시 오류(5xx), 빈 목록 반환', status);
      return { list: [], serverError: true };
    }
    console.error('getWeeklyPopularPosts error:', error);
    throw error;
  }
};

// [월간 인기글. 5xx 시 빈 배열 반환]
export const getMonthlyPopularPosts = async (period) => {
  try {
    const { data } = await authApi.get(`/api/bbs_popularPostMonthlyList`, {
      params: {
        period,
      },
    });

    return Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
  } catch (error) {
    const status = error?.response?.status;
    if (status != null && status >= 500) {
      console.warn('getMonthlyPopularPosts: 서버 일시 오류(5xx), 빈 목록 반환', status);
      return { list: [], serverError: true };
    }
    console.error('getMonthlyPopularPosts error:', error);
    throw error;
  }
};

// [월간 인기글 (파이썬). 5xx/503 시 빈 목록 반환]
export const getMonthlyPopularPosts_py = async () => {
  try {
    const { data } = await mlAuthApi.get(`/monthly-top`);

    const posts = data?.posts ?? data?.content ?? data?.data;
    return Array.isArray(posts) ? { posts } : { posts: [] };
  } catch (error) {
    const status = error?.response?.status;
    if (status === 503 || (status != null && status >= 500)) {
      console.warn('getMonthlyPopularPosts_py: 서버/ML 일시 오류(5xx/503), 빈 목록 반환', status);
      return { posts: [], serverError: true };
    }
    console.error('getMonthlyPopularPosts_py error:', error);
    throw error;
  }
};

// [추천순 (ML/파이썬). 엔드포인트 없거나 404/405 시 빈 목록 반환]
export const getRecommendedPosts = async (email) => {
  try {
    const { data } = await mlAuthApi.post(`/recommend`, {
      user_id: email,
    });
    return data ?? { recommendations: [] };
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404 || status === 405 || status === 503 || (status != null && status >= 500)) {
      console.warn('getRecommendedPosts: 추천 API 미제공/일시 오류(404/405/5xx/503), 빈 목록 반환', status);
      return { recommendations: [], serverError: true };
    }
    console.error('getRecommendedPosts error:', error);
    throw error;
  }
};

// [이번 주 키워드. 엔드포인트 없거나 404/500/요청 취소 시 빈 키워드 반환]
// timeout: Render 콜드 스타트 대기(최대 60초) 후에도 응답 없으면 실패 처리
const WEEKLY_KEYWORDS_TIMEOUT_MS = 60000;

export const getWeeklyKeywords = async () => {
  try {
    const { data } = await mlAuthApi.get(`/weekly-keywords`, {
      timeout: WEEKLY_KEYWORDS_TIMEOUT_MS,
    });
    return data ?? { keywords: [] };
  } catch (error) {
    const status = error?.response?.status;
    const msg = typeof error?.message === 'string' ? error.message.toLowerCase() : '';
    const isAborted =
      error?.code === 'ERR_CANCELED' ||
      error?.name === 'CanceledError' ||
      msg.includes('aborted') ||
      msg.includes('cancel');
    if (isAborted) {
      return { keywords: [] };
    }
    if (status === 401 || status === 404 || status >= 500) {
      console.warn('getWeeklyKeywords: 인증/미제공/서버 오류, 빈 키워드 반환');
      return { keywords: [] };
    }
    // ECONNABORTED = timeout; 네트워크/서버 지연 시에도 빈 키워드로 처리해 UI는 유지
    if (error?.code === 'ECONNABORTED') {
      console.warn('getWeeklyKeywords: 요청 시간 초과(서버 대기 중일 수 있음), 빈 키워드 반환');
      return { keywords: [] };
    }
    console.error('getWeeklyKeywords error:', error);
    throw error;
  }
};
