import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { refreshAccessToken } from '../axios/Auth.js';

export const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

/** 로그인 토큰: Zustand → localStorage 순 조회. Spring JWT 검증용으로만 사용 (커스텀 헤더 X-User-Email 등 없음) */
function getAccessToken() {
  const storeToken = useAuthStore.getState().accessToken;
  if (storeToken) return storeToken;
  return (
    localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('access_token') || ''
  );
}

/** 요청 공통 헤더. Content-Type + Authorization(Bearer) 만 사용 (X-User-Email 등 커스텀 헤더 없음, Spring JWT만 사용) */
export function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

const axiosInstance = axios.create({
  baseURL: BACKEND_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // api.gmss.site 쿠키(refreshToken 등) 전송
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    config.headers = {
      ...(config.headers || {}),
      ...getHeaders(),
    };
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
    const status = error.response?.status;
    const msg =
      status >= 500
        ? '서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해 주세요.'
        : data?.error || data?.message || error.message || `HTTP ${status || 'Error'}`;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (useAuthStore.getState().accessToken) {
        return axiosInstance.request(originalRequest);
      }
    }

    if (error.response) {
      const url = error.config?.url;
      if (status >= 500) {
        console.warn('[API Error]', status, url, '(서버 일시 오류)');
      } else {
        console.error('[API Error]', status, url, data);
      }
    }

    throw new Error(msg);
  },
);

export default axiosInstance;
