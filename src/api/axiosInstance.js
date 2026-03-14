import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { refreshAccessToken } from '../axios/Auth.js';

export const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

/** 로그인 토큰: Zustand(권장) → localStorage 순으로 조회 (상담사/관리자 민감키워드 검사 등 인증 API용) */
function getAccessToken() {
  const storeToken = useAuthStore.getState().accessToken;
  if (storeToken) return storeToken;
  return (
    localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('access_token') || ''
  );
}

export function getHeaders(userId = null) {
  const headers = { 'Content-Type': 'application/json' };

  const hasValidUserId = userId != null && String(userId).trim() !== '' && String(userId) !== 'anonymous';

  const xUserId = hasValidUserId
    ? String(userId).trim()
    : localStorage.getItem('dummyUser')
      ? (() => {
          try {
            const u = JSON.parse(localStorage.getItem('dummyUser'));
            return u?.id ?? 'anonymous';
          } catch {
            return 'anonymous';
          }
        })()
      : 'anonymous';

  headers['X-User-Id'] = xUserId;

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

const axiosInstance = axios.create({
  baseURL: BACKEND_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 보낼 때 Authorization 자동 부착
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = getAccessToken();

//     config.headers = {
//       ...(config.headers || {}),
//       ...(getHeaders() || {}),
//     };

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    const incomingXUserId = (config.headers || {})['X-User-Id'];

    config.headers = {
      ...(config.headers || {}),
      ...(getHeaders() || {}),
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // backendApi 등에서 넘긴 userId가 있으면 덮어쓰지 않음 (anonymous로 바뀌면 Spring에서 401 낌)
    if (
      incomingXUserId != null &&
      String(incomingXUserId).trim() !== '' &&
      String(incomingXUserId) !== 'anonymous'
    ) {
      config.headers['X-User-Id'] = String(incomingXUserId).trim();
    }

    console.log('[REQ]', config.method?.toUpperCase(), config.url, {
      Authorization: config.headers.Authorization,
      XUserId: config.headers['X-User-Id'],
      tokenRaw: token,
    });

    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 에러 시: 401이면 리프레시 후 1회 재시도, 그 외는 메시지 정리 후 throw
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const data = error.response?.data;
    const msg = data?.error || data?.message || error.message || `HTTP ${error.response?.status || 'Error'}`;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (useAuthStore.getState().accessToken) {
        return axiosInstance.request(originalRequest);
      }
    }

    if (error.response) {
      console.error('[API Error]', error.response.status, error.config?.url, data);
    }

    throw new Error(msg);
  },
);

export default axiosInstance;
