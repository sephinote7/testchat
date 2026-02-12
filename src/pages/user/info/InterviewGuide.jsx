import React from 'react';

const InterviewGuide = () => {
  const sections = [
    {
      title: '첫째, 면접 시 단정한 복장을 기본이다',
      body: '면접은 첫인상이 중요합니다. 직무와 기업 문화에 맞는 단정한 복장을 준비하세요. 과한 액세서리/향수는 피하고, 깔끔한 인상을 우선합니다.',
    },
    {
      title: '둘째, 톤과 표정과 바른 자세를 생활화하자',
      body: '말의 속도와 톤을 안정적으로 유지하고, 시선/표정/자세를 통해 신뢰감을 전달하세요. 질문을 들을 때 고개 끄덕임 등 반응도 중요합니다.',
    },
    {
      title: '셋째, 질문을 끝까지 듣고 원리대로 답하자',
      body: '질문을 끊지 않고 끝까지 듣고 핵심을 요약한 뒤 답변하세요. 결론 → 근거 → 사례(경험) 순서로 답하면 전달력이 좋아집니다.',
    },
    {
      title: '넷째, 답변은 간결하고 구체적으로',
      body: '추상적인 표현보다 수치/결과 중심으로 구체화하세요. STAR(상황/과제/행동/결과)로 정리하면 논리적인 답변이 됩니다.',
    },
  ];

  return (
    <div>
      {/* Mobile 제목 */}
      <h2 className="lg:hidden text-[20px] font-bold text-[#111827] mb-3">면접 가이드 (고용24 발췌)</h2>

      <div className="bg-white lg:bg-transparent rounded-[14px] lg:rounded-none p-4 lg:p-0 shadow-[0_10px_20px_rgba(31,41,55,0.08)] lg:shadow-none">
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-3 lg:gap-6 mb-4 lg:mb-8 lg:bg-white lg:rounded-2xl lg:border lg:border-gray-200 lg:p-6">
          <div className="flex-1">
            <p className="text-[12px] lg:text-[24px] font-semibold lg:font-medium text-[#111827] lg:mb-2">
              면접관을 사로잡는 면접의 기본 5가지
            </p>
            <p className="text-[11px] lg:text-base text-[#6b7280] lg:text-gray-600 mt-1 lg:font-normal">
              아래 체크리스트로 면접 준비 상태를 점검해보세요.
            </p>
          </div>
          <div className="w-16 h-12 lg:w-24 lg:h-16 rounded-[10px] lg:rounded-xl bg-[#f3f7ff] flex items-center justify-center text-[11px] lg:text-[18px] text-[#2f80ed] font-semibold lg:font-medium flex-shrink-0">
            TIP
          </div>
        </div>

        {/* 4단계 가이드 */}
        <div className="space-y-3 lg:space-y-6 lg:mb-8">
          {sections.map((s, idx) => (
            <div
              key={s.title}
              className="border border-[#e5e7eb] lg:border-gray-200 rounded-[12px] lg:rounded-2xl p-3 lg:p-6 lg:bg-white"
            >
              <p className="text-[13px] lg:text-[18px] font-bold lg:font-medium text-[#111827] mb-1 lg:mb-3">
                {s.title}
              </p>
              <p className="text-[12px] lg:text-base text-[#374151] lg:text-gray-600 leading-6 lg:leading-relaxed lg:font-normal">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* 하단 2개 박스 */}
        <div className="mt-4 lg:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
          <div className="border border-[#e5e7eb] lg:border-gray-200 rounded-[12px] lg:rounded-2xl p-3 lg:p-6 lg:bg-white">
            <p className="text-[12px] lg:text-[18px] font-semibold lg:font-medium text-[#111827] mb-2 lg:mb-4">
              자주 나오는 질문
            </p>
            <ul className="text-[12px] lg:text-base text-[#374151] lg:text-gray-600 leading-6 lg:leading-relaxed space-y-1 lg:space-y-2 lg:font-normal">
              <li>- 지원 동기</li>
              <li>- 장/단점</li>
              <li>- 갈등 해결 경험</li>
              <li>- 실패 경험</li>
            </ul>
          </div>
          <div className="border border-[#e5e7eb] lg:border-gray-200 rounded-[12px] lg:rounded-2xl p-3 lg:p-6 lg:bg-white">
            <p className="text-[12px] lg:text-[18px] font-semibold lg:font-medium text-[#111827] mb-2 lg:mb-4">
              마무리 멘트
            </p>
            <p className="text-[12px] lg:text-base text-[#374151] lg:text-gray-600 leading-6 lg:leading-relaxed lg:font-normal">
              "오늘 면접 기회 주셔서 감사합니다. 직무에 필요한 역량을 바탕으로 빠르게 적응하고 기여하겠습니다."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewGuide;
