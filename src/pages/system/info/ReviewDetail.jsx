import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { counselorReviews } from './counselorProfileData';

const ReviewDetail = () => {
  const navigate = useNavigate();
  const { reviewId } = useParams();

  // 해당 리뷰 찾기
  const review = counselorReviews.find((r) => r.id === parseInt(reviewId));

  // 별점 렌더링
  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  const handleEdit = () => {
    // 리뷰 수정 페이지로 이동
    navigate(`/system/info/review/${reviewId}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('리뷰를 삭제하시겠습니까?')) {
      // 삭제 로직 (백엔드 연동 시 구현)
      alert('리뷰가 삭제되었습니다.');
      navigate(-1);
    }
  };

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>리뷰를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <div className="text-sm">뒤로가기</div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="bg-white min-h-screen">
        <div className="p-4">
          {/* 작성자 정보 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">{review.author}</span>
              <span className="text-sm text-gray-500">{review.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-yellow-500">{renderStars(review.rating)}</div>
              <div className="text-sm text-gray-500">조회 {review.views}</div>
            </div>
          </div>

          {/* 수정/삭제 버튼 (작성자 본인일 경우에만 표시) */}
          {review.isAuthor && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleEdit}
                className="flex-1 border border-blue-600 text-blue-600 py-2 rounded font-medium hover:bg-blue-50 transition"
              >
                리뷰 수정
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 border border-blue-600 text-blue-600 py-2 rounded font-medium hover:bg-blue-50 transition"
              >
                리뷰 삭제
              </button>
            </div>
          )}

          {/* 리뷰 내용 */}
          <div className="py-4 border-t border-gray-200">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">{review.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
