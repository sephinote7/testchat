import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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

  // try {
  //   const accessToken = useAuthStore.getState().accessToken;
  //   const res = await authApi.post('/api/auth/refresh', null, {
  //     headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  //   });
  try {
    // 주의: 인터셉터가 붙은 authApi 대신 기본 axios를 사용하여
    // 만료된 토큰이 헤더에 포함되지 않도록 합니다.
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, null, {
      withCredentials: true,
    });
    const data = res.data;
    console.log('리플래쉬 자료 전송 완료');
    console.log(data);

    setAccessToken(data.accessToken);
    setLoginStatus(true);
    setEmail(data.email);
    setNickname(data.nickname);
    setRoleName(data.roleNames[0]);
  } catch (error) {
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
