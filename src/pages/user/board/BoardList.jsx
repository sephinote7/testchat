import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MBTI_OPTIONS, toShortDate } from './boardData';
import { bbsApi } from '../../../api/backendApi';
import { useAuthStore } from '../../../store/auth.store';
import {
  getMonthlyPopularPosts,
  getMonthlyPopularPosts_py,
  getRealtimePopularPosts,
  getRecommendedPosts,
  getWeeklyPopularPosts,
} from '../../../api/bbsApi';

// 인기글 응답 캐시 (탭별 90초) — 재요청 감소로 체감 속도 개선
const POPULAR_CACHE_TTL_MS = 90 * 1000;
const popularCache = { key: null, data: [], ts: 0 };

// 목록 응답 캐시 (page+탭별 60초)
const LIST_CACHE_TTL_MS = 60 * 1000;
const listCache = { key: null, data: { content: [], totalPages: 1 }, ts: 0 };

/** 백엔드 인기글 API 응답(camelCase/snake_case) → 목록용 포스트 형태 */
function mapPopularToPost(p) {
  if (p == null || typeof p !== 'object') return null;
  const id = p.bbsId ?? p.bbs_id ?? p.id;
  const title = p.title ?? '';
  const createdAt = p.createdAt ?? p.created_at ?? null;
  const bbsDiv = p.bbs_div ?? p.bbsDiv;
  return {
    id: id != null ? Number(id) : null,
    category: bbsDiv === 'NOTI' ? '공지' : bbsDiv === 'FREE' ? '자유' : 'MBTI',
    isNotice: bbsDiv === 'NOTI',
    title: String(title),
    author: '-',
    createdAt,
    views: Number(p.views) || 0,
    likes: Number(p.bbsLikeCount ?? p.bbs_like_count) || 0,
    comments: Number(p.commentCount ?? p.comment_count) || 0,
    mbti: p.mbti ?? null,
    content: p.content ?? '',
  };
}

// 백엔드 Bbs → 프론트 목록용 포스트 형태
function mapBbsToPost(b) {
  const author =
    b.memberId?.nickname ?? b.memberId?.email ?? (typeof b.memberId === 'string' ? b.memberId : '알 수 없음');
  const category = b.bbs_div === 'NOTI' ? '공지' : b.bbs_div === 'FREE' ? '자유' : b.bbs_div || '자유';
  return {
    id: b.bbsId,
    category,
    isNotice: b.bbs_div === 'NOTI',
    title: b.title,
    author,
    createdAt: b.created_at,
    views: b.views ?? 0,
    likes: b.bbsLikeCount ?? 0,
    comments: b.commentCount ?? 0,
    mbti: b.mbti,
    content: b.content,
  };
}

const BoardList = () => {
  const location = useLocation();
  const initialActiveTab = location.state?.activeTab ?? '전체';
  const initialMbtiFilter = location.state?.mbtiFilter ?? 'MBTI';

  const { accessToken, email } = useAuthStore();

  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [mbtiFilter, setMbtiFilter] = useState(initialMbtiFilter);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [searchField, setSearchField] = useState('title+content');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularTab, setPopularTab] = useState('realtime');
  const [showMbtiDropdown, setShowMbtiDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [noticePosts, setNoticePosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [popularPosts, setPopularPosts] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // 백엔드 목록 조회 (탭에 따라 bbs_div 전달)
  const bbsDivParam = useMemo(() => {
    if (activeTab === '자유') return 'FREE';
    if (activeTab === 'MBTI') return 'MBTI';
    if (activeTab === '공지') return 'NOTI';
    return undefined;
  }, [activeTab]);

  // 공지 목록은 별도 조회해서 항상 상단 고정 노출
  useEffect(() => {
    let cancelled = false;
    bbsApi
      .getList({ page: 1, limit: 50, bbs_div: 'NOTI' })
      .then((res) => {
        if (!cancelled) setNoticePosts((res.content || []).map(mapBbsToPost));
      })
      .catch(() => {
        if (!cancelled) setNoticePosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 목록 응답 정규화: Spring Page는 { content, totalPages } 또는 배열만 올 수 있음
  const normalizeListResponse = (res) => {
    if (res == null || typeof res !== 'object') return { content: [], totalPages: 1 };
    const content = Array.isArray(res)
      ? res
      : (res.content ?? res.data ?? res.result ?? res.list ?? []);
    const arr = Array.isArray(content) ? content : [];
    const totalPages = Math.max(1, res.totalPages ?? res.total_pages ?? 1);
    return { content: arr, totalPages };
  };

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${page}-${bbsDivParam ?? 'all'}`;
    const hit = listCache.key === cacheKey && Date.now() - listCache.ts < LIST_CACHE_TTL_MS;
    if (hit && listCache.data.content) {
      setPosts(listCache.data.content.map(mapBbsToPost));
      setTotalPages(listCache.data.totalPages);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMessage('');

    if (bbsDivParam === 'FREE' || bbsDivParam === 'MBTI') {
      bbsApi
        .getList({ page, limit: pageSize, bbs_div: bbsDivParam })
        .then((res) => {
          if (cancelled) return;
          const { content: raw, totalPages: total } = normalizeListResponse(res);
          const list = raw.map(mapBbsToPost);
          setPosts(list);
          setTotalPages(Math.max(1, total));
          listCache.key = cacheKey;
          listCache.data = { content: raw, totalPages: Math.max(1, total) };
          listCache.ts = Date.now();
        })
        .catch((err) => {
          if (cancelled) return;
          setPosts([]);
          setTotalPages(1);
          setErrorMessage(err?.message || '목록을 불러오지 못했습니다. 네트워크 탭에서 GET /api/bbs 응답을 확인해 주세요.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

    bbsApi
      .getList({ page, limit: pageSize, bbs_div: bbsDivParam })
      .then((res) => {
        if (cancelled) return;
        const { content: rawContent, totalPages: total } = normalizeListResponse(res);
        let raw = [...rawContent];
        if (!bbsDivParam) {
          raw.sort((a, b) => {
            const aNoti = a.bbs_div === 'NOTI' ? 1 : 0;
            const bNoti = b.bbs_div === 'NOTI' ? 1 : 0;
            if (bNoti !== aNoti) return bNoti - aNoti;
            return (b.bbsId ?? 0) - (a.bbsId ?? 0);
          });
        }
        const list = raw.map(mapBbsToPost);
        setPosts(list);
        setTotalPages(Math.max(1, total));
        listCache.key = cacheKey;
        listCache.data = { content: raw, totalPages: Math.max(1, total) };
        listCache.ts = Date.now();
      })
      .catch((err) => {
        if (cancelled) return;
        setPosts([]);
        setTotalPages(1);
        setErrorMessage(err?.message || '목록을 불러오지 못했습니다. 네트워크 탭에서 GET /api/bbs 응답을 확인해 주세요.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, bbsDivParam]);

  const SERVER_ERROR_MESSAGE = '일시적으로 인기글을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.';

  // 인기글 (실시간/주간/월간/추천) — 5xx/503 시 서버 오류 안내, 성공 시 빈 목록이면 "등록된 인기글이 없습니다."
  useEffect(() => {
    const fetchPopularPosts = async () => {
      setErrorMessage('');
      setPopularLoading(true);
      try {
        let data = null;
        let serverError = false;

        if (popularTab === 'realtime') {
          const res = await getRealtimePopularPosts(popularTab);
          if (res && res.serverError) {
            data = [];
            serverError = true;
          } else {
            data = Array.isArray(res) ? res : res?.list ?? res ?? [];
          }
        } else if (popularTab === 'week') {
          const res = await getWeeklyPopularPosts(popularTab);
          if (res && res.serverError) {
            data = [];
            serverError = true;
          } else {
            data = Array.isArray(res) ? res : res?.list ?? res ?? [];
          }
        } else if (popularTab === 'month') {
          if (accessToken) {
            const res = await getMonthlyPopularPosts_py();
            if (res && res.serverError) {
              data = [];
              serverError = true;
            } else {
              data = Array.isArray(res?.posts) ? res.posts : res?.posts ?? [];
            }
          } else {
            const res = await getMonthlyPopularPosts(popularTab);
            if (res && res.serverError) {
              data = [];
              serverError = true;
            } else {
              data = Array.isArray(res) ? res : res?.list ?? res ?? [];
            }
          }
        } else if (popularTab === 'recommend') {
          if (accessToken) {
            const res = await getRecommendedPosts(email);
            if (res && res.serverError) {
              data = [];
              serverError = true;
            } else {
              data = res?.recommendations ?? res ?? [];
              data = Array.isArray(data) ? data : [];
            }
          } else {
            data = [];
            setErrorMessage('해당 기능은 로그인 후 사용자 행동 패턴이 수집된 경우에만 이용할 수 있습니다.');
          }
        }

        setPopularPosts(Array.isArray(data) ? data : []);
        if (serverError) setErrorMessage(SERVER_ERROR_MESSAGE);
      } catch (error) {
        setPopularPosts([]);
        if (error.response) {
          setErrorMessage(error.response.data?.detail || '서버 오류가 발생했습니다.');
        } else if (error.request) {
          setErrorMessage('서버 응답이 없습니다. 네트워크를 확인해 주세요.');
        } else {
          setErrorMessage(error.message || '알 수 없는 에러가 발생했습니다. 새로고침을 해 주세요.');
        }
      } finally {
        setPopularLoading(false);
      }
    };
    fetchPopularPosts();
  }, [popularTab, accessToken, email]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMbtiDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 클라이언트 필터: MBTI 세부, 검색. 자유/MBTI 탭은 공지(noticePosts)를 항상 상단에 두고 그 다음 게시글.
  const filteredItems = useMemo(() => {
    if (activeTab === '인기글') {
      const popularList = (popularPosts || []).map(mapPopularToPost).filter(Boolean);
      return [...noticePosts, ...popularList];
    }

    if (activeTab === '공지') return noticePosts.length > 0 ? noticePosts : posts;

    const nonNoticePosts = (posts || []).filter((p) => !p.isNotice);
    const boardList = [...noticePosts, ...nonNoticePosts];
    let result = boardList;
    if (activeTab === 'MBTI' && mbtiFilter && mbtiFilter !== 'MBTI') {
      result = result.filter((p) => p.isNotice || p.mbti === mbtiFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => {
        const title = String(p.title ?? '').toLowerCase();
        const content = String(p.content ?? '').toLowerCase();
        const author = String(p.author ?? '').toLowerCase();
        if (searchField === 'title') return title.includes(q);
        if (searchField === 'content') return content.includes(q);
        if (searchField === 'author') return author.includes(q);
        return title.includes(q) || content.includes(q);
      });
    }
    return result;
  }, [activeTab, bbsDivParam, mbtiFilter, searchField, searchQuery, posts, noticePosts, popularPosts]);

  // 탭별 게시판 제목 (인기글 제외, DB 연동 목록용)
  const boardTitleByTab = {
    전체: '전체 게시판',
    자유: '자유 게시판',
    MBTI: 'MBTI 게시판',
    공지: '공지 게시판',
    인기글: '인기글',
  };
  const currentBoardTitle = boardTitleByTab[activeTab] ?? '전체 게시판';

  const totalPagesForPaging =
    activeTab === '인기글' ? Math.max(1, Math.ceil((filteredItems?.length || 0) / pageSize)) : totalPages;
  const safePage = Math.min(page, totalPagesForPaging);

  // PC 공지사항 카드용: 자유/MBTI일 땐 noticePosts, 그 외엔 posts 중 공지
  const noticeListForCard = useMemo(() => {
    return noticePosts;
  }, [noticePosts]);

  const pagedItems = useMemo(() => {
    if (activeTab === '인기글') {
      const start = (safePage - 1) * pageSize;
      return filteredItems?.slice(start, start + pageSize) || [];
    }
    // 서버 페이징: bbsApi.getList({ page, limit })가 이미 해당 페이지 10건만 반환함.
    // 여기서 다시 slice((page-1)*10, ...) 하면 2페이지부터 빈 목록이 됨 → 그대로 표시
    return filteredItems;
  }, [activeTab, filteredItems, safePage]);

  return (
    <div className="w-full">
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-24">
        <header className="bg-[#1f4ecf] h-14 flex items-center justify-center text-white font-bold">고민순삭</header>

        <div className="px-4 pt-4">
          {/* 탭 버튼 */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('전체');
                setPage(1);
                setMbtiFilter('MBTI');
                setSearchInput('');
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-md border text-xs ${
                activeTab === '전체'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-600'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('자유');
                setPage(1);
                setMbtiFilter('MBTI');
                setSearchInput('');
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-md border text-xs ${
                activeTab === '자유'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-600'
              }`}
            >
              자유
            </button>
            <select
              value={mbtiFilter}
              onChange={(event) => {
                const value = event.target.value;
                setMbtiFilter(value);
                setActiveTab('MBTI');
                setPage(1);
                setSearchInput('');
                setSearchQuery('');
              }}
              className="px-2 py-1 rounded-md bg-white border border-blue-600 text-xs"
            >
              <option value="MBTI">MBTI</option>
              {MBTI_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setActiveTab('인기글');
                setPage(1);
                setMbtiFilter('MBTI');
                setSearchInput('');
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-md border text-xs ${
                activeTab === '인기글'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-600'
              }`}
            >
              인기글
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('공지');
                setPage(1);
                setMbtiFilter('MBTI');
                setSearchInput('');
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-md border text-xs ${
                activeTab === '공지'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-600'
              }`}
            >
              공지
            </button>
          </div>

          {/* Mobile 헤더 - 탭에 따라 제목 변경 (DB 연동 목록) */}
          <div className="flex flex-col items-start gap-1 mb-3">
            <h2 className="text-sm font-semibold text-gray-800">{currentBoardTitle}</h2>
            <Link
              to="/board/write"
              className="px-2 py-0.5 rounded-md border border-blue-600 text-blue-600 text-xs self-end"
            >
              글 작성
            </Link>
          </div>

          {/* 목록 로드 실패 시 안내 */}
          {errorMessage && (
            <div className="mb-3 px-3 py-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Mobile List */}
          <div className="border border-blue-300 rounded-md overflow-hidden bg-white">
            {loading ? (
              <div className="px-3 py-10 text-center text-sm text-gray-500">로딩 중...</div>
            ) : pagedItems.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-gray-500">
                {errorMessage || '해당 조건의 게시글이 없습니다.'}
              </div>
            ) : (
              pagedItems.map((item) => (
                <div key={item.id} className="border-b border-blue-200 last:border-b-0 px-3 py-3">
                  <div className="flex items-start gap-2">
                    {item.isNotice && (
                      <span className="text-[11px] text-blue-600 border border-blue-600 rounded-md px-2 py-0.5">
                        공지
                      </span>
                    )}
                    <div className="flex-1">
                      <Link to={`/board/view/${item.id}`} className="text-sm font-semibold line-clamp-2 block">
                        {item.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{item.author}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2">
                        <span>👁 {item.views}</span>
                        <span>👍 {item.likes}</span>
                        <span>{toShortDate(item.createdAt)}</span>
                      </div>
                      {item.category === 'MBTI' && item.mbti && (
                        <div className="mt-1">
                          <span className="inline-flex items-center text-[11px] text-[#2f80ed] border border-[#2f80ed] rounded-md px-2 py-0.5">
                            {item.mbti}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/board/view/${item.id}`}
                      className="flex flex-col items-center justify-center w-10 h-10 rounded-md bg-blue-600 text-white text-[9px] leading-[1.05]"
                    >
                      <span>댓글</span>
                      <span className="font-semibold">{item.comments}</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600 my-4">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-2 py-1 hover:bg-gray-100 rounded transition-colors"
              disabled={safePage === 1}
            >
              〈
            </button>
            {Array.from({ length: Math.min(totalPagesForPaging, 10) }, (_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`px-2 py-1 rounded transition-colors ${
                    safePage === pageNum ? 'bg-[#2f80ed] text-white font-semibold' : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPagesForPaging, prev + 1))}
              className="px-2 py-1 hover:bg-gray-100 rounded transition-colors"
              disabled={safePage === totalPagesForPaging}
            >
              〉
            </button>
          </div>

          {/* Search Form */}
          <form
            className="flex gap-2 items-center"
            onSubmit={(event) => {
              event.preventDefault();
              setSearchQuery(searchInput);
              setPage(1);
            }}
          >
            <select
              value={searchField}
              onChange={(event) => setSearchField(event.target.value)}
              className="h-9 rounded-md border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
            >
              <option value="title+content">제목+내용</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="author">작성자</option>
            </select>
            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="flex-1 h-9 rounded-md border border-gray-300 bg-white px-3 text-xs focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
            />
            <button
              type="submit"
              className="flex-none h-9 px-4 rounded-md bg-[#2f80ed] hover:bg-[#2670d4] text-white text-xs whitespace-nowrap transition-colors"
            >
              검색
            </button>
          </form>
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-8">
          {/* PC 인기글 & 공지사항 섹션 */}
          <div className="flex mb-8 gap-5">
            {/* 커뮤니티 인기글 카드 - 공지사항과 동일 높이(418px), 안쪽 글자 크기는 아래 클래스만 바꿔서 조절 */}
            <div className="flex-[2] h-[418px] bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-[16px] font-medium text-gray-800">커뮤니티 인기글</h2>
                <div className="flex gap-2">
                  {['realtime', 'week', 'month', 'recommend'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPopularTab(tab)}
                      className={`cursor-pointer px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                        popularTab === tab
                          ? 'bg-[#2f80ed] text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {tab === 'realtime' && '실시간'}
                      {tab === 'week' && '주간'}
                      {tab === 'month' && '월간'}
                      {tab === 'recommend' && '추천순'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-h-0 flex flex-col bg-white p-4">
                {popularLoading ? (
                  <div className="flex items-center justify-center flex-1 text-sm text-gray-500">로딩 중...</div>
                ) : popularPosts?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-10 gap-y-0 min-w-[580px] h-full flex-1 min-h-0">
                    {/* 왼쪽 열 (1-5) */}
                    <div className="flex flex-col justify-between min-w-[260px] pr-4 h-full">
                      {popularPosts?.slice(0, 5).map((post, idx) => (
                        <Link
                          key={post.bbsId || post.bbs_id}
                          to={`/board/view/${post.bbsId || post.bbs_id}`}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 transition-colors flex-shrink-0 min-h-0 overflow-hidden"
                        >
                          <span className="flex-shrink-0 w-6 text-right text-[11px] font-semibold text-gray-600 tabular-nums leading-tight">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h3
                            className="text-lg! font-normal text-gray-800 min-w-0 flex-1 truncate leading-tight"
                            title={post.title || ''}
                          >
                            {post.title || ''}
                          </h3>
                          <span className="flex-shrink-0 text-[10px] font-normal text-gray-500 whitespace-nowrap leading-tight">
                            👍 {post.bbsLikeCount || post.likeCnt || 0}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {/* 오른쪽 열 (6-10) */}
                    <div className="flex flex-col justify-between min-w-[260px] border-l border-gray-200 pl-6 h-full">
                      {popularPosts?.slice(5, 10).map((post, idx) => (
                        <Link
                          key={post.bbsId || post.bbs_id}
                          to={`/board/view/${post.bbsId || post.bbs_id}`}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 transition-colors flex-shrink-0 min-h-0 overflow-hidden"
                        >
                          <span className="flex-shrink-0 w-6 text-right text-[11px] font-semibold text-gray-600 tabular-nums leading-tight">
                            {String(idx + 6).padStart(2, '0')}
                          </span>
                          <h3
                            className="text-lg! font-normal text-gray-800 min-w-0 flex-1 truncate leading-tight"
                            title={post.title || ''}
                          >
                            {post.title || ''}
                          </h3>
                          <span className="flex-shrink-0 text-[10px] font-normal text-gray-500 whitespace-nowrap leading-tight">
                            👍 {post.bbsLikeCount || post.likeCnt || 0}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 text-[#6b7280] text-lg">{errorMessage || '등록된 인기글이 없습니다.'}</div>
                )}
              </div>
            </div>

            {/* 공지사항 카드 */}
            <div className="flex-[1] h-[418px] bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                <h2 className="text-[18px] font-semibold text-gray-800">공지사항</h2>
                <button
                  className="flex items-center gap-1 text-[13px] text-[#2f80ed] hover:underline font-normal"
                  onClick={() => {
                    setActiveTab('공지');
                    setPage(1);
                    setMbtiFilter('MBTI');
                    setSearchInput('');
                    setSearchQuery('');
                  }}
                >
                  더보기
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 bg-white">
                {noticeListForCard.slice(0, 5).map((post, idx) => (
                  <Link
                    key={post.id}
                    to={`/board/view/${post.id}`}
                    className="flex items-center gap-3 px-4 h-[56px] hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <span className="flex-shrink-0 w-8 text-right text-[13px] font-semibold text-gray-600 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <h3 className="flex-1 min-w-0 truncate text-lg! leading-[1.4] font-normal text-gray-800">
                      {post.title}
                    </h3>

                    <span className="flex-shrink-0 text-[12px] text-gray-500">{toShortDate(post.createdAt)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* PC 헤더 - 탭에 따라 제목 변경 (DB 연동 목록) */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-medium text-gray-800">{currentBoardTitle}</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('전체');
                  setPage(1);
                  setMbtiFilter('MBTI');
                }}
                className={`w-[100px] px-4 py-2 rounded-lg text-lg font-medium ${
                  activeTab === '전체'
                    ? 'bg-[#2f80ed] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => {
                  setActiveTab('자유');
                  setPage(1);
                  setMbtiFilter('MBTI');
                }}
                className={`w-[100px] px-4 py-2 rounded-lg text-lg font-medium ${
                  activeTab === '자유'
                    ? 'bg-[#2f80ed] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                자유
              </button>

              {/* PC MBTI 드롭다운 */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowMbtiDropdown(!showMbtiDropdown)}
                  className={`w-[100px] px-4 py-2 rounded-lg text-base font-medium flex items-center justify-center gap-1 ${
                    activeTab === 'MBTI'
                      ? 'bg-[#2f80ed] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {mbtiFilter === 'MBTI' ? 'MBTI' : mbtiFilter}
                  <span className="text-[10px]">{showMbtiDropdown ? '▲' : '▼'}</span>
                </button>
                {showMbtiDropdown && (
                  <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 py-2 w-48 max-h-80 overflow-y-auto">
                    <button
                      onClick={() => {
                        setMbtiFilter('MBTI');
                        setActiveTab('MBTI');
                        setShowMbtiDropdown(false);
                        setPage(1);
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100"
                    >
                      전체
                    </button>
                    {MBTI_OPTIONS.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setMbtiFilter(type);
                          setActiveTab('MBTI');
                          setShowMbtiDropdown(false);
                          setPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-normal hover:bg-gray-100 ${
                          mbtiFilter === type ? 'bg-blue-50 text-[#2f80ed] font-normal' : ''
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setActiveTab('인기글');
                  setPage(1);
                  setMbtiFilter('MBTI');
                }}
                className={`w-[100px] px-4 py-2 rounded-lg text-lg font-medium ${
                  activeTab === '인기글'
                    ? 'bg-[#2f80ed] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                인기글
              </button>
              <button
                onClick={() => {
                  setActiveTab('공지');
                  setPage(1);
                  setMbtiFilter('MBTI');
                }}
                className={`w-[100px] px-4 py-2 rounded-lg text-lg font-medium ${
                  activeTab === '공지'
                    ? 'bg-[#2f80ed] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                공지
              </button>
              <Link
                to="/board/write"
                className="w-[100px] px-4 py-2 rounded-lg bg-[#2f80ed] text-white !text-lg font-medium hover:bg-[#2670d4] transition-colors ml-auto flex items-center justify-center"
              >
                글쓰기
              </Link>
            </div>
          </div>

          {/* PC Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center text-[14px] font-normal text-gray-700 w-32">번호</th>
                  <th className="px-6 py-4 text-left text-[14px] font-normal text-gray-700">제 목</th>
                  <th className="px-6 py-4 text-center text-[14px] font-normal text-gray-700 w-32">작성자</th>
                  <th className="px-6 py-4 text-center text-[14px] font-normal text-gray-700 w-32">작성일</th>
                  <th className="px-6 py-4 text-center text-[14px] font-normal text-gray-700 w-24">조회</th>
                  <th className="px-6 py-4 text-center text-[14px] font-normal text-gray-700 w-24">추천</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-[14px] text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-[14px] text-gray-500">
                      {errorMessage || '해당 조건의 게시글이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  (() => {
                    let postNumber = (safePage - 1) * pageSize + 1;
                    return pagedItems.map((item) => {
                      const currentNumber = item.isNotice ? null : postNumber++;
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-100 transition-colors ${
                            item.isNotice ? 'bg-[#2ED3C6]' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 text-center">
                            {item.isNotice ? (
                              <div className="inline-flex items-center justify-center px-4 py-1.5 bg-white text-[#2ED3C6] rounded-lg text-[14px] font-semibold border-2 border-[#2ED3C6]">
                                공지
                              </div>
                            ) : (
                              <span className="text-[14px] font-normal text-gray-600">{currentNumber}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              to={`/board/view/${item.id}`}
                              className={`text-[16px] font-normal flex items-center gap-2 ${
                                item.isNotice ? 'text-white' : 'text-gray-800 hover:text-[#2f80ed]'
                              }`}
                            >
                              <span className="line-clamp-1">{item.title}</span>
                              {item.comments > 0 && (
                                <span
                                  className={`text-[12px] font-normal ${item.isNotice ? 'text-white' : 'text-gray-500'}`}
                                >
                                  [{item.comments}]
                                </span>
                              )}
                              {item.category === 'MBTI' && item.mbti && (
                                <span
                                  className={`inline-flex items-center text-[12px] font-normal px-2 py-0.5 rounded ${
                                    item.isNotice ? 'bg-white text-[#2ED3C6]' : 'text-[#2f80ed] bg-blue-50'
                                  }`}
                                >
                                  {item.mbti}
                                </span>
                              )}
                            </Link>
                          </td>
                          <td
                            className={`px-6 py-4 text-[16px] font-normal text-center ${
                              item.isNotice ? 'text-white' : 'text-gray-600'
                            }`}
                          >
                            {item.author}
                          </td>
                          <td
                            className={`px-6 py-4 text-[16px] font-normal text-center ${
                              item.isNotice ? 'text-white' : 'text-gray-500'
                            }`}
                          >
                            {toShortDate(item.createdAt)}
                          </td>
                          <td
                            className={`px-6 py-4 text-[16px] font-normal text-center ${
                              item.isNotice ? 'text-white' : 'text-gray-600'
                            }`}
                          >
                            {item.views}
                          </td>
                          <td
                            className={`px-6 py-4 text-[16px] font-normal text-center ${
                              item.isNotice ? 'text-white' : 'text-gray-600'
                            }`}
                          >
                            {item.likes}
                          </td>
                        </tr>
                      );
                    });
                  })()
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 text-sm text-gray-600 my-8">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-2 hover:bg-gray-100 rounded transition-colors"
              disabled={safePage === 1}
            >
              〈
            </button>
            {Array.from({ length: Math.min(totalPagesForPaging, 10) }, (_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded transition-colors ${
                    safePage === pageNum ? 'bg-[#2f80ed] text-white font-semibold' : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPagesForPaging, prev + 1))}
              className="px-3 py-2 hover:bg-gray-100 rounded transition-colors"
              disabled={safePage === totalPagesForPaging}
            >
              〉
            </button>
          </div>

          {/* Search Form */}
          <form
            className="flex gap-3 items-center w-[620px] mx-auto"
            onSubmit={(event) => {
              event.preventDefault();
              setSearchQuery(searchInput);
              setPage(1);
            }}
          >
            <select
              value={searchField}
              onChange={(event) => setSearchField(event.target.value)}
              className="h-[50px] rounded-lg border border-gray-300 bg-white px-4 text-[11px] font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
            >
              <option value="title+content">제목+내용</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="author">작성자</option>
            </select>
            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="flex-1 h-[50px] rounded-lg border border-gray-300 bg-white px-4 text-[11px] font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
            />
            <button
              type="submit"
              className="flex-none h-[50px] px-6 rounded-lg bg-[#2f80ed] hover:bg-[#2670d4] text-white text-[9px] font-normal whitespace-nowrap transition-colors"
            >
              검색
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BoardList;
