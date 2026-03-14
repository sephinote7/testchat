import axios from 'axios';
import { BASE_URL } from './config';
import { authApi } from '../axios/Auth';
import { mlAuthApi } from '../axios/MlAuth';

// [실시간 인기글]
export const getRealtimePopularPosts = async (period) => {
  try {
    const { data } = await authApi.get(`/api/bbs_popularPostRealtimeList`, {
      params: {
        period,
      },
    });

    return data;
  } catch (error) {
    const status = error?.response?.status;
    if (status >= 500) {
      console.warn('getRealtimePopularPosts: 서버 일시 오류');
    } else {
      console.error('getRealtimePopularPosts error:', error?.message ?? error);
    }
    throw error;
  }
};

// [주간 인기글]
export const getWeeklyPopularPosts = async (period) => {
  try {
    const { data } = await authApi.get(`/api/bbs_popularPostWeeklyList`, {
      params: {
        period,
      },
    });

    return data;
  } catch (error) {
    console.error('getWeeklyPopularPosts error:', error);
    throw error;
  }
};

// [월간 인기글]
export const getMonthlyPopularPosts = async (period) => {
  try {
    const { data } = await authApi.get(`/api/bbs_popularPostMonthlyList`, {
      params: {
        period,
      },
    });

    return data;
  } catch (error) {
    console.error('getWeeklyPopularPosts error:', error);
    throw error;
  }
};

// [월간 인기글 (파이썬)]
export const getMonthlyPopularPosts_py = async () => {
  try {
    const { data } = await mlAuthApi.get(`/monthly-top`);

    return data;
  } catch (error) {
    console.error('getMonthlyPopularPosts error:', error);
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
      return { recommendations: [] };
    }
    console.error('getRecommendedPosts error:', error);
    throw error;
  }
};

// [이번 주 키워드. 엔드포인트 없거나 404/500 시 빈 키워드 반환]
export const getWeeklyKeywords = async () => {
  try {
    const { data } = await mlAuthApi.get(`/weekly-keywords`);
    return data ?? { keywords: [] };
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401 || status === 404 || status >= 500) {
      console.warn('getWeeklyKeywords: 인증/미제공/서버 오류, 빈 키워드 반환');
      return { keywords: [] };
    }
    console.error('getWeeklyKeywords error:', error);
    throw error;
  }
};
