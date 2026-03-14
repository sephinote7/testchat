/**
 * Spring 백엔드 API 클라이언트 (axios 연동)
 * - 게시판(BBS), 리뷰, 민감키워드/위험게시물, 활동내역
 * - 로그인 연동 전에는 X-User-Id를 'anonymous' 또는 개발용 ID로 전달
 * - 백엔드 주소: .env에 VITE_BACKEND_URL 설정 (기본값 http://localhost:8080)
 */

import axiosInstance, { BACKEND_BASE, getHeaders } from './axiosInstance.js';

async function request(method, path, options = {}) {
  const { body, userId } = options;
  const config = {
    method,
    url: path,
    headers: getHeaders(userId),
    ...(body != null && { data: body }),
  };
  const res = await axiosInstance.request(config);
  return res.data;
}

// ========== 게시판 (BBS) ==========
export const bbsApi = {
  getList(params = {}) {
    const { page = 1, limit = 10, bbs_div, del_yn = 'N' } = params;
    const q = new URLSearchParams({ page, limit, del_yn });
    if (bbs_div) q.set('bbs_div', bbs_div);
    return request('GET', `/api/bbs?${q}`);
  },

  getById(id) {
    return request('GET', `/api/bbs/${id}`);
  },

  create(body, userId) {
    return request('POST', '/api/bbs', { body, userId });
  },

  update(id, body, userId) {
    return request('PUT', `/api/bbs/${id}`, { body, userId });
  },

  delete(id, userId) {
    return request('DELETE', `/api/bbs/${id}`, { userId });
  },

  /** 응답이 배열이거나 { content / data / result / body } 형태일 때 배열 추출 */
  _normalizePopularList(data) {
    if (Array.isArray(data)) return data;
    if (data == null || typeof data !== 'object') return [];
    const arr =
      data.content ?? data.data ?? data.result ?? data.body ?? data.list ?? [];
    return Array.isArray(arr) ? arr : [];
  },

  getPopularRealtime() {
    return request('GET', '/api/bbs_popularPostRealtimeList?period=realtime').then((data) =>
      bbsApi._normalizePopularList(data),
    );
  },

  getPopularWeekly() {
    return request('GET', '/api/bbs_popularPostWeeklyList?period=week').then((data) =>
      bbsApi._normalizePopularList(data),
    );
  },

  getPopularMonthly() {
    return request('GET', '/api/bbs_popularPostMonthlyList?period=month').then((data) =>
      bbsApi._normalizePopularList(data),
    );
  },

  getComments(bbsId) {
    return request('GET', `/api/bbs/${bbsId}/comments`);
  },

  addComment(bbsId, body, userId) {
    return request('POST', `/api/bbs/${bbsId}/comments`, { body, userId });
  },

  /** 댓글 좋아요(true) / 싫어요(false) */
  toggleCommentLike(cmtId, body, userId) {
    return request('POST', `/api/bbs/comments/${cmtId}/like`, { body, userId });
  },

  deleteComment(cmtId, userId) {
    return request('DELETE', `/api/bbs/comments/${cmtId}`, { userId });
  },

  toggleLike(bbsId, body, userId) {
    return request('POST', `/api/bbs/${bbsId}/like`, { body, userId });
  },

  getLikeCounts(bbsId) {
    return request('GET', `/api/bbs/${bbsId}/like-counts`);
  },
};

// ========== 위험 게시물 (Risks) ==========
export const risksApi = {
  getList(params = {}) {
    const { page = 1, limit = 20 } = params;
    return request('GET', `/api/risks?page=${page}&limit=${limit}`);
  },

  getById(id) {
    return request('GET', `/api/risks/${id}`);
  },

  getRecent() {
    return request('GET', '/api/risks/recent');
  },

  getStats(days = 7) {
    return request('GET', `/api/risks/stats?days=${days}`);
  },

  checkContent(content) {
    return request('POST', '/api/risks/check', { body: { content } });
  },
};

// ========== 민감 키워드 (Keywords) - Spring 백엔드 ==========
export const keywordsApi = {
  getList() {
    return request('GET', '/api/keywords').then((data) => (Array.isArray(data) ? data : []));
  },

  add(body) {
    return request('POST', '/api/keywords', { body }).then((res) => res?.data ?? res);
  },

  toggle(id, isActive) {
    return request('PATCH', `/api/keywords/${id}/toggle`, { body: { is_active: isActive } });
  },
};

// ========== 활동 내역 (Activities) ==========
export const activitiesApi = {
  getList(params = {}) {
    const { page = 1, limit = 50 } = params;
    return request('GET', `/api/activities?page=${page}&limit=${limit}`);
  },

  getRecent() {
    return request('GET', '/api/activities/recent');
  },

  getStats(days = 7) {
    return request('GET', `/api/activities/stats?days=${days}`);
  },
};

// ========== 리뷰 (Reviews) ==========
export const reviewsApi = {
  getList(params = {}) {
    const { page = 1, limit = 10, cnsl_id, member_id } = params;
    const q = new URLSearchParams({ page, limit });
    if (cnsl_id != null) q.set('cnsl_id', cnsl_id);
    if (member_id != null) q.set('member_id', member_id);
    return request('GET', `/api/reviews?${q}`);
  },

  getById(id) {
    return request('GET', `/api/reviews/${id}`);
  },

  create(body, userId) {
    return request('POST', '/api/reviews', { body, userId });
  },

  update(id, body, userId) {
    return request('PUT', `/api/reviews/${id}`, { body, userId });
  },

  delete(id, userId) {
    return request('DELETE', `/api/reviews/${id}`, { userId });
  },

  getAverageByCounsel(cnslId) {
    return request('GET', `/api/reviews/counsel/${cnslId}/average`);
  },
};

// ========== 상담사 상담 내역 (Cnsl) ==========
export const cnslApi = {
  async getListByCounselor(cnslerId, params = {}, userId) {
    const { status, page = 0, size = 10 } = params;
    const q = new URLSearchParams({ page, size });
    if (status) q.set('status', status);

    const res = await axiosInstance.get(`/api/cnslReg_allList/${encodeURIComponent(cnslerId)}?${q}`, {
      headers: getHeaders(userId),
    });

    if (res.status === 204) {
      return { content: [], totalElements: 0, totalPages: 0, number: page, size };
    }

    return res.data;
  },

  async getRsvListByCounselor(cnslerId, params = {}, userId) {
    const { page = 0, size = 10 } = params;
    const q = new URLSearchParams({ page, size });

    const res = await axiosInstance.get(`/api/cnslReg_pendingReservationList/${encodeURIComponent(cnslerId)}?${q}`, {
      headers: getHeaders(userId),
    });

    if (res.status === 204) {
      return { content: [], totalElements: 0, totalPages: 0, number: page, size };
    }

    return res.data;
  },
};

// ========== 상담센터 위치 (Centers) ==========
export const centersApi = {
  getList(params = {}) {
    const { query = '', page = 1, pageSize = 7, lat, lng, radiusKm } = params;
    const q = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (query) q.set('query', query);
    if (lat != null) q.set('lat', String(lat));
    if (lng != null) q.set('lng', String(lng));
    if (radiusKm != null && radiusKm > 0) q.set('radiusKm', String(radiusKm));

    return request('GET', `/api/centers?${q}`);
  },

  getById(id) {
    return request('GET', `/api/centers/${id}`);
  },

  getKakaoNearby(params = {}) {
    const { lat, lng, radiusKm = 5 } = params;
    const q = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radiusKm: String(radiusKm),
    });

    return request('GET', `/api/centers/kakao-nearby?${q}`);
  },

  getKakaoKeywordSearch(params = {}) {
    const { query = '', lat, lng, radiusKm = 5 } = params;

    const q = new URLSearchParams({
      query: String(query).trim(),
      radiusKm: String(radiusKm),
    });

    if (lat != null) q.set('lat', String(lat));
    if (lng != null) q.set('lng', String(lng));

    return request('GET', `/api/centers/search/keyword?${q}`);
  },
};

// ========== 회원 동기화 (Supabase Auth → Spring member 테이블) ==========
export const memberApi = {
  sync(body) {
    return request('POST', '/api/member/sync', { body });
  },
};

export { BACKEND_BASE, getHeaders };
