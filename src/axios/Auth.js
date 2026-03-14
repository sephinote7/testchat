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

  try {
    const accessToken = useAuthStore.getState().accessToken;
    const res = await authApi.post('/api/auth/refresh', null, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    const data = res.data;
    setAccessToken(data.accessToken);
    setLoginStatus(true);
    setEmail(data.email);
    setNickname(data.nickname);
    setRoleName(data.roleNames[0]);
    return data.accessToken;
  } catch (error) {
    const status = error.response?.status;
    const isServerError = status >= 500 || status === 502 || status === 503 || status === 504;
    if (isServerError) {
      console.warn('토큰 갱신 실패: 서버 일시 오류. 로그인이 필요할 수 있습니다.');
    } else {
      console.warn('토큰 갱신 실패:', error.response?.data?.message || error.message || status);
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

export const deleteMember = async () => {
  const clearAuth = useAuthStore.getState().clearAuth;

  try {
    const { data } = await authApi.delete('/api/auth/delete');
    return data;
  } catch (error) {
    console.error('회원탈퇴 요청 실패 : ', error);
  } finally {
    clearAuth();
  }
};
