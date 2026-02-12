import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  // 채팅 페이지에서는 푸터 숨김
  if (location.pathname.startsWith('/chat')) return null;

  return (
    <footer className="w-full bg-[#1f2937] text-white py-6 lg:py-8">
      <div className="max-w-[390px] lg:max-w-[1520px] mx-auto px-5 lg:px-8">
        <div className="flex flex-col gap-4 lg:gap-5">
          {/* 로고 섹션 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#2ed3c6] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm lg:text-base">★</span>
            </div>
            <div>
              <div className="text-[10px] lg:text-xs text-gray-400">Healing Therapy</div>
              <div className="font-bold text-sm lg:text-lg">고민순삭</div>
            </div>
          </div>

          {/* 설명 */}
          <div className="text-[11px] lg:text-sm leading-relaxed">
            <p className="font-semibold mb-1">AI 융합 고민 상담 서비스</p>
            <p className="text-gray-300 font-light">
              고민, 커리어, 취업 까지 혼자 고민하지 마세요. 함께 해결해 나갑니다.
            </p>
            <p className="text-[10px] lg:text-xs text-gray-400 font-light mt-2">
              ※ 고민순삭의 AI상담은 법적, 정신과적 진단의 처방을 대체하지 않습니다.
            </p>
          </div>

          <hr className="border-gray-600" />

          {/* 긴급 연락처 */}
          <div className="text-[11px] lg:text-sm leading-relaxed">
            <p className="text-gray-300 font-light">AI 상담은 참고용으로 제공되며,</p>
            <p className="text-gray-300 font-light">
              긴급 상황시 <span className="font-bold text-white">***109(자살 예방 상담전화)***</span>에 문의 하시기
              바랍니다.
            </p>
          </div>

          <hr className="border-gray-600" />

          {/* 저작권 */}
          <div className="text-[10px] lg:text-xs text-gray-400 font-light">
            <p>ⓒ 2026 고민순삭. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
