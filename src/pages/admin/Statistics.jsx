import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';
import { signOut } from '../../axios/Auth';
import { getWeeklyKeywords } from '../../api/bbsApi';
import { getCategoryRevenueStatistics } from './../../api/adminApi';

// ============================================================
// TODO: DB 연동 가이드
// ============================================================
// 이 페이지는 상담 키워드 통계를 시각화합니다
// 현재 더미 데이터로 구현되어 있으며, DB 연동 시 아래 가이드를 참고하세요
//
// ============================================================
// 1. 키워드 통계 조회 API
// ============================================================
//    - API: GET /api/admin/statistics/keywords
//    - 요청 파라미터:
//      * startDate: 시작 날짜 (YYYY-MM-DD)
//      * endDate: 종료 날짜 (YYYY-MM-DD)
//
//    - 응답 형식:
//      {
//        keywords: [
//          {
//            label: string,      // 키워드명 (예: "고민", "커리어")
//            count: number,      // 등장 횟수 (예: 45)
//            percentage: number, // 전체 중 비율 (예: 25)
//          }
//        ],
//        totalCount: number,     // 전체 키워드 합계
//        period: { start: string, end: string }
//      }
//
//    - 주의사항:
//      * 색상(color, hex)은 프론트엔드에서 매핑 (colorMap 사용)
//      * percentage는 소수점 첫째자리까지 반올림 권장
//
// ============================================================
// 2. 평균 상담 시간 조회 API
// ============================================================
//    - API: GET /api/admin/statistics/avg-time
//    - 요청 파라미터:
//      * startDate: 시작 날짜 (YYYY-MM-DD)
//      * endDate: 종료 날짜 (YYYY-MM-DD)
//
//    - 응답 형식:
//      {
//        categories: [
//          {
//            label: string,      // 카테고리명 (예: "커리어")
//            avgMinutes: number, // 평균 상담 시간 (분 단위)
//          }
//        ]
//      }
//
// ============================================================
// 3. 구현 체크리스트
// ============================================================
//    ✅ 파이차트 인터랙티브 호버 기능 구현 완료
//    ✅ 파이차트 동적 계산 로직 구현 완료 (DB 연동 후에도 사용 가능)
//    ⬜ useState로 loading 상태 추가
//    ⬜ useEffect로 API 호출 구현
//    ⬜ 날짜 변경 시 API 재호출 로직 추가
//    ⬜ 에러 핸들링 및 사용자 피드백 추가
//    ⬜ 빈 데이터 처리 (키워드가 없을 때)
//
// ============================================================
// 4. 추가 기능 (선택사항)
// ============================================================
//    - 데이터 내보내기 (CSV/Excel/PDF)
//    - 실시간 데이터 갱신 (WebSocket)
//    - 차트 애니메이션 효과
//    - 더 많은 통계 지표 추가
// ============================================================

const Statistics = () => {
  const navigate = useNavigate();
  const { email, nickname } = useAuthStore();
  const [dateRange, setDateRange] = useState('2026-01-19 ~ 2026-01-25');
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [chartData, setChartData] = useState([]);

  const colors = [
    'bg-blue-500', // 1
    'bg-indigo-500', // 2
    'bg-purple-500', // 3
    'bg-pink-500', // 4
    'bg-red-500', // 5
    'bg-orange-500', // 6
    'bg-yellow-400', // 7
    'bg-green-500', // 8
    'bg-teal-500', // 9
    'bg-cyan-500', // 10
  ];

  const colorsHex = [
    '#3B82F6', // blue-500
    '#6366F1', // indigo-500
    '#8B5CF6', // purple-500
    '#EC4899', // pink-500
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#FACC15', // yellow-400
    '#22C55E', // green-500
    '#14B8A6', // teal-500
    '#06B6D4', // cyan-500
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    const fetchWeeklyKeywords = async () => {
      try {
        const data = await getWeeklyKeywords();
        if (!data?.keywords?.length) {
          setChartData([]);
          return;
        }

        // 총합 계산
        const totalScore = data.keywords.reduce((sum, item) => sum + item.score, 0);

        // 퍼센트 계산 후 소수점 1자리 반올림
        let temp = data.keywords.map((item) => ({
          label: item.keyword,
          score: item.score,
          percentage: Math.round((item.score / totalScore) * 1000) / 10, // 소수점 1자리
        }));

        // 총합 100% 맞추기
        const sumPercent = temp.reduce((sum, item) => sum + item.percentage, 0);
        const diff = Math.round((100 - sumPercent) * 10) / 10; // 소수점 1자리까지
        temp[temp.length - 1].percentage += diff;

        setChartData(temp);
      } catch (err) {
        console.error('주간 키워드 불러오기 실패:', err);
      }
    };

    fetchWeeklyKeywords();
  }, []);

  // 파이차트 SVG 계산 로직
  // 주의: 이 계산 로직은 DB 연동 후에도 그대로 사용 가능
  // chartData가 API에서 받아온 데이터로 대체되어도 동일하게 작동함
  const radius = 40; // SVG 원의 반지름
  const circumference = 2 * Math.PI * radius; // 원의 둘레 (약 251.33)
  let cumulativePercentage = 0;
  const pieSegments = chartData.map((item) => {
    // 각 세그먼트의 길이 계산
    const segmentLength = (circumference * item.percentage) / 100;
    const gapLength = circumference - segmentLength;

    // 누적 오프셋 계산 (이전 세그먼트들의 합)
    const offset = -(cumulativePercentage * circumference) / 100;

    cumulativePercentage += item.percentage;

    return {
      ...item,
      strokeDasharray: `${segmentLength} ${gapLength}`,
      strokeDashoffset: offset,
    };
  });

  return (
    <>
      {/* LEFT SIDEBAR - 뷰포트 전체 높이 고정 */}
      <aside className="fixed top-0 left-0 bottom-0 z-10 w-[280px] bg-[#2d3e50] text-white flex flex-col">
        {/* LOGO */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-[#2ed3c6] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">★</span>
          </div>
          <span className="text-xl font-bold">고민순삭</span>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="px-4 py-8">
          <ul className="space-y-1">
            <li>
              <Link
                to="/alarm"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="text-lg">최신정보</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"
                  />
                </svg>
                <span className="text-lg">대시보드</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/keywords"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span className="text-lg">민감키워드</span>
              </Link>
            </li>
            <li>
              <Link
                to="/stats"
                className="flex items-center gap-4 px-6 py-4 rounded-lg bg-white/10 transition-colors text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-lg">통계자료</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-lg">마이페이지</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="min-h-screen flex flex-col pl-[280px] bg-[#f3f7ff]">
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* TOP BAR */}
          <header className="bg-white px-10 py-5 flex items-center justify-end gap-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <span className="text-lg font-semibold text-gray-700">{nickname || ''} 관리자님</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-lg text-base font-semibold hover:bg-blue-50 transition-colors"
            >
              로그아웃
            </button>
          </header>

          {/* CONTENT AREA */}
          <div className="flex-1 px-16 py-12 overflow-y-auto">
            <div className="max-w-[1520px] mx-auto">
              {/* TITLE */}
              <h1 className="text-4xl font-bold text-gray-800 mb-10">통계 자료</h1>

              {/* 파이차트와 키워드 범례 */}
              <div className="bg-white rounded-3xl p-10 shadow-xl mb-10">
                <div className="grid grid-cols-2 gap-12">
                  {/* 파이차트 */}
                  {/* DB 연동 시: pieSegments는 chartData가 API 데이터로 교체되면 자동으로 업데이트됨 */}
                  {/* 로딩 상태 추가 권장: {loading ? <Spinner /> : <차트 렌더링>} */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-[380px] h-[380px]">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90 drop-shadow-lg">
                        {/* 각 카테고리별 파이차트 세그먼트 */}
                        {pieSegments.map((segment, index) => (
                          <circle
                            key={index}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={colorsHex[index]}
                            strokeWidth="20"
                            strokeDasharray={segment.strokeDasharray}
                            strokeDashoffset={segment.strokeDashoffset}
                            className="cursor-pointer transition-all duration-200"
                            style={{
                              opacity: hoveredSegment === null || hoveredSegment === index ? 1 : 0.3,
                              filter: hoveredSegment === index ? 'brightness(1.2)' : 'none',
                            }}
                            onMouseEnter={() => setHoveredSegment(index)}
                            onMouseLeave={() => setHoveredSegment(null)}
                          />
                        ))}
                      </svg>
                      {/* 마우스 호버 시 중앙에 표시되는 툴팁 */}
                      {/* DB 연동 후에도 동일하게 작동 - pieSegments 데이터만 교체됨 */}
                      {hoveredSegment !== null && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="bg-white px-6 py-4 rounded-xl shadow-2xl border-2 border-gray-200">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: colorsHex[hoveredSegment] }}
                                ></div>
                                <p className="text-xl font-bold text-gray-800">{pieSegments[hoveredSegment].label}</p>
                              </div>
                              <p className="text-2xl font-bold text-[#2563eb]">
                                {pieSegments[hoveredSegment].percentage}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 키워드 범례 */}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-800">이번주 키워드</h2>
                    </div>

                    {/* 키워드 범례 목록 */}
                    {/* DB 연동 후에도 동일한 구조로 chartData만 API 데이터로 대체 */}
                    <div className="grid grid-cols-2 gap-4">
                      {chartData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-full ${colors[index]} shadow-md flex-shrink-0`}></div>
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-gray-800">
                              {item.label} ({item.percentage}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Statistics;
