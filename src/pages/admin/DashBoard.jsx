import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// TODO: DB 연동 가이드
// 이 페이지는 관리자 대시보드로 상담 통계를 표시합니다
//
// DB 연동 시 필요한 작업:
// 1. 상담 통계 조회 API
//    - API: GET /api/admin/dashboard/stats?startDate={start}&endDate={end}
//    - 요청 파라미터:
//      * startDate: 시작 날짜 (YYYY-MM-DD)
//      * endDate: 종료 날짜 (YYYY-MM-DD)
//    - 응답:
//      {
//        concern: {
//          count: number,      // 고민 상담 건수
//          avgTime: number,    // 평균 상담 시간 (분)
//          keywords: string[], // 주요 키워드
//          riskCount: number   // 위험 단어 감지 건수
//        },
//        career: { count, avgTime, keywords },
//        job: { count, avgTime, keywords }
//      }
//
// 2. 날짜 범위 선택
//    - 커스텀 날짜 선택 기능 추가 (DatePicker)
//    - 주간/월간/분기별 프리셋 제공
//
// 3. 실시간 업데이트
//    - WebSocket으로 새로운 상담 발생 시 통계 자동 업데이트
//    - 위험 단어 감지 시 즉시 알림

const DashBoard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('2026-01-19 ~ 2026-01-25');

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/');
    }
  };

  // ========== 더미 데이터 시작 (DB 연동 시 삭제) ==========
  // 상담 통계 카드 데이터
  const counselStats = [
    {
      title: '고민 상담 건수',
      thisWeek: '0 건',
      avgTime: 'N 분',
      keywords: ['□ □', '□ □', '□ □'],
      risk: 'N 건',
    },
    {
      title: '커리어 상담 건수',
      thisWeek: '0 건',
      avgTime: 'N 분',
      keywords: ['□ □', '□ □', '□ □'],
      risk: null,
    },
    {
      title: '취업 상담 건수',
      thisWeek: '0 건',
      avgTime: 'N 분',
      keywords: ['□ □', '□ □', '□ □'],
      risk: null,
    },
  ];

  // 실시간 위험 감지 조치 현황
  const riskActivities = [
    { id: 1, date: '2026-02-04 / 15:00', type: '고민', counselor: 'OOO', counselorName: 'AI', keyword: '자살', riskLevel: '높음', status: '높음' },
    { id: 2, date: '2026-02-04 / 15:00', type: '커리어', counselor: 'OOO', counselorName: 'OOO 상담사', keyword: '실기 실타', riskLevel: '중위', status: '조치' },
    { id: 3, date: '2026-02-04 / 15:00', type: '취업', counselor: 'OOO', counselorName: 'OOO 상담사', keyword: '죽고 싶다', riskLevel: '높음', status: '완료' },
    { id: 4, date: '2026-02-04 / 15:00', type: '취업', counselor: 'OOO', counselorName: 'OOO 상담사', keyword: '자살', riskLevel: '높음', status: '완료' },
  ];

  // 최근 정산 현황
  const settlements = [
    { id: 1, date: '2026-02-01', counselor: '커리어', counselorName: 'AAA 상담사', totalCounsel: '45건', totalAmount: '1,200,000원', platformFee: '240,000원', netAmount: '960,000원', status: '대기' },
    { id: 2, date: '2026-02-01', counselor: '커리어', counselorName: 'BBB 상담사', totalCounsel: '32건', totalAmount: '850,000원', platformFee: '170,000원', netAmount: '680,000원', status: '대기' },
    { id: 3, date: '2026-02-01', counselor: '취업', counselorName: 'AAA 상담사', totalCounsel: '45건', totalAmount: '1,200,000원', platformFee: '240,000원', netAmount: '960,000원', status: '완료' },
    { id: 4, date: '2026-02-01', counselor: '취업', counselorName: 'BBB 상담사', totalCounsel: '32건', totalAmount: '850,000원', platformFee: '170,000원', netAmount: '680,000원', status: '완료' },
  ];
  // ========== 더미 데이터 끝 ==========

  return (
    <div className="flex min-h-screen bg-[#f3f7ff]">
      {/* LEFT SIDEBAR */}
      <aside className="w-[280px] bg-[#2d3e50] text-white flex-shrink-0">
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
                <span className="text-lg">최신 정보</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-4 px-6 py-4 rounded-lg bg-white/10 transition-colors text-white"
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
                to="/stats"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
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
      <main className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="bg-white px-10 py-5 flex items-center justify-end gap-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <span className="text-lg font-semibold text-gray-700">
              {user?.email?.split('@')[0] || 'OOO'} 관리자님
            </span>
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
            {/* TITLE & DATE SELECTOR */}
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-4xl font-bold text-gray-800">대시보드</h1>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-12 px-6 bg-white border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:border-[#2563eb] transition-colors"
              >
                <option value="2026-01-19 ~ 2026-01-25">2026-01-19 ~ 2026-01-25</option>
                <option value="2026-01-12 ~ 2026-01-18">2026-01-12 ~ 2026-01-18</option>
                <option value="2026-01-05 ~ 2026-01-11">2026-01-05 ~ 2026-01-11</option>
              </select>
            </div>

            {/* STATS CARDS - 3 COLUMN GRID */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              {counselStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-gray-200">
                    {stat.title}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">이번 주 상담 :</span>
                      <span className="text-lg font-bold text-green-600">{stat.thisWeek}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">평균 상담 시간 :</span>
                      <span className="text-base font-semibold text-gray-800">{stat.avgTime}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">주요 상담 키워드 :</span>
                      <div className="flex flex-wrap gap-2">
                        {stat.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    {stat.risk && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">위험 단어 감지 :</span>
                          <span className="text-lg font-bold text-red-600">{stat.risk}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 실시간 위험 감지 조치 현황 */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">실시간 위험 감지 조치 현황</h2>
                <Link to="/admin/activities" className="text-[#2563eb] font-semibold hover:underline">
                  자세 보러가기
                </Link>
              </div>

              {/* TABLE */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#2563eb] text-white">
                      <th className="px-4 py-3 text-center font-bold text-sm">날짜</th>
                      <th className="px-4 py-3 text-center font-bold text-sm">상담</th>
                      <th className="px-4 py-3 text-center font-bold text-sm">상담자</th>
                      <th className="px-4 py-3 text-center font-bold text-sm">상담사</th>
                      <th className="px-4 py-3 text-center font-bold text-sm">감지단어</th>
                      <th className="px-4 py-3 text-center font-bold text-sm">위험단계</th>
                      <th className="px-4 py-3 text-center font-bold text-sm">확인 및 조치</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskActivities.map((activity, index) => (
                      <tr
                        key={activity.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-4 py-3 text-center text-xs text-gray-700">{activity.date}</td>
                        <td className="px-4 py-3 text-center text-xs text-gray-700">{activity.type}</td>
                        <td className="px-4 py-3 text-center text-xs text-gray-700">{activity.counselor}</td>
                        <td className="px-4 py-3 text-center text-xs text-gray-700">{activity.counselorName}</td>
                        <td className="px-4 py-3 text-center text-xs font-semibold text-red-600">{activity.keyword}</td>
                        <td className="px-4 py-3 text-center text-xs font-semibold text-red-600">
                          {activity.riskLevel}
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-semibold text-cyan-500">{activity.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 최근 정산 현황 */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">최근 정산 현황</h2>
                <Link to="/admin/settlements" className="text-[#2563eb] font-semibold hover:underline">
                  상세한 분석까기
                </Link>
              </div>

              {/* TABLE */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#2563eb] text-white">
                      <th className="px-3 py-3 text-center font-bold text-sm">정산날짜</th>
                      <th className="px-3 py-3 text-center font-bold text-sm">상담</th>
                      <th className="px-3 py-3 text-center font-bold text-sm">상담사</th>
                      <th className="px-3 py-3 text-center font-bold text-sm">총 상담 건수</th>
                      <th className="px-3 py-3 text-center font-bold text-sm">총 매출액</th>
                      <th className="px-3 py-3 text-center font-bold text-sm">플랫폼 수수료</th>
                      <th className="px-3 py-3 text-center font-bold text-sm">지급액</th>
                      <th className="px-3 py-3 text-center font-bold text-sm">정산 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-3 py-3 text-center text-xs text-gray-700">{item.date}</td>
                        <td className="px-3 py-3 text-center text-xs text-gray-700">{item.counselor}</td>
                        <td className="px-3 py-3 text-center text-xs text-gray-700">{item.counselorName}</td>
                        <td className="px-3 py-3 text-center text-xs font-semibold text-blue-600">
                          {item.totalCounsel}
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-semibold text-gray-700">
                          {item.totalAmount}
                        </td>
                        <td className="px-3 py-3 text-center text-xs text-gray-700">{item.platformFee}</td>
                        <td className="px-3 py-3 text-center text-xs font-semibold text-gray-700">{item.netAmount}</td>
                        <td
                          className={`px-3 py-3 text-center text-xs font-semibold ${
                            item.status === '대기' ? 'text-yellow-600' : 'text-blue-500'
                          }`}
                        >
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashBoard;
