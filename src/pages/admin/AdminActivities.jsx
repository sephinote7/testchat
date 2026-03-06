import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';
import { signOut } from '../../axios/Auth';

const AdminActivities = () => {
  const { email, nickname } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  const [currentPage, setCurrentPage] = useState(1);

  // ========== 더미 데이터 시작 (DB 연동 시 삭제) ==========
  // 테이블 데이터
  const allActivities = [
    {
      id: 1,
      date: '2026-02-04 / 15:00',
      type: '고민',
      counselor: 'OOO',
      counselorName: 'AI',
      keyword: '자살',
      riskLevel: '높음',
      status: '진행 중',
      statusColor: 'text-yellow-500',
    },
    {
      id: 2,
      date: '2026-02-04 / 15:00',
      type: '커리어',
      counselor: 'OOO',
      counselorName: 'OOO 상담사',
      keyword: '실기 실타',
      riskLevel: '중위',
      status: '조치',
      statusColor: 'text-yellow-600',
    },
    {
      id: 3,
      date: '2026-02-04 / 15:00',
      type: '취업',
      counselor: 'OOO',
      counselorName: 'OOO 상담사',
      keyword: '죽고 싶다',
      riskLevel: '높음',
      status: '완료',
      statusColor: 'text-cyan-400',
    },
    {
      id: 4,
      date: '2026-02-04 / 15:00',
      type: '취업',
      counselor: 'OOO',
      counselorName: 'OOO 상담사',
      keyword: '자살',
      riskLevel: '높음',
      status: '완료',
      statusColor: 'text-cyan-400',
    },
    {
      id: 5,
      date: '2026-02-04 / 15:00',
      type: '취업',
      counselor: 'OOO',
      counselorName: 'OOO 상담사',
      keyword: '죽고 싶다',
      riskLevel: '중위',
      status: '완료',
      statusColor: 'text-cyan-400',
    },
    {
      id: 6,
      date: '2026-02-04 / 15:00',
      type: '취업',
      counselor: 'OOO',
      counselorName: 'OOO 상담사',
      keyword: '자살',
      riskLevel: '높음',
      status: '완료',
      statusColor: 'text-cyan-400',
    },
  ];

  const itemsPerPage = 6;
  const totalPages = Math.ceil(allActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const activities = allActivities.slice(startIndex, startIndex + itemsPerPage);
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
        <div className="flex-1 px-16 py-12">
          <div className="max-w-[1520px] mx-auto">
            {/* TITLE */}
            <h1 className="text-4xl font-bold text-gray-800 mb-3">최근 활동 내역</h1>
            <p className="text-lg text-gray-600 mb-10">위험 단어 사용 상담자 확인 및 조치 현황</p>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2563eb] text-white">
                    <th className="px-6 py-4 text-center font-bold text-base">날짜</th>
                    <th className="px-6 py-4 text-center font-bold text-base">상담</th>
                    <th className="px-6 py-4 text-center font-bold text-base">상담자</th>
                    <th className="px-6 py-4 text-center font-bold text-base">상담사</th>
                    <th className="px-6 py-4 text-center font-bold text-base">감지단어</th>
                    <th className="px-6 py-4 text-center font-bold text-base">위험단계</th>
                    <th className="px-6 py-4 text-center font-bold text-base">확인 및 조치</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity, index) => (
                    <tr
                      key={activity.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 text-center text-sm text-gray-700">{activity.date}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">{activity.type}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">{activity.counselor}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">{activity.counselorName}</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-red-600">{activity.keyword}</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-red-600">{activity.riskLevel}</td>
                      <td
                        className="px-6 py-4 text-center text-sm font-semibold"
                        style={{ color: activity.statusColor }}
                      >
                        {activity.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors"
                disabled={currentPage === 1}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors"
                disabled={currentPage === totalPages}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminActivities;
