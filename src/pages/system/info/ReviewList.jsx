import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { counselorReviews } from './counselorProfileData';

const ReviewList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(counselorReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = counselorReviews.slice(startIndex, startIndex + itemsPerPage);

  // 별점 렌더링
  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  const handleReviewClick = (reviewId) => {
    navigate(`/system/info/review/${reviewId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 6;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 rounded ${
            currentPage === i ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6 pb-6">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center text-gray-600 disabled:text-gray-300"
        >
          &lt;
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center text-gray-600 disabled:text-gray-300"
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-gray-50 pb-24">
        {/* 헤더 */}
        <div className="bg-blue-600 text-white p-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">상담 리뷰</h1>
        </div>

        {/* 리뷰 리스트 */}
        <div className="p-4 space-y-4">
          {currentItems.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => handleReviewClick(review.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{review.author}</span>
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-yellow-500 text-sm">{renderStars(review.rating)}</div>
                <span className="text-xs text-gray-500">조회 {review.views}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">{review.content}</p>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {renderPagination()}
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[30px] font-semibold text-gray-800">상담 리뷰</h1>
            <button
              onClick={() => navigate('/system/mypage')}
              className="px-8 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
            >
              뒤로 가기
            </button>
          </div>

          {/* 리뷰 리스트 */}
          <div className="space-y-4">
            {currentItems.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-sm p-8 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleReviewClick(review.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-lg font-semibold text-gray-800">{review.author}</span>
                      <span className="text-base text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-yellow-500 text-xl">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-500">조회 {review.views}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReviewClick(review.id);
                    }}
                    className="px-6 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
                  >
                    상세보기
                  </button>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">{review.content}</p>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg text-gray-600 disabled:text-gray-300 hover:bg-white transition-colors"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    currentPage === pageNum 
                      ? 'bg-[#2563eb] text-white font-semibold' 
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg text-gray-600 disabled:text-gray-300 hover:bg-white transition-colors"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewList;
