import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyCounselReservations = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 임시 데이터 (나중에 API로 교체)
  const counselReservations = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    title: '상담제목 : LJ정한LJ무많은일이있었어나무힘들...',
    client: '고길동',
    date: '26.01.16 18:00',
    status: 'pending', // pending, accepted, rejected
  }));

  const totalPages = Math.ceil(counselReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = counselReservations.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (id) => {
    navigate(`/mycounsel/${id}`);
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <img src="/logo.png" alt="고민순삭" className="h-8 mx-auto" />
        </div>
        <div className="w-6"></div>
      </div>

      {/* 환영 메시지 */}
      <div className="mx-4 mt-4 mb-4 bg-blue-500 text-white p-3 rounded-lg text-center text-sm">
        안녕하세요, 홍길동 상담자님.
      </div>

      {/* 제목 */}
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">내 예약 내역 관리</h1>
      </div>

      {/* 예약 리스트 */}
      <div className="px-4 space-y-3">
        {currentItems.map((item, index) => (
          <div
            key={item.id}
            className={`rounded-lg p-4 shadow-sm border border-gray-200 ${index % 2 === 1 ? 'bg-blue-50' : 'bg-white'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-xs text-gray-600 mb-1">상담자 : {item.client}</p>
                <p className="text-xs text-gray-500">예약일시 : {item.date}</p>
              </div>
              <button
                onClick={() => handleViewDetail(item.id)}
                className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 whitespace-nowrap"
              >
                상담 예약
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
};

export default MyCounselReservations;
