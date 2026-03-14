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
    // 기존 `/api/bbsRisk_realtimeList` 대신, 현재 백엔드 표준 위험 감지 API 사용
    // BbsRisk 응답을 대시보드에서 쓰는 형태로 가공해서 반환
    const { data } = await authApi.get(`/api/risks/recent`);
    const list = Array.isArray(data) ? data : (data?.content ?? []);

    const pad2 = (n) => String(n).padStart(2, '0');
    const formatDateTime = (dateStr) => {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    };

    const extractMaxSeverity = (detectedKeywords) => {
      if (!detectedKeywords) return 0;
      const text = String(detectedKeywords);
      // recordRiskPost에서 "...(심각도:5)" 형태로 저장됨
      const matches = [...text.matchAll(/심각도\s*[:：]\s*(\d)/g)];
      const nums = matches.map((m) => Number(m[1])).filter((n) => Number.isFinite(n));
      if (nums.length === 0) return 0;
      return Math.max(...nums);
    };

    const severityToLevel = (maxSeverity) => {
      if (maxSeverity >= 4) return '높음';
      if (maxSeverity === 3) return '중간';
      if (maxSeverity >= 1) return '낮음';
      return '—';
    };

    return list.map((r) => ({
      id: r.id ?? `${r.tableId ?? 'bbs'}-${r.bbsId ?? ''}-${r.createdAt ?? ''}`,
      riskDate: formatDateTime(r.createdAt),
      type: r.bbsDiv || r.tableId || '상담',
      nickname: r.memberId
        ? `${String(r.memberId).slice(0, 2)}***`
        : '-',
      keyword: r.detectedKeywords || '-',
      riskLevel: severityToLevel(extractMaxSeverity(r.detectedKeywords)),
      maxSeverity: extractMaxSeverity(r.detectedKeywords),
      action: r.action || '진행 중',
    }));
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
