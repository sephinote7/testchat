import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const MyComment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedComment, setSelectedComment] = useState(null);
  const [page, setPage] = useState(1);
  const [searchField, setSearchField] = useState('title+content');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 20;

  // 모든 게시글의 댓글을 가져와서 현재 사용자가 작성한 댓글만 필터링
  const allComments = useMemo(() => {
    // 더미 데이터를 60개로 확장
    const baseComments = [
      {
        id: 'my-comment-1',
        postId: 4,
        category: 'MBTI',
        author: '카푸치노',
        content:
          '놀라 영양소로만 타 대답의 사진이라는 나오는가 타자가 비가 실험공이 기관에 원인을 찾다 있습니다 아래와 말고 만큼 연구적 조사한다',
        createdAt: '26.01.26',
        likes: 8,
        replies: 0,
        postTitle: '놀라 영양소로만 타 대답의 사진이라는 나 ...',
        postAuthor: '카푸치노',
        postViews: 37,
      },
      {
        id: 'my-comment-2',
        postId: 6,
        category: 'MBTI',
        author: '카푸치노',
        content: '오전 새롭 아이의 완료하는 진단받은 반응하는 유전하는 광고와 따르며는 대영한 조사하나 스프렘셈을',
        createdAt: '26.01.26',
        likes: 8,
        replies: 2,
        postTitle: '놀라 영양소로만 타 대답의 사진이라는 나 ...',
        postAuthor: '카푸치노',
        postViews: 37,
      },
      {
        id: 'my-comment-3',
        postId: 8,
        category: 'MBTI',
        author: '카푸치노',
        content: '정말 좋은 팁이네요! 저는 매일 작은 성취를 기록하는 습관이 자존감 향상에 큰 도움이 되었어요.',
        createdAt: '26.01.26',
        likes: 12,
        replies: 1,
        postTitle: '놀라 영양소로만 타 대답의 사진이라는 나 ...',
        postAuthor: '카푸치노',
        postViews: 37,
      },
    ];

    // 60개로 확장
    const expandedComments = [];
    for (let i = 0; i < 60; i++) {
      const baseComment = baseComments[i % baseComments.length];
      expandedComments.push({
        ...baseComment,
        id: `my-comment-${i + 1}`,
        postId: 4 + i,
      });
    }

    return expandedComments;
  }, [user]);

  // 검색 필터 적용
  const filteredComments = useMemo(() => {
    let result = allComments;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((c) => {
        const title = String(c.postTitle ?? '').toLowerCase();
        const content = String(c.content ?? '').toLowerCase();
        if (searchField === 'title') return title.includes(q);
        if (searchField === 'content') return content.includes(q);
        return title.includes(q) || content.includes(q);
      });
    }

    return result;
  }, [allComments, searchQuery, searchField]);

  const totalPages = Math.max(1, Math.ceil(filteredComments.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredComments.slice(start, start + pageSize);
  }, [filteredComments, safePage]);

  const formatDate = (dateStr) => {
    if (dateStr.includes('.')) return dateStr;
    const date = new Date(dateStr);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };

  const handleCommentClick = (comment) => {
    setSelectedComment(comment);
  };

  const handleGoToPost = () => {
    if (selectedComment) {
      navigate(`/board/view/${selectedComment.postId}`);
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
          <h1 className="text-white text-lg font-bold flex-1 text-center mr-6">내 작성 댓글 보기</h1>
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
          {allComments.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>작성한 댓글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allComments.map((comment) => (
                <div
                  key={comment.id}
                  onClick={() => handleCommentClick(comment)}
                  className={`bg-white rounded-lg p-4 cursor-pointer transition-all ${
                    selectedComment?.id === comment.id
                      ? 'bg-[#2563eb] text-white shadow-lg'
                      : 'hover:shadow-md border border-gray-100'
                  }`}
                >
                  {/* 작성 댓글 제목 */}
                  <div className="mb-2">
                    <span
                      className={`text-xs font-semibold ${
                        selectedComment?.id === comment.id ? 'text-white' : 'text-[#2563eb]'
                      }`}
                    >
                      작성 댓글 :
                    </span>
                    <span
                      className={`text-sm ml-2 ${selectedComment?.id === comment.id ? 'text-white' : 'text-gray-800'}`}
                    >
                      {comment.postTitle.length > 30 ? comment.postTitle.substring(0, 30) + '...' : comment.postTitle}
                    </span>
                  </div>

                  {/* 작성 일자 */}
                  <div className="mb-3">
                    <span
                      className={`text-xs ${selectedComment?.id === comment.id ? 'text-white/80' : 'text-gray-500'}`}
                    >
                      작성 일자 : {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {/* 댓글 내용 */}
                  <div className="mb-3">
                    <p
                      className={`text-xs mb-1 ${
                        selectedComment?.id === comment.id ? 'text-white/80' : 'text-gray-600'
                      }`}
                    >
                      작성 글 :{' '}
                      {comment.postTitle.length > 25 ? comment.postTitle.substring(0, 25) + '...' : comment.postTitle}
                    </p>
                    <p
                      className={`text-sm line-clamp-2 ${
                        selectedComment?.id === comment.id ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {comment.content}
                    </p>
                  </div>

                  {/* 작성자 정보 */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${selectedComment?.id === comment.id ? 'text-white/80' : 'text-gray-600'}`}>
                      작성자 : {comment.postAuthor}
                    </span>
                    {selectedComment?.id === comment.id && (
                      <span className="bg-white text-[#2563eb] px-2 py-0.5 rounded-md text-xs font-semibold">
                        선택됨
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 선택된 댓글이 있을 때 하단 이동 버튼 */}
        {selectedComment && (
          <div className="fixed bottom-16 left-0 right-0 px-5 max-w-[390px] mx-auto">
            <button
              onClick={handleGoToPost}
              className="w-full bg-[#2563eb] text-white py-3 rounded-xl font-semibold shadow-lg"
            >
              해당 게시글로 이동
            </button>
          </div>
        )}
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8 px-[200px]">
            <h1 className="text-[30px] font-semibold text-gray-800">내가 작성한 댓글</h1>
          </div>

          {/* TABLE */}
          <div className="w-[1520px] mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-32">게시판명</th>
                  <th className="px-6 py-4 text-left text-base font-normal text-gray-700">제 목</th>
                  <th className="px-6 py-4 text-left text-base font-normal text-gray-700 w-80">작성 댓글</th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-24">작성자</th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-24">작성일</th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-20">조회</th>
                  <th className="px-6 py-4 text-center text-base font-normal text-gray-700 w-20">추천</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-base text-gray-500">
                      작성한 댓글이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pagedItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 transition-colors cursor-pointer ${
                        index % 2 === 0 ? 'hover:bg-blue-50' : 'bg-white hover:bg-blue-50'
                      }`}
                      onClick={() => navigate(`/board/view/${item.postId}`)}
                    >
                      <td className="px-6 py-4 text-center">
                        <span className="text-base font-normal text-gray-600">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-base font-normal text-gray-800">
                          <span className="line-clamp-1">{item.postTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-base font-normal text-gray-600">
                          <span className="line-clamp-1">{item.content}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-base font-normal text-center text-gray-600">{item.author}</td>
                      <td className="px-6 py-4 text-base font-normal text-center text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-base font-normal text-center text-gray-600">{item.postViews}</td>
                      <td className="px-6 py-4 text-base font-normal text-center text-gray-600">{item.likes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {filteredComments.length > 0 && (
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

export default MyComment;
