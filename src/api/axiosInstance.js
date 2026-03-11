/**
 * 백엔드 API용 axios 인스턴스
 * - baseURL: .env의 VITE_BACKEND_URL (없으면 http://localhost:8080)
 * - 요청 시 X-User-Id 헤더 자동 설정
 */

import axios from 'axios';

export const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export function getHeaders(userId = null) {
  const headers = { 'Content-Type': 'application/json' };
  const hasValidUserId = userId != null && String(userId).trim() !== '' && String(userId) !== 'anonymous';
  const xUserId = hasValidUserId
    ? String(userId).trim()
    : (localStorage.getItem('dummyUser')
        ? (() => {
            try {
              const u = JSON.parse(localStorage.getItem('dummyUser'));
              return u?.id ?? 'anonymous';
            } catch {
              return 'anonymous';
            }
          })()
        : 'anonymous');
  headers['X-User-Id'] = xUserId;
  return headers;
}

const axiosInstance = axios.create({
  baseURL: BACKEND_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 응답 에러 시 메시지 정리 후 throw
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const msg = data?.error || data?.message || error.message || `HTTP ${error.response?.status || 'Error'}`;
    if (error.response) {
      console.error('[API Error]', error.response.status, error.config?.url, data);
    }
    throw new Error(msg);
  }
);

export default axiosInstance;
