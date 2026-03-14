/** 배포 시 Vercel 환경변수 VITE_API_BASE_URL(예: https://api.gmss.site), 로컬은 .env 또는 기본값 */
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  'http://localhost:8080';
