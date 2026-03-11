import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { risksApi } from '../../../api/backendApi';

const formatRiskDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

const formatRiskDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} - ${h}시 ${min}분`;
};

const RiskCaseList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [pageData, setPageData] = useState({ content: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    risksApi.getList({ page: currentPage, limit: itemsPerPage })
      .then((res) => {
        if (cancelled) return;
        const list = (res.content ?? []).map((r) => ({
          id: r.id,
          title: (r.content || '').slice(0, 50) || `[${r.bbsDiv}] 게시글 #${r.bbsId}`,
          clientName: r.memberId ?? '—',
          status: r.action ?? '—',
          createdAt: formatRiskDate(r.createdAt),
          reportedAt: formatRiskDateTime(r.createdAt),
          processedAt: r.updatedAt ? formatRiskDateTime(r.updatedAt) : '—',
        }));
        setPageData({
          content: list,
          totalPages: Math.max(1, res.totalPages ?? 1),
        });
      })
      .catch(() => {
        if (!cancelled) setPageData({ content: [], totalPages: 1 });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentPage]);

  const totalPages = pageData.totalPages;
  const currentItems = pageData.content;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (caseId) => {
    navigate(`/system/info/risk-case/${caseId}`);
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
          <h1 className="text-lg font-bold">위험군 조치 내역</h1>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">모바일 버전은 지원하지 않습니다. PC에서 이용해주세요.</p>
        </div>
      </div>

      {/* PC VERSION */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[30px] font-bold text-gray-800">위험군 조치 내역</h1>
            <button
              onClick={() => navigate('/system/info/counsel-history')}
              className="px-8 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
            >
              뒤로 가기
            </button>
          </div>

          {/* 위험군 케이스 리스트 */}
          <div className="space-y-4 mb-8">
            {loading ? (
              <div className="py-12 text-center text-gray-500">로딩 중...</div>
            ) : currentItems.length === 0 ? (
              <div className="py-12 text-center text-gray-500">위험 게시물 내역이 없습니다.</div>
            ) : (
            currentItems.map((riskCase) => (
              <div
                key={riskCase.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleViewDetail(riskCase.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                      {riskCase.title}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                      <span>상담자 : {riskCase.clientName}</span>
                      <span>조치 : {riskCase.status}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>위험군감지 : {riskCase.reportedAt}</p>
                      <p>조치완료 : {riskCase.processedAt}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(riskCase.id);
                    }}
                    className="ml-6 px-8 py-3 rounded-xl bg-red-500 text-white text-base font-medium hover:bg-red-600 transition-colors whitespace-nowrap"
                  >
                    위험 확인
                  </button>
                </div>
              </div>
            ))
            )}
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-[#2563eb] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCaseList;
