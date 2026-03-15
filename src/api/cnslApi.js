import axios from 'axios';
import { BASE_URL } from './config';
import { authApi } from '../axios/Auth';

// 상담 예약 (상담사 예약)
export const postReservation = async ({
  cnsl_cate,
  cnsl_tp,
  member_id,
  cnsler_id,
  cnsl_title,
  cnsl_content,
  cnsl_date,
  cnsl_start_time,
}) => {
  const { data } = await authApi.post(`/api/cnslReg_create`, {
    cnsl_cate: cnsl_cate != null ? String(cnsl_cate) : undefined,
    cnsl_tp: cnsl_tp != null ? String(cnsl_tp) : undefined,
    member_id,
    cnsler_id,
    cnsl_title: cnsl_title ?? '',
    cnsl_content: cnsl_content ?? '',
    cnsl_date: cnsl_date ?? '',
    cnsl_start_time: cnsl_start_time ?? '',
  });
  return data;
};

// AI 즉시 상담 생성 (Spring DB 저장 → 마이페이지 목록 노출)
export const createAiCounseling = async () => {
  const { data } = await authApi.post('/api/cnslReg_createAi');
  return data;
};

// 진행 중 AI 상담 ID 조회 (재진입 리다이렉트용)
export const getActiveAiCnsl = async () => {
  const { data } = await authApi.get('/api/mypage/activeAiCnsl');
  return data?.cnslId ?? null;
};

// 상담 예약 시 선택한 일자에 예약된 시간 리스트
export const getAvailableSlots = async ({ cnsler_id, cnsl_dt }) => {
  const { data } = await authApi.get(`/api/cnslReg_availableTimeList`, {
    params: {
      cnslerId: cnsler_id,
      cnslDt: cnsl_dt,
    },
  });

  return data;
};

// 상담 수정
export const patchReservation = async ({
  cnsl_id,
  cnsler_id,
  cnsl_title,
  cnsl_content,
  cnsl_date,
  cnsl_start_time,
}) => {
  const { data: cnslId } = await axios.patch(
    `${BASE_URL}/api/reserve/${cnsl_id}`,
    null,
    {
      params: {
        cnsler_id,
        cnsl_title,
        cnsl_content,
        cnsl_date,
        cnsl_start_time,
      },
    },
  );

  return cnslId;
};

// 상담 취소
export const cancelReservation = async () => {
  const { data } = await axios.put(`${BASE_URL}/api/cancel/${cnslId}`);
  return data;
};

// 상담사 요금 정보 가져오기
export const getCnslPriceWithTypeName = async (email) => {
  const { data } = await authApi.get('/api/cnslInfo_getPrice', {
    params: {
      email,
    },
  });

  return data;
};

// 상담사 리스트 불러오기
export const getCounselorList = async (params) => {
  const { data } = await authApi.get('/api/counselorList', {
    params: params,
  });

  return data;
};

// 상담사 뷰
export const getCounselor = async (memberId) => {
  const { data } = await authApi.get(`/api/counselor/${memberId}`);
  return data;
};

// 특정 상담사 리뷰 목록
export const getReviews = async ({ params, memberId }) => {
  const { data } = await authApi.get(`/api/reviews/counselor/${memberId}`, {
    params: params,
  });

  return data;
};
