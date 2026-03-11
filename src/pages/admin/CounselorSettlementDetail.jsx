import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// TODO: DB 연동 시 상담사 ID로 정산 요약 + 월별 일별 데이터 조회

const CounselorSettlementDetail = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { counselorId } = useParams();
  const [selectedMonth, setSelectedMonth] = useState('2026-02'); // YYYY-MM

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) navigate('/');
  };

  // 상담사명 (counselorId로 매핑, DB 연동 시 API에서 조회)
  const counselorNameMap = { '1': 'AAA', '2': 'BBB' };
  const counselorName = counselorNameMap[counselorId] || counselorId;

  // 정산 요약 더미
  const summary = {
    totalCounsel: 45,
    totalAmount: 1200000,
    platformFee: 240000,
    netAmount: 960000,
  };

  // 선택 월의 일별 데이터 더미 (0~31일, 해당 월 일수만 사용)
  const dailyData = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const sale = 20000 + Math.floor(Math.random() * 30000);
      const fee = Math.floor(sale * 0.2);
      const net = sale - fee;
      return { day, 매출액: sale, 플랫폼수수료: fee, 지급액: net };
    });
  }, [selectedMonth]);

  const dataMax = Math.max(...dailyData.flatMap((d) => [d.매출액, d.플랫폼수수료, d.지급액]), 1);
  const maxValue = Math.max(100000, dataMax); // Y축 최소 10만원 스케일
  const formatMoney = (n) => `${Number(n).toLocaleString()}원`;

  // 월 옵션 생성 (최근 12개월)
  const monthOptions = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
      list.push({ value: val, label });
    }
    return list;
  }, []);

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
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold text-gray-800">{counselorName} 상담사 정산 내역</h1>
              <Link to="/admin/settlements" className="text-[#2563eb] font-semibold hover:underline">
                상담사 목록으로
              </Link>
            </div>

            {/* 정산 요약 4개 카드 */}
            <div className="grid grid-cols-4 gap-6 mb-10">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-sm text-gray-500 mb-1">총 상담 건수</h3>
                <p className="text-2xl font-bold text-gray-800">{summary.totalCounsel} 건</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-sm text-gray-500 mb-1">총 매출액</h3>
                <p className="text-2xl font-bold text-gray-800">{formatMoney(summary.totalAmount)}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-sm text-gray-500 mb-1">플랫폼 수수료</h3>
                <p className="text-2xl font-bold text-gray-800">{formatMoney(summary.platformFee)}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-sm text-gray-500 mb-1">지급액</h3>
                <p className="text-2xl font-bold text-gray-800">{formatMoney(summary.netAmount)}</p>
              </div>
            </div>

            {/* 월별 수익 그래프 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">월별 수익 그래프</h2>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 rounded bg-gray-800" /> 매출액
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 rounded bg-lime-400" /> 플랫폼 수수료
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 rounded bg-purple-500" /> 지급액
                  </span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-10 px-4 bg-white border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-end gap-0.5 h-64" style={{ minHeight: '256px' }}>
                {dailyData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-0.5 group">
                    <div className="w-full flex gap-px justify-center items-end flex-1">
                      <div
                        className="w-full min-w-[2px] rounded-t bg-gray-800 transition-all hover:opacity-90"
                        style={{ height: `${(d.매출액 / maxValue) * 100}%` }}
                        title={`${d.day}일 매출액: ${formatMoney(d.매출액)}`}
                      />
                      <div
                        className="w-full min-w-[2px] rounded-t bg-lime-400 transition-all hover:opacity-90"
                        style={{ height: `${(d.플랫폼수수료 / maxValue) * 100}%` }}
                        title={`${d.day}일 수수료: ${formatMoney(d.플랫폼수수료)}`}
                      />
                      <div
                        className="w-full min-w-[2px] rounded-t bg-purple-500 transition-all hover:opacity-90"
                        style={{ height: `${(d.지급액 / maxValue) * 100}%` }}
                        title={`${d.day}일 지급액: ${formatMoney(d.지급액)}`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 pt-1">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>{formatMoney(maxValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default CounselorSettlementDetail;
