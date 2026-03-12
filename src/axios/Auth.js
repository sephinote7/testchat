import axios from 'axios';
import { BASE_URL } from '../api/config';
import { useAuthStore } from '../store/auth.store';

export const authApi = axios.create({
  baseURL: BASE_URL || undefined,
  withCredentials: true, // refreshToken cookie
});

authApi.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers['Content-Type'] = 'application/json';

  return config;
});

export const refreshAccessToken = async () => {
  const { setAccessToken, setLoginStatus, setEmail, clearAuth, setNickname, setRoleName } = useAuthStore.getState();

  if (!BASE_URL || BASE_URL === 'undefined') {
    clearAuth();
    return null;
  }

  // 아직 refreshToken 쿠키가 없으면(최초 진입 등) 갱신을 시도하지 않는다.
  const hasRefresh = document.cookie
    .split(';')
    .map((c) => c.trim())
    .some((c) => c.startsWith('refreshToken='));

  if (!hasRefresh) {
    console.warn('토큰 갱신 스킵 (refreshToken 없음)');
    return null;
  }

  try {
    const res = await axios.post(`${BASE_URL}/api/auth/refresh`, null, {
      withCredentials: true,
    });
    const data = res.data;
    console.log('리플래쉬 자료 전송 완료');
    console.log(data);

    setAccessToken(data.accessToken);
    setLoginStatus(true);
    setEmail(data.email);
    setNickname(data.nickname);
    setRoleName(data.roleNames?.[0]);
    return data;
  } catch (error) {
    if (error?.response?.status === 401) {
      console.warn('refresh 401 → 로그아웃 처리');
      clearAuth();
      window.location.href = '/member/signin';
      return null;
    }

    // FastAPI(localhost:8000) 미실행 시 ERR_NETWORK 발생 가능 → 경고만 출력
    if (error?.code === 'ERR_NETWORK') {
      console.warn('토큰 갱신 스킵 (auth API 연결 불가. VITE_API_BASE_URL 서버가 꺼져 있으면 정상 동작입니다.)');
    } else {
      console.error('토큰 갱신 실패 : ', error);
    }
    clearAuth();
    return null;
  }
};

export const signOut = async () => {
  const clearAuth = useAuthStore.getState().clearAuth;

  try {
    const { data } = await authApi.post('/api/auth/signout');
    return data;
  } catch (error) {
    console.error('로그아웃 요청 실패 : ', error);
  } finally {
    clearAuth();
  }
};
