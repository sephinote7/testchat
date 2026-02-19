import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// TODO: DB 연동 가이드
// 이 페이지는 상담사의 상담 내역 관리 페이지입니다
//
// DB 연동 시 필요한 작업:
// 1. 상담 내역 조회 API
//    - API: GET /api/counselors/me/counsels?status={status}&page={page}&pageSize={pageSize}
//    - 요청 파라미터:
//      * status: 'scheduled' | 'inProgress' | 'completed' | 'all'
//      * page: 페이지 번호
//      * pageSize: 페이지당 항목 수
//    - 응답:
//      {
//        counsels: [
//          {
//            id: string,
//            title: string,
//            clientName: string,
//            reservationDate: string,
//            status: 'scheduled' | 'inProgress' | 'completed',
//            createdAt: string
//          }
//        ],
//        totalCount: number,
//        totalPages: number
//      }
//
// 2. 상담 상세 조회
//    - API: GET /api/counselors/me/counsels/:id
//
// 3. 상태별 카운트 조회
//    - API: GET /api/counselors/me/counsels/count
//    - 응답: { scheduled: number, inProgress: number, completed: number }

const MyCounselHistory = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('scheduled'); // 'scheduled', 'inProgress', 'completed'
  const itemsPerPage = 10;

  // TODO: DB 연동 시 상태별 데이터 가져오기
  // useEffect(() => {
  //   const fetchCounsels = async () => {
  //     const response = await fetch(
  //       `/api/counselors/me/counsels?status=${activeTab}&page=${currentPage}&pageSize=${itemsPerPage}`,
  //       { headers: { 'Authorization': `Bearer ${token}` } }
  //     );
  //     const data = await response.json();
  //     setCounselHistory(data.counsels);
  //     setTotalPages(data.totalPages);
  //   };
  //   fetchCounsels();
  // }, [activeTab, currentPage]);

  // ========== 더미 데이터 시작 (DB 연동 시 아래 전체 삭제) ==========
  const allCounselHistory = [
    // 상담 예정 (scheduled) - 5개
    {
      id: 1,
      title: '상담제목 : 진로 고민이 많아요. 어떤 선택을 해야 할지 모르겠어요.',
      client: '김민수',
      clientId: 'user-001',
      date: '2026.02.05 14:00',
      status: 'scheduled',
      counselType: 'chat', // 'chat' | 'video' | 'phone'
    },
    {
      id: 2,
      title: '상담제목 : 직장 내 인간관계가 너무 힘들어요',
      client: '이서연',
      clientId: 'user-002',
      date: '2026.02.05 15:00',
      status: 'scheduled',
      counselType: 'video',
    },
    {
      id: 3,
      title: '상담제목 : 가족과의 갈등 때문에 매일 스트레스를 받습니다',
      client: '박지훈',
      clientId: 'user-003',
      date: '2026.02.06 10:00',
      status: 'scheduled',
      counselType: 'chat',
    },
    {
      id: 4,
      title: '상담제목 : 취업 준비가 너무 막막하고 불안해요',
      client: '최유진',
      clientId: 'user-004',
      date: '2026.02.06 16:00',
      status: 'scheduled',
      counselType: 'phone',
    },
    {
      id: 5,
      title: '상담제목 : 우울감이 지속되고 있어 도움이 필요합니다',
      client: '정하늘',
      clientId: 'user-005',
      date: '2026.02.07 11:00',
      status: 'scheduled',
      counselType: 'chat',
    },

    // 상담 진행중 (inProgress) - 5개
    {
      id: 6,
      title: '상담제목 : 학업 스트레스로 인한 불면증 증상',
      client: '강민지',
      clientId: 'user-006',
      date: '2026.02.03 14:00',
      status: 'inProgress',
      counselType: 'chat',
    },
    {
      id: 7,
      title: '상담제목 : 연애 관계에서의 소통 문제',
      client: '윤성호',
      clientId: 'user-007',
      date: '2026.02.03 15:30',
      status: 'inProgress',
      counselType: 'video',
    },
    {
      id: 8,
      title: '상담제목 : 자존감이 낮아져서 일상생활이 힘듭니다',
      client: '송예은',
      clientId: 'user-008',
      date: '2026.02.04 10:00',
      status: 'inProgress',
      counselType: 'chat',
    },
    {
      id: 9,
      title: '상담제목 : 사회생활 적응이 어렵고 외로움을 느낍니다',
      client: '임준혁',
      clientId: 'user-009',
      date: '2026.02.04 13:00',
      status: 'inProgress',
      counselType: 'phone',
    },
    {
      id: 10,
      title: '상담제목 : 진로 변경을 고민 중인데 결정하기 어려워요',
      client: '한소희',
      clientId: 'user-010',
      date: '2026.02.04 16:00',
      status: 'inProgress',
      counselType: 'chat',
    },

    // 상담 완료 (completed) - 5개
    {
      id: 11,
      title: '상담제목 : 직장 내 갈등 해결 방법 상담',
      client: '오지훈',
      clientId: 'user-011',
      date: '2026.01.30 14:00',
      status: 'completed',
      counselType: 'chat',
    },
    {
      id: 12,
      title: '상담제목 : 대인 관계 개선을 위한 상담',
      client: '배수진',
      clientId: 'user-012',
      date: '2026.01.30 16:00',
      status: 'completed',
      counselType: 'video',
    },
    {
      id: 13,
      title: '상담제목 : 불안장애 증상 완화 상담',
      client: '신동욱',
      clientId: 'user-013',
      date: '2026.01.31 10:00',
      status: 'completed',
      counselType: 'chat',
    },
    {
      id: 14,
      title: '상담제목 : 가족 간 소통 문제 해결',
      client: '류하은',
      clientId: 'user-014',
      date: '2026.01.31 14:00',
      status: 'completed',
      counselType: 'phone',
    },
    {
      id: 15,
      title: '상담제목 : 진로 결정 및 취업 준비 상담',
      client: '홍재민',
      clientId: 'user-015',
      date: '2026.02.01 11:00',
      status: 'completed',
      counselType: 'chat',
    },
  ];
  // ========== 더미 데이터 끝 (여기까지 삭제) ==========

  // 탭별 필터링
  const filteredCounsels = allCounselHistory.filter((item) => {
    if (activeTab === 'scheduled') return item.status === 'scheduled';
    if (activeTab === 'inProgress') return item.status === 'inProgress';
    if (activeTab === 'completed') return item.status === 'completed';
    return true;
  });

  const totalPages = Math.ceil(filteredCounsels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCounsels.slice(startIndex, startIndex + itemsPerPage);

  // 탭 변경 시 페이지 초기화
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getStatusLabel = (status) => {
    if (status === 'scheduled') return { text: '상담 예정', bg: 'bg-blue-500' };
    if (status === 'inProgress') return { text: '상담 진행중', bg: 'bg-orange-500' };
    if (status === 'completed') return { text: '상담 완료', bg: 'bg-green-500' };
    return { text: '상담 예정', bg: 'bg-blue-500' };
  };

  // 상담 유형 라벨 가져오기
  const getCounselTypeLabel = (type) => {
    if (type === 'chat') return { text: '채팅 상담', icon: '💬', color: 'text-blue-600' };
    if (type === 'video') return { text: '화상 상담', icon: '📹', color: 'text-purple-600' };
    if (type === 'phone') return { text: '전화 상담', icon: '📞', color: 'text-green-600' };
    return { text: '상담', icon: '💬', color: 'text-gray-600' };
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (item) => {
    // 모든 상담은 상세 페이지로 이동
    // MyCounselDetail.jsx에서 상태에 따라 다른 화면 렌더링
    navigate(`/mycounsel/${item.id}`);
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
    <>
      {/* MOBILE */}
      <div className="lg:hidden min-h-screen bg-gray-50">
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
          <h1 className="text-2xl font-bold text-gray-800">내 상담 내역 관리</h1>
        </div>

        {/* 탭 */}
        <div className="px-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm flex overflow-hidden">
            <button
              onClick={() => handleTabChange('scheduled')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'scheduled' ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
            >
              상담 예정
            </button>
            <button
              onClick={() => handleTabChange('inProgress')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'inProgress' ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
            >
              진행중
            </button>
            <button
              onClick={() => handleTabChange('completed')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'completed' ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
            >
              상담 완료
            </button>
          </div>
        </div>

        {/* 상담 내역 리스트 */}
        <div className="px-4 space-y-3 mb-6">
          {currentItems.map((item) => {
            const statusInfo = getStatusLabel(item.status);
            const typeInfo = getCounselTypeLabel(item.counselType);
            return (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">{item.title}</h3>
                      <span className={`text-xs font-medium ${typeInfo.color} whitespace-nowrap`}>
                        {typeInfo.icon} {typeInfo.text}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">상담자 : {item.client}</p>
                    <p className="text-xs text-gray-500">예약일시 : {item.date}</p>
                  </div>
                  <button
                    onClick={() => handleViewDetail(item)}
                    className={`ml-4 px-4 py-2 rounded-md text-sm font-medium text-white whitespace-nowrap ${statusInfo.bg}`}
                  >
                    {statusInfo.text}
                  </button>
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
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-800">내 상담 내역 관리</h1>
          </div>

          {/* 탭 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="grid grid-cols-3">
              <button
                onClick={() => handleTabChange('scheduled')}
                className={`py-5 text-xl font-bold transition-colors ${
                  activeTab === 'scheduled' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                상담 예정
              </button>
              <button
                onClick={() => handleTabChange('inProgress')}
                className={`py-5 text-xl font-bold transition-colors border-x border-gray-200 ${
                  activeTab === 'inProgress' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                진행중
              </button>
              <button
                onClick={() => handleTabChange('completed')}
                className={`py-5 text-xl font-bold transition-colors ${
                  activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                상담 완료
              </button>
            </div>
          </div>

          {/* 상담 내역 리스트 */}
          <div className="space-y-4 mb-8">
            {currentItems.map((item) => {
              const statusInfo = getStatusLabel(item.status);
              const typeInfo = getCounselTypeLabel(item.counselType);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-800 flex-1">{item.title}</h3>
                        <span className={`text-base font-bold ${typeInfo.color} px-4 py-2 rounded-full bg-gray-50`}>
                          {typeInfo.icon} {typeInfo.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-base text-gray-600">
                        <p>상담자 : {item.client}</p>
                        <p>상담 : {statusInfo.text}</p>
                      </div>
                      <p className="text-base text-gray-500 mt-2">예약 일시 : {item.date}</p>
                    </div>
                    <button
                      onClick={() => handleViewDetail(item)}
                      className={`ml-8 px-10 py-4 rounded-xl text-lg font-bold text-white whitespace-nowrap hover:shadow-lg transition-all ${statusInfo.bg}`}
                    >
                      {statusInfo.text}
                    </button>
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
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map((page) => (
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
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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
