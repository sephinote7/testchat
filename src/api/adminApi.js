import axios from 'axios';
import { BASE_URL } from './config';
import { authApi } from '../axios/Auth';

// [기간 내 상담 건수 및 수익 : 카테고리별]
export const getCategoryRevenueStatistics = async ({ startDate, endDate }) => {
  try {
    const { data } = await authApi.get(`/api/cnslReg_categoryRevenueStatistics`, {
      params: {
        startDate,
        endDate,
      },
    });

    return data;
  } catch (error) {
    console.error('getCategoryRevenueStatistics error:', error);
    throw error;
  }
};

// [기간 내 상담 건수 및 수익 : 상담 유형별]
export const getTypeRevenueStatistics = async ({ startDate, endDate }) => {
  try {
    const { data } = await authApi.get(`/api/cnslReg_typeRevenueStatistics`, {
      params: {
        startDate,
        endDate,
      },
    });

    return data;
  } catch (error) {
    console.error('getTypeRevenueStatistics error:', error);
    throw error;
  }
};

// [실시간 위험 감지 및 조치 현황]
export const getRealtimeRiskDetectionStatus = async () => {
  try {
    const { data } = await authApi.get(`/api/bbsRisk_realtimeList`);

    return data;
  } catch (error) {
    console.error('getRealtimeRiskDetectionStatus error:', error);
    throw error;
  }
};

// [정산현황 : 일자별전체 상담사 내역 관련 집계 (최근일, 상담매출액순)]
export const getLatestlyCounselorRevenue = async () => {
  try {
    const { data } = await authApi.get(`/api/cnslReg_latestRevenue`);
    return data;
  } catch (error) {
    console.error('getLatestlyCounselorRevenue error:', error);
    throw error;
  }
};
