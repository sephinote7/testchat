import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const CounselorPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      const result = await signOut();
      if (result.success) {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-blue-600">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-2 text-white font-bold text-lg">
            <span className="text-lg leading-none" aria-hidden="true">
              ★
            </span>
            <span>고민순삭</span>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="p-4">
        {/* 환영 메시지 */}
        <div className="bg-white rounded-lg p-4 mb-4 text-center">
          <p className="text-gray-800">안녕하세요, 홍길동 상담사님.</p>
        </div>

        {/* 페이지 타이틀 */}
        <div className="text-white mb-4">
          <h1 className="text-2xl font-bold">상담사 마이페이지</h1>
          <button
            onClick={handleLogout}
            className="mt-2 bg-blue-700 text-white px-6 py-2 rounded font-medium hover:bg-blue-800 transition"
          >
            로그아웃
          </button>
        </div>

        {/* 메뉴 버튼들 */}
        <div className="space-y-4">
          {/* 상담사 정보 수정 */}
          <button
            onClick={() => navigate('/system/info/edit')}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white p-6 rounded-lg flex items-center justify-between transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold">상담사 정보 수정</span>
            </div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 상담 내역 */}
          <button
            onClick={() => navigate('/system/info/counsel-history')}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white p-6 rounded-lg flex items-center justify-between transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold">상담 내역</span>
            </div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 상담사 소개페이지 */}
          <button
            onClick={() => navigate('/system/info/profile')}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white p-6 rounded-lg flex items-center justify-between transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold">상담사 소개페이지</span>
            </div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounselorPage;
