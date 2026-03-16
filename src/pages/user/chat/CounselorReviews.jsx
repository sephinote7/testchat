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
            <div className="grid grid-cols-3 gap-6">
              {reviews.map((r, idx) => (
                <div
                  key={r.reviewId ?? idx}
                  className="border border-gray-200 rounded-xl p-6 bg-gray-50"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              >
                이전
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const num = i + 1;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`w-8 h-8 rounded-full text-sm ${
                      num === page
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounselorReviews;

