import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';
import { getCategoryRevenueStatistics } from '../../api/adminApi';
import { signOut } from '../../axios/Auth';
import { bbsApi, risksApi } from '../../api/backendApi';

const NOTICES_PAGE_SIZE = 6;

const Alarm = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { nickname, email } = useAuthStore();
  const [notices, setNotices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [riskAlertsLoading, setRiskAlertsLoading] = useState(true);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/');
    }
  };

  // 공지사항 목록: 게시판(BBS) API bbs_div=NOTI 로 연동
  useEffect(() => {
    let cancelled = false;
    setNoticesLoading(true);
    bbsApi
      .getList({
        page: currentPage,
        limit: NOTICES_PAGE_SIZE,
        bbs_div: 'NOTI',
        del_yn: 'N',
      })
      .then((res) => {
        if (cancelled) return;
        const content = res.content || [];
        setNotices(content);
        setTotalPages(
          (res.totalPages ??
            Math.ceil((res.totalElements || 0) / NOTICES_PAGE_SIZE)) ||
            1,
        );
      })
      .catch(() => {
        if (!cancelled) setNotices([]);
      })
      .finally(() => {
        if (!cancelled) setNoticesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  // 최근 위험 단어 감지: risks API 연동 (최근 24시간)
  useEffect(() => {
    let cancelled = false;
    setRiskAlertsLoading(true);
    risksApi
      .getRecent()
      .then((list) => {
        if (cancelled) return;
        const items = Array.isArray(list) ? list : (list?.content ?? []);
        setRiskAlerts(
          items.map((r) => ({
            id: r.id,
            date: (() => {
              if (!r.createdAt) return '-';
              const d = new Date(r.createdAt);
              const Y = d.getFullYear();
              const M = String(d.getMonth() + 1).padStart(2, '0');
              const D = String(d.getDate()).padStart(2, '0');
              const h = String(d.getHours()).padStart(2, '0');
              const m = String(d.getMinutes()).padStart(2, '0');
              return `${Y}-${M}-${D} / ${h}:${m}`;
            })(),
            type: r.bbsDiv || '상담',
            counselor: r.memberId
              ? `${String(r.memberId).slice(0, 2)}***`
              : '-',
            counselorName: '-',
            keyword: r.detectedKeywords || '-',
            riskLevel: (() => {
              const text = String(r.detectedKeywords || '');
              const matches = [...text.matchAll(/심각도\s*[:：]\s*(\d)/g)];
              const nums = matches.map((m) => Number(m[1])).filter((n) => Number.isFinite(n));
              const max = nums.length ? Math.max(...nums) : 0;
              if (max >= 4) return '높음';
              if (max === 3) return '중간';
              if (max >= 1) return '낮음';
              return '—';
            })(),
            status: r.action || '진행 중',
            statusColor:
              r.action === '완료'
                ? 'text-cyan-400'
                : r.action === '조치'
                  ? 'text-yellow-600'
                  : 'text-yellow-500',
            bbsId: r.bbsId,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setRiskAlerts([]);
      })
      .finally(() => {
        if (!cancelled) setRiskAlertsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
                className="flex items-center gap-4 px-6 py-4 rounded-lg bg-white/10 transition-colors text-white"
              >
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-lg">민감키워드</span>
              </Link>
            </li>
            <li>
              <Link
                to="/stats"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
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
              <span className="text-lg font-semibold text-gray-700">
                {nickname || ''} 관리자님
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="cursor-pointer px-6 py-2.5 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-lg text-base font-semibold hover:bg-blue-50 transition-colors"
            >
              로그아웃
            </button>
          </header>

          {/* CONTENT AREA */}
          <div className="flex-1 px-16 py-12 overflow-y-auto">
            <div className="max-w-[1520px] mx-auto">
              {/* TITLE & SUBTITLE */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  최신 정보
                </h1>
                <div className="flex items-center justify-between">
                  <p className="text-lg text-gray-600">공지사항</p>
                  <Link
                    to="/alarm/notice/write"
                    className="text-[#2563eb] font-semibold hover:underline"
                  >
                    공지사항 추가 하기 →
                  </Link>
                </div>
              </div>

              {/* 공지 버튼 리스트 - 게시판(NOTI) 연동 */}
              <div className="mb-12">
                {noticesLoading ? (
                  <div className="py-12 text-center text-gray-500">
                    공지사항을 불러오는 중...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notices.length === 0 ? (
                      <div className="w-full bg-white py-10 px-6 rounded-xl text-center text-gray-500 border border-gray-200">
                        등록된 공지사항이 없습니다.
                      </div>
                    ) : (
                      notices.map((notice) => (
                        <Link
                          key={notice.bbsId}
                          to={`/board/view/${notice.bbsId}`}
                          className="w-full bg-white py-5 px-6 rounded-xl text-left hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-4 block"
                        >
                          <span className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-sm font-semibold">
                            공 지
                          </span>
                          <span className="text-base text-gray-700 flex-1 truncate">
                            {notice.title || '(제목 없음)'}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* PAGINATION FOR NOTICES */}
              {!noticesLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mb-12">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors"
                    disabled={currentPage === 1}
                  >
                    <svg
                      className="w-5 h-5"
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
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => i + 1,
                  ).map((page) => (
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors"
                    disabled={currentPage === totalPages}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* 최근 위험 단어 감지 */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    최근 위험 단어 감지
                  </h2>
                  <Link
                    to="/admin/activities"
                    className="text-[#2563eb] font-semibold hover:underline"
                  >
                    더보기 →
                  </Link>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {riskAlertsLoading ? (
                    <div className="py-12 text-center text-gray-500">
                      위험 단어 감지 목록을 불러오는 중...
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#2563eb] text-white">
                          <th className="px-6 py-4 text-center font-bold text-base">
                            날짜
                          </th>
                          <th className="px-6 py-4 text-center font-bold text-base">
                            상담
                          </th>
                          <th className="px-6 py-4 text-center font-bold text-base">
                            상담자
                          </th>
                          <th className="px-6 py-4 text-center font-bold text-base">
                            상담사
                          </th>
                          <th className="px-6 py-4 text-center font-bold text-base">
                            감지단어
                          </th>
                          <th className="px-6 py-4 text-center font-bold text-base">
                            위험단계
                          </th>
                          <th className="px-6 py-4 text-center font-bold text-base">
                            확인 및 조치
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {riskAlerts.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-6 py-10 text-center text-gray-500"
                            >
                              최근 24시간 내 감지된 위험 단어가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          riskAlerts.map((activity, index) => (
                            <tr
                              key={activity.id}
                              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                              }`}
                            >
                              <td className="px-6 py-4 text-center text-sm text-gray-700">
                                {activity.date}
                              </td>
                              <td className="px-6 py-4 text-center text-sm text-gray-700">
                                {activity.type}
                              </td>
                              <td className="px-6 py-4 text-center text-sm text-gray-700">
                                {activity.counselor}
                              </td>
                              <td className="px-6 py-4 text-center text-sm text-gray-700">
                                {activity.counselorName}
                              </td>
                              <td className="px-6 py-4 text-center text-sm font-semibold text-red-600">
                                {activity.keyword}
                              </td>
                              <td className="px-6 py-4 text-center text-sm font-semibold text-red-600">
                                {activity.riskLevel}
                              </td>
                              <td
                                className={`px-6 py-4 text-center text-sm font-semibold ${activity.statusColor}`}
                              >
                                {activity.status}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Alarm;
