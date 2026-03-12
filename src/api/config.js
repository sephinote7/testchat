// 배포 시 Vercel 등에서 VITE_BACKEND_URL 또는 VITE_API_BASE_URL 설정
// 값이 없거나 문자열 "undefined"이면 로컬 개발용 fallback 사용 (배포 시 반드시 env 설정)
function getBaseUrl() {
  const raw = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || '';
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (s === '' || s === 'undefined') return 'http://localhost:8080';
  return s.replace(/\/$/, '');
}
export const BASE_URL = getBaseUrl();
