import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCounselsByStatus } from './../../../api/counselApi';
import { useAuthStore } from './../../../store/auth.store';

const TAB_TO_STATUS = { scheduled: 'B', inProgress: 'C', completed: 'D' };

const MyCounselHistory = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('B'); // 'B: 상담 예정', 'C: 상담 진행 중', 'D: 상담 완료'
  const [counselHistory, setCounselHistory] = useState([]);
  const itemsPerPage = 10;
  const { email, nickname } = useAuthStore();

  useEffect(() => {
    const fetchCounsels = async () => {
      const data = await fetchCounselsByStatus({
        page: 0,
        size: 10,
        status: activeTab,
        cnslerId: email,
      });

      console.log('test', data.content);
      setCounselHistory(data.content);
    };
    fetchCounsels();
  }, [activeTab, currentPage]);

  // 탭별 필터링
  const filteredCounsels = counselHistory.filter((item) => {
    if (activeTab === 'B') return item.statusText === '상담 예정';
    if (activeTab === 'C') return item.statusText === '상담 진행 중';
    if (activeTab === 'D') return item.statusText === '상담 완료';
    return true;
  });

  const totalPages = Math.ceil(filteredCounsels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCounsels.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // 탭 변경 시 페이지 초기화
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getStatusLabel = (status) => {
    if (status === '상담 예정')
      return { text: status, bg: 'bg-[#2563eb]', color: 'text-[#2563eb]' };
    if (status === '상담 진행 중')
      return { text: status, bg: 'bg-[#ff8d28]', color: 'text-[#ff8d28]' };
    if (status === '상담 완료')
      return { text: status, bg: 'bg-chat', color: 'text-chat' };
    return { text: '상담 예정', bg: 'bg-blue-500' };
  };

  // 상담 유형 라벨 가져오기
  const getCounselTypeLabel = (type) => {
    if (type === '채팅')
      return { text: '채팅 상담', icon: '💬', color: 'text-blue-600' };
    if (type === '화상')
      return { text: '화상 상담', icon: '💻', color: 'text-purple-600' };
    if (type === '전화')
      return { text: '전화 상담', icon: '📞', color: 'text-green-600' };
    if (type === '방문')
      return { text: '방문 상담', icon: '🏢', color: 'text-yellow-600' };
    if (type === '게시판')
      return { text: '게시판 상담', icon: '📝', color: 'text-orange-600' };
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (item) => {
    // 상담 시작 시간이 지났고, 수락 상태(B)이며, cnsl_tp가 4(채팅) 또는 5(화상)인 경우
    try {
      const now = new Date();
      // dtTime: "YY.MM.DD HH:MM" 형식이므로 변환
      const raw = item.dtTime; // 예: "25.03.18 17:00"
      if (raw) {
        const [datePart, timePart] = String(raw).split(' ');
        const [yy, mm, dd] = datePart.split('.').map((v) => parseInt(v, 10));
        const year = 2000 + (isNaN(yy) ? 0 : yy);
        const month = isNaN(mm) ? 1 : mm;
        const day = isNaN(dd) ? 1 : dd;
        const start = new Date(year, month - 1, day, ...timePart.split(':').map((v) => parseInt(v, 10)));

        const isStarted = start <= now;
        const isAccepted = item.statusText === '상담 예정' || item.statusText === '상담 진행 중';
        const tp = item.cnslTp || item.cnsl_tp;

        if (isStarted && isAccepted && (tp === '4' || tp === '5')) {
          if (tp === '4') {
            navigate(`/chat/cnslchat/${item.cnslId}`);
          } else if (tp === '5') {
            navigate(`/chat/visualchat/${item.cnslId}`);
          }
          return;
        }
      }
    } catch (e) {
      console.error('상담 시작 시간 파싱 실패:', e);
    }

    // 기본: 상담 상세 페이지로 이동
    navigate(`/system/info/counsel/${item.cnslId}`);
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
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>,
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
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center text-gray-600 disabled:text-gray-300"
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-blue-600 text-white p-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <img src="/logo.png" alt="고민순삭" className="h-8 mx-auto" />
          </div>
          <div className="w-6"></div>
        </div>

        {/* 환영 메시지 */}
        <div className="mx-4 mt-4 mb-4 bg-blue-500 text-white p-3 rounded-lg text-center text-sm">
          안녕하세요, {nickname} 상담사님.
        </div>

        {/* 제목 */}
        <div className="px-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            내 상담 내역 관리
          </h1>
        </div>

        {/* 탭 */}
        <div className="px-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm flex overflow-hidden">
            <button
              onClick={() => handleTabChange('B')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'B' ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
            >
              상담 예정
            </button>
            <button
              onClick={() => handleTabChange('C')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'C' ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
            >
              진행 중
            </button>
            <button
              onClick={() => handleTabChange('D')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'D' ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
            >
              상담 완료
            </button>
          </div>
        </div>

        {/* 상담 내역 리스트 */}
        <div className="px-4 space-y-3 mb-6">
          {currentItems.map((item) => {
            const statusInfo = getStatusLabel(item.statusText);
            const typeInfo = getCounselTypeLabel(item.type);

            return (
              <div
                key={item.cnslId}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer"
                onClick={() => handleViewDetail(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">
                        {item.cnslTitle}
                      </h3>
                      <span
                        className={`text-xs font-medium ${typeInfo.color} whitespace-nowrap`}
                      >
                        {typeInfo.icon} {typeInfo.text}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      상담자 : {item.nickname}
                    </p>
                    <p className="text-xs text-gray-500">
                      예약일시 : {item.dtTime}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        {renderPagination()}
      </div>

      {/* PC VERSION */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="mb-12 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-800">
              내 상담 내역 관리
            </h1>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer px-8 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
            >
              뒤로 가기
            </button>
          </div>

          {/* 탭 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="grid grid-cols-3">
              <button
                onClick={() => handleTabChange('B')}
                className={`cursor-pointer py-5 text-xl font-bold transition-colors ${
                  activeTab === 'B'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                상담 예정
              </button>
              <button
                onClick={() => handleTabChange('C')}
                className={`cursor-pointer py-5 text-xl font-bold transition-colors border-x border-gray-200 ${
                  activeTab === 'C'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                진행 중
              </button>
              <button
                onClick={() => handleTabChange('D')}
                className={`cursor-pointer py-5 text-xl font-bold transition-colors ${
                  activeTab === 'D'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                상담 완료
              </button>
            </div>
          </div>

          {/* 상담 내역 리스트 */}
          <div className="space-y-4 mb-8">
            {currentItems.map((item) => {
              const statusInfo = getStatusLabel(item.statusText);
              const typeInfo = getCounselTypeLabel(item.type);
              return (
                <div
                  key={item.cnslId}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 cursor-pointer"
                  onClick={() => handleViewDetail(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-800 flex-1">
                          {item.cnslTitle}
                        </h3>
                        <span
                          className={`text-base font-bold ${typeInfo.color} px-4 py-2 rounded-full bg-gray-50`}
                        >
                          {typeInfo.icon} {typeInfo.text}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2.5 text-sm text-gray-600">
                        <span>상담자 : {item.nickname}</span>
                        <span>
                          상태 :{' '}
                          <span className={statusInfo.color}>
                            {statusInfo.text}
                          </span>
                        </span>
                        <span className="text-[#ff8d28] mt-1 sm:mt-0">
                          {item.respYn === '답변 필요' ? '답변 필요' : null}
                        </span>
                        <p className="text-sm text-gray-500">
                          예약 일시 : {item.dtTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 페이지네이션 - PC */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 flex items-center justify-center text-gray-600 disabled:text-gray-300 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xl"
            >
              &lt;
            </button>
            {Array.from(
              { length: Math.min(10, totalPages) },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-12 h-12 rounded-lg text-base font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-[#2563eb] text-white shadow-lg'
                    : 'text-gray-600 border-2 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="w-12 h-12 flex items-center justify-center text-gray-600 disabled:text-gray-300 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xl"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyCounselHistory;
