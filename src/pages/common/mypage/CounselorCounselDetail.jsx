import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCnslDetail } from '../../../api/myCnslDetail';
import useAuth from '../../../hooks/useAuth';

const CounselorCounselDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken: token } = useAuth();

  // 상태 관리
  const [counselDetail, setCounselDetail] = useState(null); // 초기값 null
  const [loading, setLoading] = useState(true);

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
  // 리뷰 작성 가능 여부 확인 (상담 완료 상태면 모두 가능)
  const canWriteReview = () => {
    return counselDetail.cnsl_stat === '상담 완료';
  };

  // 예약 수정/취소 가능 여부 (1일 전까지)
  const canEditOrCancel = () => {
    const reservationDate = new Date(counselDetail.created_at);
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

  // API 호출
  useEffect(() => {
    const fetchDetail = async () => {
      if (!token || !id) return; // 토큰이나 ID가 없으면 중단

      try {
        setLoading(true);
        console.log('dsfdsfds', typeof id);
        const data = await getCnslDetail(Number(id));
        console.log('받아온 데이터:', data); // 데이터 구조 확인용
        setCounselDetail(data);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        // alert('상담 내역을 불러올 수 없습니다.');
        // navigate('/mypage/clist');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail(); // <--- 이 호출 문장이 반드시 있어야 실행됩니다!
  }, [id, token]); // id나 token이 바뀔 때마다 다시 실행

  // 로딩 중 처리
  if (loading) return <div className="text-center py-20">데이터를 불러오는 중입니다...</div>;
  if (!counselDetail) return null;

  // 백엔드 데이터와 UI 연결 (변수 매핑, snake_case/camelCase 모두 처리)
  const displayData = {
    title: counselDetail.cnslTitle ?? counselDetail.cnsl_title,
    requester: counselDetail.userNickname ?? counselDetail.user_nickname,
    content: counselDetail.cnslContent ?? counselDetail.cnsl_content ?? '',
    counselorName: counselDetail.cnslerName ?? counselDetail.cnsler_name,
    status: counselDetail.cnslStat ?? counselDetail.cnsl_stat,
    date: counselDetail.cnslDt ?? (counselDetail.created_at ? new Date(counselDetail.created_at).toLocaleDateString('ko-KR') : ''),
    image: counselDetail.cnslerimgUrl ?? counselDetail.cnsler_img_url,
    tags: (counselDetail.hashTags ?? counselDetail.hash_tags || '')
      ? (counselDetail.hashTags ?? counselDetail.hash_tags).split(',')
      : [],
  };

  // 상태별 배지 색상
  const getStatusColor = () => {
    switch (displayData.status) {
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
      {/* MOBILE VIEW */}
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

        {/* 뒤로가기 & 상태 배지 */}
        <div className="px-5 pt-4 pb-4">
          <Link
            to="/mypage/clist"
            className="inline-flex items-center gap-1 text-sm text-[#2563eb] border border-[#2563eb] px-3 py-1.5 rounded-lg bg-white mb-4"
          >
            <span>←</span>
            <span>뒤로가기</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">상담 내용</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
              {displayData.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">예약일자 : {displayData.date}</p>
        </div>

        {/* 예약 상세 내용 카드 */}
        <div className="px-5 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-base font-bold text-gray-800 mb-2">제목 : {displayData.title}</h3>
            <p className="text-sm text-gray-600 mb-4">예약자 : {displayData.requester}</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {displayData.content?.trim() ? displayData.content : '저장된 상담 내용이 없습니다.'}
            </p>
          </div>
        </div>

        {/* 상담사 정보 섹션 */}
        <div className="px-5 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">상담사 정보</h2>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
            <div className="w-32 h-32 rounded-full mx-auto mb-3 overflow-hidden shadow-sm">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${displayData.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'})`,
                }}
              />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{displayData.counselorName} 상담사</h3>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {displayData.tags &&
                displayData.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                    # {tag.trim()}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* 모바일 하단 액션 버튼 */}
        <div className="px-5 pb-10">
          {displayData.status === '상담 예약 (완료)' && (
            <div className="flex gap-3">
              <button
                onClick={handleEditClick}
                className="flex-1 bg-white border-2 border-[#2563eb] text-[#2563eb] py-3 rounded-xl font-semibold"
              >
                상담 수정
              </button>
              <button
                onClick={handleCancelClick}
                className="flex-1 bg-[#2563eb] text-white py-3 rounded-xl font-semibold"
              >
                상담 취소
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PC VIEW */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff] py-16">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">상담 예약 상세</h1>
              <p className="text-gray-600">예약일자 : {displayData.date}</p>
            </div>
            <button
              onClick={() => navigate('/mypage/clist')}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              목록으로
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-10 space-y-12">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#2563eb] rounded-full"></span>
                상담 상세 내용
              </h2>
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{displayData.title}</h3>
                <p className="text-gray-500 mb-6 border-b pb-4">예약자: {displayData.requester}</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {displayData.content?.trim() ? displayData.content : '저장된 상담 내용이 없습니다.'}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-3 gap-8 items-center bg-blue-50/50 rounded-3xl p-8">
              <div className="col-span-1 flex justify-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${displayData.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'})`,
                    }}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{displayData.counselorName} 상담사</h3>
                <div className="flex flex-wrap gap-2 mt-4">
                  {displayData.tags &&
                    displayData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-white text-gray-600 px-4 py-1.5 rounded-full text-sm border border-blue-100 shadow-sm"
                      >
                        # {tag.trim()}
                      </span>
                    ))}
                </div>
              </div>
            </section>

            <div className="flex justify-center gap-4 pt-6">
              {displayData.status === '상담 예약 (완료)' && (
                <>
                  <button
                    onClick={handleEditClick}
                    className="px-10 py-3 border-2 border-[#2563eb] text-[#2563eb] rounded-xl font-bold hover:bg-blue-50 transition-colors"
                  >
                    상담 일정 수정
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className="px-10 py-3 bg-[#2563eb] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    상담 예약 취소
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CounselorCounselDetail;
