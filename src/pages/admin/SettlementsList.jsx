import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// TODO: DB 연동 시 GET /api/admin/settlements 또는 dashboard/settlements 활용
// 상담사별로 그룹핑하여 한 행씩 표시

const SettlementsList = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) navigate('/');
  };

  // 상담사별 정산 목록 (상담사 전체 보기용 - 상담사 단위 집계)
  const counselorSettlements = [
    { counselorId: '1', counselorName: 'AAA', totalCounsel: 45, totalAmount: 1200000, platformFee: 240000, netAmount: 960000, status: '대기' },
    { counselorId: '2', counselorName: 'BBB', totalCounsel: 32, totalAmount: 850000, platformFee: 170000, netAmount: 680000, status: '완료' },
  ];

  const formatMoney = (n) => `${Number(n).toLocaleString()}원`;

  return (
    <>
      <aside className="fixed top-0 left-0 bottom-0 z-10 w-[280px] bg-[#2d3e50] text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-[#2ed3c6] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">★</span>
          </div>
          <span className="text-xl font-bold">고민순삭</span>
        </div>
        <nav className="px-4 py-8">
          <ul className="space-y-1">
            <li>
              <Link to="/alarm" className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="text-lg">최신 정보</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="flex items-center gap-4 px-6 py-4 rounded-lg bg-white/10 transition-colors text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" /></svg>
                <span className="text-lg">대시보드</span>
              </Link>
            </li>
            <li>
              <Link to="/stats" className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span className="text-lg">통계자료</span>
              </Link>
            </li>
            <li>
              <Link to="/admin" className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-lg">마이페이지</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="min-h-screen flex flex-col pl-[280px] bg-[#f3f7ff]">
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <header className="bg-white px-10 py-5 flex items-center justify-end gap-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full" />
            <span className="text-lg font-semibold text-gray-700">{user?.email?.split('@')[0] || 'OOO'} 관리자님</span>
          </div>
          <button onClick={handleLogout} className="px-6 py-2.5 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-lg text-base font-semibold hover:bg-blue-50 transition-colors">
            로그아웃
          </button>
        </header>

        <div className="flex-1 px-16 py-12 overflow-y-auto">
          <div className="max-w-[1520px] mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-4xl font-bold text-gray-800">정산 현황 · 상담사 전체</h1>
              <Link to="/dashboard" className="text-[#2563eb] font-semibold hover:underline">
                대시보드로 돌아가기
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2563eb] text-white">
                    <th className="px-4 py-3 text-center font-bold text-sm">상담사</th>
                    <th className="px-4 py-3 text-center font-bold text-sm">총 상담 건수</th>
                    <th className="px-4 py-3 text-center font-bold text-sm">총 매출액</th>
                    <th className="px-4 py-3 text-center font-bold text-sm">플랫폼 수수료</th>
                    <th className="px-4 py-3 text-center font-bold text-sm">지급액</th>
                    <th className="px-4 py-3 text-center font-bold text-sm">정산 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {counselorSettlements.map((row, index) => (
                    <tr
                      key={row.counselorId}
                      onClick={() => navigate(`/admin/settlements/${row.counselorId}`)}
                      className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-800">{row.counselorName}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600">{row.totalCounsel} 건</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{formatMoney(row.totalAmount)}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">{formatMoney(row.platformFee)}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{formatMoney(row.netAmount)}</td>
                      <td className={`px-4 py-3 text-center text-sm font-semibold ${row.status === '대기' ? 'text-yellow-600' : 'text-blue-500'}`}>
                        {row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default SettlementsList;
