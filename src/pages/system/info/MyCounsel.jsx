import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import {
  fetchAllCounsels,
  fetchConsultationCategoryCounts,
  fetchConsultationStatusCounts,
  fetchCounselsBeforeAccept,
  fetchDailyReservationCompletionTrend,
  fetchMostConsultedType,
  fetchMyRevenueSummary,
} from '../../../api/counselApi';
import { useAuthStore } from '../../../store/auth.store';
import { cnslApi } from '../../../api/backendApi';

// TODO: DB 연동 가이드
// 이 페이지는 상담사의 수익성 분석 대시보드입니다
//
// DB 연동 시 필요한 작업:
// 1. 활동 통계 조회 API
//    - API: GET /api/counselors/me/activity-stats?period={period}
//    - period: '전체' | '이번주' | '이번달' | '3개월'
//    - 응답:
//      {
//        // 기간 내 상담 건수
//        totalCount: number,          // 전체
//        phoneCount: number,          // 전화
//        riskCount: number,           // 위험
//        completedCount: number,      // 완료
//        counselingCount: number,     // 상담
//        visitCount: number,          // 방문
//        reservationCount: number,    // 예약
//        chatCount: number,           // 채팅
//
//        // 기간 내 활동 건수
//        riskCount: number,           // 위험군 상담 건수
//        completedConsultCount: number, // 완료 상담 건수
//        reservedConsultCount: number,  // 예약 상담 건수
//        totalConsultCount: number      // 전체 상담 건수
//      }
//
// 2. 수익 정보 조회 API
//    - API: GET /api/counselors/me/revenue?period={period}
//    - period: '전체' | '이번주' | '이번달' | '3개월'
//    - 응답:
//      {
//        totalRevenue: number,      // 금일 기준 총 수익
//        totalExpense: number,      // 금일 지출 총
//        netProfit: number,         // 순이익 (수익 - 지출)
//        monthlyEstimate: number    // 개월별 예상 수익
//      }
//
// 3. 주간 활동 타임라인 조회 API
//    - API: GET /api/counselors/me/weekly-timeline?period={period}
//    - period: '전체' | '이번주' | '이번달' | '3개월'
//    - 응답:
//      {
//        period: string,            // 기간 표시용 (예: "2025.02.02 ~ 2025.03.01")
//        timeline: [
//          {
//            day: string,           // 월, 화, 수, 목, 금, 토, 일
//            reservedCount: number, // 예약 건수
//            completedCount: number // 완료 건수
//          }
//        ]
//      }
//
// 4. 상담 내역 조회 API (최근 5개)
//    - API: GET /api/counselors/me/counsels?limit=5&sort=recent&period={period}
//    - 응답:
//      {
//        counsels: [
//          {
//            id: string,
//            title: string,
//            clientName: string,
//            date: string,
//            status: string,        // '상담 예약', '상담 완료', etc
//            type: string           // chat, call, visit
//          }
//        ]
//      }
//
// 5. 예약 관리 조회 API (최근 5개)
//    - API: GET /api/counselors/me/reservations?limit=5&status=pending,confirmed&period={period}
//    - 응답:
//      {
//        reservations: [
//          {
//            id: string,
//            title: string,
//            clientName: string,
//            date: string,
//            status: string,
//            type: string
//          }
//        ]
//      }

const MyCounsel = () => {
  const navigate = useNavigate();
  const [periodFilter, setPeriodFilter] = useState('전체'); // 전체, 일주일, 1개월, 3개월
  const [loading, setLoading] = useState(false);

  // TODO: DB 연동 시 state로 관리
  const [activityStats, setActivityStats] = useState(null);
  const [activityStatsCate, setActivityStatsCate] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [weeklyTimeline, setWeeklyTimeline] = useState([]);
  const [counselHistory, setCounselHistory] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [topCnslType, setTopCnslType] = useState(null);

  const { email } = useAuthStore();

  // 날짜 포맷 계산(date -> string) 함수 (날짜 계산 완료 후 사용해야 함)
  const formatDate = (date) => date.toISOString().split('T')[0];
  let startDate = new Date(),
    endDate = new Date();
  const today = new Date();
  const oneWeekAgo = new Date();

  oneWeekAgo.setDate(today.getDate() - 6);

  // 내 상담 내역 · 상담 예약 관리 API 연동 (백엔드 member_id = 이메일 사용)
  useEffect(() => {
    // 날짜 계산
    if (periodFilter === '전체' || !periodFilter) {
      startDate = new Date(1000, 1, 1); // month는 0부터 시작
      endDate = new Date(9999, 11, 31);
    } else if (periodFilter === '일주일') {
      startDate.setDate(endDate.getDate() - 6);
    } else if (periodFilter === '1개월') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else {
      // 3개월
      startDate.setMonth(endDate.getMonth() - 3);
    }
    // const loadData = async () => {
    //   try {
    //     setLoading(true);
    //     // const [activity, revenue, timeline, history, reservationsList] = await Promise.all([
    //     //   fetch('/api/counselors/me/activity-stats?period=' + periodFilter).then(r => r.json()),
    //     //   fetch('/api/counselors/me/revenue?period=' + periodFilter).then(r => r.json()),
    //     //   fetch('/api/counselors/me/weekly-timeline?period=' + periodFilter).then(r => r.json()),
    //     //   fetch('/api/counselors/me/counsels?limit=5&sort=recent&period=' + periodFilter).then(r => r.json()),
    //     //   fetch('/api/counselors/me/reservations?limit=5&status=pending,confirmed&period=' + periodFilter).then(r => r.json())
    //     // ]);
    //     // setActivityStats(activity);
    //     // setRevenueData(revenue);
    //     // setWeeklyTimeline(timeline);
    //     // setCounselHistory(history.counsels);
    //     // setReservations(reservationsList.reservations);
    //   } catch (error) {
    //     console.error('데이터 로드 실패:', error);
    //     // TODO: 에러 처리 (토스트 메시지 등)
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // 모든 상담 리스트
    const getAllList = async () => {
      const { content: data } = await fetchAllCounsels({
        page: 0,
        size: 5,
        cnslerId: email,
      });

      setCounselHistory(data);
    };

    // 상담 수락 전 리스트
    const getBeforAcceptList = async () => {
      const { content: data } = await fetchCounselsBeforeAccept({
        page: 0,
        size: 5,
        cnslerId: email,
      });
      setReservations(data);
    };

    // 기간 내 상담 건수 : 상담 상태별
    const getConsultationStatusCounts = async () => {
      const data = await fetchConsultationStatusCounts({
        cnslerId: email,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });

      setActivityStats({ ...data });
    };

    // 기간 내 상담 건수 + 수익 : 카테고리별
    const getConsultationCategoryCounts = async () => {
      const data = await fetchConsultationCategoryCounts({
        cnslerId: email,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });

      console.log(data);
      setActivityStatsCate(data);
    };

    // 최근 일주일 일자별 예약 및 완료 건수 추이 : 그래프에 쓰일 메서드
    const getDailyReservationCompletionTrend = async () => {
      const data = await fetchDailyReservationCompletionTrend({
        cnslerId: email,
        startDate: formatDate(oneWeekAgo),
        endDate: formatDate(endDate),
      });

      setWeeklyTimeline(data);
    };

    // 선택 기간 내 수익, 최근 3달 수익
    const getMyRevenueSummary = async () => {
      const data = await fetchMyRevenueSummary({
        cnslerId: email,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });

      setRevenueData(data);
    };

    // 가장 많은 상담 유형
    const getMostConsultedType = async () => {
      const data = await fetchMostConsultedType({
        cnslerId: email,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });

      setTopCnslType(data);
    };

    getAllList();
    getBeforAcceptList();
    getConsultationStatusCounts();
    getConsultationCategoryCounts();
    getDailyReservationCompletionTrend();
    getMyRevenueSummary();
    getMostConsultedType();
    // loadData(); // TODO: DB 연동 시 주석 해제
  }, [periodFilter, email]);

  // useEffect(() => {
  //   const cnslerId = email;
  //   if (!cnslerId) {
  //     setCounselHistory([]);
  //     setReservations([]);
  //     return;
  //   }
  //   let cancelled = false;
  //   setLoading(true);
  //   Promise.all([
  //     cnslApi.getListByCounselor(cnslerId, { page: 0, size: 5 }, cnslerId),
  //     cnslApi.getRsvListByCounselor(cnslerId, { page: 0, size: 5 }, cnslerId),
  //   ])
  //     .then(([listRes, rsvRes]) => {
  //       if (cancelled) return;
  //       const listContent = listRes.content || [];
  //       setCounselHistory(
  //         listContent.map((row) => ({
  //           id: row.cnslId,
  //           title: row.cnslTitle
  //             ? `상담제목 : ${row.cnslTitle}`
  //             : '상담제목 없음',
  //           clientName: row.nickname ?? '-',
  //           date: row.dtTime ?? '-',
  //           status: row.statusText ?? '상담',
  //           type: 'chat',
  //         })),
  //       );
  //       const rsvContent = rsvRes.content || [];
  //       setReservations(
  //         rsvContent.map((row) => ({
  //           id: row.cnslId,
  //           title: row.cnslTitle
  //             ? `상담제목 : ${row.cnslTitle}`
  //             : '상담제목 없음',
  //           clientName: row.nickname ?? '-',
  //           date: row.dtTime ?? '-',
  //           status: '상담 예약',
  //           type: 'chat',
  //         })),
  //       );
  //     })
  //     .catch((err) => {
  //       if (!cancelled) {
  //         setCounselHistory([]);
  //         setReservations([]);
  //         console.error('상담/예약 목록 로드 실패:', err);
  //       }
  //     })
  //     .finally(() => {
  //       if (!cancelled) setLoading(false);
  //     });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [email]);

  // codeName별로 cnslCount 합산 함수
  const getTotalCountByCodeName = (data, codeName) => {
    if (!Array.isArray(data)) return 0;

    // 해당 codeName인 항목만 필터 후, cnslCount 합산
    return data
      .filter((item) => item.codeName?.trim() === codeName)
      .reduce((sum, item) => sum + (item.cnslCount || 0), 0);
  };

  // 기간 내 상담 건수 데이터
  const counselCountData = activityStats
    ? [
        {
          label: '전체',
          count: activityStats?.count || 0,
          color: 'bg-blue-500',
        },
        {
          label: '화상',
          count: getTotalCountByCodeName(activityStatsCate, '화상') || 0,
          color: 'bg-blue-500',
        },
        {
          label: '위험',
          count: activityStats.riskCount || 0,
          color: 'bg-red-500',
        },
        {
          label: '전화',
          count: getTotalCountByCodeName(activityStatsCate, '전화') || 0,
          color: 'bg-red-500',
        },
        {
          label: '완료',
          count: activityStats?.cnslDoneCnt || 0,
          color: 'bg-cyan-400',
        },
        {
          label: '채팅',
          count: getTotalCountByCodeName(activityStatsCate, '채팅') || 0,
          color: 'bg-cyan-400',
        },
        {
          label: '예약',
          count: activityStats?.cnslReqCnt || 0,
          color: 'bg-yellow-400',
        },
        {
          label: '게시판',
          count: getTotalCountByCodeName(activityStatsCate, '게시판') || 0,
          color: 'bg-yellow-400',
        },
        {
          label: '방문',
          count: getTotalCountByCodeName(activityStatsCate, '방문') || 0,
          color: 'bg-yellow-400',
        },
      ]
    : [];

  // 기간 내 활동 건수 데이터
  const activityCountData = activityStats
    ? [
        {
          label: '위험군 상담 건수',
          count: activityStats.riskCount || 0,
          icon: '🚨',
        },
        {
          label: '완료 상담 건수',
          count: activityStats?.cnslDoneCnt || 0,
          icon: '✅',
        },
        {
          label: '예약 상담 건수',
          count: activityStats?.cnslReqCnt || 0,
          icon: '📅',
        },
        {
          label: '전체 상담 건수',
          count: activityStats?.count || 0,
          icon: '📊',
        },
      ]
    : [];

  // 그래프 최대값 계산 (TODO: DB 연동 시 activityStats, counselData에서 계산)
  const maxCounselValue = Math.max(...counselCountData.map((d) => d.count), 1);

  const revenue = revenueData || {
    totalRevenue: 1000000,
    totalExpense: 550000,
    netProfit: 200000,
    monthlyEstimate: 0,
  };

  // 주간 그래프 데이터 (TODO: DB 연동 시 weeklyTimeline 사용)
  // const weeklyData =
  //   weeklyTimeline?.length > 0
  //     ? weeklyTimeline.map((item) => ({
  //         day: item.cnslDt,
  //         reservedCount: item.cnslReqCnt,
  //         completedCount: item.cnslDoneCnt,
  //       }))
  //     : Array.from({ length: 7 }, (_, i) => {
  //         const date = new Date(oneWeekAgo); // 복사 (중요)
  //         date.setDate(date.getDate() + i); // 하루씩 증가

  //         return {
  //           day: formatDate(date),
  //           reservedCount: 0,
  //           completedCount: 0,
  //         };
  //       });
  // 아래 껄로 대체

  // 최근 7일 기본 배열 생성
  const baseDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(oneWeekAgo);
    date.setDate(date.getDate() + i);

    return {
      day: formatDate(date),
      reservedCount: 0,
      completedCount: 0,
    };
  });

  // DB 데이터 Map으로 변환 (조회 성능 ↑)
  const dataMap = new Map(
    (weeklyTimeline || []).map((item) => [
      item.cnslDt,
      {
        reservedCount: item.cnslReqCnt,
        completedCount: item.cnslDoneCnt,
      },
    ]),
  );

  // 날짜 기준으로 병합
  const weeklyData = baseDates.map((dayItem) => {
    const found = dataMap.get(dayItem.day);

    return found ? { ...dayItem, ...found } : dayItem;
  });

  const maxWeeklyValue = Math.max(...weeklyData.map((d) => Math.max(d.reservedCount, d.completedCount)), 1);

  // 상담 내역 더미 데이터 (TODO: DB 연동 시 counselHistory 사용)
  const counselHistoryData =
    counselHistory?.length > 0
      ? counselHistory.map((item) => ({
          id: item.cnslId,
          title: item.cnslTitle,
          clientName: item.nickname,
          date: item.dtTime,
          status: item.statusText,
          respYn: item.respYn,
        }))
      : [];

  // 예약 관리 더미 데이터 (TODO: DB 연동 시 reservations 사용)
  const reservationsData =
    reservations?.length > 0
      ? reservations.map((item) => ({
          id: item.cnslId,
          title: item.cnslTitle,
          clientName: item.nickname,
          date: item.dtTime,
          status: '상담 예약',
        }))
      : [];

  // 핸들러 함수들
  const handleViewAllHistory = () => {
    navigate('/system/info/counsel-history-list');
  };

  const handleViewAllReservations = () => {
    navigate('/system/info/counsel-reservation-list');
  };

  const handleViewDetail = (counselId) => {
    navigate(`/system/info/counsel/${counselId}`);
  };

  // 로딩 중일 때 (TODO: DB 연동 시 활성화)
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-[#f3f7ff] flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">데이터를 불러오는 중...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full">
      <div className="w-full min-h-screen bg-[#f3f7ff] px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="max-w-[1520px] mx-auto">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
            <h1 className="text-[24px] sm:text-[30px] font-semibold text-gray-800">상담 내역</h1>
            <button
              onClick={() => navigate('/system/mypage')}
              className="cursor-pointer px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
            >
              뒤로 가기
            </button>
          </div>

          {/* 활동 내역 요약 */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-0">
              <h2 className="text-[20px] sm:text-[24px] font-semibold text-gray-800">활동 내역 요약</h2>

              {/* 기간 필터 버튼 */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {['전체', '일주일', '1개월', '3개월'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPeriodFilter(filter)}
                    className={`cursor-pointer px-4 sm:px-6 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      periodFilter === filter
                        ? 'bg-[#2563eb] text-white shadow-lg border-[#2563eb]'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-[#2563eb]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              {/* 기간 내 상담 건수 */}
              <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                <h3 className="text-[18px] sm:text-[20px] font-bold text-gray-800 mb-6">기간 내 상담 건수</h3>
                <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3">
                  {counselCountData.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 ${item.label === '방문' ? 'col-start-2 justify-end' : null}`}
                    >
                      <span className="text-sm text-gray-700 font-medium min-w-[45px]">{item.label} :</span>
                      <span
                        className={`text-base font-bold ${
                          item.label === '전체' || item.label === '화상'
                            ? 'text-blue-600'
                            : item.label === '위험' || item.label === '전화'
                              ? 'text-red-600'
                              : item.label === '완료' || item.label === '채팅'
                                ? 'text-cyan-600'
                                : 'text-yellow-600'
                        }`}
                      >
                        {item.count}
                      </span>
                      <div className="flex-1">
                        <div className="h-4 sm:h-5 bg-gray-200 rounded overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${item.color}`}
                            style={{
                              width: `${(item.count / maxCounselValue) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 기간 내 활동 건수 */}
              <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2 sm:gap-0">
                  <h3 className="text-[18px] sm:text-[20px] font-bold text-gray-800">기간 내 활동 건수</h3>
                  <button
                    onClick={() => navigate('/system/info/risk-cases')}
                    className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors mt-2 sm:mt-0"
                  >
                    위험군 조치 내역 &gt;
                  </button>
                </div>
                <div className="space-y-4">
                  {activityCountData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 font-medium mb-1">{item.label}</p>
                        <p className="text-2xl font-bold text-blue-600">{item.count} 건</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 내 수익 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
              <h3 className="text-[16px] sm:text-[18px] font-medium text-gray-800 mb-6">내 수익</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-20">
                {/* 포인트 아이콘 */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl">💰</span>
                  </div>
                </div>

                {/* 수익 정보 */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-6 mt-4 sm:mt-5">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">선택 기간 총 매출액</p>
                    <p className="text-xl font-bold text-blue-600">{revenue[0]?.cnslPriceSum}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">차감 수수료</p>
                    <p className="text-xl font-bold text-red-600">{revenue[0]?.cnslPriceCmsn}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">정산 예정 금액</p>
                    <p className="text-xl font-bold text-green-600">{revenue[0]?.cnslExctAmt}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">최근 3개월 매출액</p>
                    <p className="text-xl font-bold text-gray-800">{revenue[1]?.cnslPriceSum}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">가장 많은 상담 유형</p>
                    <p className="text-xl font-bold text-gray-800">{topCnslType?.cnslTpNm || ''}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 주간 그래프 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] sm:text-[18px] font-medium text-gray-800">
                  {formatDate(oneWeekAgo)} ~ {formatDate(endDate)}
                </h3>
              </div>
              <div className="relative sm:h-64 h-75">
                <div className="flex items-end justify-around h-full pb-8 gap-2 sm:gap-4">
                  {weeklyData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 flex-1">
                      <div className="relative w-full flex items-end justify-center gap-2" style={{ height: '200px' }}>
                        {/* 예약 건수 */}
                        <div
                          className="bg-cyan-400 rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${(data.reservedCount / maxWeeklyValue) * 100}%`,
                            width: '40%',
                            minHeight: data.reservedCount > 0 ? '8px' : '0',
                          }}
                        ></div>
                        {/* 완료 건수 */}
                        <div
                          className="bg-teal-500 rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${(data.completedCount / maxWeeklyValue) * 100}%`,
                            width: '40%',
                            minHeight: data.completedCount > 0 ? '8px' : '0',
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                  <span className="text-sm text-gray-600">예약 건수</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-500 rounded"></div>
                  <span className="text-sm text-gray-600">완료 건수</span>
                </div>
              </div>
            </div>

            {/* 내 상담 내역 */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-0">
                <h2 className="text-[20px] sm:text-[24px] font-semibold text-gray-800">내 상담 내역</h2>
                <button
                  onClick={handleViewAllHistory}
                  className="px-4 sm:px-6 py-2 rounded-xl bg-[#2563eb] text-white text-base font-medium hover:bg-[#1d4ed8] transition-colors cursor-pointer"
                >
                  전체 보기
                </button>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="py-8 text-center text-gray-500">내 상담 내역을 불러오는 중...</div>
                ) : counselHistoryData.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 sm:p-8 text-center text-gray-500 border border-gray-200">
                    상담 내역이 없습니다.
                  </div>
                ) : (
                  counselHistoryData.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handleViewDetail(item.id)}
                      className={`bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:shadow-lg transition-all ${
                        idx === 0 ? 'bg-cyan-50' : idx === 1 ? 'bg-blue-50' : idx === 2 ? 'bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-gray-800 mb-2">{item.title}</h3>
                        <div className="flex flex-col gap-2.5 text-sm text-gray-600">
                          <span>상담자 : {item.clientName}</span>
                          <div className="flex flex-col sm:flex-row justify-between">
                            <span>
                              상태 :{' '}
                              <span
                                className={
                                  item.status === '상담 예정'
                                    ? 'text-[#2563eb]'
                                    : item.status === '상담 진행 중'
                                      ? 'text-[#ff8d28]'
                                      : 'text-chat'
                                }
                              >
                                {item.status}
                              </span>
                            </span>
                            <span className="text-[#ff8d28] mt-1 sm:mt-0">
                              {item.respYn === '답변 필요' ? '답변 필요' : null}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.status === '상담 완료' ? '완료 일시' : '예약 일시'} : {item.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 상담 예약 관리 */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-0">
                <h2 className="text-[20px] sm:text-[24px] font-semibold text-gray-800">상담 예약 관리</h2>
                <button
                  onClick={handleViewAllReservations}
                  className="px-4 sm:px-6 py-2 rounded-xl bg-[#2563eb] text-white text-base font-medium hover:bg-[#1d4ed8] transition-colors cursor-pointer"
                >
                  전체 보기
                </button>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="py-8 text-center text-gray-500">상담 예약 목록을 불러오는 중...</div>
                ) : reservationsData.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 sm:p-8 text-center text-gray-500 border border-gray-200">
                    수락 대기 중인 상담 예약이 없습니다.
                  </div>
                ) : (
                  reservationsData.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleViewDetail(item.id)}
                      className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:shadow-lg transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-gray-800 mb-2">{item.title}</h3>
                        <div className="flex flex-col gap-2.5 text-sm text-gray-600">
                          <span>상담자 : {item.clientName}</span>
                          <span>
                            상태 : <span className="text-[#2563eb]">{item.status}</span>
                          </span>
                          <p className="text-sm text-gray-500">예약 일시 : {item.date}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCounsel;
