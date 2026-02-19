import React from 'react';

const About = () => {
  return (
    <div className="bg-white lg:bg-transparent rounded-[14px] lg:rounded-none p-5 lg:p-0 shadow-[0_10px_20px_rgba(31,41,55,0.08)] lg:shadow-none">
      {/* Mobile 제목 */}
      <h2 className="lg:hidden text-[20px] font-bold text-[#111827] mb-3">고민순삭 소개</h2>

      {/* 로고 영역 */}
      <div className="flex items-center justify-center bg-[#f3f7ff] rounded-[14px] lg:rounded-2xl py-6 lg:py-16 mb-5 lg:mb-12">
        <div className="text-center">
          <div className="text-[12px] lg:text-base text-[#6b7280] font-semibold lg:font-normal mb-2 lg:mb-3">
            Healing Therapy
          </div>
          <div className="text-[26px] lg:text-[60px] font-extrabold lg:font-bold text-[#111827]">고민순삭</div>
        </div>
      </div>

      {/* 메인 타이틀 */}
      <h3 className="text-[13px] lg:text-[36px] lg:font-semibold leading-6 lg:leading-tight text-[#111827] lg:text-center mb-4 lg:mb-12">
        혼자 고민하면 막막함, <span className="text-[#2f80ed]">함께 나누면 고민순삭</span>
      </h3>

      {/* 3개 카드 (PC 버전만) */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:mb-16">
        <div className="bg-white border-2 border-[#2f80ed] rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#f3f7ff] rounded-full flex items-center justify-center">
            <span className="text-4xl">❓</span>
          </div>
          <h4 className="text-[24px] font-medium text-gray-800 mb-4">혼자 고민하면 '막막함'</h4>
          <p className="text-base font-normal text-gray-600 leading-relaxed">
            취업 준비를 혼자 하다 보면 지원 직무도 잘못 선택하고 본격 절망하는 순간이 있습니다.
            <br />
            <br />
            막막하고 답답할 때는 누군가 조언 좀 들어야겠다고 생각하지만 고민은 시작 그 단계에서 멈춥니다.
          </p>
        </div>

        <div className="bg-white border-2 border-[#2f80ed] rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#f3f7ff] rounded-full flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <h4 className="text-[24px] font-medium text-gray-800 mb-4">혼자가 아닌 위한 준비를 위해</h4>
          <p className="text-base font-normal text-gray-600 leading-relaxed">
            취업 준비에는 기본 원칙이 있습니다. 혼자선 절대로 미완성이며 보지 않았었다면 다행입니다.
            <br />
            <br />
            고민순삭은 AI상담 처칠 상담으로 상담을 최적화를 해결하며 다음 단계 상담을 성공을닙니다.
          </p>
        </div>

        <div className="bg-white border-2 border-[#2f80ed] rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#f3f7ff] rounded-full flex items-center justify-center">
            <span className="text-4xl">🌱</span>
          </div>
          <h4 className="text-[24px] font-medium text-gray-800 mb-4">고민순삭이 함께하는 이유</h4>
          <p className="text-base font-normal text-gray-600 leading-relaxed">
            고민순삭은 단지 대신 상담하는것이 아닙니다.
            <br />
            <br />
            다음, 혼자 힘든 방법을 혼자선 어렵고 고민과 자신감으로 대신 이자를 걸어갈 수 있게 합니다.
            <br />
            <br />
            취업 이자를 걸어갈 수 있도록 고민순삭이 함께 합니다.
          </p>
        </div>
      </div>

      {/* Mobile 텍스트 */}
      <p className="lg:hidden text-[12px] leading-6 text-[#374151] mb-5">
        "자소서 한 줄이 안 써질 때, 내가 맞게 가고 있는 건지 불안할 때… 누구에게도 말 못 한 취업 고민, 이제
        &apos;고민순삭&apos;에서 털어내리세요.
        <br />
        빠른 시간 내 답해주는 똑똑한 AI 상담부터, 현직자의 날카로운 조언이 담긴 1:1 전문 상담, 그리고 같은 길을 걷는
        동료들과의 따뜻한 커뮤니티까지.
        <br />
        당신의 취업 여정이 외롭지 않도록, 고민순삭이 끝까지 함께 합니다."
      </p>

      {/* 구분선 */}
      <hr className="my-5 lg:my-16 border-[#e5e7eb]" />

      {/* 3단계 솔루션 섹션 */}
      <div>
        <h3 className="text-[16px] lg:text-[36px] font-bold lg:font-semibold text-[#111827] lg:text-center mb-3 lg:mb-6">
          취업 성공을 위한 고민순삭의 3단계 솔루션
        </h3>

        <p className="text-[12px] lg:text-base text-[#374151] lg:text-gray-600 lg:text-center leading-6 lg:leading-relaxed mb-3 lg:mb-12 lg:font-normal">
          막막함은 이제 끝! 취업 준비에 필요한
          <br className="lg:hidden" /> 고민순삭의 고민과 상담을 정상적 단계로도 효율적으로 돕습니다.
        </p>

        {/* Mobile 리스트 */}
        <ul className="lg:hidden text-[12px] text-[#374151] leading-6 space-y-2">
          <li>
            <span className="font-semibold">- 24/7 즉각 반응, AI 상담</span>: 기다림 없는 빠른 답변! 궁금한 점은 AI에게
            바로 물어보고 기초 가이드를 받으세요.
          </li>
          <li>
            <span className="font-semibold">- 심층 분석, 전문가 1:1 상담</span>: 막연한 조언은 그만. 실전 상담사와 함께
            고민을 깊게 파고들어 나만의 전략을 세우세요.
          </li>
          <li>
            <span className="font-semibold">- 든든한 동료, 커뮤니티</span>: 취업 정보 공유부터 소소한 위로까지!
            게시판에서 소통하며 스트레스는 비우고 정보는 채우세요.
          </li>
        </ul>

        {/* PC 3단계 카드 */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-[#2f80ed] text-white rounded-full flex items-center justify-center text-[30px] font-semibold mb-6">
              01
            </div>
            <h4 className="text-[24px] font-medium text-gray-800 mb-4">즉각적인 정리, AI 상담</h4>
            <p className="text-base font-normal text-gray-600 leading-relaxed mb-4">
              지금 당장 답이 필요한 상황 직접하게 질문합니다.
            </p>
            <p className="text-sm font-normal text-gray-500 leading-relaxed">
              막연한 사례에 빠진다면 문제와 값을 정리 찾습니다. 문제와 파트를 뷰 전략과 최적화 다음 단계 방향을
              제공합니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-[#2f80ed] text-white rounded-full flex items-center justify-center text-[30px] font-semibold mb-6">
              02
            </div>
            <h4 className="text-[24px] font-medium text-gray-800 mb-4">나에게 맞춘 답, 전문가 1:1 상담</h4>
            <p className="text-base font-normal text-gray-600 leading-relaxed mb-4">모든 고민을 같은 답을 원합니다.</p>
            <p className="text-sm font-normal text-gray-500 leading-relaxed">
              막연한 사례를 빠르므로 문제의 값을은 정도 문제와 전문적 다음을 단계를 제공하는 명확를 다음 단계를 제공하는
              합니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-[#2f80ed] text-white rounded-full flex items-center justify-center text-[30px] font-semibold mb-6">
              03
            </div>
            <h4 className="text-[24px] font-medium text-gray-800 mb-4">함께 걷는 길, 커뮤니티</h4>
            <p className="text-base font-normal text-gray-600 leading-relaxed mb-4">취업 준비는 상담을 위합니다.</p>
            <p className="text-sm font-normal text-gray-500 leading-relaxed">
              침묵한 고민을 나누고 서로의 정보와 공유하여 걷거나 이자는 힘을 수 있는 공간이 준비가 되어 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
