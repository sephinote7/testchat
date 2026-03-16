import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReviews } from '../../../api/cnslApi';

const CounselorReviews = () => {
  const { c_id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({ content: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getReviews({
      params: { page: page - 1, size: 10 },
      memberId: c_id,
    })
      .then((res) => {
        if (cancelled) return;
        setPageData({
          content: res?.content ?? [],
          totalPages: Math.max(1, res?.totalPages ?? 1),
        });
      })
      .catch(() => {
        if (!cancelled) setPageData({ content: [], totalPages: 1 });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [c_id, page]);

  const totalPages = pageData.totalPages;
  const reviews = pageData.content;

  const renderStars = (rating) => {
    const full = Math.round(rating || 0);
    return '⭐'.repeat(full);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(
        <button
          key={i}
          type="button"
          onClick={() => setPage(i)}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            page === i ? 'bg-[#2563eb] text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center text-gray-600 disabled:text-gray-300"
        >
          &lt;
        </button>
        {pages}
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center text-gray-600 disabled:text-gray-300"
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f3f7ff]">
      <div className="max-w-[1520px] mx-auto px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[30px] font-semibold text-gray-800">상담 리뷰</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
          >
            뒤로 가기
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {loading ? (
            <div className="text-center text-gray-500 py-20">리뷰를 불러오는 중입니다...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-500 py-20">아직 등록된 리뷰가 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, idx) => (
                <div
                  key={r.reviewId ?? idx}
                  className="border border-gray-200 rounded-2xl p-6 bg-white"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#f59e0b] text-lg">
                      {renderStars(r.evalPt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {r.nickname} | {r.createdAt?.split('T')[0]}
                  </p>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {r.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default CounselorReviews;

