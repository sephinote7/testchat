import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const mlAuthApi = axios.create({
  baseURL: import.meta.env.VITE_FASTAPI_URL,
});

mlAuthApi.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers['Content-Type'] = 'application/json';

  return config;
});
