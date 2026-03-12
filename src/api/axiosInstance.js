/**
 * 백엔드 API용 axios 인스턴스
 * - baseURL: config.BASE_URL (VITE_BACKEND_URL / VITE_API_BASE_URL, fallback localhost:8080)
 */
import axios from 'axios';
import { BASE_URL } from './config';

export const BACKEND_BASE = BASE_URL;

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
  withCredentials: true,
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
