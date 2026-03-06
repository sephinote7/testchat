import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../../axios/Auth';
import { useAuthStore } from '../../../store/auth.store';

const CounselorDefaultPage = () => {
  const navigate = useNavigate();
  const { nickname } = useAuthStore();

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await signOut();
      navigate('/');
    }
  };

  return (
    <div className="w-full">
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff]">
        {/* 헤더 */}
        <header className="bg-[#2a5eea] h-16 flex items-center justify-center">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <span className="text-lg leading-none" aria-hidden="true">
              ★
            </span>
            <span>고민순삭</span>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="px-[18px] pt-4 flex flex-col gap-[22px] pb-[24px]">
          {/* 환영 메시지 */}
          <section className="bg-white rounded-[14px] p-4 text-center shadow-[0_4px_8px_rgba(0,0,0,0.08)]">
            <p className="text-[#1f2937] font-medium">안녕하세요, {nickname} 상담사님.</p>
          </section>

          {/* 페이지 타이틀 */}
          <section className="flex flex-col gap-3">
            <h1 className="text-[#1f2937] text-xl font-bold">상담사 마이페이지</h1>
            <button
              onClick={handleLogout}
              className="bg-[#2f80ed] text-white px-6 py-2.5 rounded-[12px] font-medium hover:bg-[#2a5eea] transition shadow-[0_4px_8px_rgba(0,0,0,0.08)]"
            >
              로그아웃
            </button>
          </section>

          {/* 메뉴 버튼들 */}
          <section className="flex flex-col gap-[14px]">
            {/* 상담사 정보 수정 */}
            <button
              onClick={() => navigate('/system/info/edit')}
              className="w-full bg-white hover:bg-gray-50 p-5 rounded-[14px] flex items-center justify-between transition shadow-[0_4px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#e3f2fd] rounded-[12px] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#2f80ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span className="text-[#1f2937] text-base font-semibold">상담사 정보 수정</span>
              </div>
              <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 상담 내역 */}
            <button
              onClick={() => navigate('/system/info/counsel-history')}
              className="w-full bg-white hover:bg-gray-50 p-5 rounded-[14px] flex items-center justify-between transition shadow-[0_4px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#e3f2fd] rounded-[12px] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#2f80ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="text-[#1f2937] text-base font-semibold">상담 내역</span>
              </div>
              <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 상담사 소개페이지 */}
            <button
              onClick={() => navigate('/system/info/profile')}
              className="w-full bg-white hover:bg-gray-50 p-5 rounded-[14px] flex items-center justify-between transition shadow-[0_4px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#e3f2fd] rounded-[12px] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#2f80ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <span className="text-[#1f2937] text-base font-semibold">상담사 소개페이지</span>
              </div>
              <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 스케줄 관리 */}
            <button
              onClick={() => navigate('/system/info/schedule')}
              className="w-full bg-white hover:bg-gray-50 p-5 rounded-[14px] flex items-center justify-between transition shadow-[0_4px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#e3f2fd] rounded-[12px] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#2f80ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-[#1f2937] text-base font-semibold">스케줄 관리</span>
              </div>
              <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </section>
        </main>
      </div>

      {/* PC VERSION */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-lg text-gray-600 mb-2">
                안녕하세요 <span className="font-bold text-[#2563eb]">{nickname}</span> 상담사님.
              </p>
              <h1 className="text-4xl font-bold text-gray-800">마이페이지</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-8 py-3 bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white text-lg font-bold rounded-xl hover:shadow-lg transition-all"
            >
              로그아웃
            </button>
          </div>

          {/* MENU CARDS - 2x2 GRID */}
          <div className="grid grid-cols-2 gap-8">
            {/* 상담사 정보 수정 */}
            <button
              onClick={() => navigate('/system/info/edit')}
              className="group bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-3xl p-16 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-20 h-20 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">상담사 정보 수정</h2>
                <p className="text-white/90 text-lg">프로필 및 상담 정보 관리</p>
              </div>
            </button>

            {/* 상담 내역 */}
            <button
              onClick={() => navigate('/system/info/counsel-history')}
              className="group bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-3xl p-16 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-20 h-20 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">상담 내역</h2>
                <p className="text-white/90 text-lg">진행한 상담 내역 조회</p>
              </div>
            </button>

            {/* 상담사 소개페이지 */}
            <button
              onClick={() => navigate('/system/info/profile')}
              className="group bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-3xl p-16 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-20 h-20 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">상담사 소개페이지</h2>
                <p className="text-white/90 text-lg">나의 소개 페이지 수정</p>
              </div>
            </button>

            {/* 스케줄 관리 (NEW) */}
            <button
              onClick={() => navigate('/system/info/schedule')}
              className="group bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-3xl p-16 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-20 h-20 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">스케줄 관리</h2>
                <p className="text-white/90 text-lg">상담 가능 시간 설정</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorDefaultPage;
