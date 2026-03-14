import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';
import { signOut } from '../../axios/Auth';
import { modifyMemberInfo } from '../../api/adminModifyApi';

const EditAdminInfo = () => {
  const { email, nickname } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const admin_info = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/admin_info.png';
  const dashboard = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/dashboard.png';
  const analysis = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/admin_analysis%20.png';
  const admin_mypage = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/admin_mypage.png';

  // 1. formData 상태 선언 (초기값으로 현재 닉네임 설정)
  const [formData, setFormData] = useState({
    nickname: nickname || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 2. DTO 구조에 맞게 데이터 변환 (MemberModifyDto와 필드명 매칭)
    const modifydto = {
      nickname: formData.nickname,
      pw: formData.newPassword || null, // 새 비밀번호가 없으면 null 혹은 기존 처리 방식에 따름
      persona: null,
      mbti: null,
      profile: null,
      text: null,
      hashTags: null,
    };

    try {
      // 3. API 호출
      const response = await modifyMemberInfo(modifydto);
      useAuthStore.setState({ nickname: formData.nickname });

      // 4. 성공 처리
      alert(response); // "회원 정보가 성공적으로 수정되었습니다."
      navigate('/admin');
    } catch (error) {
      // 콘솔을 열어 이 메시지를 꼭 확인하세요!
      console.error('실제 발생한 에러:', error);

      if (error.response) {
        // 서버가 에러 코드를 준 경우
        alert(`서버 오류: ${error.response.data.message || error.response.data}`);
      } else if (error.message) {
        // 코드가 잘못되었거나 함수가 정의되지 않은 경우
        alert(`클라이언트 오류: ${error.message}`);
      } else {
        alert('정보 수정 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

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
                <img src={dashboard} alt="대시보드" />
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
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <img src={analysis} alt="통계자료" />
                <span className="text-lg">통계자료</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="flex items-center gap-4 px-6 py-4 rounded-lg bg-white/15 font-semibold text-white border-l-4 border-white"
              >
                <img src={admin_mypage} alt="마이페이지" />
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
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#2563eb] font-bold">
                {nickname ? nickname.charAt(0) : 'A'}
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-700">{nickname || '관리자'} 관리자님</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-lg text-base font-semibold hover:bg-blue-50 transition-colors"
            >
              로그아웃
            </button>
          </header>

          <div className="flex-1 px-16 py-12 overflow-y-auto">
            <div className="max-w-[1520px] mx-auto">
              <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">관리자 정보 수정</h1>

              {/* PROFILE IMAGE */}
              <div className="flex flex-col items-center mb-12">
                <div className="w-40 h-40 bg-gray-300 rounded-full mb-6 overflow-hidden">
                  <img src="https://via.placeholder.com/160" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* FORM SECTION */}
              <div className="bg-white rounded-2xl shadow-lg p-10 mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">기본 정보 수정</h2>
                <div className="space-y-8">
                  {/* 닉네임 변경 */}
                  <div className="flex items-center">
                    <label className="w-48 text-lg font-semibold text-gray-700">닉네임</label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      placeholder="수정할 닉네임을 입력하세요"
                      className="flex-1 px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* 비밀번호 섹션 구분선 */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-blue-600 mb-6">* 비밀번호 변경 시에만 아래 필드를 입력해 주세요.</p>
                  </div>

                  {/* 현재 비밀번호 */}
                  <div className="flex items-center">
                    <label className="w-48 text-lg font-semibold text-gray-700">현재 비밀번호</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="기존 비밀번호 확인"
                      className="flex-1 px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                      placeholder="새 비밀번호 (최소 8자 이상)"
                      className="flex-1 px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                      placeholder="새 비밀번호 다시 입력"
                      className="flex-1 px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-center gap-6 mt-12">
                <button
                  onClick={handleCancel}
                  className="px-16 py-4 bg-white border-2 border-gray-300 text-gray-600 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-16 py-4 bg-[#2563eb] text-white rounded-xl text-lg font-bold hover:bg-blue-700 hover:shadow-lg transition-all"
                >
                  수정 완료
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default EditAdminInfo;
