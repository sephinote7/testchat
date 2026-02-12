import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// TODO: DB 연동 가이드
// 이 페이지는 위험군 조치 내역 목록 페이지입니다
//
// DB 연동 시 필요한 작업:
// 1. 위험군 케이스 목록 조회 API
//    - API: GET /api/counselors/me/risk-cases?page={page}&pageSize={pageSize}
//    - 요청 파라미터:
//      * page: 페이지 번호 (기본값: 1)
//      * pageSize: 페이지당 항목 수 (기본값: 10)
//    - 응답:
//      {
//        cases: [
//          {
//            id: string,
//            title: string,
//            clientName: string,
//            status: string,           // '완료', '진행중', '대기중'
//            riskLevel: string,        // '고위험', '중위험', '저위험'
//            createdAt: string,        // 'YYYY.MM.DD'
//            reportedAt: string,       // 'YYYY.MM.DD HH:mm'
//            processedAt: string | null // 'YYYY.MM.DD HH:mm'
//          }
//        ],
//        totalCount: number,
//        totalPages: number,
//        currentPage: number
//      }
//
// 2. 위험군 케이스 상세 조회 API
//    - API: GET /api/counselors/me/risk-cases/:id
//    - 상세 페이지로 이동 시 사용

const RiskCaseList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // TODO: DB 연동 시 상태로 관리
  // useEffect(() => {
  //   const fetchRiskCases = async () => {
  //     const response = await fetch(
  //       `/api/counselors/me/risk-cases?page=${currentPage}&pageSize=${itemsPerPage}`,
  //       { headers: { 'Authorization': `Bearer ${token}` } }
  //     );
  //     const data = await response.json();
  //     setRiskCases(data.cases);
  //     setTotalPages(data.totalPages);
  //   };
  //   fetchRiskCases();
  // }, [currentPage]);

  // ========== 더미 데이터 시작 (DB 연동 시 아래 전체 삭제) ==========
  const allRiskCases = [
    {
      id: 1,
      title: '상담제목 : 나랑같이나무르는걸알아아아아아아아아야...',
      clientName: '김철수',
      status: '완료',
      createdAt: '2026.01.12',
      reportedAt: '2026.01.12 - 10시 38분',
      processedAt: '2026.01.13 06:00'
    },
    {
      id: 2,
      title: '상담제목 : 나랑같이나무르는걸알아아아아아아아아야...',
      clientName: '김철수',
      status: '완료',
      createdAt: '2026.01.12',
      reportedAt: '2026.01.12 - 10시 38분',
      processedAt: '2026.01.13 06:00'
    },
    {
      id: 3,
      title: '상담제목 : 나랑같이나무르는걸알아아아아아아아아야...',
      clientName: '김철수',
      status: '완료',
      createdAt: '2026.01.12',
      reportedAt: '2026.01.12 - 10시 38분',
      processedAt: '2026.01.13 06:00'
    },
    {
      id: 4,
      title: '상담제목 : 나랑같이나무르는걸알아아아아아아아아야...',
      clientName: '김철수',
      status: '완료',
      createdAt: '2026.01.12',
      reportedAt: '2026.01.12 - 10시 38분',
      processedAt: '2026.01.13 06:00'
    },
    {
      id: 5,
      title: '상담제목 : 나랑같이나무르는걸알아아아아아아아아야...',
      clientName: '김철수',
      status: '완료',
      createdAt: '2026.01.12',
      reportedAt: '2026.01.12 - 10시 38분',
      processedAt: '2026.01.13 06:00'
    },
    {
      id: 6,
      title: '상담제목 : 나랑같이나무르는걸알아아아아아아아아야...',
      clientName: '김철수',
      status: '완료',
      createdAt: '2026.01.12',
      reportedAt: '2026.01.12 - 10시 38분',
      processedAt: '2026.01.13 06:00'
    },
    {
      id: 7,
      title: '상담제목 : 나랑같이나무르는걸알아아아아아아아아야...',
      clientName: '김철수',
      status: '완료',
      createdAt: '2026.01.12',
      reportedAt: '2026.01.12 - 10시 38분',
      processedAt: '2026.01.13 06:00'
    },
    {
      id: 8,
      title: '상담제목 : 나랑같이나무르는걸알아아아아아아아아야...',
      clientName: '김철수',
      status: '완료',
      createdAt: '2026.01.12',
      reportedAt: '2026.01.12 - 10시 38분',
      processedAt: '2026.01.13 06:00'
    },
    {
      id: 9,
      title: '상담제목 : 나랑같이나무르는걸알아아아아아아아아야...',
      clientName: '김철수',
      status: '완료',
      createdAt: '2026.01.12',
      reportedAt: '2026.01.12 - 10시 38분',
      processedAt: '2026.01.13 06:00'
    },
    {
      id: 10,
      title: '상담제목 : 나랑같이나무르는걸알아아아아아아아아야...',
      clientName: '김철수',
      status: '완료',
      createdAt: '2026.01.12',
      reportedAt: '2026.01.12 - 10시 38분',
      processedAt: '2026.01.13 06:00'
    },
  ];
  // ========== 더미 데이터 끝 (여기까지 삭제) ==========

  const totalPages = Math.ceil(allRiskCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = allRiskCases.slice(startIndex, startIndex + itemsPerPage);

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
            {currentItems.map((riskCase) => (
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
            ))}
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
