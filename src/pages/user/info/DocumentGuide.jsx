import React from 'react';

const ResumeContent = () => {
  return (
    <div className="bg-white lg:bg-transparent rounded-[14px] lg:rounded-none p-4 lg:p-0 shadow-[0_10px_20px_rgba(31,41,55,0.08)] lg:shadow-none">
      {/* 헤더 배너 */}
      <div className="h-[120px] lg:h-[200px] rounded-[12px] lg:rounded-2xl bg-gradient-to-r from-orange-200 via-yellow-200 to-green-200 mb-4 lg:mb-8 flex items-center justify-center px-6 lg:px-12">
        <div className="text-center">
          <h3 className="text-[14px] lg:text-[24px] font-bold lg:font-semibold text-gray-800 mb-1 lg:mb-2">
            이력서란?
          </h3>
          <p className="text-[10px] lg:text-base text-gray-700 leading-relaxed">
            이력서는 본인이 지원한 직종에 대해 관련된 경력이나 보유 능력을 채용담당자에게 알리는 자료입니다.
            <br className="hidden lg:block" />
            이력서에 의해서만 채용담당자가 면접 대상을 선정하기 때문에, 이력서는 지원자의 전반적인 인상을 결정짓는 가장
            중요한 자료입니다.
          </p>
        </div>
      </div>

      {/* 이력서 작성 포인트 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ① 이력서 작성 포인트
        </h3>

        <div className="space-y-4 lg:space-y-6">
          <div className="lg:bg-white lg:border lg:border-gray-200 lg:rounded-xl lg:p-6">
            <h4 className="text-[13px] lg:text-[18px] font-semibold lg:font-medium text-gray-800 mb-2 lg:mb-3">
              ✓ 정확성
            </h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              이력서에 기재한 내용이 사실과 다를 경우 채용이 취소될 수 있으므로 정확하게 작성합니다. 자신의 능력을
              과대포장하거나 거짓 내용을 적는 것은 피해야 합니다. 과거 재직했던 회사, 학교 등을 반드시 정확하게
              기재하여야 하며, 전화번호도 정확히 기재하여 연락이 닿을 수 있도록 합니다.
            </p>
          </div>

          <div className="lg:bg-white lg:border lg:border-gray-200 lg:rounded-xl lg:p-6">
            <h4 className="text-[13px] lg:text-[18px] font-semibold lg:font-medium text-gray-800 mb-2 lg:mb-3">
              ✓ 완전성
            </h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              이력서에는 기재해야 할 항목이 있습니다. 이 중 빈 공백이 많으면 성의 없어 보일 수 있습니다. 지원하고자 하는
              업무와 관련되는 경험이나 활동 사항을 빠짐없이 기재하여 능력과 관심을 충분히 어필하도록 합니다. 다만,
              지나치게 많은 정보로 가득 채우기보다 간결하고 명료하게 작성하는 것이 좋습니다.
            </p>
          </div>

          <div className="lg:bg-white lg:border lg:border-gray-200 lg:rounded-xl lg:p-6">
            <h4 className="text-[13px] lg:text-[18px] font-semibold lg:font-medium text-gray-800 mb-2 lg:mb-3">
              ✓ 가독성
            </h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              이력서 양식은 깔끔하고 정돈되어 있어야 하며, 손 글씨로 작성할 경우 악필, 맞춤법 오류는 피해야 합니다.
              워드프로세서로 작성할 때는 적정한 여백과 줄 간격을 유지하여 읽기 편하도록 합니다. 특히 중요한 내용은 굵은
              글씨나 밑줄로 강조할 수도 있습니다.
            </p>
          </div>

          <div className="lg:bg-white lg:border lg:border-gray-200 lg:rounded-xl lg:p-6">
            <h4 className="text-[13px] lg:text-[18px] font-semibold lg:font-medium text-gray-800 mb-2 lg:mb-3">
              ✓ 간결성
            </h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              채용담당자가 이력서 한 장을 읽는데 걸리는 시간은 보통 30초 ~ 1분 정도입니다. 그 짧은 시간 안에 주요 내용을
              전달하기 위해서는 간결하면서도 핵심을 담은 문장을 사용해야 합니다. 불필요한 설명이나 중복된 내용은
              삭제하고, 핵심 키워드 중심으로 작성합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 이력서 작성 시 유의사항 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ② 이력서 작성 시 유의사항
        </h3>

        <div className="bg-gray-50 lg:bg-white lg:border lg:border-gray-200 rounded-xl p-4 lg:p-6">
          <ul className="space-y-2 lg:space-y-3 text-[12px] lg:text-base text-gray-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">•</span>
              <span>이력서는 가능한 한 컴퓨터로 작성하되, 손으로 쓸 경우 흑색 필기구를 사용합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">•</span>
              <span>
                사진은 3개월 이내 촬영한 증명사진을 사용하며, 단정한 복장과 밝은 표정이 담긴 사진을 선택합니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">•</span>
              <span>학력, 경력, 자격증 등은 최신 순으로 작성하거나, 기업에서 요구하는 양식에 따라 작성합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">•</span>
              <span>
                특기 및 취미는 지원 직무와 관련이 있거나, 자신의 성격과 능력을 드러낼 수 있는 것을 기재합니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">•</span>
              <span>
                지원 동기나 포부는 구체적이고 진실 되게 작성하며, 기업의 인재상과 연관 지어 표현하는 것이 좋습니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">•</span>
              <span>제출 전 반드시 맞춤법, 띄어쓰기 등을 점검하고 오탈자가 없는지 확인합니다.</span>
            </li>
      </ul>
        </div>
      </div>

      {/* 이력서 양식의 종류 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ③ 이력서 양식의 종류
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px] lg:text-base">
            <thead>
              <tr className="bg-[#2f80ed] text-white">
                <th className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 font-medium">구분</th>
                <th className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 font-medium">특징</th>
                <th className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 font-medium">장점</th>
                <th className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 font-medium">단점</th>
                <th className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 font-medium">적합대상</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 font-medium text-gray-800">
                  시간순 이력서
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  시간 순서대로 학력 및 경력을 나열
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  경력의 발전 과정과 안정성을 보여줌
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  경력 단절이나 이직이 잦을 경우 불리
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">경력이 꾸준한 사람</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 font-medium text-gray-800">
                  기능적 이력서
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  직무 기능이나 기술 중심으로 작성
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  관련 능력과 업적을 강조할 수 있음
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  시간 흐름 파악이 어려움
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  경력 단절이 있거나 전직하는 사람
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 font-medium text-gray-800">
                  혼합형 이력서
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  시간순 + 기능적 이력서 결합
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  능력과 경력 발전 과정 모두 표현
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  작성 시간이 오래 걸림
                </td>
                <td className="border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-gray-600">
                  다양한 경력과 능력 보유자
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 이력서 작성 순서 및 방법 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ④ 이력서 작성 순서 및 방법
        </h3>

        <div className="space-y-4 lg:space-y-6">
          {/* 인적사항 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-gray-800 mb-3 lg:mb-4 flex items-center gap-2">
              <span className="w-6 h-6 lg:w-8 lg:h-8 bg-[#2f80ed] text-white rounded-full flex items-center justify-center text-[12px] lg:text-base font-bold">
                1
              </span>
              인적사항
            </h4>
            <div className="pl-8 lg:pl-10 space-y-2">
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">• 성명:</span> 한글로 작성하되, 외국계 기업의 경우
                영문명을 함께 기재
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">• 생년월일:</span> 주민등록번호 또는 생년월일만 기재
                (개인정보 보호)
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">• 연락처:</span> 휴대전화, 이메일은 반드시 정확하게
                기재하여 연락 가능하도록 함
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">• 주소:</span> 현 거주지 주소를 정확히 기재
              </p>
            </div>
          </div>

          {/* 학력사항 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-gray-800 mb-3 lg:mb-4 flex items-center gap-2">
              <span className="w-6 h-6 lg:w-8 lg:h-8 bg-[#2f80ed] text-white rounded-full flex items-center justify-center text-[12px] lg:text-base font-bold">
                2
              </span>
              학력사항
            </h4>
            <div className="pl-8 lg:pl-10 space-y-2">
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 최종학력부터 시작하여 역순으로 기재하거나, 고등학교부터 순차적으로 기재
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 학교명, 전공, 학위, 졸업(예정)일을 명확히 작성
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 편입, 복수전공, 부전공, 교환학생 경험 등이 있으면 함께 기재
              </p>
            </div>
          </div>

          {/* 경력사항 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-gray-800 mb-3 lg:mb-4 flex items-center gap-2">
              <span className="w-6 h-6 lg:w-8 lg:h-8 bg-[#2f80ed] text-white rounded-full flex items-center justify-center text-[12px] lg:text-base font-bold">
                3
              </span>
              경력사항
            </h4>
            <div className="pl-8 lg:pl-10 space-y-2">
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 회사명, 재직기간, 직급/직책, 담당 업무를 구체적으로 기재
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 주요 성과나 업적을 수치화하여 표현 (예: 매출 20% 증가 기여)
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 아르바이트, 인턴, 프로젝트 경험도 직무 관련성이 있으면 포함
              </p>
            </div>
          </div>

          {/* 자격증 및 교육사항 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-gray-800 mb-3 lg:mb-4 flex items-center gap-2">
              <span className="w-6 h-6 lg:w-8 lg:h-8 bg-[#2f80ed] text-white rounded-full flex items-center justify-center text-[12px] lg:text-base font-bold">
                4
              </span>
              자격증 및 교육사항
            </h4>
            <div className="pl-8 lg:pl-10 space-y-2">
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 직무와 관련된 자격증을 우선적으로 기재 (자격증명, 발급기관, 취득일)
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 어학 능력 (토익, 토플, 오픽 등)을 점수와 취득일과 함께 명시
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 직무 교육, 전문 과정 이수 내역이 있으면 포함
              </p>
            </div>
          </div>

          {/* 자기소개 및 포부 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-gray-800 mb-3 lg:mb-4 flex items-center gap-2">
              <span className="w-6 h-6 lg:w-8 lg:h-8 bg-[#2f80ed] text-white rounded-full flex items-center justify-center text-[12px] lg:text-base font-bold">
                5
              </span>
              자기소개 및 포부
            </h4>
            <div className="pl-8 lg:pl-10 space-y-2">
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 자신의 강점과 경험을 지원 직무와 연결하여 간략하게 작성
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 입사 후 포부나 기여할 수 있는 부분을 구체적으로 표현
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                • 과도한 미사여구보다는 진솔하고 명확한 문장으로 작성
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 면접 시 자주 묻는 질문들 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ⑤ 이력서 작성 후 자주 묻는 질문들
        </h3>

        <div className="bg-yellow-50 lg:bg-white lg:border-2 lg:border-yellow-400 rounded-xl p-4 lg:p-6">
          <div className="space-y-3 lg:space-y-4">
            <div className="border-l-4 border-[#2f80ed] pl-4 lg:pl-6">
              <p className="text-[13px] lg:text-[18px] font-semibold text-gray-800 mb-1 lg:mb-2">
                Q. 이력서에 사진을 꼭 넣어야 하나요?
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                A. 기업에서 요구하지 않는다면 필수는 아닙니다. 다만, 사진을 넣을 경우 단정하고 밝은 인상의 증명사진을
                사용하는 것이 좋습니다.
              </p>
            </div>

            <div className="border-l-4 border-[#2f80ed] pl-4 lg:pl-6">
              <p className="text-[13px] lg:text-[18px] font-semibold text-gray-800 mb-1 lg:mb-2">
                Q. 경력 단절 기간은 어떻게 설명해야 하나요?
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                A. 솔직하게 기재하되, 그 기간 동안 자기계발, 교육, 자격증 취득 등의 활동이 있었다면 함께 언급하여
                긍정적으로 표현할 수 있습니다.
              </p>
            </div>

            <div className="border-l-4 border-[#2f80ed] pl-4 lg:pl-6">
              <p className="text-[13px] lg:text-[18px] font-semibold text-gray-800 mb-1 lg:mb-2">
                Q. 이력서는 몇 페이지가 적당한가요?
              </p>
              <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
                A. 일반적으로 1~2페이지가 적당합니다. 신입의 경우 1페이지, 경력자는 2페이지 내외로 작성하는 것이
                좋습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 이력서 최종 체크리스트 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 lg:from-white lg:to-white lg:border lg:border-gray-200 rounded-xl p-4 lg:p-6">
        <h3 className="text-[14px] lg:text-[24px] font-bold lg:font-semibold text-gray-800 mb-3 lg:mb-5 flex items-center gap-2">
          <span className="text-[20px] lg:text-[30px]">✓</span>
          이력서 제출 전 최종 체크리스트
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 text-[12px] lg:text-base text-gray-600">
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>맞춤법 및 오탈자 확인</span>
          </label>
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>연락처 정확성 확인</span>
          </label>
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>지원 직무와의 연관성 확인</span>
          </label>
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>파일 형식 및 용량 확인</span>
          </label>
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>사진 품질 및 복장 확인</span>
          </label>
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>경력/학력 날짜 정확성 확인</span>
          </label>
        </div>
      </div>
    </div>
  );
};

const CoverLetterContent = () => {
  return (
    <div className="bg-white lg:bg-transparent rounded-[14px] lg:rounded-none p-4 lg:p-0 shadow-[0_10px_20px_rgba(31,41,55,0.08)] lg:shadow-none">
      {/* 헤더 배너 */}
      <div className="h-[120px] lg:h-[200px] rounded-[12px] lg:rounded-2xl bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 mb-4 lg:mb-8 flex items-center justify-center px-6 lg:px-12">
        <div className="text-center">
          <h3 className="text-[14px] lg:text-[24px] font-bold lg:font-semibold text-gray-800 mb-1 lg:mb-2">
            면접관을 사로잡는 자기소개서 작성 5가지
          </h3>
          <p className="text-[10px] lg:text-base text-gray-700 leading-relaxed">서류 통과를 위한 기본 가이드</p>
        </div>
      </div>

      {/* ① 자기소개서 작성 요령 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ① 자기소개서 작성 요령
        </h3>

        <div className="space-y-4 lg:space-y-6">
          <div className="lg:bg-white lg:border lg:border-gray-200 lg:rounded-xl lg:p-6">
            <h4 className="text-[13px] lg:text-[18px] font-semibold lg:font-medium text-gray-800 mb-2 lg:mb-3">
              정보 파악
            </h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              지원하고자 하는 회사의 특성 및 역할을 수행하기 위한 업무 수행 방식에 대해 기본 지식을 습득합니다.
            </p>
          </div>

          <div className="lg:bg-white lg:border lg:border-gray-200 lg:rounded-xl lg:p-6">
            <h4 className="text-[13px] lg:text-[18px] font-semibold lg:font-medium text-gray-800 mb-2 lg:mb-3">
              동기·포부
            </h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              왜 그 일을 하려고 하는지, 왜 그 기업을 선택했는지 등 지원한 동기를 밝히고, 입사 후 구체적으로 어떻게
              자신의 역할을 수행할 것인지를 밝힙니다.
            </p>
          </div>

          <div className="lg:bg-white lg:border lg:border-gray-200 lg:rounded-xl lg:p-6">
            <h4 className="text-[13px] lg:text-[18px] font-semibold lg:font-medium text-gray-800 mb-2 lg:mb-3">
              강점·활동
            </h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              자신만이 가지고 있는 강점이나 능력 등을 적고, 이를 위해 학교 생활이나 다양한 활동 등에서 어떤 행동 등을
              했는지 구체적으로 밝혀 자신의 역량을 나타냅니다.
            </p>
          </div>

          <div className="lg:bg-white lg:border lg:border-gray-200 lg:rounded-xl lg:p-6">
            <h4 className="text-[13px] lg:text-[18px] font-semibold lg:font-medium text-gray-800 mb-2 lg:mb-3">기타</h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              그 외 기업이 자기소개서에서 요구하는 부분에 대해 솔직하고 진솔하게 작성합니다.
            </p>
          </div>
        </div>
      </div>

      {/* ② 면접 발탁 세부 항목 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ② 면접 발탁 (바람직한 세부 항목별 자기소개서)
        </h3>

        <div className="bg-gray-50 lg:bg-white lg:border lg:border-gray-200 rounded-xl p-4 lg:p-6">
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">▸</span>
              <span className="text-[12px] lg:text-base text-gray-600">가족관계</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">▸</span>
              <span className="text-[12px] lg:text-base text-gray-600">성장과정</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">▸</span>
              <span className="text-[12px] lg:text-base text-gray-600">성격의 장·단점</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">▸</span>
              <span className="text-[12px] lg:text-base text-gray-600">특기 및 취미</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">▸</span>
              <span className="text-[12px] lg:text-base text-gray-600">지원동기</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">▸</span>
              <span className="text-[12px] lg:text-base text-gray-600">학교생활 및 사회경험</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">▸</span>
              <span className="text-[12px] lg:text-base text-gray-600">직업관 및 인생관</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">▸</span>
              <span className="text-[12px] lg:text-base text-gray-600">입사 후 포부</span>
            </div>
          </div>
          <p className="text-[11px] lg:text-sm text-gray-500 mt-4 lg:mt-6 italic">
            * 모든 항목에서 지원 기업과 직무에 맞춰 구체적이고 진솔하게 작성합니다.
          </p>
        </div>
      </div>

      {/* ③ ~것 같습니다, ~라고 생각합니다 같은 바람직하지 못한 표현 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ③ ~것 같습니다, ~라고 생각합니다 같은 바람직하지 못한 표현
        </h3>

        <div className="space-y-3 lg:space-y-4">
          <div className="bg-red-50 lg:bg-white lg:border-2 lg:border-red-200 rounded-xl p-4 lg:p-6">
            <h4 className="text-[13px] lg:text-[18px] font-semibold text-red-700 mb-2 lg:mb-3">❌ 피해야 할 표현</h4>
            <ul className="space-y-2 text-[12px] lg:text-base text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0">•</span>
                <span>"~것 같습니다", "~라고 생각합니다" 같은 불확실한 표현</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0">•</span>
                <span>"노력하겠습니다", "최선을 다하겠습니다" 같은 추상적인 다짐</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0">•</span>
                <span>"~할 수 있을 것입니다" 같은 자신감 부족 표현</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0">•</span>
                <span>과도한 겸손이나 과장된 표현</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 lg:bg-white lg:border-2 lg:border-green-200 rounded-xl p-4 lg:p-6">
            <h4 className="text-[13px] lg:text-[18px] font-semibold text-green-700 mb-2 lg:mb-3">✅ 권장하는 표현</h4>
            <ul className="space-y-2 text-[12px] lg:text-base text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0">•</span>
                <span>"~했습니다", "~할 수 있습니다" 같은 확신 있는 표현</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0">•</span>
                <span>구체적인 수치와 결과를 포함한 문장</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0">•</span>
                <span>"~을 통해 ~한 역량을 키웠습니다" 같은 성과 중심 표현</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0">•</span>
                <span>능동적이고 긍정적인 어투</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ④ 자기소개서 작성 시 유의사항 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ④ 자기소개서 작성 시 유의사항
        </h3>

        <div className="bg-blue-50 lg:bg-white lg:border lg:border-gray-200 rounded-xl p-4 lg:p-6">
          <ul className="space-y-2 lg:space-y-3 text-[12px] lg:text-base text-gray-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">1.</span>
              <span>공통 양식을 여러 기업에 제출하지 말고, 각 기업별로 맞춤형 자기소개서를 작성합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">2.</span>
              <span>타인의 자기소개서를 참고는 할 수 있으나, 절대 표절하지 않습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">3.</span>
              <span>과장되거나 거짓된 내용은 면접이나 입사 후 문제가 될 수 있으니 진실만을 작성합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">4.</span>
              <span>맞춤법, 띄어쓰기, 문장 호응 등을 꼼꼼히 검토하여 완성도를 높입니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2f80ed] font-bold flex-shrink-0">5.</span>
              <span>제출 전 여러 번 읽어보고, 가능하면 주변 사람에게 피드백을 받아 수정합니다.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ⑤ 좋지 않은 자기소개서 사례 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ⑤ 좋지 않은 자기소개서 사례
        </h3>

        <div className="space-y-3 lg:space-y-4">
          <div className="border border-red-300 rounded-xl p-4 lg:p-6 bg-red-50 lg:bg-white">
            <h4 className="text-[13px] lg:text-[18px] font-semibold text-gray-800 mb-2 lg:mb-3">
              지나치게 개인적이거나 감정적인 내용
            </h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              가족 관계나 개인적인 어려움을 과도하게 서술하여 자기 연민에 빠지거나, 지원 기업과 무관한 개인 스토리로
              분량을 채우는 경우
            </p>
          </div>

          <div className="border border-red-300 rounded-xl p-4 lg:p-6 bg-red-50 lg:bg-white">
            <h4 className="text-[13px] lg:text-[18px] font-semibold text-gray-800 mb-2 lg:mb-3">
              추상적이고 뻔한 내용의 나열
            </h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              "성실하고 책임감이 강합니다", "도전정신이 있습니다" 같은 누구나 쓸 수 있는 내용을 구체적 근거 없이
              나열하는 경우
            </p>
          </div>

          <div className="border border-red-300 rounded-xl p-4 lg:p-6 bg-red-50 lg:bg-white">
            <h4 className="text-[13px] lg:text-[18px] font-semibold text-gray-800 mb-2 lg:mb-3">질문과 무관한 답변</h4>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed">
              기업에서 요구한 질문 항목과 관계없는 내용을 작성하거나, 분량만 채우기 위해 불필요한 정보를 포함하는 경우
            </p>
          </div>
        </div>
      </div>

      {/* ⑥ 단계별 이력서·자기소개서 작성 전략 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ⑥ 단계별 이력서·자기소개서 작성 전략
        </h3>

        <div className="space-y-4 lg:space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 lg:w-10 lg:h-10 bg-[#2f80ed] text-white rounded-full flex items-center justify-center font-bold text-sm lg:text-lg">
                1
              </span>
              <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-gray-800">자료 수집 및 분석</h4>
            </div>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed pl-11 lg:pl-14">
              지원 기업의 홈페이지, 뉴스, 채용공고 등을 통해 기업 정보를 충분히 수집하고, 요구하는 인재상과 직무 역량을
              파악합니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 lg:w-10 lg:h-10 bg-[#2f80ed] text-white rounded-full flex items-center justify-center font-bold text-sm lg:text-lg">
                2
              </span>
              <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-gray-800">자기 분석</h4>
            </div>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed pl-11 lg:pl-14">
              나의 강점, 경험, 가치관 등을 정리하고, 지원 직무와 연결될 수 있는 키워드를 추출합니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 lg:w-10 lg:h-10 bg-[#2f80ed] text-white rounded-full flex items-center justify-center font-bold text-sm lg:text-lg">
                3
              </span>
              <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-gray-800">초안 작성</h4>
            </div>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed pl-11 lg:pl-14">
              개요를 잡고 각 항목별로 초안을 작성합니다. 완벽하지 않아도 되니 우선 전체적인 흐름을 완성합니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 lg:w-10 lg:h-10 bg-[#2f80ed] text-white rounded-full flex items-center justify-center font-bold text-sm lg:text-lg">
                4
              </span>
              <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-gray-800">수정 및 보완</h4>
            </div>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed pl-11 lg:pl-14">
              불필요한 내용은 삭제하고, 부족한 부분은 보강하며, 문장을 다듬어 가독성을 높입니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 lg:w-10 lg:h-10 bg-[#2f80ed] text-white rounded-full flex items-center justify-center font-bold text-sm lg:text-lg">
                5
              </span>
              <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-gray-800">최종 점검 및 제출</h4>
            </div>
            <p className="text-[12px] lg:text-base text-gray-600 leading-relaxed pl-11 lg:pl-14">
              맞춤법, 오탈자, 파일 형식 등을 최종 점검하고, 제출 기한을 확인한 후 제출합니다.
            </p>
          </div>
        </div>
      </div>

      {/* ⑦ 자기소개서 질문 준비 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ⑦ 자기소개서 질문 준비
        </h3>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 lg:from-white lg:to-white lg:border lg:border-gray-200 rounded-xl p-4 lg:p-6">
          <p className="text-[12px] lg:text-base text-gray-700 lg:text-gray-600 leading-relaxed mb-4 lg:mb-6">
            자기소개서를 작성한 후에는 면접에서 관련 질문을 받을 수 있으므로, 작성한 내용을 기반으로 예상 질문과 답변을
            미리 준비해두는 것이 좋습니다.
          </p>
          <ul className="space-y-2 text-[12px] lg:text-base text-gray-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold flex-shrink-0">Q.</span>
              <span>자기소개서에 쓴 경험에 대해 더 자세히 설명해주세요.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold flex-shrink-0">Q.</span>
              <span>그 경험을 통해 배운 점을 우리 회사에서 어떻게 활용할 수 있나요?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold flex-shrink-0">Q.</span>
              <span>지원 동기에서 언급한 부분에 대해 구체적으로 말씀해주세요.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ⑧ 좋게 보는 지원자 vs. 불리 보는 지원자 */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-[16px] lg:text-[30px] font-bold lg:font-semibold text-[#111827] mb-3 lg:mb-6 pb-2 border-b-2 border-[#2f80ed]">
          ⑧ 좋게 보는 지원자 vs. 불리 보는 지원자
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* 좋게 보는 지원자 */}
          <div className="bg-green-50 lg:bg-white lg:border-2 lg:border-green-300 rounded-xl p-4 lg:p-6">
            <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-green-700 mb-3 lg:mb-4">
              ✅ 좋게 보는 지원자
            </h4>
            <ul className="space-y-2 text-[12px] lg:text-base text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">▸</span>
                <span>지원 기업과 직무에 대한 명확한 이해</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">▸</span>
                <span>구체적인 경험과 성과를 수치로 제시</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">▸</span>
                <span>자신만의 차별화된 스토리</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">▸</span>
                <span>긍정적이고 능동적인 어조</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">▸</span>
                <span>논리적이고 체계적인 구성</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">▸</span>
                <span>맞춤법과 문법이 완벽함</span>
              </li>
            </ul>
          </div>

          {/* 불리 보는 지원자 */}
          <div className="bg-red-50 lg:bg-white lg:border-2 lg:border-red-300 rounded-xl p-4 lg:p-6">
            <h4 className="text-[14px] lg:text-[20px] font-bold lg:font-semibold text-red-700 mb-3 lg:mb-4">
              ❌ 불리 보는 지원자
            </h4>
            <ul className="space-y-2 text-[12px] lg:text-base text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-red-600 flex-shrink-0">▸</span>
                <span>기업 조사 없이 일반적인 내용만 작성</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 flex-shrink-0">▸</span>
                <span>추상적이고 뻔한 표현의 나열</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 flex-shrink-0">▸</span>
                <span>타인과 차별화되지 않는 평범한 내용</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 flex-shrink-0">▸</span>
                <span>소극적이고 불확실한 표현 사용</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 flex-shrink-0">▸</span>
                <span>내용 간 연결성이 부족함</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 flex-shrink-0">▸</span>
                <span>오탈자와 문법 오류가 많음</span>
              </li>
      </ul>
          </div>
        </div>
      </div>

      {/* 자기소개서 최종 체크리스트 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 lg:from-white lg:to-white lg:border lg:border-gray-200 rounded-xl p-4 lg:p-6">
        <h3 className="text-[14px] lg:text-[24px] font-bold lg:font-semibold text-gray-800 mb-3 lg:mb-5 flex items-center gap-2">
          <span className="text-[20px] lg:text-[30px]">✓</span>
          자기소개서 제출 전 최종 체크리스트
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 text-[12px] lg:text-base text-gray-600">
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>질문 항목에 맞는 답변 작성 확인</span>
          </label>
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>맞춤법 및 오탈자 확인</span>
          </label>
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>기업 맞춤형 내용 작성 확인</span>
          </label>
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>구체적 사례와 수치 포함 확인</span>
          </label>
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>긍정적이고 능동적인 어투 확인</span>
          </label>
          <label className="flex items-center gap-2 hover:text-[#2f80ed] transition-colors cursor-pointer">
            <input type="checkbox" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>분량 및 파일 형식 확인</span>
          </label>
        </div>
      </div>
    </div>
  );
};

const DocumentGuide = ({ type = 'resume' }) => {
  // PC에서는 type prop으로 이력서/자소서 구분
  // Mobile에서는 탭으로 전환
  const [mobileTab, setMobileTab] = React.useState('resume');

  return (
    <div>
      {/* Mobile 제목 */}
      <h2 className="lg:hidden text-[20px] font-bold text-[#111827] mb-3">이력서 / 자소서 가이드 (고용24 발췌)</h2>

      {/* Mobile 탭 버튼 */}
      <div className="lg:hidden bg-white rounded-[14px] overflow-hidden border border-[#dbe3f1] mb-4">
        <div className="grid grid-cols-2">
          <button
            type="button"
            onClick={() => setMobileTab('resume')}
            className={`h-11 text-[13px] font-semibold ${
              mobileTab === 'resume' ? 'bg-[#2f80ed] text-white' : 'bg-white text-[#111827]'
            }`}
          >
            이력서
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('cover')}
            className={`h-11 text-[13px] font-semibold ${
              mobileTab === 'cover' ? 'bg-[#2f80ed] text-white' : 'bg-white text-[#111827]'
            }`}
          >
            자기소개서
          </button>
        </div>
      </div>

      {/* Mobile 콘텐츠 */}
      <div className="lg:hidden">{mobileTab === 'resume' ? <ResumeContent /> : <CoverLetterContent />}</div>

      {/* PC 콘텐츠 */}
      <div className="hidden lg:block">{type === 'resume' ? <ResumeContent /> : <CoverLetterContent />}</div>
    </div>
  );
};

export default DocumentGuide;
