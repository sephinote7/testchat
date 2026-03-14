import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
import { nanoid } from 'nanoid';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import {
  cancelPayment,
  createPayment,
  getMyPoint,
} from '../../../api/walletApi';
import { authApi } from '../../../axios/Auth';

const PointCharge = () => {
  const { nickname, email } = useAuthStore();
  const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
  const customerKey = email;

  // TODO: DB 연동 시 실제 사용자 포인트 조회
  const [userPoints, setUserPoints] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const widgetsRef = useRef(null);
  const paymentWidgetRef = useRef(null);
  const agreementWidgetRef = useRef(null);

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

  const handleConfirmCharge = async () => {
    let paymentId;
    try {
      // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
      // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
      // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
      const orderId = nanoid();
      paymentId = await createPayment({
        email: email,
        amount: selectedAmount.points,
        orderId: orderId,
      });

      await widgetsRef.current.requestPayment({
        orderId: orderId,
        orderName: '포인트 충전',
        successUrl: window.location.origin + '/mypage/point-charge',
        failUrl: window.location.origin + '/mypage/point-charge',
        customerEmail: email,
        customerName: nickname,
        customerMobilePhone: '01012341234',
      });

      setShowConfirmModal(false);
      setShowCompleteModal(true);
    } catch (error) {
      // 에러 처리하기
      await cancelPayment(paymentId);
      console.error(error);
    }
  };

  const handleCompleteClose = () => {
    setShowCompleteModal(false);
  };

  const handleCloseModal = () => {
    paymentWidgetRef.current?.destroy();
    agreementWidgetRef.current?.destroy();

    paymentWidgetRef.current = null;
    agreementWidgetRef.current = null;

    setReady(false);
    setShowConfirmModal(false);
  };

  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      // ------  결제위젯 초기화 ------
      const tossPayments = await loadTossPayments(clientKey);

      // 회원 결제
      widgetsRef.current = tossPayments.widgets({
        customerKey,
      });

      // 비회원 결제
      // const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

      // setWidgets(widgets);
    }

    fetchPaymentWidgets();
  }, []);

  useEffect(() => {
    if (!widgetsRef.current || !selectedAmount || !showConfirmModal) return;

    async function renderPaymentWidgets() {
      // ------ 주문의 결제 금액 설정 ------
      await widgetsRef.current.setAmount({
        currency: 'KRW',
        value: selectedAmount.price,
      });

      paymentWidgetRef.current = await widgetsRef.current.renderPaymentMethods({
        selector: '#payment-method',
        variantKey: 'DEFAULT',
      });

      agreementWidgetRef.current = await widgetsRef.current.renderAgreement({
        selector: '#agreement',
        variantKey: 'AGREEMENT',
      });

      setReady(true);
    }

    renderPaymentWidgets();
  }, [showConfirmModal, selectedAmount]);

  // [결제 성공 시]
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = params.get('amount');

    if (!paymentKey || !orderId || !amount) return;

    const confirmPayment = async () => {
      try {
        const response = await authApi.post('/confirm', {
          paymentKey,
          orderId,
          amount,
        });

        if (response.status !== 200) {
          alert('결제 승인 실패');
          return;
        }

        const updatedPoint = await getMyPoint(email);
        setUserPoints(updatedPoint);

        setShowCompleteModal(true);

        // URL 정리 (모달 중복 방지)
        window.history.replaceState({}, '', window.location.pathname);
      } catch (error) {
        alert('결제 승인 실패');
        console.error(error);
      }
    };

    confirmPayment();
  }, []);

  useEffect(() => {
    const fetchMyPoint = async () => {
      const data = await getMyPoint(email);
      setUserPoints(data);
    };
    fetchMyPoint();
  }, [email]);

  return (
    <>
      <div className="w-full min-h-screen bg-[#f3f7ff] lg:pb-0 pb-20">
        <div className="max-w-[390px] lg:max-w-[1520px] mx-auto lg:px-8 px-0 lg:py-16 py-0">
          {/* HEADER */}
          <div className="bg-[#2563eb] lg:bg-transparent h-14 lg:h-auto flex items-center justify-between px-5 lg:px-0 lg:mb-12">
            {/* 모바일 뒤로가기 */}
            <Link to="/mypage" className="text-white lg:hidden text-xl">
              ←
            </Link>

            {/* 타이틀 */}
            <h1 className="text-white lg:text-gray-800 text-lg lg:text-3xl font-bold text-center w-full lg:w-auto">
              포인트 충전
            </h1>

            {/* 모바일 여백 / PC 마이페이지 버튼 */}
            <div className="w-6 lg:hidden" />
            <Link
              to="/mypage"
              className="hidden lg:block bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3 rounded-xl text-base font-semibold transition-colors"
            >
              마이페이지로
            </Link>
          </div>

          <div className="px-6 lg:px-0 pt-6 lg:pt-0 max-w-[900px] mx-auto flex flex-col items-center">
            {/* 현재 포인트 표시 */}
            <div className="w-full bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 mb-6 lg:mb-8 shadow-md lg:shadow-lg text-center">
              <p className="text-sm lg:text-lg text-gray-600 mb-2 lg:mb-3">
                현재 내 포인트
              </p>
              <p className="text-3xl lg:text-5xl font-bold text-[#2563eb]">
                {userPoints.toLocaleString()}P
              </p>
            </div>

            {/* 포인트 충전 옵션 */}
            <div className="w-full space-y-4 lg:space-y-5">
              {pointOptions.map((option) => (
                <button
                  key={option.points}
                  onClick={() => handleSelectAmount(option)}
                  className={`cursor-pointer w-full bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-md lg:shadow-lg flex items-center justify-between transition-all lg:hover:scale-102 ${
                    selectedAmount?.points === option.points
                      ? 'border-4 border-[#2563eb] lg:shadow-xl'
                      : 'border-2 border-gray-200'
                  }`}
                >
                  <span className="text-xl lg:text-3xl font-bold text-[#2563eb]">
                    {option.points.toLocaleString()}P
                  </span>
                  <span className="text-lg lg:text-2xl font-semibold text-gray-700">
                    {option.price.toLocaleString()}원
                  </span>
                </button>
              ))}
            </div>

            {/* 충전하기 버튼 */}
            <button
              onClick={handleChargeClick}
              className="cursor-pointer w-full mt-8 lg:mt-10 bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white font-bold py-4 lg:py-6 rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl text-lg lg:text-2xl lg:hover:shadow-2xl transition-all"
            >
              {selectedAmount
                ? `[${selectedAmount.points.toLocaleString()}P]포인트 충전하기`
                : '[~~~P]포인트 충전하기'}
            </button>
          </div>
        </div>

        {/* 충전 확인 모달 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/40 lg:bg-black/50 z-50 flex items-center justify-center p-4 lg:p-8">
            <div
              className="w-[340px] lg:w-full lg:max-w-[700px] 
                bg-white rounded-2xl lg:rounded-3xl 
                p-6 lg:p-8 
                max-h-[85vh] overflow-y-auto lg:max-h-none lg:overflow-visible"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:pb-4 lg:border-b-2 lg:border-gray-200">
                <div className="flex flex-col items-center lg:flex-row lg:gap-4 mb-6 lg:mb-0">
                  <img
                    src="/vite.svg"
                    alt="고민손삭"
                    className="w-16 h-16 lg:w-12 lg:h-12 mb-4 lg:mb-0"
                  />
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                    포인트 충전하기
                  </h3>
                </div>

                {/* PC 닫기 버튼 */}
                <button
                  onClick={handleCloseModal}
                  className="hidden lg:block cursor-pointer text-gray-400 hover:text-gray-600 text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 lg:p-5 mb-4 lg:mb-6 space-y-2">
                <div className="flex justify-between text-sm lg:text-base">
                  <span className="text-gray-600">결제일</span>
                  <span className="text-gray-800 font-semibold">
                    {new Date().toLocaleDateString('ko-KR')}{' '}
                    {new Date().toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm lg:text-base">
                  <span className="text-gray-600">결제 내용</span>
                  <span className="text-gray-800 font-semibold">
                    포인트 충전
                  </span>
                </div>
              </div>

              <div className="wrapper">
                <div className="box_section">
                  <div id="payment-method" />
                  <div id="agreement" />

                  <button
                    className="button cursor-pointer w-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white text-lg font-bold py-4 rounded-xl hover:shadow-lg transition-all"
                    disabled={!ready}
                    onClick={handleConfirmCharge}
                  >
                    결제 완료하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 충전 완료 모달 */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black/40 lg:bg-black/50 z-50 flex items-center justify-center p-4 lg:p-8">
            <div className="w-[300px] lg:max-w-[500px] lg:w-full bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-10 text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6">
                <img
                  src="/vite.svg"
                  alt="고민손삭"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6">
                포인트 충전 완료
              </h3>
              <button
                onClick={handleCompleteClose}
                className="w-full bg-[#2563eb] text-white font-semibold lg:font-bold py-3 lg:py-4 rounded-xl lg:text-lg lg:hover:bg-[#1d4ed8] transition-colors"
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
