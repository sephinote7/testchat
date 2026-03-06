import axios from 'axios';
import { BASE_URL } from './config';

// 토큰 리프레시
export const refreshToken = async () => {
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/refresh`,
    {}, // 바디 없음
    {
      withCredentials: true, // 쿠키 포함 필수
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return data;
};
