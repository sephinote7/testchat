import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const UserDefaultPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // TODO: DB 연동 시 실제 사용자 포인트 조회
  const userPoints = 5000;
  const userName = user?.email?.split('@')[0] || '홍길동';

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-20">
        {/* CONTENT */}
        <div className="px-6 pt-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">마이페이지</h1>
            <button
              onClick={handleLogout}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              로그아웃
            </button>
          </div>
          {/* 포인트 정보 섹션 */}
          <div className="bg-[#3b82f6] rounded-2xl overflow-hidden mb-6 shadow-lg">
            <div className="text-center py-6 px-5">
              <p className="text-white text-sm mb-2">{userName} 님의 잔액</p>
              <p className="text-white text-4xl font-bold">{userPoints.toLocaleString()} P</p>
            </div>
            <div className="grid grid-cols-2 border-t border-white/20">
              <button
                onClick={() => navigate('/mypage/point-usage')}
                className="bg-transparent text-white font-semibold py-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border-r border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                사용 내역
              </button>
              <button
                onClick={() => navigate('/mypage/point-charge')}
                className="bg-transparent text-white font-semibold py-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                충전
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 회원정보 수정 */}
            <Link
              to="/mypage/editinfo"
              className="bg-[#2563eb] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-40 shadow-md"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-base">회원정보 수정</span>
            </Link>

            {/* 상담 내역 */}
            <Link
              to="/mypage/clist"
              className="bg-[#5b9cff] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-40 shadow-md"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#5b9cff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                  <circle cx="12" cy="13" r="3" strokeWidth={2} />
                </svg>
              </div>
              <span className="text-white font-bold text-base">상담 내역</span>
            </Link>

            {/* 내 작성 글 */}
            <Link
              to="/mypage/postlist"
              className="bg-[#2563eb] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-40 shadow-md"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-base">내 작성 글</span>
            </Link>

            {/* 내 작성 댓글 */}
            <Link
              to="/mypage/commentlist"
              className="bg-[#5b9cff] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-40 shadow-md"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#5b9cff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-base">내 작성 댓글</span>
            </Link>
          </div>
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-[30px] font-semibold text-gray-800">마이페이지</h1>
              <button
                onClick={handleLogout}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-10 py-3 rounded-xl text-base font-normal transition-colors"
              >
                로그아웃
              </button>
            </div>

            {/* 포인트 정보 섹션 */}
            <div className="mb-10">
            <div className="bg-[#3b82f6] rounded-3xl overflow-hidden shadow-xl">
              <div className="text-center py-12 px-10">
                <p className="text-white text-2xl mb-4">{userName} 님의 잔액</p>
                <p className="text-white text-6xl font-bold">{userPoints.toLocaleString()} P</p>
              </div>
              <div className="grid grid-cols-2 border-t border-white/20">
                <button
                  onClick={() => navigate('/mypage/point-usage')}
                  className="bg-transparent text-white font-bold px-8 py-6 flex items-center justify-center gap-3 hover:bg-white/10 transition-colors text-xl border-r border-white/20"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  사용 내역
                </button>
                <button
                  onClick={() => navigate('/mypage/point-charge')}
                  className="bg-transparent text-white font-bold px-8 py-6 flex items-center justify-center gap-3 hover:bg-white/10 transition-colors text-xl"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  충전
                </button>
              </div>
            </div>
            </div>

            {/* BUTTONS GRID */}
            <div className="grid grid-cols-2 gap-8">
                {/* 회원정보 수정 */}
              <Link
                to="/mypage/editinfo"
                className="bg-[#1e40af] hover:bg-[#1e3a8a] rounded-3xl p-12 flex flex-col items-center justify-center gap-6 shadow-lg transition-colors h-[280px]"
              >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-[#1e40af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
                <span className="text-white font-bold text-2xl">회원정보 수정</span>
              </Link>

              {/* 상담 내역 */}
              <Link
                to="/mypage/clist"
                className="bg-[#3b82f6] hover:bg-[#2563eb] rounded-3xl p-12 flex flex-col items-center justify-center gap-6 shadow-lg transition-colors h-[280px]"
              >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                  <circle cx="12" cy="13" r="3" strokeWidth={2} />
                </svg>
              </div>
                <span className="text-white font-bold text-2xl">상담 내역</span>
              </Link>

              {/* 내 작성 글 */}
              <Link
                to="/mypage/postlist"
                className="bg-[#1e40af] hover:bg-[#1e3a8a] rounded-3xl p-12 flex flex-col items-center justify-center gap-6 shadow-lg transition-colors h-[280px]"
              >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-[#1e40af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
                <span className="text-white font-bold text-2xl">내 작성 글</span>
              </Link>

              {/* 내 작성 댓글 */}
              <Link
                to="/mypage/commentlist"
                className="bg-[#3b82f6] hover:bg-[#2563eb] rounded-3xl p-12 flex flex-col items-center justify-center gap-6 shadow-lg transition-colors h-[280px]"
              >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
                <span className="text-white font-bold text-2xl">내 작성 댓글</span>
              </Link>
            </div>
        </div>
      </div>
    </>
  );
};

export default UserDefaultPage;
