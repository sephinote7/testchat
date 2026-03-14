import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { getMyBbsList } from '../../../api/myBbsList';

const MyPost = () => {
  const { accessToken: token } = useAuth();
  const navigate = useNavigate();

  // 상태 관리
  const [serverPosts, setServerPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchField, setSearchField] = useState('title+content');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  // 데이터 로드
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      // API 호출 (Spring Boot 0-indexed page)
      const data = await getMyBbsList(searchQuery, page - 1, pageSize);

      console.log('test', data);

      setServerPosts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('내 게시글 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, page, pageSize]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };

  const handlePostClick = (post) => setSelectedPost(post);

  const handleGoToPost = () => {
    if (selectedPost) navigate(`/board/view/${selectedPost.bbs_id}`);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const renderPagination = () => {
    const maxVisible = 10;
    const pages = [];
    const startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (startPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setPage(Math.max(1, page - 1))}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
        >
          {' '}
          &lt;{' '}
        </button>,
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 flex items-center justify-center rounded ${i === page ? 'bg-[#2f80ed] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {i}
        </button>,
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <span
          key="dots"
          className="w-8 h-8 flex items-center justify-center text-gray-400"
        >
          ...
        </span>,
      );
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
        >
          {totalPages}
        </button>,
      );
      pages.push(
        <button
          key="next"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
        >
          {' '}
          &gt;{' '}
        </button>,
      );
    }
    return pages;
  };

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-20">
        <header className="bg-[#2563eb] h-14 flex items-center justify-between px-5">
          <Link to="/mypage" className="text-white text-xl">
            ←
          </Link>
          <h1 className="text-white text-lg font-bold flex-1 text-center mr-6">
            내 작성 글 보기
          </h1>
        </header>

        <div className="px-5 pt-4 pb-2">
          <Link
            to="/mypage"
            className="inline-flex items-center gap-1 text-sm text-[#2563eb] border border-[#2563eb] px-3 py-1.5 rounded-lg"
          >
            <span>←</span>
            <span>뒤로가기</span>
          </Link>
        </div>

        <div className="px-5 pt-2">
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              데이터를 불러오는 중...
            </div>
          ) : serverPosts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>작성한 글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {serverPosts.map((post) => (
                <div
                  key={post.bbs_id}
                  onClick={() => handlePostClick(post)}
                  className={`bg-white rounded-lg p-4 cursor-pointer transition-all ${selectedPost?.bbs_id === post.bbs_id ? 'bg-[#2563eb] text-white shadow-lg' : 'hover:shadow-md border border-gray-100'}`}
                >
                  <h3
                    className={`font-semibold text-base mb-2 line-clamp-2 ${selectedPost?.bbs_id === post.bbs_id ? 'text-white' : 'text-gray-800'}`}
                  >
                    {post.title}
                  </h3>
                  <p
                    className={`text-sm mb-3 ${selectedPost?.bbs_id === post.bbs_id ? 'text-white/90' : 'text-gray-600'}`}
                  >
                    {post.nickname}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {post.likeCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span>{formatDate(post.created_at)}</span>
                      {post.commentCount > 0 && (
                        <span
                          className={`${selectedPost?.bbs_id === post.bbs_id ? 'bg-white text-[#2563eb]' : 'bg-[#2563eb] text-white'} px-2 py-0.5 rounded-md text-xs font-semibold text-center`}
                        >
                          {post.commentCount}
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

      {/* PC VIEW */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          <div className="flex-col items-center justify-between mb-8">
            <h3 className="!font-bold text-gray-800 mb-6">내가 작성한 글</h3>

          <div className="w-full mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-32">
                    게시판명
                  </th>
                  <th className="px-6 py-4 text-left text-base font-normal text-gray-700">
                    제 목
                  </th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-32">
                    작성자
                  </th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-32">
                    작성일
                  </th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-24">
                    조회
                  </th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-24">
                    추천
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-gray-500">
                      불러오는 중...
                    </td>
                  </tr>
                ) : serverPosts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-20 text-center text-base text-gray-500"
                    >
                      작성한 글이 없습니다.
                    </td>
                  </tr>
                ) : (
                  serverPosts.map((item, index) => (
                    <tr
                      key={item.bbs_id}
                      className={`border-b border-gray-100 transition-colors cursor-pointer ${index % 2 === 0 ? 'hover:bg-blue-50' : 'bg-white hover:bg-blue-50'}`}
                      onClick={() => navigate(`/board/view/${item.bbs_id}`)}
                    >
                      <td className="px-6 py-4 text-center">
                        <span className="text-base font-normal text-gray-600">
                          {item.bbs_div}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-base font-normal text-gray-800 flex items-center gap-2">
                          <span className="line-clamp-1">{item.title}</span>
                          {item.commentCount > 0 && (
                            <span className="text-sm font-normal text-gray-500">
                              [{item.commentCount}]
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.nickname}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.views}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.likeCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {serverPosts.length > 0 && (
            <div className="flex items-center justify-center gap-1 mt-8">
              {renderPagination()}
            </div>
          )}

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
      </div>
    </>
  );
};

export default MyPost;
