import React from 'react';
import { Link } from 'react-router-dom';

// TODO: DB 연동 가이드
// 이 페이지는 채팅 타입 선택 화면입니다 (AI 상담 vs 상담사 상담)
//
// DB 연동 시 필요한 작업:
// 1. 사용자 인증 상태 확인
//    - useAuth() 훅으로 로그인 여부 체크
//    - 비로그인 시 로그인 페이지로 리다이렉트
//
// 2. AI 상담 이용 가능 여부 확인
//    - API: GET /api/chat/ai/available
//    - 응답: { available: boolean, remainingCount: number }
//    - 이용 횟수 제한이 있는 경우 표시
//
// 3. 상담사 예약 가능 여부 확인
//    - API: GET /api/chat/counselor/available
//    - 응답: { available: boolean, availableCounselors: number }
//    - 예약 가능한 상담사 수 표시

const ChatDefaultPage = () => {
  return (
    <div className="w-full">
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-[90px]">
        <header className="bg-[#2a5eea] h-16 flex items-center justify-center text-white font-bold text-lg">
          채팅
        </header>

        <main className="px-[18px] pt-5 flex flex-col gap-4">
          <h2 className="text-[18px] font-bold text-[#1f2937]">누구와 상담을 하고 싶으세요?</h2>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/chat/withai"
              className="rounded-[14px] bg-[#2ed3c6] text-white p-4 min-h-[150px] flex flex-col items-center justify-center gap-3 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
            >
              <div className="w-16 h-16 rounded-full border-2 border-white/70 flex items-center justify-center font-bold text-sm bg-white/10">
                AI
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold">AI와 상담하기</p>
                <p className="text-[12px] opacity-90">빠르게 상담 시작</p>
              </div>
            </Link>

            <Link
              to="/chat/counselor"
              className="rounded-[14px] bg-[#2f80ed] text-white p-4 min-h-[150px] flex flex-col items-center justify-center gap-3 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
            >
              <div className="w-16 h-16 rounded-full border-2 border-white/70 flex items-center justify-center font-bold text-sm bg-white/10">
                상담
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold">상담사와 상담하기</p>
                <p className="text-[12px] opacity-90">전문 상담사 찾기</p>
              </div>
            </Link>
          </div>
        </main>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-center mb-16">
            <h1 className="text-[48px] font-bold text-gray-800">채팅</h1>
          </div>

          {/* CONTENT */}
          <div className="mx-auto">
            <h2 className="text-[36px] font-semibold text-gray-800 mb-12 text-center">누구와 상담을 하고 싶으세요?</h2>

            <div className="grid grid-cols-2 gap-12 max-w-[1200px] mx-auto">
              {/* AI 상담하기 */}
              <Link
                to="/chat/withai"
                className="rounded-3xl bg-gradient-to-br from-[#2ed3c6] to-[#26b8ad] text-white p-16 min-h-[400px] flex flex-col items-center justify-center gap-8 shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.16)] transition-all hover:scale-105"
              >
                <div className="w-32 h-32 rounded-full border-4 border-white/70 flex items-center justify-center font-bold text-4xl bg-white/10 shadow-lg">
                  AI
                </div>
                <div className="text-center">
                  <p className="text-[32px] font-bold mb-3">AI와 상담하기</p>
                  <p className="text-[20px] opacity-90">빠르게 상담 시작하세요</p>
                </div>
              </Link>

              {/* 상담사와 상담하기 */}
              <Link
                to="/chat/counselor"
                className="rounded-3xl bg-gradient-to-br from-[#2f80ed] to-[#2563eb] text-white p-16 min-h-[400px] flex flex-col items-center justify-center gap-8 shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.16)] transition-all hover:scale-105"
              >
                <div className="w-32 h-32 rounded-full border-4 border-white/70 flex items-center justify-center font-bold text-2xl bg-white/10 shadow-lg">
                  상담
                </div>
                <div className="text-center">
                  <p className="text-[32px] font-bold mb-3">상담사와 상담하기</p>
                  <p className="text-[20px] opacity-90">전문 상담사를 찾아보세요</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDefaultPage;
