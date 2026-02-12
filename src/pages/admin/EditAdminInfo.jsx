import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const EditAdminInfo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ========== 더미 데이터 시작 (DB 연동 시 삭제) ==========
  const [formData, setFormData] = useState({
    nickname: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    riskAlert: false,
    hourlyCheck: false,
    weeklyReport: false,
  });
  // ========== 더미 데이터 끝 ==========

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = () => {
    // TODO: DB 연동 가이드
    // 관리자 정보 수정 API 호출
    // POST /api/admin/profile
    // Body: { nickname, currentPassword, newPassword, notifications }
    console.log('Submitting:', { formData, notifications });
    alert('정보가 수정되었습니다.');
  };

  const handleCancel = () => {
    navigate(-1);
  };

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
            <span className="text-lg font-semibold text-gray-700">
              {user?.email?.split('@')[0] || 'OOO'} 관리자님
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-lg text-base font-semibold hover:bg-blue-50 transition-colors"
          >
            로그아웃
          </button>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 px-16 py-12 overflow-y-auto">
          <div className="max-w-[1520px] mx-auto">
            {/* TITLE */}
            <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">관리자 정보 수정</h1>

            {/* PROFILE IMAGE */}
            <div className="flex flex-col items-center mb-12">
              <div className="w-40 h-40 bg-gray-300 rounded-full mb-6 overflow-hidden">
                <img
                  src="https://via.placeholder.com/160"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors">
                  프로필 사진 변경
                </button>
                <button className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors">
                  프로필 사진 저장
                </button>
              </div>
            </div>

            {/* FORM SECTION */}
            <div className="bg-white rounded-2xl shadow-lg p-10 mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">기본 정보 수정</h2>
              <div className="space-y-6">
                {/* 닉네임 변경 */}
                <div className="flex items-center">
                  <label className="w-48 text-lg font-semibold text-gray-700">닉네임 변경</label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    placeholder="새 닉네임"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 현재 비밀번호 */}
                <div className="flex items-center">
                  <label className="w-48 text-lg font-semibold text-gray-700">현재 비밀번호</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="현재 비밀번호"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 새 비밀번호 */}
                <div className="flex items-center">
                  <label className="w-48 text-lg font-semibold text-gray-700">새 비밀번호</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="새 비밀번호"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 비밀번호 확인 */}
                <div className="flex items-center">
                  <label className="w-48 text-lg font-semibold text-gray-700">비밀번호 확인</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="비밀번호 확인"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* NOTIFICATION SETTINGS */}
            <div className="bg-white rounded-2xl shadow-lg p-10 mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">알림 설정</h2>
              <div className="flex items-center gap-8 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="riskAlert"
                    checked={notifications.riskAlert}
                    onChange={handleCheckboxChange}
                    className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-lg text-gray-700 whitespace-nowrap">위험 단어 감지 시 즉시 알림</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hourlyCheck"
                    checked={notifications.hourlyCheck}
                    onChange={handleCheckboxChange}
                    className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-lg text-gray-700 whitespace-nowrap">정시간 마감리 위험 건 재알림</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="weeklyReport"
                    checked={notifications.weeklyReport}
                    onChange={handleCheckboxChange}
                    className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-lg text-gray-700 whitespace-nowrap">주간 통계자료 수신</span>
                </label>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handleCancel}
                className="px-12 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="px-12 py-3.5 bg-[#2563eb] text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditAdminInfo;
