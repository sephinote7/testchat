import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { fetchMyCommentList } from '../../../api/myCmList';
import { useAuthStore } from '../../../store/auth.store';

const MyComment = () => {
  const { accessToken: token } = useAuth(); // useAuth에서 token 가져오기
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  // 상태 관리
  const [comments, setComments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedComment, setSelectedComment] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(''); // 입력창 값
  const [searchQuery, setSearchQuery] = useState(''); // 실제 검색에 사용될 값

  const pageSize = 10;

  // 데이터 페칭 함수
  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      // searchField를 제거하고 searchQuery와 token만 전달
      const data = await fetchMyCommentList(page - 1, pageSize, searchQuery);
      console.log('test', data);

      setComments(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, searchQuery]); // searchQuery가 바뀔 때 재호출

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };

  const handleSearch = () => {
    setSearchQuery(searchInput); // 버튼 클릭 시에만 검색 쿼리 업데이트
    setPage(1); // 검색 시 1페이지로 이동
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // 페이지네이션 렌더링 (로직 최적화)
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisible = 10;
    // 현재 페이지를 중심으로 앞뒤 범위를 계산
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // 끝 페이지가 부족할 경우 시작 페이지를 더 앞으로 당김
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-20">
        <header className="bg-[#2563eb] h-14 flex items-center justify-between px-5">
          <Link to="/mypage" className="text-white text-xl">
            ←
          </Link>
          <h1 className="text-white text-lg font-bold flex-1 text-center mr-6">내 작성 댓글</h1>
        </header>

        <div className="px-5 pt-4">
          {isLoading ? (
            <div className="text-center py-20 text-gray-500">로딩 중...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-20 text-gray-500">작성한 댓글이 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.cmtId}
                  onClick={() => setSelectedComment(comment)}
                  className={`bg-white rounded-lg p-4 cursor-pointer border ${selectedComment?.cmtId === comment.cmtId ? 'border-[#2563eb] ring-1 ring-[#2563eb]' : 'border-gray-100'}`}
                >
                  <div className="text-xs text-[#2563eb] font-semibold mb-1">작성 댓글</div>
                  <div className="text-sm text-gray-800 mb-2 line-clamp-2">{comment.content}</div>
                  <div className="text-[11px] text-gray-400">일자: {formatDate(comment.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedComment && (
          <div className="fixed bottom-6 left-0 right-0 px-5 max-w-[390px] mx-auto">
            <button
              onClick={() => navigate(`/board/view/${selectedComment.bbsId}`)}
              className="w-full bg-[#2563eb] text-white py-3 rounded-xl font-semibold shadow-lg"
            >
              해당 게시글로 이동
            </button>
          </div>
        )}
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="w-[80%] mx-auto py-12">
          <h1 className="text-[30px] font-semibold text-gray-800 mb-8">내가 작성한 댓글</h1>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center w-32">게시판</th>
                  <th className="px-6 py-4 w-40">원본 게시글 제목</th>
                  <th className="px-6 py-4 w-80">내 댓글 내용</th>
                  <th className="px-6 py-4 text-center w-32">작성일</th>
                  <th className="px-6 py-4 text-center w-24">추천</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : comments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-gray-500">
                      작성한 댓글이 없습니다.
                    </td>
                  </tr>
                ) : (
                  comments.map((item) => (
                    <tr
                      key={item.cmtId}
                      className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
                      onClick={() => navigate(`/board/view/${item.bbsId}`)}
                    >
                      <td className="px-6 py-4 text-center text-gray-600">{item.bbsDiv}</td>
                      <td className="px-6 py-4 ">
                        <div className="font-medium line-clamp-1">{item.title}</div>
                      </td>
                      <td className="px-6 py-4 ">
                        <div className="text-gray-600 line-clamp-1">{item.content}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">{formatDate(item.createdAt)}</td>
                      <td className="px-6 py-4 text-center">{item.clikeCount || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 & 검색 */}
          {/* <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`w-8 h-8 flex items-center justify-center rounded ${page === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              &lt;
            </button>
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 flex items-center justify-center rounded ${i === page ? 'bg-[#2f80ed] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {i}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`w-8 h-8 flex items-center justify-center rounded ${page === totalPages ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              &gt;
            </button>
          </div> */}

          <div className="flex justify-center gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="댓글 내용으로 검색"
              className="w-80 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#2f80ed]"
            />
            <button onClick={handleSearch} className="px-8 py-2 bg-[#2f80ed] text-white rounded-lg hover:bg-[#2670d4]">
              검색
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyComment;
