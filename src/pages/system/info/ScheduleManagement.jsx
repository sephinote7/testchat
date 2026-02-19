import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// TODO: DB 연동 가이드
// 이 페이지는 상담사의 스케줄 관리 페이지입니다
//
// DB 연동 시 필요한 작업:
// 1. 프리셋 조회/저장 API
//    - API: GET /api/counselors/me/schedule/presets
//    - API: POST /api/counselors/me/schedule/presets
//    - 요청 파라미터:
//      {
//        dayType: 'weekday' | 'weekend' | 'custom',
//        customDays: string[], // ['월', '화', '수', '목', '금', '토', '일']
//        timeSlot: 'morning' | 'afternoon' | 'night' | 'custom',
//        customStartTime: string, // 'HH:mm' format
//        customEndTime: string // 'HH:mm' format
//      }
//
// 2. 특정 날짜 스케줄 조회/저장 API
//    - API: GET /api/counselors/me/schedule/date?date={YYYY-MM-DD}
//    - 응답:
//      {
//        schedule: {
//          date: string,
//          isExcluded: boolean, // 해당 날짜 일정 제외 여부
//          availableTimeSlots: string[] // ['09:00', '10:00', '11:00', ...] 선택된 시간대
//        },
//        counsels: [
//          {
//            id: string,
//            title: string,
//            clientName: string,
//            status: 'scheduled' | 'inProgress' | 'completed',
//            date: string,
//            time: string,
//            counselType: 'chat' | 'video' | 'phone'
//          }
//        ]
//      }
//    - API: POST /api/counselors/me/schedule/date
//    - 요청 파라미터:
//      {
//        date: string, // 'YYYY-MM-DD'
//        isExcluded: boolean, // 해당 날짜 일정 제외 여부
//        availableTimeSlots: string[] // ['09:00', '10:00', '11:00', ...] 09:00~22:00 범위에서 선택
//      }
//
// 3. 캘린더에서 날짜 선택 시 해당 날짜의 상담 일정 조회
//    - selectedDate 변경 시 useEffect로 데이터 fetch
//    - 상담 예정/상담진행중/상담완료 상태별로 구분하여 표시

const ScheduleManagement = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 일정 프리셋 상태
  const [presetDayType, setPresetDayType] = useState('weekday'); // 'weekday' | 'weekend' | 'custom'
  const [customDays, setCustomDays] = useState([]); // ['월', '화', '수', '목', '금', '토', '일']
  const [presetTimeSlot, setPresetTimeSlot] = useState('morning'); // 'morning' | 'afternoon' | 'night' | 'custom'
  const [presetCustomStartTime, setPresetCustomStartTime] = useState('09:00');
  const [presetCustomEndTime, setPresetCustomEndTime] = useState('18:00');
  
  // 일별 스케줄 설정 상태
  const [isDateExcluded, setIsDateExcluded] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);

  // TODO: DB 연동 시 프리셋 데이터 가져오기
  // useEffect(() => {
  //   const fetchPresets = async () => {
  //     const response = await fetch('/api/counselors/me/schedule/presets', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     setPresetDayType(data.dayType);
  //     setCustomDays(data.customDays || []);
  //     setPresetTimeSlot(data.timeSlot);
  //     setPresetCustomStartTime(data.customStartTime);
  //     setPresetCustomEndTime(data.customEndTime);
  //   };
  //   fetchPresets();
  // }, []);

  // TODO: DB 연동 시 선택한 날짜의 스케줄 데이터 가져오기
  // useEffect(() => {
  //   const fetchDateSchedule = async () => {
  //     const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
  //     const response = await fetch(`/api/counselors/me/schedule/date?date=${dateStr}`, {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     setIsDateExcluded(data.schedule.isExcluded); // 일정 제외 여부
  //     setSelectedTimeSlots(data.schedule.availableTimeSlots || []); // 선택된 시간대
  //   };
  //   fetchDateSchedule();
  // }, [selectedDate]);

  // ========== 더미 데이터 시작 (DB 연동 시 아래 전체 삭제) ==========
  // 선택한 날짜의 상담 일정 (날짜별로 다른 데이터)
  const allDateCounsels = {
    '2026-02-10': [
      {
        id: 1,
        title: '상담제목 : 취업준비 하는데 진로에 대한 고민이 많아요 상담 받고 싶습니다...',
        clientName: '김철수',
        status: 'scheduled',
        date: '2026.02.10',
        time: '10:00',
        counselType: 'chat',
      },
      {
        id: 2,
        title: '상담제목 : 직장 내 인간관계 스트레스로 힘들어요',
        clientName: '이영희',
        status: 'inProgress',
        date: '2026.02.10',
        time: '14:00',
        counselType: 'video',
      },
      {
        id: 3,
        title: '상담제목 : 가족과의 갈등 해결 방법을 알고 싶습니다',
        clientName: '박민수',
        status: 'completed',
        date: '2026.02.10',
        time: '16:00',
        counselType: 'chat',
      },
    ],
    '2026-02-11': [
      {
        id: 4,
        title: '상담제목 : 우울감이 지속되고 있어요',
        clientName: '최수진',
        status: 'scheduled',
        date: '2026.02.11',
        time: '11:00',
        counselType: 'phone',
      },
      {
        id: 5,
        title: '상담제목 : 불안장애 증상으로 일상생활이 어려워요',
        clientName: '정하늘',
        status: 'scheduled',
        date: '2026.02.11',
        time: '15:00',
        counselType: 'chat',
      },
    ],
    '2026-02-12': [
      {
        id: 6,
        title: '상담제목 : 진로 변경을 고민하고 있습니다',
        clientName: '강민지',
        status: 'inProgress',
        date: '2026.02.12',
        time: '13:00',
        counselType: 'video',
      },
    ],
  };

  // 선택한 날짜의 키 생성
  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 선택한 날짜의 상담 목록
  const selectedDateCounsels = allDateCounsels[getDateKey(selectedDate)] || [];

  // 상태별로 필터링
  const scheduledCounsels = selectedDateCounsels.filter(c => c.status === 'scheduled');
  const inProgressCounsels = selectedDateCounsels.filter(c => c.status === 'inProgress');
  const completedCounsels = selectedDateCounsels.filter(c => c.status === 'completed');
  // ========== 더미 데이터 끝 (여기까지 삭제) ==========

  const handleApplyPreset = () => {
    // TODO: DB에 프리셋 저장
    let message = '';
    
    if (presetDayType === 'weekday') {
      message += '주중 ';
    } else if (presetDayType === 'weekend') {
      message += '주말 ';
    } else {
      message += `${customDays.join(', ')} `;
    }

    if (presetTimeSlot === 'morning') {
      message += '오전(09:00~13:00)';
    } else if (presetTimeSlot === 'afternoon') {
      message += '오후(14:00~18:00)';
    } else if (presetTimeSlot === 'night') {
      message += '심야(18:00~22:00)';
    } else {
      message += `직접입력(${presetCustomStartTime}~${presetCustomEndTime})`;
    }

    alert(`${message} 프리셋이 저장되었습니다.`);
  };

  const toggleCustomDay = (day) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter(d => d !== day));
    } else {
      setCustomDays([...customDays, day]);
    }
  };

  const getTimeSlotRange = () => {
    if (presetTimeSlot === 'morning') return { start: '09:00', end: '13:00' };
    if (presetTimeSlot === 'afternoon') return { start: '14:00', end: '18:00' };
    if (presetTimeSlot === 'night') return { start: '18:00', end: '22:00' };
    return { start: presetCustomStartTime, end: presetCustomEndTime };
  };

  // 월 변경 함수
  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // 시간 슬롯 생성 (09:00 ~ 22:00, 1시간 단위)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  // 시간 슬롯 토글
  const toggleTimeSlot = (time) => {
    if (selectedTimeSlots.includes(time)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(t => t !== time));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, time]);
    }
  };

  // 날짜 선택 시 초기화
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // 선택한 날짜가 현재 표시된 월과 다르면 currentMonth도 업데이트
    if (date.getFullYear() !== currentMonth.getFullYear() || date.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setIsDateExcluded(false);
    setSelectedTimeSlots([]);
    // TODO: DB에서 해당 날짜의 기존 설정 불러오기
  };

  // 일별 스케줄 저장
  const handleSaveDateSchedule = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (isDateExcluded) {
      alert(`${selectedDate.toLocaleDateString('ko-KR')} 일정이 제외되었습니다.`);
      // TODO: DB에 저장
      // const response = await fetch('/api/counselors/me/schedule/date', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     date: dateStr,
      //     isExcluded: true,
      //     availableTimeSlots: []
      //   })
      // });
    } else {
      if (selectedTimeSlots.length === 0) {
        alert('상담 가능한 시간을 최소 1개 이상 선택해주세요.');
        return;
      }
      alert(`${selectedDate.toLocaleDateString('ko-KR')} 상담 가능 시간: ${selectedTimeSlots.sort().join(', ')}`);
      // TODO: DB에 저장
      // const response = await fetch('/api/counselors/me/schedule/date', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     date: dateStr,
      //     isExcluded: false,
      //     availableTimeSlots: selectedTimeSlots.sort()
      //   })
      // });
    }
  };


  const getStatusInfo = (status) => {
    if (status === 'scheduled') {
      return {
        label: '상담 예정',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        buttonColor: 'bg-blue-500 hover:bg-blue-600',
        textColor: 'text-blue-700',
      };
    }
    if (status === 'inProgress') {
      return {
        label: '상담 진행중',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        buttonColor: 'bg-orange-500 hover:bg-orange-600',
        textColor: 'text-orange-700',
      };
    }
    if (status === 'completed') {
      return {
        label: '상담 완료',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        buttonColor: 'bg-green-500 hover:bg-green-600',
        textColor: 'text-green-700',
      };
    }
    return {
      label: '상태 없음',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      buttonColor: 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-gray-700',
    };
  };

  const getCounselTypeLabel = (type) => {
    if (type === 'chat') return { text: '채팅 상담', icon: '💬' };
    if (type === 'video') return { text: '화상 상담', icon: '📹' };
    if (type === 'phone') return { text: '전화 상담', icon: '📞' };
    return { text: '상담', icon: '💬' };
  };

  // 간단한 캘린더 렌더링 (currentMonth 기준)
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks = [];
    let days = [];

    // 빈 칸 추가 (월의 첫날 전까지)
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14"></div>);
    }

    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const isSelected = 
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === day;
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(dateObj)}
          className={`h-14 flex items-center justify-center rounded-lg text-base font-medium transition-colors ${
            isSelected
              ? 'bg-[#2563eb] text-white font-bold'
              : 'text-gray-700 hover:bg-blue-50'
          }`}
        >
          {day}
        </button>
      );

      // 한 주가 끝나면 weeks에 추가
      if (days.length === 7) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">
            {days}
          </div>
        );
        days = [];
      }
    }

    // 남은 날짜 추가
    if (days.length > 0) {
      while (days.length < 7) {
        days.push(<div key={`empty-end-${days.length}`} className="h-14"></div>);
      }
      weeks.push(
        <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">
          {days}
        </div>
      );
    }

    return weeks;
  };

  return (
    <div className="w-full">
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-gray-50 pb-24">
        {/* 헤더 */}
        <div className="bg-blue-600 text-white p-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">스케줄 관리</h1>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">모바일 버전은 지원하지 않습니다. PC에서 이용해주세요.</p>
        </div>
      </div>

      {/* PC VERSION */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl font-bold text-gray-800">상담사 스케줄 관리</h1>
            <button
              onClick={() => navigate('/system/mypage')}
              className="px-8 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
            >
              뒤로 가기
            </button>
          </div>

          {/* 일정 프리셋 섹션 */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">일정 프리셋</h2>
            
            <div className="space-y-6">
              {/* 요일 선택 */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">요일 선택</label>
                <select
                  value={presetDayType}
                  onChange={(e) => {
                    setPresetDayType(e.target.value);
                    if (e.target.value !== 'custom') {
                      setCustomDays([]);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white"
                >
                  <option value="weekday">주중 (월-금)</option>
                  <option value="weekend">주말 (토-일)</option>
                  <option value="custom">직접선택</option>
                </select>

                {/* 직접선택 시 요일 체크박스 */}
                {presetDayType === 'custom' && (
                  <div className="mt-4 flex gap-3">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleCustomDay(day)}
                        className={`flex-1 py-3 rounded-xl text-base font-medium transition-colors ${
                          customDays.includes(day)
                            ? 'bg-[#2563eb] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 시간대 선택 */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">시간대 선택</label>
                <select
                  value={presetTimeSlot}
                  onChange={(e) => setPresetTimeSlot(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white"
                >
                  <option value="morning">오전 (09:00 ~ 13:00)</option>
                  <option value="afternoon">오후 (14:00 ~ 18:00)</option>
                  <option value="night">심야 (18:00 ~ 22:00)</option>
                  <option value="custom">직접입력</option>
                </select>

                {/* 직접입력 시 시간 선택 */}
                {presetTimeSlot === 'custom' && (
                  <div className="mt-4 flex items-center gap-3">
                    <select
                      value={presetCustomStartTime}
                      onChange={(e) => setPresetCustomStartTime(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base bg-white"
                    >
                      {Array.from({ length: 14 }, (_, i) => {
                        const hour = 9 + i;
                        const time = `${hour.toString().padStart(2, '0')}:00`;
                        return (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        );
                      })}
                    </select>
                    <span className="text-gray-600">~</span>
                    <select
                      value={presetCustomEndTime}
                      onChange={(e) => setPresetCustomEndTime(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base bg-white"
                    >
                      {Array.from({ length: 14 }, (_, i) => {
                        const hour = 9 + i;
                        const time = `${hour.toString().padStart(2, '0')}:00`;
                        return (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* 선택한 프리셋 미리보기 */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-base text-gray-700">
                  <span className="font-semibold">선택한 일정: </span>
                  {presetDayType === 'weekday' && '주중 (월-금)'}
                  {presetDayType === 'weekend' && '주말 (토-일)'}
                  {presetDayType === 'custom' && (customDays.length > 0 ? customDays.join(', ') : '요일을 선택해주세요')}
                  {' / '}
                  {presetTimeSlot === 'morning' && '오전 (09:00 ~ 13:00)'}
                  {presetTimeSlot === 'afternoon' && '오후 (14:00 ~ 18:00)'}
                  {presetTimeSlot === 'night' && '심야 (18:00 ~ 22:00)'}
                  {presetTimeSlot === 'custom' && `직접입력 (${presetCustomStartTime} ~ ${presetCustomEndTime})`}
                </p>
              </div>

              <button
                onClick={handleApplyPreset}
                className="w-full px-6 py-3 rounded-xl bg-[#2563eb] text-white text-base font-medium hover:bg-[#1d4ed8] transition-colors"
              >
                프리셋 적용
              </button>
            </div>
          </div>

          {/* 일별 상세 스케줄 설정 */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">일별 상세 스케줄 설정</h2>

            <div className="grid grid-cols-2 gap-8">
              {/* 캘린더 */}
              <div>
                {/* 월/년 네비게이션 */}
                <div className="flex items-center justify-center mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="text-lg font-bold text-gray-800 mx-6 min-w-[140px] text-center">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                  </h3>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* 캘린더 그리드 */}
                {renderCalendar()}
              </div>

              {/* 오른쪽 패널 - 일정 제외 및 시간 설정 */}
              <div className="flex flex-col">
                {/* 일정 제외 옵션 */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">
                    {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정 제외하기
                  </h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDateExcluded}
                      onChange={(e) => setIsDateExcluded(e.target.checked)}
                      className="w-5 h-5 text-[#2563eb] rounded focus:ring-2 focus:ring-[#2563eb]"
                    />
                    <span className="text-sm text-gray-700">이 날짜는 상담 불가</span>
                  </label>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setIsDateExcluded(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveDateSchedule}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
                    >
                      확인
                    </button>
                  </div>
                </div>

                {/* 상담 상세 시간 설정 */}
                {!isDateExcluded && (
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-800">
                        {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 상담 상세 시간 설정
                      </h3>
                      <button
                        onClick={() => {
                          const timeSlot = getTimeSlotRange();
                          const startHour = parseInt(timeSlot.start.split(':')[0]);
                          const endHour = parseInt(timeSlot.end.split(':')[0]);
                          const presetSlots = [];
                          for (let hour = startHour; hour < endHour; hour++) {
                            presetSlots.push(`${hour.toString().padStart(2, '0')}:00`);
                          }
                          setSelectedTimeSlots(presetSlots);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#2563eb] text-[#2563eb] text-xs font-medium hover:bg-blue-50 transition-colors"
                      >
                        프리셋 적용
                      </button>
                    </div>

                    {selectedTimeSlots.length > 0 && (
                      <p className="text-xs text-gray-600 mb-3">
                        선택된 시간: {selectedTimeSlots.length}개 ({selectedTimeSlots.sort().join(', ')})
                      </p>
                    )}
                    
                    {/* 시간 버튼 그리드 */}
                    <div className="grid grid-cols-5 gap-2 mb-6">
                      {generateTimeSlots().map((time) => (
                        <button
                          key={time}
                          onClick={() => toggleTimeSlot(time)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedTimeSlots.includes(time)
                              ? 'bg-[#2563eb] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedTimeSlots([])}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveDateSchedule}
                        className="flex-1 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
                      >
                        확인
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 해당 일자 스케줄 */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                해당 일자 스케줄 ({selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일)
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-base text-gray-600">
                  총 {selectedDateCounsels.length}건
                  {scheduledCounsels.length > 0 && ` (예정 ${scheduledCounsels.length})`}
                  {inProgressCounsels.length > 0 && ` (진행중 ${inProgressCounsels.length})`}
                  {completedCounsels.length > 0 && ` (완료 ${completedCounsels.length})`}
                </span>
              </div>
            </div>

            {selectedDateCounsels.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <p className="text-lg text-gray-500">해당 날짜에 예정된 상담이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 상담 예정 */}
                {scheduledCounsels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      상담 예정 ({scheduledCounsels.length}건)
                    </h3>
                    <div className="space-y-3">
                      {scheduledCounsels.map((counsel) => {
                        const statusInfo = getStatusInfo(counsel.status);
                        const typeInfo = getCounselTypeLabel(counsel.counselType);
                        return (
                          <div
                            key={counsel.id}
                            className={`rounded-2xl shadow-sm p-6 flex items-center justify-between border-2 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-base font-medium text-gray-800 line-clamp-1 flex-1">
                                  {counsel.title}
                                </h4>
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                  {typeInfo.icon} {typeInfo.text}
                                </span>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <span>상담자 : {counsel.clientName}</span>
                                <span className={`font-medium ${statusInfo.textColor}`}>{statusInfo.label}</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                예약시간 : {counsel.time}
                              </p>
                            </div>
                            <button
                              onClick={() => navigate(`/system/info/counsel/${counsel.id}`)}
                              className={`ml-6 px-8 py-3 rounded-xl text-white text-base font-medium transition-colors ${statusInfo.buttonColor}`}
                            >
                              상담 보기
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 상담 진행중 */}
                {inProgressCounsels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      상담 진행중 ({inProgressCounsels.length}건)
                    </h3>
                    <div className="space-y-3">
                      {inProgressCounsels.map((counsel) => {
                        const statusInfo = getStatusInfo(counsel.status);
                        const typeInfo = getCounselTypeLabel(counsel.counselType);
                        return (
                          <div
                            key={counsel.id}
                            className={`rounded-2xl shadow-sm p-6 flex items-center justify-between border-2 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-base font-medium text-gray-800 line-clamp-1 flex-1">
                                  {counsel.title}
                                </h4>
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                  {typeInfo.icon} {typeInfo.text}
                                </span>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <span>상담자 : {counsel.clientName}</span>
                                <span className={`font-medium ${statusInfo.textColor}`}>{statusInfo.label}</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                예약시간 : {counsel.time}
                              </p>
                            </div>
                            <button
                              onClick={() => navigate(`/system/info/counsel/${counsel.id}`)}
                              className={`ml-6 px-8 py-3 rounded-xl text-white text-base font-medium transition-colors ${statusInfo.buttonColor}`}
                            >
                              상담 보기
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 상담 완료 */}
                {completedCounsels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      상담 완료 ({completedCounsels.length}건)
                    </h3>
                    <div className="space-y-3">
                      {completedCounsels.map((counsel) => {
                        const statusInfo = getStatusInfo(counsel.status);
                        const typeInfo = getCounselTypeLabel(counsel.counselType);
                        return (
                          <div
                            key={counsel.id}
                            className={`rounded-2xl shadow-sm p-6 flex items-center justify-between border-2 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-base font-medium text-gray-800 line-clamp-1 flex-1">
                                  {counsel.title}
                                </h4>
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                  {typeInfo.icon} {typeInfo.text}
                                </span>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <span>상담자 : {counsel.clientName}</span>
                                <span className={`font-medium ${statusInfo.textColor}`}>{statusInfo.label}</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                예약시간 : {counsel.time}
                              </p>
                            </div>
                            <button
                              onClick={() => navigate(`/system/info/counsel/${counsel.id}`)}
                              className={`ml-6 px-8 py-3 rounded-xl text-white text-base font-medium transition-colors ${statusInfo.buttonColor}`}
                            >
                              상담 보기
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;
