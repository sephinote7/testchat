import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const CounselList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'counselor'
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // TODO: DB 연동 시 API 호출로 대체 필요
  // - AI 상담 목록: GET /api/counsels/ai?userId={user.id}&page={page}&pageSize={pageSize}
  // - 상담사 상담 목록: GET /api/counsels/counselor?userId={user.id}&page={page}&pageSize={pageSize}
  // - 응답 형식: { counsels: [...], totalCount: number }

  // 더미 AI 상담 데이터 (확장)
  const aiCounselList = Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    title: '볶음밥을 하려고 했는데 쌀이 없었...',
    date: '2026.01.12',
    status: '상담 중',
    type: 'AI 상담',
    counselor: '상담 중',
  }));

  // 더미 상담사 상담 데이터 (확장)
  // id별 상태:
  // 1, 5 = '상담 완료' (리뷰 작성하기 버튼)
  // 2 = '상담 예약 대기' (대기 안내)
  // 3 = '상담 예약 (완료)' (수정하기/취소하기 버튼)
  // 4 = '상담 예약 취소' (취소 안내)
  const counselorCounselList = Array.from({ length: 60 }, (_, i) => {
    const id = i + 1;
    let status, statusText;

    if (id === 1 || id === 5) {
      status = '상담 완료';
      statusText = '상담 완료';
    } else if (id === 2) {
      status = '상담 예약 대기';
      statusText = '상담 예약 대기';
    } else if (id === 3) {
      status = '상담 예약 (완료)';
      statusText = '상담 예약 (완료)';
    } else if (id === 4) {
      status = '상담 예약 취소';
      statusText = '상담 예약 취소';
    } else {
      // 나머지는 랜덤
      const statusTypes = [
        { status: '상담 완료', text: '상담 완료' },
        { status: '상담 예약 (완료)', text: '상담 예약 (완료)' },
        { status: '상담 예약 대기', text: '상담 예약 대기' },
      ];
      const randomStatus = statusTypes[i % statusTypes.length];
      status = randomStatus.status;
      statusText = randomStatus.text;
    }

    return {
      id: id,
      title:
        id === 1
          ? 'LN다무맛은일이있었어힘들다...'
          : id === 2
          ? '취업 준비 관련 상담'
          : id === 3
          ? '진로 고민 상담'
          : id === 4
          ? '스트레스 관리 상담'
          : id === 5
          ? '대인관계 고민 상담 (채팅)'
          : '볶음밥을 하려고 했는데 쌀이 없었...',
      date: '2026.01.12',
      status: status,
      statusText: statusText,
      type: '상담사 상담',
      counselor: status === '상담 완료' ? '상담 완료' : status === '상담 예약 (완료)' ? '예약 확정' : '대기 중',
    };
  });

  const currentList = activeTab === 'ai' ? aiCounselList : counselorCounselList;

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(currentList.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return currentList.slice(start, start + pageSize);
  }, [currentList, safePage]);

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
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-24">
        {/* HEADER */}
        <header className="bg-[#2563eb] h-14 flex items-center justify-center px-5 relative">
          <Link to="/mypage" className="absolute left-5 text-white text-xl">
            ←
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#2563eb] font-bold text-sm">★</span>
            </div>
            <span className="text-white font-bold text-lg">고민순삭</span>
          </div>
        </header>

        {/* TITLE */}
        <div className="px-5 pt-5 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">상담내역</h1>
        </div>

        {/* TAB BUTTONS */}
        <div className="px-5 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('ai');
                setPage(1);
                setSelectedItem(null);
              }}
              className={`flex-1 py-3 rounded-lg font-semibold text-base transition-colors ${
                activeTab === 'ai' ? 'bg-[#2563eb] text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              AI상담
            </button>
            <button
              onClick={() => {
                setActiveTab('counselor');
                setPage(1);
                setSelectedItem(null);
              }}
              className={`flex-1 py-3 rounded-lg font-semibold text-base transition-colors ${
                activeTab === 'counselor' ? 'bg-[#2563eb] text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              상담사 상담
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-5 space-y-4">
          {pagedItems.map((counsel) => (
            <div
              key={counsel.id}
              onClick={() => navigate(`/mypage/counsel/${activeTab}/${counsel.id}`)}
              className="bg-white rounded-xl p-5 border border-gray-200 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-semibold text-gray-800 flex-1 pr-2">{counsel.title}</h3>
                <span className="text-sm text-gray-500 whitespace-nowrap">{counsel.date}</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  상태 : <span className="text-blue-600">{counsel.statusText || counsel.status}</span>
                </p>
                {activeTab === 'counselor' && <p className="text-sm text-gray-600">상담사 : {counsel.counselor}</p>}
              </div>

              <div className="mt-4 flex justify-end">
                <span className="text-sm text-[#2563eb] font-semibold">상담 내용 보기</span>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION - MOBILE */}
        {currentList.length > 0 && (
          <div className="flex items-center justify-center gap-1 mt-6 px-5">{renderPagination()}</div>
        )}
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* TABS WITH HEADER */}
          <div className="w-[1520px] mx-auto mb-6">
            {/* Header 위치 변경: AI상담 위 좌측과 상담사 상담 위 우측 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-[30px] font-semibold text-gray-800">상담 내역</h1>
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={() => navigate('/mypage')}
                  className="px-8 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
                >
                  뒤로 가기
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setActiveTab('ai');
                  setPage(1);
                  setSelectedItem(null);
                }}
                className={`flex-1 py-4 rounded-xl text-lg font-semibold transition-colors ${
                  activeTab === 'ai' ? 'bg-[#2563eb] text-white' : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                AI상담
              </button>
              <button
                onClick={() => {
                  setActiveTab('counselor');
                  setPage(1);
                  setSelectedItem(null);
                }}
                className={`flex-1 py-4 rounded-xl text-lg font-semibold transition-colors ${
                  activeTab === 'counselor' ? 'bg-[#2563eb] text-white' : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                상담사 상담
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="w-[1520px] mx-auto space-y-4">
            {pagedItems.map((counsel, index) => {
              const isSelected = selectedItem === counsel.id;
              const isInProgress = activeTab === 'counselor' && counsel.status === '진행 중';

              return (
                <div
                  key={counsel.id}
                  onClick={() => navigate(`/mypage/counsel/${activeTab}/${counsel.id}`)}
                  className={`bg-white rounded-xl p-6 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#2563eb] text-white shadow-lg'
                      : isInProgress
                      ? 'border-2 border-orange-400'
                      : 'border border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 제목과 날짜 */}
                      <div className="flex items-start justify-between mb-4">
                        <h3
                          className={`text-lg font-semibold flex-1 pr-4 ${isSelected ? 'text-white' : 'text-gray-800'}`}
                        >
                          {counsel.title}
                        </h3>
                        <span className={`text-base whitespace-nowrap ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                          {counsel.date}
                        </span>
                      </div>

                      {/* 상태 정보 */}
                      <div className="flex items-center gap-8 mb-4">
                        <p className={`text-base ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                          상담자 : <span className="font-medium">{counsel.type}</span>
                        </p>
                        <p className={`text-base ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                          상태 :{' '}
                          <span className={`font-medium ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                            {counsel.statusText || counsel.status}
                          </span>
                        </p>
                      </div>

                      {/* 상담 내용 보기 링크 */}
                      <div className="flex justify-end">
                        <span
                          className={`text-base font-semibold hover:underline ${
                            isSelected ? 'text-white' : 'text-[#2563eb]'
                          }`}
                        >
                          상담 내용 보기
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {currentList.length > 0 && (
            <div className="flex items-center justify-center gap-1 mt-8">{renderPagination()}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default CounselList;
