import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { posts } from '../../user/board/boardData';

const MyPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const [page, setPage] = useState(1);
  const [searchField, setSearchField] = useState('title+content');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 20;

  // 현재 사용자가 작성한 글만 필터링
  const myPosts = useMemo(() => {
    const userNickname = user.email?.split('@')[0] || '카푸치노';
    let result = posts.filter((post) => post.author === userNickname || post.author === '카푸치노');

    // 검색 필터
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => {
        const title = String(p.title ?? '').toLowerCase();
        const content = String(p.content ?? '').toLowerCase();
        if (searchField === 'title') return title.includes(q);
        if (searchField === 'content') return content.includes(q);
        return title.includes(q) || content.includes(q);
      });
    }

    return result;
  }, [user, searchQuery, searchField]);

  const totalPages = Math.max(1, Math.ceil(myPosts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return myPosts.slice(start, start + pageSize);
  }, [myPosts, safePage]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleGoToPost = () => {
    if (selectedPost) {
      navigate(`/board/view/${selectedPost.id}`);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderPagination = () => {
    const maxVisible = 10;
    const pages = [];
    const startPage = Math.max(1, safePage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (startPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setPage(Math.max(1, safePage - 1))}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
        >
          &lt;
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            i === safePage ? 'bg-[#2f80ed] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <span key="dots" className="w-8 h-8 flex items-center justify-center text-gray-400">
          ...
        </span>
      );
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
        >
          {totalPages}
        </button>
      );
      pages.push(
        <button
          key="next"
          onClick={() => setPage(Math.min(totalPages, safePage + 1))}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
        >
          &gt;
        </button>
      );
    }

    return pages;
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-20">
        {/* HEADER */}
        <header className="bg-[#2563eb] h-14 flex items-center justify-between px-5">
          <Link to="/mypage" className="text-white text-xl">
            ←
          </Link>
          <h1 className="text-white text-lg font-bold flex-1 text-center mr-6">내 작성 글 보기</h1>
        </header>

        {/* 뒤로가기 버튼 */}
        <div className="px-5 pt-4 pb-2">
          <Link
            to="/mypage"
            className="inline-flex items-center gap-1 text-sm text-[#2563eb] border border-[#2563eb] px-3 py-1.5 rounded-lg"
          >
            <span>←</span>
            <span>뒤로가기</span>
          </Link>
        </div>

        {/* CONTENT */}
        <div className="px-5 pt-2">
          {myPosts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>작성한 글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className={`bg-white rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPost?.id === post.id
                      ? 'bg-[#2563eb] text-white shadow-lg'
                      : 'hover:shadow-md border border-gray-100'
                  }`}
                >
                  {/* 제목 */}
                  <h3
                    className={`font-semibold text-base mb-2 line-clamp-2 ${
                      selectedPost?.id === post.id ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {post.title}
                  </h3>

                  {/* 작성자 */}
                  <p className={`text-sm mb-3 ${selectedPost?.id === post.id ? 'text-white/90' : 'text-gray-600'}`}>
                    {post.author}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <span
                        className={`flex items-center gap-1 ${
                          selectedPost?.id === post.id ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {post.views}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          selectedPost?.id === post.id ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {post.likes}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`${selectedPost?.id === post.id ? 'text-white' : 'text-gray-500'}`}>
                        {formatDate(post.createdAt)}
                      </span>
                      {selectedPost?.id === post.id && (
                        <span className="bg-white text-[#2563eb] px-2 py-0.5 rounded-md text-xs font-semibold">
                          {post.comments}
                          <br />
                          댓글
                        </span>
                      )}
                      {selectedPost?.id !== post.id && (
                        <span className="bg-[#2563eb] text-white px-2 py-0.5 rounded-md text-xs font-semibold">
                          {post.comments}
                          <br />
                          댓글
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 선택된 게시글이 있을 때 하단 이동 버튼 */}
        {selectedPost && (
          <div className="fixed bottom-16 left-0 right-0 px-5 max-w-[390px] mx-auto">
            <button
              onClick={handleGoToPost}
              className="w-full bg-[#2563eb] text-white py-3 rounded-xl font-semibold shadow-lg"
            >
              선택한 글로 이동
            </button>
          </div>
        )}
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8 px-[200px]">
            <h1 className="text-[30px] font-semibold text-gray-800">내가 작성한 글</h1>
          </div>

          {/* TABLE */}
          <div className="w-[1520px] mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-32">게시판명</th>
                  <th className="px-6 py-4 text-left text-base font-normal text-gray-700">제 목</th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-32">작성자</th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-32">작성일</th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-24">조회</th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-24">추천</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-base text-gray-500">
                      작성한 글이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pagedItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 transition-colors cursor-pointer ${
                        index % 2 === 0 ? 'hover:bg-blue-50' : 'bg-white hover:bg-blue-50'
                      }`}
                      onClick={() => navigate(`/board/view/${item.id}`)}
                    >
                      <td className="px-6 py-4 text-center">
                        <span className="text-base font-normal text-gray-600">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-base font-normal text-gray-800 flex items-center gap-2">
                          <span className="line-clamp-1">{item.title}</span>
                          {item.comments > 0 && (
                            <span className="text-sm font-normal text-gray-500">[{item.comments}]</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-base font-normal text-center text-gray-600">{item.author}</td>
                      <td className="px-6 py-4 text-base font-normal text-center text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-base font-normal text-center text-gray-600">{item.views}</td>
                      <td className="px-6 py-4 text-base font-normal text-center text-gray-600">{item.likes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {myPosts.length > 0 && (
            <div className="flex items-center justify-center gap-1 mt-8">{renderPagination()}</div>
          )}

          {/* SEARCH */}
          <div className="w-[1520px] mx-auto mt-8 flex items-center justify-center gap-3">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-base font-normal text-gray-700 bg-white"
            >
              <option value="title+content">제목+내용</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
            </select>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="검색어를 입력하세요"
              className="w-80 px-4 py-2 border border-gray-300 rounded-lg text-base font-normal"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-[#2f80ed] text-white rounded-lg text-base font-normal hover:bg-[#2670d4] transition-colors"
            >
              검 색
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyPost;
