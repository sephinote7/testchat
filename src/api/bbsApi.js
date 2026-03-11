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
    console.error('getRealtimePopularPosts error:', error);
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

// [추천순 (파이썬)]
export const getRecommendedPosts = async (email) => {
  try {
    const { data } = await mlAuthApi.post(`/recommend`, {
      user_id: email,
    });

    return data;
  } catch (error) {
    console.error('getRecommendedPosts error:', error);
    throw error;
  }
};

// [이번 주 키워드]
export const getWeeklyKeywords = async () => {
  try {
    const { data } = await mlAuthApi.get(`/weekly-keywords`);

    return data;
  } catch (error) {
    console.error('getWeeklyKeywords error:', error);
    throw error;
  }
};
