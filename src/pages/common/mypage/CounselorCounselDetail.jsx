import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const CounselorCounselDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 모달 상태
  const [showCancelCompleteModal, setShowCancelCompleteModal] = useState(false);
  const [showCannotEditModal, setShowCannotEditModal] = useState(false);
  const [showEditCompleteModal, setShowEditCompleteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewCompleteModal, setShowReviewCompleteModal] = useState(false);
  const [showCannotReviewModal, setShowCannotReviewModal] = useState(false);

  // 리뷰 데이터
  const [rating, setRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');

  // TODO: DB 연동 시 API 호출로 대체 필요
  // - 상담 상세 정보 조회: GET /api/counsels/counselor/:id
  // - 상담 상태 값:
  //   * '상담 완료' - 리뷰 작성하기 버튼 표시
  //   * '상담 예약 대기' - 대기 안내 메시지 표시
  //   * '상담 예약 (완료)' - 상담 수정/취소 버튼 표시
  //   * '상담 예약 취소' - 취소 안내 메시지 표시
  // - 리뷰 작성: POST /api/reviews
  // - 상담 수정: PUT /api/counsels/:id
  // - 상담 취소: DELETE /api/counsels/:id

  // 더미 데이터 - id에 따라 다른 상태 (테스트용)
  // id 1: 상담 완료 (채팅) → 리뷰 작성하기 버튼
  // id 2: 상담 예약 대기 → 대기 안내 메시지
  // id 3: 상담 예약 (완료) → 수정하기/취소하기 버튼
  // id 4: 상담 예약 취소 → 취소 안내 메시지
  // id 5: 상담 완료 (채팅) → 리뷰 작성하기 버튼
  const getCounselDetail = (counselId) => {
    const counselors = {
      1: {
        id: counselId,
        title: 'LN다무맛은일이있었어힘들다...',
        reservationDate: '2026-01-14',
        reservationTime: '16:00',
        status: '상담 완료',
        counselType: 'chat', // 'chat' | 'video' | 'phone'
        requester: '임삼미',
        content:
          '해야 할 일은 과감히 하라, 결심한 일은 반드시 실행하라. -맨자위 프랭클린.\n\n우리 인생에서 해야 할 일이 참 많지요. 또 새해에 계획하고 결심한 일들도 참 많겠죠. -그렇지만 여건 상 못하거나 완벽하지 못하는 일들이만기도 합니다.',
        counselor: {
          name: '아무지',
          title: '상담사',
          specialty: '고민상담, 커리어상담, 취업상담',
          sessions: 888,
          tags: ['고민상담', '커리어상담', '취업상담'],
        },
        chatMessages: [
          {
            id: 1,
            sender: 'counselor',
            message:
              '"안녕하세요, 트로스트 고객센터입니다\n어떠에서 회원 분들을 선택해주세요.\n* 고객센터 운영시간 : 평일 10시~17시\n(점심시간 12시~13시 30분, 주말 및 공휴일 제외)',
            time: '오후 4:06',
          },
          {
            id: 2,
            sender: 'user',
            message: '일반 회원',
            time: '오후 4:08',
          },
          {
            id: 3,
            sender: 'counselor',
            message: '궁금한 내용을 알려주시면 자세한 안내를 도와드릴게요!',
            time: '오후 4:08',
          },
          {
            id: 4,
            sender: 'user',
            message: '명상 / ASMR',
            time: '오후 4:08',
          },
        ],
        completedDate: '2026-01-14', // 상담 완료 날짜
      },
      2: {
        id: counselId,
        title: '취업 준비 관련 상담',
        reservationDate: '2026-02-05', // 미래 날짜로 수정
        reservationTime: '14:00',
        status: '상담 예약 대기',
        counselType: 'video',
        requester: '임삼미',
        content: '취업 준비가 너무 막막해서 상담 신청합니다. 이력서 작성부터 면접 준비까지 도움이 필요합니다.',
        counselor: {
          name: '김전문',
          title: '상담사',
          specialty: '취업상담, 면접코칭',
          sessions: 520,
          tags: ['취업상담', '면접코칭', '이력서첨삭'],
        },
      },
      3: {
        id: counselId,
        title: '진로 고민 상담',
        reservationDate: '2026-02-10', // 미래 날짜로 수정 (수정/취소 버튼 활성화)
        reservationTime: '15:00',
        status: '상담 예약 (완료)',
        counselType: 'phone',
        requester: '임삼미',
        content: '진로 선택에 대해 고민이 많아서 상담을 받고 싶습니다.',
        counselor: {
          name: '박진로',
          title: '상담사',
          specialty: '진로상담, 커리어코칭',
          sessions: 650,
          tags: ['진로상담', '커리어코칭'],
        },
      },
      4: {
        id: counselId,
        title: '스트레스 관리 상담',
        reservationDate: '2026-01-15',
        reservationTime: '11:00',
        status: '상담 예약 취소',
        counselType: 'chat',
        requester: '임삼미',
        content: '최근 스트레스가 심해서 상담을 받고 싶었으나 일정상 취소하게 되었습니다.',
        counselor: {
          name: '최상담',
          title: '상담사',
          specialty: '심리상담, 스트레스관리',
          sessions: 720,
          tags: ['심리상담', '스트레스관리'],
        },
        cancelDate: '2026-01-13',
      },
      5: {
        id: counselId,
        title: '대인관계 고민 상담 (채팅)',
        reservationDate: '2026-01-13',
        reservationTime: '10:00',
        status: '상담 완료',
        counselType: 'chat',
        requester: '임삼미',
        content:
          '직장 내 대인관계에 대한 고민이 있습니다. 동료들과의 소통이 어렵고, 상사와의 관계도 원활하지 않아 스트레스를 많이 받고 있습니다. 어떻게 관계를 개선할 수 있을까요?',
        counselor: {
          name: '이채팅',
          title: '상담사',
          specialty: '대인관계상담, 직장생활코칭',
          sessions: 450,
          tags: ['대인관계상담', '직장생활코칭', '커뮤니케이션'],
        },
        chatMessages: [
          {
            id: 1,
            sender: 'counselor',
            message:
              '안녕하세요, 이채팅 상담사입니다.\n직장 내 대인관계로 고민이 많으시군요.\n\n먼저 현재 상황에 대해 조금 더 자세히 말씀해주시겠어요?\n어떤 부분이 가장 힘드신가요?',
            time: '오전 10:02',
          },
          {
            id: 2,
            sender: 'user',
            message:
              '동료들과 대화할 때 제 의견을 제대로 전달하지 못하겠어요. 말을 하려고 하면 긴장되고, 나중에 생각해보면 더 잘 말할 수 있었을 것 같은데 그 순간에는 말이 안 나와요.',
            time: '오전 10:05',
          },
          {
            id: 3,
            sender: 'counselor',
            message:
              '그런 상황이 정말 답답하셨겠어요. 많은 분들이 비슷한 어려움을 겪으십니다.\n\n몇 가지 팁을 드리자면:\n1. 중요한 회의 전에 말할 내용을 미리 정리해보세요\n2. 짧고 명확한 문장으로 말하는 연습을 하세요\n3. 완벽하게 말하려는 압박감을 내려놓으세요\n\n천천히 연습하시면 분명 나아질 거예요.',
            time: '오전 10:07',
          },
          {
            id: 4,
            sender: 'user',
            message: '상사와의 관계는 어떻게 개선할 수 있을까요? 항상 눈치를 보게 되고 불편해요.',
            time: '오전 10:10',
          },
          {
            id: 5,
            sender: 'counselor',
            message:
              '상사와의 관계 개선은 시간이 필요합니다.\n\n추천 방법:\n- 정기적으로 업무 진행상황을 공유하세요\n- 피드백을 받을 때는 방어적이지 않게 경청하세요\n- 작은 성과라도 보고하며 신뢰를 쌓아가세요\n\n관계는 하루아침에 바뀌지 않지만, 꾸준히 노력하면 개선될 수 있어요.',
            time: '오전 10:12',
          },
          {
            id: 6,
            sender: 'user',
            message: '좋은 조언 감사합니다. 하나씩 실천해보겠습니다. 오늘 상담이 정말 도움이 되었어요!',
            time: '오전 10:15',
          },
          {
            id: 7,
            sender: 'counselor',
            message:
              '도움이 되셨다니 다행입니다! 😊\n\n변화는 작은 실천에서 시작됩니다. 응원하겠습니다!\n\n다음에 또 궁금한 점이 있으시면 언제든 연락주세요.',
            time: '오전 10:16',
          },
        ],
        completedDate: '2026-01-13',
      },
    };

    return counselors[counselId] || counselors['1'];
  };

  const counselDetail = getCounselDetail(id);

  // 리뷰 작성 가능 여부 확인 (상담 완료 상태면 모두 가능)
  const canWriteReview = () => {
    return counselDetail.status === '상담 완료';
  };

  // 예약 수정/취소 가능 여부 (1일 전까지)
  const canEditOrCancel = () => {
    const reservationDate = new Date(counselDetail.reservationDate);
    const today = new Date();
    const diffTime = reservationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 1;
  };

  const handleCancelClick = () => {
    if (canEditOrCancel()) {
      // TODO: DB 연동 시 API 호출 추가
      // try {
      //   await fetch(`/api/counsels/${id}/cancel`, {
      //     method: 'PUT',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       userId: user.id,
      //       status: '상담 예약 취소'
      //     })
      //   });
      // } catch (error) {
      //   console.error('상담 취소 실패:', error);
      //   return;
      // }

      setShowCancelCompleteModal(true);
    } else {
      setShowCannotEditModal(true);
    }
  };

  const handleEditClick = () => {
    if (canEditOrCancel()) {
      // TODO: DB 연동 시 수정 페이지로 이동 또는 모달 표시
      // navigate(`/mypage/counsel/counselor/${id}/edit`);
      // 또는
      // setShowEditModal(true); // 수정 모달 구현 필요

      setShowEditCompleteModal(true);
    } else {
      setShowCannotEditModal(true);
    }
  };

  const handleReviewClick = () => {
    setShowReviewModal(true);
  };

  const handleReviewSubmit = () => {
    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }

    // TODO: DB 연동 시 API 호출 추가
    // try {
    //   await fetch('/api/reviews', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       counselId: id,
    //       rating: rating,
    //       content: reviewContent,
    //       userId: user.id
    //     })
    //   });
    // } catch (error) {
    //   console.error('리뷰 작성 실패:', error);
    //   return;
    // }

    setShowReviewModal(false);
    setShowReviewCompleteModal(true);
  };

  const handleModalClose = (type) => {
    if (type === 'cancel' || type === 'edit' || type === 'reviewComplete') {
      navigate('/mypage/clist');
    }
    setShowCancelCompleteModal(false);
    setShowCannotEditModal(false);
    setShowEditCompleteModal(false);
    setShowReviewModal(false);
    setShowReviewCompleteModal(false);
    setShowCannotReviewModal(false);
  };

  // 상태별 배지 색상
  const getStatusColor = () => {
    switch (counselDetail.status) {
      case '상담 완료':
        return 'bg-green-100 text-green-700';
      case '상담 예약 대기':
        return 'bg-yellow-100 text-yellow-700';
      case '상담 예약 (완료)':
        return 'bg-blue-100 text-blue-700';
      case '상담 예약 취소':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-24">
        {/* HEADER */}
        <header className="bg-[#2563eb] h-14 flex items-center justify-center px-5 relative">
          <Link to="/mypage/clist" className="absolute left-5 text-white text-xl">
            ←
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#2563eb] font-bold text-sm">★</span>
            </div>
            <span className="text-white font-bold text-lg">고민순삭</span>
          </div>
        </header>

        {/* 뒤로가기 버튼 */}
        <div className="px-5 pt-4 pb-2">
          <Link
            to="/mypage/clist"
            className="inline-flex items-center gap-1 text-sm text-[#2563eb] border border-[#2563eb] px-3 py-1.5 rounded-lg bg-white"
          >
            <span>←</span>
            <span>뒤로가기</span>
          </Link>
        </div>

        {/* TITLE + 상태 배지 */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-800">상담 내용</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
              {counselDetail.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            예약일자 : {counselDetail.reservationDate} {counselDetail.reservationTime}
          </p>
        </div>

        {/* 예약 내용 */}
        <div className="px-5 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-base font-bold text-gray-800 mb-2">제목 : {counselDetail.title}</h3>
            <p className="text-sm text-gray-600 mb-4">예약자 : {counselDetail.requester}</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{counselDetail.content}</p>
          </div>
        </div>

        {/* 상담자 정보 */}
        <div className="px-5 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">상담사 정보</h2>
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex flex-col items-center mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-3 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop')",
                  }}
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {counselDetail.counselor.name} {counselDetail.counselor.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">고민순삭 상담 {counselDetail.counselor.sessions}회 진행</p>
              <div className="flex flex-wrap justify-center gap-2">
                {counselDetail.counselor.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                    # {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 상담 내용 (채팅 상담일 경우만) */}
        {counselDetail.status === '상담 완료' && counselDetail.counselType === 'chat' && (
          <div className="px-5 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">상담 내용</h2>
            <div className="bg-[#2563eb] rounded-t-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#2563eb]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">전문 상담사 {counselDetail.counselor.name}</p>
                  <p className="text-white/80 text-xs">
                    #{counselDetail.counselor.tags[0]} #{counselDetail.counselor.tags[1]}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white border-x border-b border-gray-200 rounded-b-2xl p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {counselDetail.chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-white border-2 border-[#2563eb] text-gray-800'
                          : 'bg-[#2563eb] text-white'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-1">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="px-5">
          {counselDetail.status === '상담 완료' && (
            <button
              onClick={handleReviewClick}
              className="w-full bg-[#2563eb] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              리뷰 작성하기
            </button>
          )}

          {counselDetail.status === '상담 예약 대기' && (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">상담사 확인 후 예약이 확정됩니다.</p>
              <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
            </div>
          )}

          {counselDetail.status === '상담 예약 (완료)' && (
            <div className="flex gap-3">
              <button
                onClick={handleEditClick}
                className="flex-1 bg-white border-2 border-[#2563eb] text-[#2563eb] py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                상담 수정
              </button>
              <button
                onClick={handleCancelClick}
                className="flex-1 bg-[#2563eb] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                상담 취소
              </button>
            </div>
          )}

          {counselDetail.status === '상담 예약 취소' && (
            <div className="text-center py-6 bg-gray-100 rounded-xl">
              <p className="text-gray-700 font-semibold mb-2">상담이 취소되었습니다</p>
              <p className="text-sm text-gray-600">취소일: {counselDetail.cancelDate}</p>
            </div>
          )}
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-3xl p-6 max-w-[360px] lg:max-w-[480px] w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">별점 선택</h2>
              <Link to="/mypage/clist" className="text-sm lg:text-base text-[#2563eb]">
                ← 뒤로가기
              </Link>
            </div>

            {/* 별점 선택 */}
            <div className="mb-6">
              <div className="bg-[#2563eb] text-white p-3 lg:p-4 rounded-t-xl flex items-center justify-between">
                <span className="text-sm lg:text-base">별점을 선택해주세요</span>
                <span className="text-sm lg:text-base">✓</span>
              </div>
              <div className="bg-white border-x border-b border-gray-200 rounded-b-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    onClick={() => setRating(star)}
                    className="flex items-center justify-between p-4 lg:p-5 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
                  >
                    <span className="text-gray-700 text-base lg:text-lg">{star}점</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <span
                          key={index}
                          className={`text-xl lg:text-2xl ${index < star ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-3">리뷰 내용</h3>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="리뷰를 작성해주세요"
                className="w-full h-32 lg:h-40 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:border-[#2563eb] text-base"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg"
              >
                취소
              </button>
              <button
                onClick={handleReviewSubmit}
                className="flex-1 bg-[#2563eb] text-white py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 리뷰 작성 완료 모달 */}
      {showReviewCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-3xl p-8 max-w-[340px] lg:max-w-[480px] w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[#2ed3c6] font-bold text-sm lg:text-base">Healing Therapy</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">고민순삭</h2>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">리뷰 작성 완료</h3>
            <p className="text-sm lg:text-base text-gray-700 mb-6">정상적으로 리뷰가 작성되었습니다</p>
            <button
              onClick={() => handleModalClose('reviewComplete')}
              className="w-full bg-[#2563eb] text-white py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg"
            >
              메인으로
            </button>
          </div>
        </div>
      )}

      {/* 리뷰 작성/수정 불가 모달 */}
      {showCannotReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-3xl p-8 max-w-[340px] lg:max-w-[480px] w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[#2ed3c6] font-bold text-sm lg:text-base">Healing Therapy</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">고민순삭</h2>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">작성 / 수정 불가 안내</h3>
            <p className="text-sm lg:text-base text-gray-700 mb-2">
              리뷰 작성/ 수정은 상담 완료일로부터
              <br />
              5일 이내로만 가능합니다.
            </p>
            <p className="text-xs lg:text-sm text-gray-600 mb-6">양해 부탁드립니다.</p>
            <button
              onClick={() => handleModalClose('cannot')}
              className="w-full bg-[#2563eb] text-white py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg"
            >
              메인으로
            </button>
          </div>
        </div>
      )}

      {/* 상담 취소 완료 모달 */}
      {showCancelCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-3xl p-8 max-w-[340px] lg:max-w-[480px] w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[#2ed3c6] font-bold text-sm lg:text-base">Healing Therapy</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">고민순삭</h2>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">상담 취소 완료</h3>
            <p className="text-sm lg:text-base text-gray-700 mb-2">신청하신 상담이 취소되었습니다</p>
            <p className="text-xs lg:text-sm text-gray-600 mb-6">환불 관련은 환불 정책을 확인해주세요</p>
            <button
              onClick={() => handleModalClose('cancel')}
              className="w-full bg-[#2563eb] text-white py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg"
            >
              메인으로
            </button>
          </div>
        </div>
      )}

      {/* 상담 취소/수정 불가 모달 */}
      {showCannotEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-3xl p-8 max-w-[340px] lg:max-w-[480px] w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[#2ed3c6] font-bold text-sm lg:text-base">Healing Therapy</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">고민순삭</h2>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">상담 취소 / 수정 불가 안내</h3>
            <p className="text-sm lg:text-base text-gray-700 mb-2">
              상담 취소 및 수정은 상담 1일 전 까지만
              <br />
              가능합니다.
            </p>
            <p className="text-xs lg:text-sm text-gray-600 mb-6">상세 내용은 운영정책 확인 부탁드립니다.</p>
            <button
              onClick={() => handleModalClose('cannot')}
              className="w-full bg-[#2563eb] text-white py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg"
            >
              메인으로
            </button>
          </div>
        </div>
      )}

      {/* 상담 일정 수정 완료 모달 */}
      {showEditCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-3xl p-8 max-w-[340px] lg:max-w-[480px] w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[#2ed3c6] font-bold text-sm lg:text-base">Healing Therapy</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">고민순삭</h2>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">상담 일정 수정 완료</h3>
            <p className="text-sm lg:text-base text-gray-700 mb-2">신청하신 상담 일정이 수정되었습니다</p>
            <p className="text-xs lg:text-sm text-gray-600 mb-6">담당 상담사님의 확인 후 처리 예정입니다</p>
            <button
              onClick={() => handleModalClose('edit')}
              className="w-full bg-[#2563eb] text-white py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg"
            >
              메인으로
            </button>
          </div>
        </div>
      )}

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8 px-[200px]">
            <div>
              <h1 className="text-[30px] font-semibold text-gray-800 mb-2">상담 예약 내용</h1>
              <p className="text-lg text-gray-600">
                예약일자 : {counselDetail.reservationDate} {counselDetail.reservationTime}
              </p>
            </div>
            <button
              onClick={() => navigate('/mypage/clist')}
              className="px-8 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
            >
              상담 예약
            </button>
          </div>

          {/* CONTENT */}
          <div className="w-[1520px] mx-auto bg-white rounded-2xl shadow-sm p-12">
            {/* 상담 내용 */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">상담 내용</h2>
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">제목 : {counselDetail.title}</h3>
                <p className="text-base text-gray-600 mb-6">예약자 : {counselDetail.requester}</p>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{counselDetail.content}</p>
                </div>
              </div>
            </div>

            {/* 상담사 정보 */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">상담사 정보</h2>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-12 border border-purple-200">
                <div className="flex flex-col items-center">
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-6 overflow-hidden shadow-xl">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop')",
                      }}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {counselDetail.counselor.name} {counselDetail.counselor.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">고민순삭 상담 {counselDetail.counselor.sessions}회 진행</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {counselDetail.counselor.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-white text-gray-700 px-6 py-2 rounded-full text-base font-medium shadow-sm"
                      >
                        # {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 상담 내역 (채팅 상담 완료일 경우) */}
            {counselDetail.status === '상담 완료' &&
              counselDetail.counselType === 'chat' &&
              counselDetail.chatMessages && (
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">상담 내역</h2>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* 채팅 헤더 */}
                    <div className="bg-[#2563eb] py-6 px-8 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#2563eb]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-bold text-xl">전문 상담사 {counselDetail.counselor.name}</p>
                        <p className="text-white/90 text-base">
                          #{counselDetail.counselor.tags[0]} #{counselDetail.counselor.tags[1]}
                        </p>
                      </div>
                    </div>

                    {/* 채팅 메시지 */}
                    <div className="p-8 bg-gray-50 max-h-[600px] overflow-y-auto">
                      <div className="max-w-[1000px] mx-auto space-y-6">
                        {counselDetail.chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] flex flex-col ${
                                msg.sender === 'user' ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div
                                className={`px-6 py-4 rounded-2xl shadow-sm ${
                                  msg.sender === 'user'
                                    ? 'bg-white border-2 border-[#2563eb] text-gray-800'
                                    : 'bg-[#2563eb] text-white'
                                }`}
                              >
                                <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                              </div>
                              <span className="text-sm text-gray-500 mt-2 px-2">{msg.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* 하단 버튼 */}
            <div className="flex justify-end gap-4">
              {counselDetail.status === '상담 완료' && (
                <button
                  onClick={handleReviewClick}
                  className="px-16 py-4 bg-[#2563eb] text-white rounded-xl text-lg font-normal hover:bg-[#1d4ed8] transition-colors"
                >
                  리뷰 작성하기
                </button>
              )}

              {counselDetail.status === '상담 예약 대기' && (
                <div className="w-full text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-xl text-gray-700 mb-4 font-semibold">상담사 확인 후 예약이 확정됩니다.</p>
                  <p className="text-base text-gray-600">잠시만 기다려주세요.</p>
                </div>
              )}

              {counselDetail.status === '상담 예약 (완료)' && (
                <>
                  <button
                    onClick={handleEditClick}
                    className="px-16 py-4 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-xl text-lg font-normal hover:bg-blue-50 transition-colors"
                  >
                    상담 수정하기
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className="px-16 py-4 bg-[#2563eb] text-white rounded-xl text-lg font-normal hover:bg-[#1d4ed8] transition-colors"
                  >
                    상담 취소하기
                  </button>
                </>
              )}

              {counselDetail.status === '상담 예약 취소' && (
                <div className="w-full text-center py-12 bg-gray-100 rounded-xl">
                  <p className="text-xl text-gray-700 font-semibold mb-3">상담이 취소되었습니다</p>
                  <p className="text-base text-gray-600">취소일: {counselDetail.cancelDate}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CounselorCounselDetail;
