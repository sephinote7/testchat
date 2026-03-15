/**
 * API에서 오는 created_at 등은 타임존 없이 전달됨(백엔드 UTC 기준).
 * UTC로 파싱한 뒤 사용자 로컬 시간으로 표시하기 위한 유틸.
 * 정렬은 서버에서 받은 원본 값(또는 parseApiUtc 반환 Date) 기준으로 하면 됨.
 */

/**
 * API datetime 문자열을 UTC로 간주하고 로컬 Date로 파싱.
 * @param {string|null|undefined} apiDatetime - e.g. "2026-03-15T14:13:16.967958"
 * @returns {Date|null} 로컬 시간으로 해석된 Date (invalid이면 null)
 */
export function parseApiUtc(apiDatetime) {
  if (apiDatetime == null || typeof apiDatetime !== 'string') return null;
  const s = apiDatetime.trim();
  if (!s) return null;
  const iso = s.endsWith('Z') ? s : s + 'Z';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * API UTC datetime → 목록용 짧은 날짜 (예: 26.03.15)
 */
export function formatUtcToShortDate(apiDatetime) {
  const d = parseApiUtc(apiDatetime);
  if (!d) return '—';
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

/**
 * API UTC datetime → 상세/댓글용 날짜+시간 (로컬)
 */
export function formatUtcToLocalDateTime(apiDatetime) {
  const d = parseApiUtc(apiDatetime);
  if (!d) return '—';
  return d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * API UTC datetime → "YYYY-MM-DD HH:mm" 형태 (로컬)
 */
export function formatUtcToLocalYMDHM(apiDatetime) {
  const d = parseApiUtc(apiDatetime);
  if (!d) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
