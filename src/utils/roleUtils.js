/**
 * 백엔드 역할 값 정규화.
 * - DB: 0 = USER, 1 = SYSTEM, 2 = ADMIN (MemberRole.ordinal())
 * - API가 숫자(0,1,2) 또는 문자열('USER','SYSTEM','ADMIN')로 올 수 있음.
 * - 항상 'USER' | 'SYSTEM' | 'ADMIN' 문자열로 통일.
 */
export function normalizeRole(role) {
  if (role === 'USER' || role === 'SYSTEM' || role === 'ADMIN') return role;
  const n = Number(role);
  if (n === 0) return 'USER';
  if (n === 1) return 'SYSTEM';
  if (n === 2) return 'ADMIN';
  return 'USER';
}
