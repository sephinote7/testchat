import React, { useState } from 'react';

const questions = [
  { q: '처음 보는 사람에게 먼저 말을 거는 편이다.', type: 'EI', w: 2 },
  { q: '혼자만의 시간을 보낼 때 에너지가 충전된다.', type: 'EI', w: -2 },
  { q: '모임이나 파티에서 중심에 서는 것을 즐긴다.', type: 'EI', w: 2 },
  { q: '생각을 정리한 후 말하기보다 말하면서 정리하는 편이다.', type: 'EI', w: 1 },
  { q: '현실적인 세부 사항과 사실에 집중하는 것을 선호한다.', type: 'SN', w: 2 },
  { q: '상상력이 풍부하며 비유적인 표현을 자주 쓴다.', type: 'SN', w: -2 },
  { q: '경험해본 적 없는 새로운 방식보다 익숙한 방식을 선호한다.', type: 'SN', w: 1 },
  { q: '미래에 대한 구상보다 현재의 삶에 충실하다.', type: 'SN', w: 2 },
  { q: '결정을 내릴 때 사람들의 감정보다 논리적 타당성이 중요하다.', type: 'TF', w: 2 },
  { q: '친구가 고민을 털어놓으면 해결책보다 먼저 공감을 해준다.', type: 'TF', w: -2 },
  { q: '비판을 들었을 때 감정적으로 상처받기보다 내용의 객관성을 따진다.', type: 'TF', w: 1 },
  { q: '화목한 분위기를 유지하는 것이 효율성보다 우선이다.', type: 'TF', w: -2 },
  { q: '여행을 갈 때 시간 단위로 꼼꼼하게 계획을 세운다.', type: 'JP', w: 2 },
  { q: '마감 기한이 닥쳐서야 업무를 시작하는 편이다.', type: 'JP', w: -2 },
  { q: '환경이 갑자기 변해도 당황하지 않고 즉흥적으로 대응한다.', type: 'JP', w: -1 },
  { q: '정리정돈된 상태를 유지하는 것에 집착하는 편이다.', type: 'JP', w: 2 },
];

const MbtiTest = ({ isOpen = true, onClose, onResult }) => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [result, setResult] = useState(null);

  const handleChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = parseInt(value);
    setAnswers(newAnswers);
  };

  const calculateMBTI = () => {
    // 결과가 이미 나와있으면 다시 계산하지 않음
    if (result) return;

    // 선택되지 않은 문항 체크
    const unanswered = answers.some((a) => a === null || a === undefined);
    if (unanswered) {
      alert('모든 문항을 선택해야 결과를 확인할 수 있습니다.');
      return;
    }

    const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };

    questions.forEach((item, index) => {
      const val = Number(answers[index]); // 문자열일 경우 대비
      const score = (val - 3) * item.w;
      scores[item.type] += score;
    });

    let mbti = '';
    mbti += scores.EI >= 0 ? 'E' : 'I';
    mbti += scores.SN >= 0 ? 'S' : 'N';
    mbti += scores.TF >= 0 ? 'T' : 'F';
    mbti += scores.JP >= 0 ? 'J' : 'P';

    setResult({
      type: mbti,
      desc: `${mbti} 유형의 자세한 특징은 분석 결과를 확인해 보세요!`,
    });

    onResult(mbti);

    // 질문 입력 막기
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResultClick = () => {
    const result = calculateMBTI(); // 모달 내부에서 결과 계산
    onResult(result); // 부모에 MBTI 값 전달
    onClose(); // 모달 닫기
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 overflow-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#EAF1FF] rounded-2xl max-w-3xl w-full sm:w-11/12 md:w-3/4 lg:w-1/2 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-lg font-bold"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 text-[#1F2F3E672A44] text-center sm:text-left">
          MBTI 성격 유형 검사 (15문항)
        </h2>

        <div className="space-y-4 max-h-[60vh] overflow-auto pr-2 sm:pr-4 relative">
          {questions.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-md">
              <p className="font-semibold mb-2 text-sm sm:text-base">
                {index + 1}. {item.q}
              </p>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>매우 아니다</span>
                <span>매우 그렇다</span>
              </div>
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((val) => (
                  <input
                    key={val}
                    type="radio"
                    name={`q${index}`}
                    value={val}
                    checked={answers[index] === val}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer disabled:cursor-not-allowed"
                    disabled={!!result} // 결과가 있으면 클릭 불가
                  />
                ))}
              </div>
            </div>
          ))}

          {/* pointer-events로 전체 막기용 오버레이 */}
          {result && <div className="absolute inset-0 bg-transparent z-10"></div>}
        </div>

        <button
          onClick={() => {
            calculateMBTI();
            onClose();
          }}
          className="cursor-pointer w-full py-3 mt-4 rounded-lg text-white font-semibold text-sm sm:text-base bg-[#2f80ed] hover:bg-[#2670d4]"
        >
          결과 확인하기
        </button>

        {result && (
          <div className="bg-white p-4 mt-4 rounded-xl text-center">
            <h3 className="text-lg font-semibold mb-2">당신의 성격 유형은?</h3>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#2F80ED' }}>
              {result.type}
            </h1>
            <p className="text-sm sm:text-base">{result.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MbtiTest;
