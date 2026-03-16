import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCnslDetail } from '../../../api/myCnslDetail';
import { getAvailableSlots } from '../../../api/cnslApi';
import useAuth from '../../../hooks/useAuth';
import { useAuthStore } from '../../../store/auth.store';
import { supabase } from '../../../lib/supabase';
import { refreshAccessToken } from '../../../axios/Auth';

/** chat_msg.summary 또는 msg_data.content에서 상담 내용 텍스트 추출 */
function getContentFromChatMsg(msgRow) {
  if (!msgRow) return '';
  let text = '';
  if (msgRow.summary) {
    try {
      const parsed = typeof msgRow.summary === 'string' ? JSON.parse(msgRow.summary) : msgRow.summary;
      text = (parsed?.summary ?? parsed?.summary_line ?? '').trim() || '';
    } catch {
      text = String(msgRow.summary).trim();
    }
  }
  if (!text && msgRow.msg_data?.content && Array.isArray(msgRow.msg_data.content)) {
    const lines = msgRow.msg_data.content
      .filter((m) => m?.text)
      .map((m) => {
        const who = m.speaker === 'user' || m.role === 'user' ? '신청인' : '상담사';
        return `[${who}] ${String(m.text).trim()}`;
      });
    text = lines.join('\n');
  }
  return text || '';
}

const CounselorCounselDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken: token } = useAuth();
  const currentUserEmail = useAuthStore((s) => s.email);

  // 상태 관리
  const [counselDetail, setCounselDetail] = useState(null); // 초기값 null
  const [contentFromSupabase, setContentFromSupabase] = useState(null); // Spring에 cnsl_content 없을 때 chat_msg 요약
  const [cnslMeta, setCnslMeta] = useState(null); // cnsler_id, cnsl_date, cnsl_start_time
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [showCancelCompleteModal, setShowCancelCompleteModal] = useState(false);
  const [showCannotEditModal, setShowCannotEditModal] = useState(false);
  const [showEditCompleteModal, setShowEditCompleteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewCompleteModal, setShowReviewCompleteModal] = useState(false);
  const [showCannotReviewModal, setShowCannotReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // 리뷰 데이터
  const [rating, setRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');

  // 상담 수정 폼 (모달 내부용)
  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    title: '',
    content: '',
  });
  const [editBookedSlots, setEditBookedSlots] = useState([]);

  // 정각 기준 1시간 단위 슬롯 (00:00 ~ 23:00)
  const EDIT_TIME_SLOTS = useMemo(
    () => Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`),
    [],
  );

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
    const stat = counselDetail?.cnsl_stat ?? counselDetail?.cnslStat ?? '';
    return stat === '상담 완료' || stat === 'D';
  };

  const handleCancelClick = () => {
    console.log('handleCancelClick', id);
    fetchCancel();
  };

  const handleEditClick = () => {
    if (!cnslMeta) {
      console.warn('수정 메타데이터가 없습니다.');
      return;
    }
    console.log('handleEditClick', id);
    // 기존 값으로 수정 폼 초기화
    setEditForm({
      date: cnslMeta.cnsl_date || '',
      time: (cnslMeta.cnsl_start_time || '').slice(0, 5) || '',
      title: displayData.title || '',
      content: displayData.content || '',
    });
    setShowEditModal(true);
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

  // 상담 수정 모달 내 "수정 완료" 버튼 클릭
  const handleEditSubmit = () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }
    // 날짜/시간은 기존 값 유지가 기본이므로 필수는 아님
    fetchUpdate();
  };

  // 선택 불가 시간 계산 (오늘 과거 시간 + 이미 예약된 시간)
  const disabledTimeSet = useMemo(() => {
    const disabled = new Set();
    const dateStr = editForm.date;
    if (!dateStr) return disabled;

    const now = new Date();
    const target = new Date(`${dateStr}T00:00:00`);

    // 오늘 날짜인 경우, 현재 시간 이전 슬롯 비활성화
    if (target.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      EDIT_TIME_SLOTS.forEach((slot) => {
        const slotHour = Number(slot.split(':')[0]);
        if (slotHour <= currentHour) {
          disabled.add(slot);
        }
      });
    }

    // 예약된 슬롯 비활성화 (cnsl_start_time 기준)
    if (editBookedSlots && Array.isArray(editBookedSlots)) {
      editBookedSlots.forEach((slot) => {
        const t = slot?.cnslStartTime || slot?.cnsl_start_time;
        if (t) {
          const hh = String(t).slice(0, 2);
          const key = `${hh}:00`;
          disabled.add(key);
        }
      });
    }

    return disabled;
  }, [EDIT_TIME_SLOTS, editForm.date, editBookedSlots]);

  // 상담사 스케줄(예약된 시간) 조회 - 수정 모달 열리거나 날짜 변경 시
  useEffect(() => {
    const fetchSlots = async () => {
      if (!showEditModal) return;
      if (!cnslMeta?.cnsler_id || !editForm.date) return;
      try {
        const slots = await getAvailableSlots({
          cnsler_id: cnslMeta.cnsler_id,
          cnsl_dt: editForm.date,
        });
        setEditBookedSlots(slots || []);
      } catch (error) {
        console.error('예약된 시간 불러오기 실패(수정 모달):', error);
        setEditBookedSlots([]);
      }
    };
    fetchSlots();
  }, [showEditModal, cnslMeta?.cnsler_id, editForm.date]);

  // 백엔드 API 베이스 URL (Vite 환경 변수 사용, 없으면 상대 경로 사용)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  // 상담 취소 API 호출
  const fetchCancel = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cnslReg_cancel/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      if (!res.ok) {
        // 401이면 accessToken 자동 갱신 후 한 번 재시도
        if (res.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            const retryRes = await fetch(`${API_BASE_URL}/api/cnslReg_cancel/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${newToken}`,
              },
              credentials: 'include',
            });
            if (!retryRes.ok) {
              console.error('상담 취소 재시도 실패:', retryRes.status);
              alert('상담 취소에 실패했습니다. 잠시 후 다시 시도해 주세요.');
              return;
            }
          } else {
            alert('로그인 정보가 만료되었습니다. 다시 로그인 후 이용해 주세요.');
            return;
          }
        } else {
          let errorBody = null;
          try {
            const text = await res.text();
            try {
              errorBody = text ? JSON.parse(text) : null;
            } catch {
              errorBody = text || null;
            }
          } catch {
            // ignore
          }
          console.error('상담 취소 실패 응답:', { status: res.status, body: errorBody });
          alert('상담 취소에 실패했습니다. 잠시 후 다시 시도해 주세요.');
          return;
        }
      }
      setShowCancelCompleteModal(true);
      alert('상담 예약이 취소되었습니다.');
      navigate('/mypage/clist');
    } catch (error) {
      console.error('상담 취소 실패:', error);
      alert('상담 취소 중 오류가 발생했습니다.');
    }
  };

  // 상담 수정 API 호출 (간단히 현재 제목/내용을 다시 패치)
  const fetchUpdate = async () => {
    if (!id || !counselDetail) return;
    try {
      // time input 값(HH:mm)을 백엔드 LocalTime 형식(HH:mm:ss)으로 보정
      const timeForPayload =
        editForm.time && editForm.time.length === 5
          ? `${editForm.time}:00`
          : editForm.time || cnslMeta?.cnsl_start_time || undefined;

      const body = {
        // 백엔드 CnslModiReqDto 요구 필드 5개 모두 전달
        cnsler_id: cnslMeta?.cnsler_id ?? undefined,
        cnsl_title: editForm.title?.trim() || undefined,
        cnsl_content: editForm.content?.trim() || undefined,
        cnsl_date: editForm.date || cnslMeta?.cnsl_date || undefined,
        cnsl_start_time: timeForPayload,
      };
      const res = await fetch(`${API_BASE_URL}/api/cnslReg_update/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        if (res.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            const retryRes = await fetch(`${API_BASE_URL}/api/cnslReg_update/${id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${newToken}`,
              },
              credentials: 'include',
              body: JSON.stringify(body),
            });
            if (!retryRes.ok) {
              console.error('상담 수정 재시도 실패:', retryRes.status);
              alert('상담 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.');
              return;
            }
          } else {
            alert('로그인 정보가 만료되었습니다. 다시 로그인 후 이용해 주세요.');
            return;
          }
        } else {
          let errorBody = null;
          try {
            const text = await res.text();
            try {
              errorBody = text ? JSON.parse(text) : null;
            } catch {
              errorBody = text || null;
            }
          } catch {
            // ignore
          }
          console.error('상담 수정 실패 응답:', { status: res.status, body: errorBody });
          alert('상담 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.');
          return;
        }
      }
      // 성공 시: 수정 모달 닫고 완료 모달만 띄움
      setShowEditModal(false);
      setShowEditCompleteModal(true);
    } catch (error) {
      console.error('상담 수정 실패:', error);
      alert('상담 수정 중 오류가 발생했습니다.');
    }
  };

  // API 호출 (Spring 우선, 404 시 Supabase cnsl_reg + chat_msg fallback)
  useEffect(() => {
    const cnslIdNum = id ? Number(id) : null;
    if (!id || !cnslIdNum) return;

    const statToLabel = (s) => {
      if (!s) return '';
      const map = { A: '상담 예약 대기', B: '상담 예약 (완료)', C: '상담 진행 중', D: '상담 완료', E: '상담 종료 중' };
      return map[s] || s;
    };

    const fetchDetail = async () => {
      setLoading(true);
      setContentFromSupabase(null);
      try {
        const data = await getCnslDetail(cnslIdNum);
        setCounselDetail(data);

        // Supabase cnsl_reg에서 메타데이터(cnsler_id, cnsl_date, cnsl_start_time) 조회
        try {
          const { data: regRow } = await supabase
            .from('cnsl_reg')
            .select('cnsl_id, cnsler_id, cnsl_dt, cnsl_start_time')
            .eq('cnsl_id', cnslIdNum)
            .maybeSingle();
          if (regRow) {
            setCnslMeta({
              cnsler_id: regRow.cnsler_id,
              cnsl_date: regRow.cnsl_dt,
              cnsl_start_time: regRow.cnsl_start_time,
            });
          }
        } catch (metaErr) {
          console.error('Supabase 메타데이터 조회 실패:', metaErr);
        }

        // Spring에 상담 내용이 비어 있으면 Supabase chat_msg(summary + msg_data)로 보완
        const content = data?.cnslContent ?? data?.cnsl_content ?? '';
        if (!String(content).trim()) {
          const { data: msgRow } = await supabase
            .from('chat_msg')
            .select('summary, msg_data')
            .eq('cnsl_id', cnslIdNum)
            .maybeSingle();
          const text = getContentFromChatMsg(msgRow);
          if (text) setContentFromSupabase(text);
        }
      } catch (error) {
        console.error('데이터 로드 실패 (Spring):', error);
        // 404 등 실패 시 Supabase에서 상담 내역 조회
        try {
          const { data: regRow, error: regErr } = await supabase
            .from('cnsl_reg')
            .select('cnsl_id, cnsl_title, cnsl_content, cnsl_stat, cnsl_dt, cnsl_start_time, created_at, member_id, cnsler_id')
            .eq('cnsl_id', cnslIdNum)
            .maybeSingle();
          if (regErr || !regRow) {
            setCounselDetail(null);
            return;
          }
          // 상담 신청인(member_id)과 로그인 사용자가 다르면 비공개 (이메일이 있을 때만 검사)
          if (
            currentUserEmail &&
            regRow.member_id &&
            String(regRow.member_id).trim() !== String(currentUserEmail).trim()
          ) {
            setCounselDetail(null);
            return;
          }
          let content = regRow.cnsl_content?.trim() ?? '';
          if (!content) {
            const { data: msgRow } = await supabase
              .from('chat_msg')
              .select('summary, msg_data')
              .eq('cnsl_id', cnslIdNum)
              .maybeSingle();
            content = getContentFromChatMsg(msgRow);
          }
          setCounselDetail({
            cnsl_title: regRow.cnsl_title,
            cnsl_content: content,
            user_nickname: '',
            cnsler_name: '',
            cnsl_stat: statToLabel(regRow.cnsl_stat),
            created_at: regRow.created_at,
          });
          setCnslMeta({
            cnsler_id: regRow.cnsler_id,
            cnsl_date: regRow.cnsl_dt,
            cnsl_start_time: regRow.cnsl_start_time,
          });
        } catch (supabaseErr) {
          console.error('Supabase fallback 실패:', supabaseErr);
          setCounselDetail(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, token, currentUserEmail]);

  // 로딩 중 처리
  if (loading) return <div className="text-center py-20">데이터를 불러오는 중입니다...</div>;
  // 로드 실패 시 안내 (Spring 404 + Supabase 미존재 또는 권한 없음)
  if (!counselDetail) {
    return (
      <div className="min-h-screen bg-[#f3f7ff] flex flex-col items-center justify-center p-6">
        <p className="text-gray-700 mb-4">상담 내역을 불러올 수 없습니다.</p>
        <button
          type="button"
          onClick={() => navigate('/mypage/clist')}
          className="px-6 py-2 bg-[#2563eb] text-white rounded-lg"
        >
          목록으로
        </button>
      </div>
    );
  }

  // 상태 코드 → 한글 라벨 (Spring은 코드만 올 수 있음)
  const statusLabel =
    counselDetail.cnslStat ?? counselDetail.cnsl_stat ?? '';
  const statusDisplay =
    statusLabel.length === 1
      ? { A: '상담 예약 대기', B: '상담 예약 (완료)', C: '상담 진행 중', D: '상담 완료', E: '상담 종료 중' }[
          statusLabel
        ] ?? statusLabel
      : statusLabel;

  // 백엔드 데이터와 UI 연결 (변수 매핑, snake_case/camelCase 모두 처리)
  const rawContent = counselDetail.cnslContent ?? counselDetail.cnsl_content ?? '';
  const displayData = {
    title: counselDetail.cnslTitle ?? counselDetail.cnsl_title,
    requester: counselDetail.userNickname ?? counselDetail.user_nickname,
    content: (rawContent && String(rawContent).trim()) ? rawContent : (contentFromSupabase ?? ''),
    counselorName: counselDetail.cnslerName ?? counselDetail.cnsler_name,
    intro: counselDetail.cnslerText ?? counselDetail.cnsler_text ?? '',
    career: counselDetail.cnslerProfile ?? counselDetail.cnsler_profile ?? '',
    status: statusDisplay,
    date: counselDetail.cnslDt ?? (counselDetail.created_at ? new Date(counselDetail.created_at).toLocaleDateString('ko-KR') : ''),
    image: counselDetail.cnslerimgUrl ?? counselDetail.cnsler_img_url,
    tags: ((counselDetail.hashTags ?? counselDetail.hash_tags) || '')
      ? (counselDetail.hashTags ?? counselDetail.hash_tags).split(',')
      : [],
  };

  // 예약 일시 표기용 (날짜 + 시:분)
  const displayDateTime =
    displayData.date &&
    (cnslMeta?.cnsl_start_time
      ? `${displayData.date} ${String(cnslMeta.cnsl_start_time).slice(0, 5)}`
      : displayData.date);

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
      {/* 상담 일정 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-800">상담 일정 수정</h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">예약 날짜</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb]"
                value={editForm.date || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {/* 시간 (정각 기준, 스케줄 기반 비활성화) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">예약 시간</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb]"
                value={editForm.time || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, time: e.target.value }))}
              >
                <option value="">시간을 선택해 주세요 (정각 기준)</option>
                {EDIT_TIME_SLOTS.map((slot) => {
                  const disabled = disabledTimeSet.has(slot);
                  return (
                    <option
                      key={slot}
                      value={slot}
                      disabled={disabled}
                      className={disabled ? 'text-gray-400 bg-gray-100' : ''}
                    >
                      {slot}
                      {disabled ? ' (선택 불가)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">제목</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb]"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">상담 내용</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-28 resize-none focus:outline-none focus:border-[#2563eb]"
                value={editForm.content}
                onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                className="flex-1 bg-[#2563eb] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#1d4ed8]"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상담 일정 수정 완료 모달 */}
      {showEditCompleteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-5 text-center">
            {/* 로고 (Footer 로고 스타일과 유사) */}
            <div className="flex flex-col items-center mb-2">
              <img
                src="https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/f_logo.png"
                alt="고민순삭 로고"
                className="w-32 h-auto mb-2"
              />
              <p className="text-[11px] text-gray-500">AI 융합 고민 상담 서비스</p>
            </div>
            <h3 className="text-xl font-bold text-gray-800">상담 일정 수정완료</h3>
            <p className="text-sm text-gray-600 mb-2">변경된 내용이 정상적으로 반영되었습니다.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/mypage/clist')}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50"
              >
                목록으로
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditCompleteModal(false);
                  window.location.reload();
                }}
                className="flex-1 bg-[#2563eb] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#1d4ed8]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

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
            <p className="text-sm text-gray-600 mb-4">
              예약자 : {displayData.requester}
              {displayDateTime && (
                <span className="ml-1 text-gray-500">
                  {' '}
                  / 예약일시 : {displayDateTime}
                </span>
              )}
            </p>
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
          {(statusLabel === 'A' || statusLabel === 'B') && (
            <div className="flex gap-3">
              {statusLabel === 'A' && (
                <button
                  onClick={handleEditClick}
                  className="flex-1 bg-white border-2 border-[#2563eb] text-[#2563eb] py-3 rounded-xl font-semibold"
                >
                  상담 수정
                </button>
              )}
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
        <div className="max-w-[1520px] mx-auto px-8">
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
                <p className="text-gray-500 mb-6 border-b pb-4">
                  예약자: {displayData.requester}
                  {displayDateTime && (
                    <span className="ml-2 text-gray-400">
                      {' '}
                      / 예약일시 : {displayDateTime}
                    </span>
                  )}
                </p>
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

            {/* 상담사 소개 / 자격 및 경력 (CounselorView 레이아웃 참고, 간략 버전) */}
            {(displayData.intro?.trim() || displayData.career?.trim()) && (
              <section className="grid grid-cols-2 gap-8">
                {displayData.intro?.trim() && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-3 text-gray-800 border-b border-gray-200 pb-2">
                      상담사 소개
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                      {displayData.intro}
                    </p>
                  </div>
                )}
                {displayData.career?.trim() && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-3 text-gray-800 border-b border-gray-200 pb-2">
                      자격 및 경력
                    </h3>
                    <ul className="text-base text-gray-700 list-disc space-y-2 whitespace-pre-line pl-5">
                      {displayData.career.split('\n').map((line, idx) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <div className="flex justify-center gap-4 pt-6">
              {(statusLabel === 'A' || statusLabel === 'B') && (
                <>
                  {statusLabel === 'A' && (
                    <button
                      onClick={handleEditClick}
                      className="px-10 py-3 border-2 border-[#2563eb] text-[#2563eb] rounded-xl font-bold hover:bg-blue-50 transition-colors"
                    >
                      상담 일정 수정
                    </button>
                  )}
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
