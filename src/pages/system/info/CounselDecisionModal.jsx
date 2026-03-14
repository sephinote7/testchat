import { useState } from 'react';

const CounselDecisionModal = ({
  open,
  type = 'accept', // accept | reject
  onClose,
  onSubmit,
}) => {
  const [message, setMessage] = useState('');

  if (!open) return null;

  const isReject = type === 'reject';

  const handleSubmit = () => {
    onSubmit(message);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white w-[90%] max-w-md rounded-2xl shadow-xl p-6">
        {/* 제목 */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {isReject ? '상담 거절 사유 입력' : '상담 수락 메시지'}
        </h2>

        {/* 설명 */}
        <p className="text-sm text-gray-500 mb-4">
          {isReject ? '상담을 거절하는 사유를 입력해주세요.' : '예약자에게 전달할 간단한 메시지를 입력해주세요.'}
        </p>

        {/* 입력창 */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isReject ? '거절 사유를 입력하세요.' : '예약자에게 전달할 메시지를 입력하세요.'}
          className="w-full h-28 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        {/* 버튼 */}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">
            취소
          </button>

          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-sm rounded-lg text-white font-semibold ${
              isReject ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isReject ? '거절하기' : '수락하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounselDecisionModal;
