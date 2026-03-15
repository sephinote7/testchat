import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

/** ML/추천 API 서버. 미설정 시 백엔드(api.gmss.site)로 보내 405(프론트로 요청 가는 것) 방지. 워드클라우드 이미지 URL 등에서도 사용 */
export const ML_API_BASE =
  import.meta.env.VITE_FASTAPI_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  'http://localhost:8080';

export const mlAuthApi = axios.create({
  baseURL: ML_API_BASE,
  withCredentials: true, // ML이 백엔드(api.gmss.site)로 갈 때 쿠키 포함
});

mlAuthApi.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers['Content-Type'] = 'application/json';

  return config;
});
