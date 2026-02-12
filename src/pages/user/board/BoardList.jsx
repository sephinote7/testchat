import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MBTI_OPTIONS, posts, toShortDate } from './boardData';

const BoardList = () => {
  const location = useLocation();
  const initialActiveTab = location.state?.activeTab ?? '전체';
  const initialMbtiFilter = location.state?.mbtiFilter ?? 'MBTI';

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

  const filteredItems = useMemo(() => {
    const sorted = [...posts].sort((a, b) => {
      if (a.isNotice && !b.isNotice) return -1;
      if (!a.isNotice && b.isNotice) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    let result = sorted;
    if (activeTab === '자유') result = result.filter((p) => p.category === '자유');
    if (activeTab === 'MBTI') result = result.filter((p) => p.category === 'MBTI');
    if (activeTab === '공지') result = result.filter((p) => p.isNotice);
    if (activeTab === '인기글') {
      const nonNotice = result.filter((p) => !p.isNotice);
      const topIds = nonNotice
        .sort((a, b) => b.likes - a.likes || b.views - a.views)
        .slice(0, 5)
        .map((p) => p.id);
      result = result.filter((p) => topIds.includes(p.id));
    }

    if (activeTab === 'MBTI' && mbtiFilter && mbtiFilter !== 'MBTI') {
      result = result.filter((p) => p.mbti === mbtiFilter);
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
  }, [activeTab, mbtiFilter, searchField, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, safePage]);

  // 인기글 필터링
  const popularPosts = useMemo(() => {
    const nonNotice = posts.filter((p) => !p.isNotice);
    return nonNotice.sort((a, b) => b.likes - a.likes || b.views - a.views).slice(0, 10);
  }, []);

  return (
    <div className="w-full">
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-24">
        <header className="bg-[#1f4ecf] h-14 flex items-center justify-center text-white font-bold">
          고민순삭
        </header>

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
                activeTab === '전체' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600'
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
                activeTab === '자유' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600'
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
                activeTab === '공지' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600'
              }`}
            >
              공지
            </button>
          </div>

          {/* Mobile 헤더 */}
          <div className="flex flex-col items-start gap-1 mb-3">
            <h2 className="text-[6px] font-semibold">BEST 인기글 (실시간)</h2>
            <Link
              to="/board/write"
              className="px-2 py-0.5 rounded-md border border-blue-600 text-blue-600 text-[6px] self-end"
            >
              글 작성
            </Link>
          </div>

          {/* Mobile List */}
          <div className="border border-blue-300 rounded-md overflow-hidden bg-white">
            {pagedItems.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-gray-500">해당 조건의 게시글이 없습니다.</div>
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
            {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => {
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
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-2 py-1 hover:bg-gray-100 rounded transition-colors"
              disabled={safePage === totalPages}
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
            {/* 커뮤니티 인기글 카드 */}
            <div className="flex-[2] h-[418px] bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                <h2 className="text-[16px] font-medium text-gray-800">커뮤니티 인기글</h2>
                <div className="flex gap-2">
                  {['realtime', 'week', 'month', 'recommend', 'reply'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPopularTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-colors ${
                        popularTab === tab ? 'bg-[#2f80ed] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tab === 'realtime' && '실시간'}
                      {tab === 'week' && '주 간'}
                      {tab === 'month' && '월 간'}
                      {tab === 'recommend' && '추천순'}
                      {tab === 'reply' && '답변'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-white p-3">
                <div className="grid grid-cols-2 gap-3 h-full">
                  {/* 왼쪽 열 (1-5) */}
                  <div className="pr-2">
                    {popularPosts.slice(0, 5).map((post, idx) => (
                      <Link
                        key={post.id}
                        to={`/board/view/${post.id}`}
                        className="flex items-center justify-between px-3 py-[7px] hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-[7px] font-semibold text-gray-800 flex-shrink-0">0{idx + 1}</span>
                          <h3 className="text-[11px] font-normal text-gray-800 truncate flex-1">
                            {post.title} [{post.comments}]
                          </h3>
                        </div>
                        <span className="text-[6px] font-normal text-gray-500 flex-shrink-0 ml-3">
                          {toShortDate(post.createdAt)}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* 오른쪽 열 (6-10) */}
                  <div className="pr-2 border-l border-gray-200 pl-2">
                    {popularPosts.slice(5, 10).map((post, idx) => (
                      <Link
                        key={post.id}
                        to={`/board/view/${post.id}`}
                        className="flex items-center justify-between px-3 py-[7px] hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-[7px] font-semibold text-gray-800 flex-shrink-0">0{idx + 6}</span>
                          <h3 className="text-[11px] font-normal text-gray-800 truncate flex-1">
                            {post.title} [{post.comments}]
                          </h3>
                        </div>
                        <span className="text-[6px] font-normal text-gray-500 flex-shrink-0 ml-3">
                          {toShortDate(post.createdAt)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 공지사항 카드 */}
            <div className="flex-[1] h-[418px] bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                <h2 className="text-[16px] font-medium text-gray-800">공지사항</h2>
                <button className="flex items-center gap-1 text-xs text-[#2f80ed] hover:underline font-normal">
                  더보기
                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 bg-white">
                {posts
                  .filter((p) => p.isNotice)
                  .slice(0, 5)
                  .map((post, idx) => (
                    <Link
                      key={post.id}
                      to={`/board/view/${post.id}`}
                      className="flex items-center justify-between px-4 py-[7px] hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[8px] font-semibold text-gray-800 flex-shrink-0">0{idx + 1}</span>
                        <h3 className="text-xs font-normal text-gray-800 truncate flex-1">
                          {post.title} [{post.comments}]
                        </h3>
                      </div>
                      <span className="text-[7px] font-normal text-gray-500 flex-shrink-0 ml-3">
                        {toShortDate(post.createdAt)}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          {/* PC 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-medium text-gray-800">BEST인기글(실시간)</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('전체');
                  setPage(1);
                  setMbtiFilter('MBTI');
                }}
                className={`w-[100px] px-4 py-2 rounded-lg text-[13px] font-medium ${
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
                className={`w-[100px] px-4 py-2 rounded-lg text-[13px] font-medium ${
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
                  className={`w-[100px] px-4 py-2 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1 ${
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
                        setActiveTab('전체');
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
                className={`w-[100px] px-4 py-2 rounded-lg text-[13px] font-medium ${
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
                className={`w-[100px] px-4 py-2 rounded-lg text-[13px] font-medium ${
                  activeTab === '공지'
                    ? 'bg-[#2f80ed] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                공지
              </button>
              <Link
                to="/board/write"
                className="w-[100px] px-4 py-2 rounded-lg bg-[#2f80ed] text-white text-[13px] font-medium hover:bg-[#2670d4] transition-colors ml-auto flex items-center justify-center"
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
                  <th className="px-6 py-4 text-center text-[14px] font-normal text-gray-700 w-32">게시판명</th>
                  <th className="px-6 py-4 text-left text-[14px] font-normal text-gray-700">제 목</th>
                  <th className="px-6 py-4 text-center text-[14px] font-normal text-gray-700 w-32">작성자</th>
                  <th className="px-6 py-4 text-center text-[14px] font-normal text-gray-700 w-32">작성일</th>
                  <th className="px-6 py-4 text-center text-[14px] font-normal text-gray-700 w-24">조회</th>
                  <th className="px-6 py-4 text-center text-[14px] font-normal text-gray-700 w-24">추천</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-[14px] text-gray-500">
                      해당 조건의 게시글이 없습니다.
                    </td>
                  </tr>
                ) : (
                  (() => {
                    // 이전 페이지까지의 일반 게시물 개수를 계산
                    const previousPagesNonNoticeCount = filteredItems
                      .slice(0, (safePage - 1) * pageSize)
                      .filter((p) => !p.isNotice).length;

                    let postNumber = previousPagesNonNoticeCount + 1;

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
                            className={`px-6 py-4 text-[14px] font-normal text-center ${
                              item.isNotice ? 'text-white' : 'text-gray-600'
                            }`}
                          >
                            {item.author}
                          </td>
                          <td
                            className={`px-6 py-4 text-[14px] font-normal text-center ${
                              item.isNotice ? 'text-white' : 'text-gray-500'
                            }`}
                          >
                            {toShortDate(item.createdAt)}
                          </td>
                          <td
                            className={`px-6 py-4 text-[14px] font-normal text-center ${
                              item.isNotice ? 'text-white' : 'text-gray-600'
                            }`}
                          >
                            {item.views}
                          </td>
                          <td
                            className={`px-6 py-4 text-[14px] font-normal text-center ${
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
            {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => {
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
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-2 hover:bg-gray-100 rounded transition-colors"
              disabled={safePage === totalPages}
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
