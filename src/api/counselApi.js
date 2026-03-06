import axios from 'axios';
import { BASE_URL } from './config';
import { authApi } from '../axios/Auth';

/**
 * 상담 관리 API
 * TODO: 백엔드 API 구현 후 실제 엔드포인트로 교체
 */

/**
 * 통계 데이터 가져오기
 */

// [기간 내 상담 건수 : 상담 상태별]
export const fetchConsultationStatusCounts = async ({ cnslerId, startDate, endDate }) => {
  try {
    const { data } = await authApi.get('/api/cnslReg_statusStatistics', {
      params: {
        cnslerId,
        startDate,
        endDate,
      },
    });

    return data;
  } catch (error) {
    console.error('fetchConsultationStatusCounts error:', error);
    throw error;
  }
};

// [기간 내 상담 건수 : 카테고리별]
export const fetchConsultationCategoryCounts = async ({ cnslerId, startDate, endDate }) => {
  try {
    const { data } = await authApi.get('/api/cnslReg_categoryStatistics', {
      params: {
        cnslerId,
        startDate,
        endDate,
      },
    });

    return data;
  } catch (error) {
    console.error('fetchConsultationCategoryCounts error:', error);
    throw error;
  }
};

// [일자별 예약 및 완료 건수 추이]
export const fetchDailyReservationCompletionTrend = async ({ cnslerId, startDate, endDate }) => {
  try {
    const { data } = await authApi.get('/api/cnslReg_dailyStatusStatistics', {
      params: {
        cnslerId,
        startDate,
        endDate,
      },
    });

    return data;
  } catch (error) {
    console.error('fetchDailyReservationCompletionTrend error:', error);
    throw error;
  }
};

// [선택 기간 내 수익, 최근 3달 수익]
export const fetchMyRevenueSummary = async ({ cnslerId, startDate, endDate }) => {
  try {
    const { data } = await authApi.get('/api/cnslReg_revenueSummary', {
      params: {
        cnslerId,
        startDate,
        endDate,
      },
    });

    return data;
  } catch (error) {
    console.error('fetchMyRevenueSummary error:', error);
    throw error;
  }
};

// [가장 많은 상담 유형]
export const fetchMostConsultedType = async ({ cnslerId, startDate, endDate }) => {
  try {
    const { data } = await authApi.get('/api/cnslReg_topTypeStatistics', {
      params: {
        cnslerId,
        startDate,
        endDate,
      },
    });

    return data;
  } catch (error) {
    console.error('fetchMostConsultedType error:', error);
    throw error;
  }
};

export const fetchCounselStats = async () => {
  try {
    // TODO: 실제 API 호출로 교체
    // const response = await fetch(`${API_BASE_URL}/counsel/stats`);
    // if (!response.ok) throw new Error('통계 데이터 로드 실패');
    // return await response.json();

    // ========== 더미 데이터 시작 (DB 연동 시 아래 전체 삭제) ==========
    return {
      riskCount: 2, // 위험군 상담 건수
      completedCount: 5, // 완료 상담 건수
      reservedCount: 10, // 예약 상담 건수 (ACCEPTED + PENDING)
      totalCount: 15, // 전체 상담 건수
    };
    // ========== 더미 데이터 끝 (여기까지 삭제) ==========
  } catch (error) {
    console.error('fetchCounselStats error:', error);
    throw error;
  }
};

/**
 * 타임라인 데이터 가져오기
 */
export const fetchCounselTimeline = async () => {
  try {
    // TODO: 실제 API 호출로 교체
    // const response = await fetch(`${API_BASE_URL}/counsel/timeline`);
    // if (!response.ok) throw new Error('타임라인 데이터 로드 실패');
    // return await response.json();

    // ========== 더미 데이터 시작 (DB 연동 시 아래 전체 삭제) ==========
    return [
      { day: '13일', reserved: 2, completed: 1 },
      { day: '15일', reserved: 4, completed: 2 },
      { day: '17일', reserved: 3, completed: 2 },
      { day: '19일', reserved: 3, completed: 1 },
      { day: '21일', reserved: 2, completed: 3 },
      { day: '23일', reserved: 1, completed: 2 },
      { day: '25일', reserved: 2, completed: 1 },
      { day: '27일', reserved: 1, completed: 0 },
      { day: '29일', reserved: 5, completed: 2 },
      { day: '31일', reserved: 3, completed: 2 },
    ];
    // ========== 더미 데이터 끝 (여기까지 삭제) ==========
  } catch (error) {
    console.error('fetchCounselTimeline error:', error);
    throw error;
  }
};

/**
 * 모든 상담 내역 가져오기
 */
export const fetchAllCounsels = async ({ page, size, cnslerId }) => {
  try {
    const { data } = await authApi.get(`/api/cnslReg_allList/${cnslerId}`, {
      params: {
        page,
        size,
      },
    });

    return data;
  } catch (error) {
    console.error('fetchAllCounsels error:', error);
    throw error;
  }
};

/*
 * 상담 상태에 따른 리스트 가져오기 (상담 수락 = B, 상담 진행 중 = C, 상담 끝 = D)
 */
export const fetchCounselsByStatus = async ({ page, size, status, cnslerId }) => {
  try {
    const { data } = await authApi.get(`/api/cnslReg_statusList/${cnslerId}`, {
      params: {
        page,
        size,
        status,
      },
    });

    return data;
  } catch (error) {
    console.error('fetchCounsels error:', error);
    throw error;
  }
};

/*
 * 상담 수락 전 리스트 가져오기
 */
export const fetchCounselsBeforeAccept = async ({ page, size, cnslerId }) => {
  try {
    const { data } = await authApi.get(`/api/cnslReg_pendingReservationList/${cnslerId}`, {
      params: {
        page,
        size,
      },
    });

    return data;
  } catch (error) {
    console.error('fetchCounselsBeforeAccept error:', error);
    throw error;
  }
};

/**
 * 상담 상세 정보 가져오기
 */
export const fetchCounselDetail = async (cnslId) => {
  try {
    // TODO: 실제 API 호출로 교체
    const { data } = await authApi.get(`/api/cnslReg_counsels/${cnslId}`);
    return data;
  } catch (error) {
    console.error('fetchCounselDetail error:', error);
    throw error;
  }
};

/**
 * 상담 수락하기
 */
export const acceptCounsel = async ({ cnslId, message }) => {
  try {
    // TODO: 실제 API 호출로 교체 => 완료
    const response = await authApi.post(`/api/cnslReg_approve/${cnslId}`, {
      message,
    });
    console.log('상담 수락:', cnslId);
    return response;
  } catch (error) {
    console.error('acceptCounsel error:', error);
    throw error;
  }
};

/**
 * 상담 거절하기
 */
export const rejectCounsel = async ({ cnslId, reason }) => {
  try {
    // TODO: 실제 API 호출로 교체 => 완료
    const response = await authApi.post(`/api/cnslReg_reject/${cnslId}`, {
      message: reason,
    });

    console.log('상담 거절:', cnslId, reason);
    return response;
  } catch (error) {
    const errorMessage = error?.response?.data;
    console.error('rejectCounsel error:', errorMessage);
    throw error;
  }
};
