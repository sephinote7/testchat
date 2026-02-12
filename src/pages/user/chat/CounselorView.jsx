import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import counselors from './counselorData';

// TODO: DB 연동 가이드
// 이 페이지는 상담사 프로필 및 예약 기능을 제공합니다
//
// DB 연동 시 필요한 작업:
// 1. 상담사 프로필 조회
//    - API: GET /api/counselors/:id
//    - 응답: 상담사 상세 정보 (프로필, 소개, 경력, 리뷰 등)
//
// 2. 예약 가능 시간 조회
//    - API: GET /api/counselors/:id/available-slots?date={date}
//    - 응답: 해당 날짜의 예약 가능한 시간 목록
//
// 3. 예약 생성
//    - API: POST /api/reservations
//    - 요청: { counselorId, type, date, time, title, content }
//    - 응답: { reservationId, status, paymentUrl }
//
// 4. 결제 처리
//    - API: POST /api/payments
//    - 요청: { reservationId, method, amount }
//    - 응답: { paymentId, status, approvalUrl }
//    - 결제 성공 시 예약 확정
//
// 5. 리뷰 조회
//    - API: GET /api/counselors/:id/reviews?page={page}&pageSize={pageSize}
//    - 응답: { reviews: [...], totalCount, totalPages }

const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatDate = (year, month, day) => {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

const getMonthMatrix = (baseDate) => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const weeks = [];
  let currentWeek = Array(firstDay.getDay()).fill(null);

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const dateObj = new Date(year, month, day);
    const dateStr = formatDate(year, month, day);
    currentWeek.push({
      day,
      dateStr,
      isToday: dateObj.toDateString() === todayMidnight.toDateString(),
      isPast: dateObj < todayMidnight,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
};

const getDisabledSlots = (dateStr) => {
  if (!dateStr) return new Set();

  const disabled = new Set();
  const dayNumber = Number(dateStr.split('-')[2]);

  if (dayNumber % 2 === 0) {
    disabled.add('12:00');
    disabled.add('13:00');
  } else {
    disabled.add('18:00');
    disabled.add('19:00');
  }

  const now = new Date();
  const target = new Date(`${dateStr}T00:00:00`);
  if (target.toDateString() === now.toDateString()) {
    const currentHour = now.getHours();
    TIME_SLOTS.forEach((slot) => {
      const slotHour = Number(slot.split(':')[0]);
      if (slotHour <= currentHour) {
        disabled.add(slot);
      }
    });
  }

  return disabled;
};

const CounselorView = () => {
  const { c_id } = useParams();
  const navigate = useNavigate();
  const counselor = useMemo(() => counselors.find((item) => item.id === c_id), [c_id]);

  const [showReservation, setShowReservation] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [reservationDone, setReservationDone] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [form, setForm] = useState({
    type: '',
    date: '',
    time: '',
    title: '',
    content: '',
  });
  const [paymentAgreements, setPaymentAgreements] = useState({
    serviceAgree: false,
    refundAgree: false,
  });
  const disabledSlots = useMemo(() => getDisabledSlots(form.date), [form.date]);
  const monthWeeks = useMemo(() => getMonthMatrix(calendarMonth), [calendarMonth]);
  const isFormValid = form.type && form.date && form.time && form.title.trim() && form.content.trim();

  // TODO: DB 연동 시 실제 포인트 조회
  // 현재는 더미 데이터로 표시
  const userPoints = {
    reserved: 5000, // 보유 포인트
    current: 5000, // 현재 포인트 (화면 표시용, 실제로는 reserved와 동일)
  };

  // 결제 포인트 계산
  const paymentAmount = form.type ? counselor.prices[form.type] : 0;
  const usedPoints = 2000; // TODO: DB 연동 시 사용자가 선택한 사용 포인트
  const finalAmount = paymentAmount - usedPoints;
  const remainingPoints = userPoints.current - finalAmount;

  if (!counselor) {
    return (
      <div className="w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-[90px] flex flex-col">
        <header className="bg-[#2f80ed] h-16 flex items-center justify-center text-white font-bold text-lg">
          상담사 프로필
        </header>
        <main className="px-[18px] pt-6 text-center text-[14px] text-[#6b7280]">
          상담사 정보를 찾을 수 없습니다.
          <div className="mt-4">
            <Link to="/chat/counselor" className="text-[#2f80ed] font-semibold">
              상담사 목록으로
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleReservationSubmit = (event) => {
    event.preventDefault();
    setShowReservation(false);
    setShowPayment(true);
  };

  // TODO: DB 연동 시 실제 결제 API 호출
  const handlePaymentComplete = () => {
    // 포인트 부족 체크
    if (remainingPoints < 0) {
      alert('포인트가 부족합니다. 포인트 충전 페이지로 이동합니다.');
      navigate('/mypage/point-charge');
      return;
    }

    // const processPayment = async () => {
    //   try {
    //     const response = await fetch('/api/payments', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         reservationId: 'temp_reservation_id',
    //         method: 'point',
    //         amount: finalAmount,
    //         usedPoints: usedPoints
    //       })
    //     });
    //     const data = await response.json();
    //     if (data.status === 'completed') {
    //       setShowPayment(false);
    //       setReservationDone(true);
    //       setPaymentAgreements({ serviceAgree: false, refundAgree: false });
    //     }
    //   } catch (error) {
    //     console.error('결제 실패:', error);
    //     alert('결제 처리 중 오류가 발생했습니다.');
    //   }
    // };
    // processPayment();

    setShowPayment(false);
    setReservationDone(true);
    setPaymentAgreements({ serviceAgree: false, refundAgree: false });
    // 채팅 상담인 경우 채팅방으로 이동
    // if (form.type === 'chat') {
    //   navigate(`/chat/counselor/${c_id}/chat`);
    // }
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-[90px]">
        <header className="bg-[#2f80ed] h-16 flex items-center justify-center text-white font-bold text-lg">
          상담사 프로필
        </header>

        <main className="px-[18px] pt-4 flex flex-col gap-4">
          <div className="bg-white rounded-[14px] overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="h-[120px] bg-gradient-to-r from-[#60a5fa] to-[#2563eb]" />
            <div className="px-4 pb-4 -mt-8">
              <div className="w-[84px] h-[84px] rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-[22px] font-bold text-[#2f80ed]">
                {counselor.name.slice(0, 1)}
              </div>
              <h2 className="mt-3 text-[18px] font-bold text-[#111827]">
                {counselor.name} {counselor.title}
              </h2>
              <p className="text-[12px] text-[#6b7280]">{counselor.tags.map((tag) => `#${tag}`).join(' ')}</p>
              <div className="flex items-center gap-1 text-[12px] text-[#f59e0b] mt-2">
                <span>★★★★★</span>
                <span className="text-[#6b7280]">({counselor.reviewCount})</span>
              </div>
            </div>
          </div>

          {reservationDone && (
            <div className="bg-white rounded-[12px] p-3 border border-[#c7d2fe] text-[13px] text-[#1e3a8a]">
              상담 예약이 완료되었습니다. 2영업일 이내 확인 후 처리될 예정입니다.
            </div>
          )}

          <section className="bg-white rounded-[14px] p-4 shadow-[0_8px_16px_rgba(0,0,0,0.06)]">
            <h3 className="text-[15px] font-bold mb-2 text-[#111827]">심리상담사 소개</h3>
            <p className="text-[13px] text-[#374151] leading-6">{counselor.intro}</p>
          </section>

          <section className="bg-white rounded-[14px] p-4 shadow-[0_8px_16px_rgba(0,0,0,0.06)]">
            <h3 className="text-[15px] font-bold mb-2 text-[#111827]">자격 및 경력</h3>
            <ul className="text-[13px] text-[#374151] list-disc pl-4 space-y-1">
              {counselor.experience.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-[14px] p-4 shadow-[0_8px_16px_rgba(0,0,0,0.06)]">
            <h3 className="text-[15px] font-bold mb-2 text-[#111827]">상담 진행 방식</h3>
            <ol className="text-[13px] text-[#374151] list-decimal pl-4 space-y-1">
              {counselor.process.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="bg-white rounded-[14px] p-4 shadow-[0_8px_16px_rgba(0,0,0,0.06)]">
            <h3 className="text-[15px] font-bold mb-3 text-[#111827]">상담 요금</h3>
            <div className="grid grid-cols-3 text-[13px] text-[#111827] gap-2">
              <div className="border border-[#dbe3f1] rounded-[10px] p-3 text-center">
                <p className="text-[11px] text-[#6b7280]">채팅</p>
                <p className="font-semibold">{counselor.prices.chat.toLocaleString()}원</p>
              </div>
              <div className="border border-[#dbe3f1] rounded-[10px] p-3 text-center">
                <p className="text-[11px] text-[#6b7280]">전화</p>
                <p className="font-semibold">{counselor.prices.call.toLocaleString()}원</p>
              </div>
              <div className="border border-[#dbe3f1] rounded-[10px] p-3 text-center">
                <p className="text-[11px] text-[#6b7280]">방문</p>
                <p className="font-semibold">{counselor.prices.visit.toLocaleString()}원</p>
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={() => {
              setShowReservation(true);
              setCalendarMonth(form.date ? new Date(form.date) : new Date());
            }}
            className="w-full bg-[#2f80ed] text-white font-semibold py-3 rounded-[12px]"
          >
            상담 예약하기
          </button>
        </main>

        {/* 모바일 예약 모달 */}
        {showReservation && (
          <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">
            <div className="min-h-full flex items-start justify-center p-4">
              <div className="w-[340px] bg-white rounded-[16px] p-4 my-6 max-h-[calc(100vh-3rem)] overflow-y-auto overscroll-contain">
                <h3 className="text-[16px] font-bold text-[#111827] mb-3">상담 예약</h3>
                <form className="flex flex-col gap-3" onSubmit={handleReservationSubmit}>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1">상담 유형</label>
                    <select
                      className="w-full border border-[#dbe3f1] rounded-[10px] px-3 py-2 text-[13px]"
                      value={form.type}
                      onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                      required
                    >
                      <option value="">원하는 상담 유형을 선택해주세요</option>
                      <option value="call">전화</option>
                      <option value="chat">채팅</option>
                      <option value="visit">방문</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1">예약 날짜</label>
                    <div className="border border-[#dbe3f1] rounded-[12px] p-3 bg-[#f9fafb]">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          type="button"
                          className="px-2 py-1 text-[12px] rounded border border-[#d1d5db]"
                          onClick={() =>
                            setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                          }
                        >
                          이전
                        </button>
                        <span className="text-[13px] font-semibold text-[#1f2937]">
                          {calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월
                        </span>
                        <button
                          type="button"
                          className="px-2 py-1 text-[12px] rounded border border-[#d1d5db]"
                          onClick={() =>
                            setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                          }
                        >
                          다음
                        </button>
                      </div>
                      <div className="grid grid-cols-7 text-center text-[11px] text-[#6b7280] mb-1">
                        {WEEK_DAYS.map((day) => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[12px]">
                        {monthWeeks.flat().map((dayItem, index) => {
                          if (!dayItem) return <div key={`empty-${index}`} />;
                          const isSelected = form.date === dayItem.dateStr;
                          return (
                            <button
                              key={dayItem.dateStr}
                              type="button"
                              disabled={dayItem.isPast}
                              onClick={() => setForm((prev) => ({ ...prev, date: dayItem.dateStr, time: '' }))}
                              className={`h-8 rounded ${
                                dayItem.isPast
                                  ? 'text-[#cbd5e1] cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-[#2f80ed] text-white'
                                  : dayItem.isToday
                                  ? 'border border-[#2f80ed] text-[#2f80ed]'
                                  : 'bg-white border border-transparent text-[#111827] hover:border-[#d1d5db]'
                              }`}
                            >
                              {dayItem.day}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-[#6b7280] mt-2">지난 날짜는 선택할 수 없습니다.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1">예약 시간</label>
                    <select
                      className="w-full border border-[#dbe3f1] rounded-[10px] px-3 py-2 text-[13px]"
                      value={form.time}
                      onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
                      required
                      disabled={!form.date}
                    >
                      <option value="">원하는 시간을 선택해주세요</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot} disabled={disabledSlots.has(slot)}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#6b7280] mt-1">
                      날짜를 먼저 선택해주세요. 시간 슬롯은 추후 DB 연동으로 실시간 제공 예정입니다.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1">제목</label>
                    <input
                      type="text"
                      className="w-full border border-[#dbe3f1] rounded-[10px] px-3 py-2 text-[13px]"
                      placeholder="제목을 입력해주세요"
                      value={form.title}
                      onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1">상담 내용</label>
                    <textarea
                      className="w-full border border-[#dbe3f1] rounded-[10px] px-3 py-2 text-[13px] h-[100px]"
                      placeholder="상담 내용을 간단히 입력해주세요"
                      value={form.content}
                      onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      className="px-4 py-2 text-[13px] border border-[#d1d5db] rounded-[10px]"
                      onClick={() => setShowReservation(false)}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-[13px] bg-[#2f80ed] text-white rounded-[10px] disabled:opacity-50"
                      disabled={!isFormValid}
                    >
                      예약 진행
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 모바일 결제 모달 */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">
            <div className="min-h-full flex items-start justify-center p-4">
              <div className="w-[340px] bg-white rounded-[16px] p-5 my-6 max-h-[calc(100vh-3rem)] overflow-y-auto overscroll-contain">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <h2 className="text-[18px] font-bold text-[#111827]">예약 후 결제하기</h2>
                  <span className="text-[14px] font-semibold text-[#6b7280]">{counselor.name}</span>
                </div>

                {/* 결제 확인 */}
                <div className="mb-4">
                  <h3 className="text-[15px] font-bold text-[#111827] mb-2">결제확인</h3>
                  <div className="bg-[#f9fafb] rounded-[12px] p-3 space-y-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6b7280]">상담사 :</span>
                      <span className="text-[#111827] font-medium">{counselor.name} 상담사</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6b7280]">결제일 :</span>
                      <span className="text-[#111827] font-medium">{form.date} {form.time}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6b7280]">상담 :</span>
                      <span className="text-[#111827] font-medium">
                        {form.type === 'chat' ? '채팅' : form.type === 'call' ? '전화' : '방문'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 최종 결제 */}
                <div className="mb-4">
                  <h3 className="text-[15px] font-bold text-[#111827] mb-2">최종 결제</h3>
                  <div className="bg-white border border-[#e5e7eb] rounded-[12px] p-3 space-y-2">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6b7280]">보유 포인트</span>
                      <span className="text-[#2f80ed] font-semibold">{userPoints.reserved.toLocaleString()} P</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6b7280]">사용 포인트</span>
                      <span className="text-[#dc2626] font-semibold">-{usedPoints.toLocaleString()} P</span>
                    </div>
                    <div className="h-px bg-[#e5e7eb]" />
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6b7280]">결제 포인트</span>
                      <span className="text-[#111827] font-semibold">{finalAmount.toLocaleString()} P</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6b7280]">현재 포인트</span>
                      <span className="text-[#2f80ed] font-semibold">{userPoints.current.toLocaleString()} P</span>
                    </div>
                  </div>
                </div>

                {/* 결제 후 잔여 포인트 */}
                <div className="mb-4">
                  <div className="bg-[#f3f7ff] rounded-[12px] p-3 flex justify-between items-center">
                    <span className="text-[14px] font-bold text-[#111827]">결제 후 잔여 포인트</span>
                    <span className="text-[18px] font-bold text-[#2f80ed]">{remainingPoints.toLocaleString()} P</span>
                  </div>
                </div>

                {/* 체크박스 */}
                <div className="mb-4 space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentAgreements.serviceAgree}
                      onChange={(e) => setPaymentAgreements((prev) => ({ ...prev, serviceAgree: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 accent-[#2f80ed]"
                    />
                    <span className="text-[12px] text-[#6b7280]">서비스 이용 및 포인트 결제 동의</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentAgreements.refundAgree}
                      onChange={(e) => setPaymentAgreements((prev) => ({ ...prev, refundAgree: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 accent-[#2f80ed]"
                    />
                    <span className="text-[12px] text-[#6b7280]">취소 및 환불 규정 동의</span>
                  </label>
                </div>

                {/* 결제 완료하기 버튼 */}
                <button
                  type="button"
                  className="w-full bg-[#2f80ed] text-white font-semibold py-3 rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePaymentComplete}
                  disabled={!paymentAgreements.serviceAgree || !paymentAgreements.refundAgree}
                >
                  결제 완료하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PC VERSION */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* 뒤로가기 버튼 */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
            >
              뒤로 가기
            </button>
          </div>

          {/* 배너 이미지 & 프로필 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-8">
            {/* 배너 */}
            <div
              className="h-[280px] bg-cover bg-center relative"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(147, 51, 234, 0.7), rgba(79, 70, 229, 0.7)), url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80')",
              }}
            >
              {/* 프로필 사진 */}
              <div className="absolute bottom-0 left-12 transform translate-y-1/2">
                <div className="w-[180px] h-[180px] rounded-full bg-gradient-to-br from-[#e9efff] to-[#d1e0ff] border-8 border-white flex items-center justify-center text-[#2f80ed] font-bold text-6xl shadow-2xl">
                  {counselor.name.slice(0, 1)}
                </div>
              </div>
            </div>

            {/* 프로필 정보 */}
            <div className="pt-24 px-12 pb-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    {counselor.name} <span className="text-gray-600">{counselor.title}</span>
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">{counselor.tags.map((tag) => `#${tag}`).join(' ')}</p>
                  <div className="flex items-center gap-3 text-xl">
                    <span className="text-[#f59e0b]">★★★★★</span>
                    <span className="text-gray-700 font-semibold">({counselor.reviewCount})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowReservation(true);
                    setCalendarMonth(form.date ? new Date(form.date) : new Date());
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-[#2f80ed] to-[#1e40af] text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  상담 예약하기
                </button>
              </div>
            </div>
          </div>

          {reservationDone && (
            <div className="bg-gradient-to-r from-[#c7d2fe] to-[#ddd6fe] rounded-2xl p-6 mb-8 border-2 border-[#6366f1] shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl">✓</div>
                <div className="text-lg text-[#1e3a8a] font-semibold">
                  상담 예약이 완료되었습니다. 2영업일 이내 확인 후 처리될 예정입니다.
                </div>
              </div>
            </div>
          )}

          {/* 상담사 소개 섹션들 */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* 심리상담사 소개 */}
            <section className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-3">심리상담사 소개</h3>
              <p className="text-base text-gray-700 leading-relaxed">{counselor.intro}</p>
            </section>

            {/* 자격 및 경력 */}
            <section className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-3">자격 및 경력</h3>
              <ul className="text-base text-gray-700 list-disc pl-6 space-y-2">
                {counselor.experience.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          {/* 상담 진행 방식 */}
          <section className="bg-white rounded-2xl p-8 shadow-sm mb-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-3">
              상담은 이렇게 진행됩니다
            </h3>
            <ol className="text-base text-gray-700 list-decimal pl-6 space-y-2">
              {counselor.process.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          {/* 상담 요금 */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-gray-200 pb-3">상담 요금</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <div className="w-4 h-4 rounded-full bg-[#22c55e] mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">채팅</p>
                <p className="text-2xl font-bold text-gray-800">{counselor.prices.chat.toLocaleString()}원</p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                <div className="w-4 h-4 rounded-full bg-[#60a5fa] mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">전화</p>
                <p className="text-2xl font-bold text-gray-800">{counselor.prices.call.toLocaleString()}원</p>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 text-center">
                <div className="w-4 h-4 rounded-full bg-[#fb923c] mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">방문</p>
                <p className="text-2xl font-bold text-gray-800">{counselor.prices.visit.toLocaleString()}원</p>
              </div>
            </div>
          </section>

          {/* 상담 리뷰 */}
          <section className="bg-white rounded-2xl p-8 shadow-sm mt-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-gray-200 pb-3">상담 리뷰</h3>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#f59e0b]">★★★★★</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {`이용자 ${idx}`} | {new Date(2026, 0, idx).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-base text-gray-800 leading-relaxed">
                    정말 도움이 많이 되었습니다. 제가 혼자서는 해결하기 어려웠던 고민들을 차근차근 풀어나갈 수
                    있었습니다. 감사합니다!
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* PC 예약 모달 */}
        {showReservation && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl p-8 max-w-[900px] w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">상담 예약하기</h2>
                <button
                  type="button"
                  onClick={() => setShowReservation(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl"
                >
                  ×
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleReservationSubmit}>
                {/* 상담 유형 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">상담 선택</label>
                  <select
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#2f80ed] transition-colors"
                    value={form.type}
                    onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                    required
                  >
                    <option value="">원하는 상담 유형을 선택해주세요</option>
                    <option value="call">전화 상담</option>
                    <option value="chat">채팅 상담</option>
                    <option value="visit">방문 상담</option>
                  </select>
                </div>

                {/* 시간 선택 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">시간 선택</label>
                  <div className="grid grid-cols-2 gap-6">
                    {/* 날짜 선택 캘린더 */}
                    <div className="border-2 border-gray-300 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          className="px-4 py-2 text-base rounded-lg border-2 border-gray-300 hover:bg-gray-50"
                          onClick={() =>
                            setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                          }
                        >
                          이전
                        </button>
                        <span className="text-lg font-bold text-gray-800">
                          {calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월
                        </span>
                        <button
                          type="button"
                          className="px-4 py-2 text-base rounded-lg border-2 border-gray-300 hover:bg-gray-50"
                          onClick={() =>
                            setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                          }
                        >
                          다음
                        </button>
                      </div>
                      <div className="grid grid-cols-7 text-center text-sm text-gray-600 mb-2">
                        {WEEK_DAYS.map((day) => (
                          <span key={day} className="font-semibold">
                            {day}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-base">
                        {monthWeeks.flat().map((dayItem, index) => {
                          if (!dayItem) return <div key={`empty-${index}`} />;
                          const isSelected = form.date === dayItem.dateStr;
                          return (
                            <button
                              key={dayItem.dateStr}
                              type="button"
                              disabled={dayItem.isPast}
                              onClick={() => setForm((prev) => ({ ...prev, date: dayItem.dateStr, time: '' }))}
                              className={`h-12 rounded-lg transition-all ${
                                dayItem.isPast
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-[#2f80ed] text-white font-bold scale-110'
                                  : dayItem.isToday
                                  ? 'border-2 border-[#2f80ed] text-[#2f80ed] font-bold'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {dayItem.day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 시간 선택 */}
                    <div>
                      <p className="text-base font-semibold text-gray-700 mb-3">시간 선택</p>
                      <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-2">
                        {TIME_SLOTS.map((slot) => {
                          const isDisabled = disabledSlots.has(slot) || !form.date;
                          const isSelected = form.time === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setForm((prev) => ({ ...prev, time: slot }))}
                              className={`px-4 py-3 rounded-lg border-2 text-base font-medium transition-all ${
                                isDisabled
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : isSelected
                                  ? 'border-[#2f80ed] bg-[#2f80ed] text-white'
                                  : 'border-gray-300 hover:border-[#2f80ed] hover:bg-[#2f80ed]/10'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                      {!form.date && <p className="text-sm text-gray-500 mt-3">날짜를 먼저 선택해주세요.</p>}
                    </div>
                  </div>
                </div>

                {/* 제목 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">제목</label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#2f80ed] transition-colors"
                    placeholder="제목을 입력해주세요"
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    required
                  />
                </div>

                {/* 상담 내용 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">상담 내용</label>
                  <textarea
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base h-[120px] focus:outline-none focus:border-[#2f80ed] transition-colors resize-none"
                    placeholder="상담 내용을 간단히 입력해주세요"
                    value={form.content}
                    onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                    required
                  />
                </div>

                {/* 버튼 */}
                <div className="flex items-center justify-end gap-4 pt-4">
                  <button
                    type="button"
                    className="px-8 py-3 text-base border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => setShowReservation(false)}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 text-base bg-[#2f80ed] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2670d4] transition-colors font-semibold"
                    disabled={!isFormValid}
                  >
                    완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PC 결제 모달 */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl p-8 max-w-[600px] w-full">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">예약 후 결제하기</h2>
                <span className="text-lg font-semibold text-gray-600">{counselor.name}</span>
              </div>

              {/* 결제 확인 */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">결제확인</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">상담사 :</span>
                    <span className="text-gray-800 font-medium">{counselor.name} 상담사</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">결제일 :</span>
                    <span className="text-gray-800 font-medium">{form.date} {form.time}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">상담 :</span>
                    <span className="text-gray-800 font-medium">
                      {form.type === 'chat' ? '채팅' : form.type === 'call' ? '전화' : '방문'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 최종 결제 */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">최종 결제</h3>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">보유 포인트</span>
                    <span className="text-[#2f80ed] font-bold text-lg">{userPoints.reserved.toLocaleString()} P</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">사용 포인트</span>
                    <span className="text-red-600 font-bold text-lg">-{usedPoints.toLocaleString()} P</span>
                  </div>
                  <div className="h-0.5 bg-gray-200" />
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">결제 포인트</span>
                    <span className="text-gray-800 font-bold text-lg">{finalAmount.toLocaleString()} P</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">현재 포인트</span>
                    <span className="text-[#2f80ed] font-bold text-lg">{userPoints.current.toLocaleString()} P</span>
                  </div>
                </div>
              </div>

              {/* 결제 후 잔여 포인트 */}
              <div className="mb-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">결제 후 잔여 포인트</span>
                  <span className="text-2xl font-bold text-[#2f80ed]">{remainingPoints.toLocaleString()} P</span>
                </div>
              </div>

              {/* 체크박스 */}
              <div className="mb-6 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentAgreements.serviceAgree}
                    onChange={(e) => setPaymentAgreements((prev) => ({ ...prev, serviceAgree: e.target.checked }))}
                    className="w-5 h-5 accent-[#2f80ed]"
                  />
                  <span className="text-base text-gray-700">서비스 이용 및 포인트 결제 동의</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentAgreements.refundAgree}
                    onChange={(e) => setPaymentAgreements((prev) => ({ ...prev, refundAgree: e.target.checked }))}
                    className="w-5 h-5 accent-[#2f80ed]"
                  />
                  <span className="text-base text-gray-700">취소 및 환불 규정 동의</span>
                </label>
              </div>

              {/* 결제 완료하기 버튼 */}
              <button
                type="button"
                className="w-full bg-gradient-to-r from-[#2f80ed] to-[#1e40af] text-white text-lg font-bold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePaymentComplete}
                disabled={!paymentAgreements.serviceAgree || !paymentAgreements.refundAgree}
              >
                결제 완료하기
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CounselorView;
