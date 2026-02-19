import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PointCharge = () => {
  const navigate = useNavigate();
  
  // TODO: DB 연동 시 실제 사용자 포인트 조회
  const [userPoints, setUserPoints] = useState(5000);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const pointOptions = [
    { points: 5000, price: 5000 },
    { points: 10000, price: 10000 },
    { points: 30000, price: 30000 },
    { points: 50000, price: 50000 },
  ];

  const handleSelectAmount = (option) => {
    setSelectedAmount(option);
  };

  const handleChargeClick = () => {
    if (!selectedAmount) {
      alert('충전할 포인트를 선택해주세요.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmCharge = () => {
    // TODO: DB 연동 시 실제 결제 API 호출
    setShowConfirmModal(false);
    setShowCompleteModal(true);
    setUserPoints((prev) => prev + selectedAmount.points);
  };

  const handleCompleteClose = () => {
    setShowCompleteModal(false);
    navigate('/mypage');
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-20">
        {/* HEADER */}
        <header className="bg-[#2563eb] h-14 flex items-center justify-between px-5">
          <Link to="/mypage" className="text-white text-xl">
            ←
          </Link>
          <h1 className="text-white text-lg font-bold">포인트 충전</h1>
          <div className="w-6" />
        </header>

        {/* CONTENT */}
        <div className="px-6 pt-6 flex flex-col items-center">
          {/* 현재 포인트 표시 */}
          <div className="w-full bg-white rounded-2xl p-4 mb-6 shadow-md text-center">
            <p className="text-sm text-gray-600 mb-2">현재 내 포인트</p>
            <p className="text-3xl font-bold text-[#2563eb]">{userPoints.toLocaleString()}P</p>
          </div>

          {/* 포인트 충전 옵션 */}
          <div className="w-full space-y-4">
            {pointOptions.map((option) => (
              <button
                key={option.points}
                onClick={() => handleSelectAmount(option)}
                className={`w-full bg-white rounded-2xl p-5 shadow-md flex items-center justify-between transition-all ${
                  selectedAmount?.points === option.points
                    ? 'border-4 border-[#2563eb]'
                    : 'border-2 border-gray-200'
                }`}
              >
                <span className="text-xl font-bold text-[#2563eb]">{option.points.toLocaleString()}P</span>
                <span className="text-lg font-semibold text-gray-700">{option.price.toLocaleString()}원</span>
              </button>
            ))}
          </div>

          {/* 충전하기 버튼 */}
          <button
            onClick={handleChargeClick}
            className="w-full mt-8 bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white font-bold py-4 rounded-2xl shadow-lg text-lg"
          >
            {selectedAmount ? `[${selectedAmount.points.toLocaleString()}P]포인트 충전하기` : '[~~~P]포인트 충전하기'}
          </button>
        </div>

        {/* 충전 확인 모달 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="w-[340px] bg-white rounded-2xl p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 mb-4">
                  <img 
                    src="/vite.svg" 
                    alt="고민손삭" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">포인트 충전하기</h3>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">결제확인</span>
                  <span className="text-gray-800 font-semibold">{selectedAmount?.points.toLocaleString()}P</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">결제일</span>
                  <span className="text-gray-800 font-semibold">
                    {new Date().toLocaleDateString('ko-KR')} {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">결제 내용</span>
                  <span className="text-gray-800 font-semibold">포인트 충전</span>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-4 space-y-2">
                <h4 className="text-base font-bold text-gray-800 mb-2">포인트 확인</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">보유 포인트</span>
                  <span className="text-[#2563eb] font-semibold">{userPoints.toLocaleString()} P</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">충전 포인트</span>
                  <span className="text-[#dc2626] font-semibold">+{selectedAmount?.points.toLocaleString()} P</span>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">결제 포인트</span>
                  <span className="text-gray-800 font-semibold">{selectedAmount?.price.toLocaleString()} P</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">현재 포인트</span>
                  <span className="text-[#2563eb] font-semibold">{userPoints.toLocaleString()} P</span>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-800">결제 후 잔여 포인트</span>
                  <span className="text-xl font-bold text-[#2563eb]">
                    {(userPoints + selectedAmount?.points).toLocaleString()} P
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-xs text-gray-600">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#2563eb]" />
                  <span>서비스 이용 및 포인트 결제 동의</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#2563eb]" />
                  <span>취소 및 환불 규정 동의</span>
                </label>
              </div>

              <button
                onClick={handleConfirmCharge}
                className="w-full bg-[#2563eb] text-white font-semibold py-3 rounded-xl"
              >
                결제 완료하기
              </button>
            </div>
          </div>
        )}

        {/* 충전 완료 모달 */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="w-[300px] bg-white rounded-2xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4">
                <img 
                  src="/vite.svg" 
                  alt="고민손삭" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">포인트 충전 완료</h3>
              <button
                onClick={handleCompleteClose}
                className="w-full bg-[#2563eb] text-white font-semibold py-3 rounded-xl"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-3xl font-bold text-gray-800">포인트 충전</h1>
            <Link
              to="/mypage"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3 rounded-xl text-base font-semibold transition-colors"
            >
              마이페이지로
            </Link>
          </div>

          <div className="max-w-[900px] mx-auto">
            {/* 현재 포인트 표시 */}
            <div className="bg-white rounded-3xl p-8 mb-8 shadow-lg text-center">
              <p className="text-lg text-gray-600 mb-3">현재 내 포인트</p>
              <p className="text-5xl font-bold text-[#2563eb]">{userPoints.toLocaleString()}P</p>
            </div>

            {/* 포인트 충전 옵션 */}
            <div className="space-y-5">
              {pointOptions.map((option) => (
                <button
                  key={option.points}
                  onClick={() => handleSelectAmount(option)}
                  className={`w-full bg-white rounded-3xl p-8 shadow-lg flex items-center justify-between transition-all hover:scale-102 ${
                    selectedAmount?.points === option.points
                      ? 'border-4 border-[#2563eb] shadow-xl'
                      : 'border-2 border-gray-200'
                  }`}
                >
                  <span className="text-3xl font-bold text-[#2563eb]">{option.points.toLocaleString()}P</span>
                  <span className="text-2xl font-semibold text-gray-700">{option.price.toLocaleString()}원</span>
                </button>
              ))}
            </div>

            {/* 충전하기 버튼 */}
            <button
              onClick={handleChargeClick}
              className="w-full mt-10 bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white font-bold py-6 rounded-3xl shadow-xl text-2xl hover:shadow-2xl transition-all"
            >
              {selectedAmount ? `[${selectedAmount.points.toLocaleString()}P]포인트 충전하기` : '[~~~P]포인트 충전하기'}
            </button>
          </div>
        </div>

        {/* PC 충전 확인 모달 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl p-8 max-w-[700px] w-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <img 
                    src="/vite.svg" 
                    alt="고민손삭" 
                    className="w-12 h-12"
                  />
                  <h2 className="text-2xl font-bold text-gray-800">포인트 충전하기</h2>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">결제확인</h3>
                <div className="bg-gray-50 rounded-xl p-5 space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">결제 페이지</span>
                    <span className="text-gray-800 font-semibold">고민손삭</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">결제일</span>
                    <span className="text-gray-800 font-semibold">
                      {new Date().toLocaleDateString('ko-KR')} {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">결제 내용</span>
                    <span className="text-gray-800 font-semibold">포인트 충전</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">포인트 확인</h3>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">보유 포인트</span>
                    <span className="text-[#2563eb] font-bold text-lg">{userPoints.toLocaleString()} P</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">충전 포인트</span>
                    <span className="text-red-600 font-bold text-lg">+{selectedAmount?.points.toLocaleString()} P</span>
                  </div>
                  <div className="h-0.5 bg-gray-200" />
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">결제 포인트</span>
                    <span className="text-gray-800 font-bold text-lg">{selectedAmount?.price.toLocaleString()} P</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">현재 포인트</span>
                    <span className="text-[#2563eb] font-bold text-lg">{userPoints.toLocaleString()} P</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">결제 후 잔여 포인트</span>
                  <span className="text-3xl font-bold text-[#2563eb]">
                    {(userPoints + selectedAmount?.points).toLocaleString()} P
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 accent-[#2563eb]" />
                  <span className="text-base text-gray-700">서비스 이용 및 포인트 결제 동의</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 accent-[#2563eb]" />
                  <span className="text-base text-gray-700">취소 및 환불 규정 동의</span>
                </label>
              </div>

              <button
                onClick={handleConfirmCharge}
                className="w-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white text-lg font-bold py-4 rounded-xl hover:shadow-lg transition-all"
              >
                결제 완료하기
              </button>
            </div>
          </div>
        )}

        {/* PC 충전 완료 모달 */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl p-10 max-w-[500px] w-full text-center">
              <div className="w-20 h-20 mx-auto mb-6">
                <img 
                  src="/vite.svg" 
                  alt="고민손삭" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">포인트 충전 완료</h3>
              <button
                onClick={handleCompleteClose}
                className="w-full bg-[#2563eb] text-white font-bold py-4 rounded-xl text-lg hover:bg-[#1d4ed8] transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PointCharge;
