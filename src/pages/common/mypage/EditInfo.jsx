import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { MBTI_OPTIONS } from '../../user/board/boardData';
import { useAuthStore } from '../../../store/auth.store';

const EditInfo = () => {
  const { getmemberInfoNicknameCheckYn, getUserInfo, uploadProfileImage, saveProfileImage, editInfo } = useAuth();
  const { accessToken, email } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    birthdate: '',
    newPassword: '',
    confirmPassword: '',
    introduction: '',
  });

  // MBTI 선택 상태
  const [selectedMbti, setSelectedMbti] = useState('');

  // 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [imageInfo, setImageInfo] = useState({
    imgUrl: null,
    imgName: null,
  });

  useEffect(() => {
    const fetchCounselorInfo = async () => {
      try {
        const data = await getUserInfo();
        if (data) {
          setFormData({
            nickname: data.nickname || '',
            birthdate: data.birth || '',
            newPassword: '',
            confirmPassword: '',
            introduction: data.persona || '',
          });
          setSelectedMbti(data.mbti || '');
          setImageInfo({
            imgUrl: data.imgUrl || null,
            imgName: data.imgName || null,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCounselorInfo();
  }, [accessToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const res = await uploadProfileImage(file);
      setImageInfo({
        imgUrl: res.img_url,
        imgName: res.img_name,
      });
    } else return;
  };

  const handleNickname = async () => {
    try {
      if (formData.nickname?.trim() === '') {
        alert('닉네임을 입력해 주세요.');
        return;
      }
      const { userInfoNicknameCheckYn: result } = await getmemberInfoNicknameCheckYn(formData.nickname);
      if (result === 'Y') {
        alert('해당 닉네임은 이미 등록되어 있습니다. 고유한 닉네임을 입력해주세요.');
        return;
      } else alert('사용 가능한 닉네임입니다.');
    } catch (error) {
      const msg = error?.message ?? '닉네임 확인에 실패했습니다.';
      alert(msg);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate('/mypage');
  };

  const handleSubmit = async () => {
    // 닉네임 체크
    if (!formData.nickname.trim()) {
      alert('닉네임을 입력해 주세요.');
      return;
    }

    // 비밀번호 확인
    if (formData.newPassword) {
      if (formData.newPassword?.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    setLoading(true);

    try {
      await editInfo({
        pw: formData.newPassword || null,
        mbti: selectedMbti || null,
        persona: formData.introduction || null,
        nickname: formData.nickname || null,
      });

      if (imageInfo) {
        await saveProfileImage(email, imageInfo.imgName || null, imageInfo.imgUrl || null);
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('정보 수정 오류:', error);
      alert('정보 수정에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate('/mypage');
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-24">
        {/* HEADER */}
        <header className="bg-[#2563eb] h-14 flex items-center justify-between px-5">
          <Link to="/mypage" className="text-white text-xl">
            ←
          </Link>
          <h1 className="text-white text-lg font-bold flex-1 text-center mr-6">회원정보 수정</h1>
        </header>

        {/* CONTENT */}
        <div className="px-6 pt-8">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer mb-4">
              {imageInfo ? (
                <img src={imageInfo.imgUrl || null} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            <label className="bg-[#2563eb] text-white px-6 py-2 rounded-xl text-sm font-semibold">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              프로필 사진 변경
            </label>
          </div>

          {/* MBTI 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">MBTI 선택</label>
            <select
              value={selectedMbti}
              onChange={(e) => setSelectedMbti(e.target.value)}
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm"
            >
              <option value="">MBTI 선택</option>
              {MBTI_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 변경할 닉네임 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">변경할 닉네임</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="변경할 닉네임"
                className="flex-1 h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm"
                disabled={loading}
              />
              <button
                onClick={handleNickname}
                className="bg-[#2563eb] text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
                disabled={loading}
              >
                중복 확인
              </button>
            </div>
          </div>

          {/* 새 비밀번호 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 변경</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="새 비밀번호"
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm"
              disabled={loading}
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호 확인"
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm"
              disabled={loading}
            />
          </div>

          {/* 자기소개 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              당신을 소개해주세요.
              <br />
              당신의 상담에 큰 도움이 될거예요.
            </label>
            <textarea
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              rows={6}
              placeholder="현재 커리어 상황을 자유롭게 작성해주세요. 상담에 필요한 정보를 포함해 주시면 더 정확한 답변을 받을 수 있습니다.

예시
- 현재 상태: 컴퓨터공학 4학년 / 백엔드 개발자 2년차 / 이직 준비 중
- 경험: Java, Spring 기반 웹 서비스 개발 경험, 개인 프로젝트 2개
- 관심 분야: 백엔드 / 데이터 엔지니어 / AI 등
- 목표: 스타트업 취업, 대기업 이직, 직무 전환 등
- 고민: 어떤 기술을 더 공부해야 할지, 이력서 방향 등"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm resize-none"
              disabled={loading}
            />
          </div>

          {/* 수정 버튼 */}
          <button
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl bg-[#2563eb] text-white text-base font-bold disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '수정 중...' : '회원 정보 수정하기'}
          </button>
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex-col items-center justify-between mb-8 ">
            <h3 className="!font-bold text-gray-800 mb-8">
              회원정보 수정
            </h3>

          {/* CONTENT */}
          <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-16">
            <div className="flex gap-16">
              {/* LEFT: 프로필 사진 */}
              <div className="flex flex-col items-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">프로필 사진</h2>
                <div className="relative w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-gray-200">
                  {imageInfo ? (
                    <img src={imageInfo.imgUrl || null} alt="프로필" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-[#2563eb] text-white px-8 py-3 rounded-xl text-base font-normal hover:bg-[#1d4ed8] transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  사진 추가/변경
                </label>
              </div>

              {/* RIGHT: 폼 입력 */}
              <div className="flex-1">
                {/* MBTI 리스트 */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">MBTI 리스트</label>
                  <select
                    value={selectedMbti}
                    onChange={(e) => setSelectedMbti(e.target.value)}
                    className="w-full h-14 rounded-xl border border-gray-300 bg-white px-4 text-base"
                    disabled={loading}
                  >
                    <option value="">MBTI 선택</option>
                    {MBTI_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 변경할 닉네임 */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">변경할 닉네임</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      placeholder="변경할 닉네임"
                      className="flex-1 h-14 rounded-xl border border-gray-300 bg-white px-4 text-base"
                      disabled={loading}
                    />
                    <button
                      onClick={handleNickname}
                      className="cursor-pointer bg-[#2563eb] text-white px-8 py-3 rounded-xl text-base font-normal hover:bg-[#1d4ed8] transition-colors whitespace-nowrap"
                      disabled={loading}
                    >
                      중복 확인
                    </button>
                  </div>
                </div>

                {/* 비밀번호 변경 */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">비밀번호 변경</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="새 비밀번호"
                    className="w-full h-14 rounded-xl border border-gray-300 bg-white px-4 text-base"
                    disabled={loading}
                  />
                </div>

                {/* 비밀번호 확인 */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">비밀번호 확인</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="비밀번호 확인"
                    className="w-full h-14 rounded-xl border border-gray-300 bg-white px-4 text-base"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* 자기소개 */}
            <div className="mt-8">
              <label className="block text-lg font-semibold text-gray-800 mb-3">자기소개</label>
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                rows={8}
                placeholder="현재 커리어 상황을 자유롭게 작성해주세요. 상담에 필요한 정보를 포함해 주시면 더 정확한 답변을 받을 수 있습니다.

예시
- 현재 상태: 컴퓨터공학 4학년 / 백엔드 개발자 2년차 / 이직 준비 중
- 경험: Java, Spring 기반 웹 서비스 개발 경험, 개인 프로젝트 2개
- 관심 분야: 백엔드 / 데이터 엔지니어 / AI 등
- 목표: 스타트업 취업, 대기업 이직, 직무 전환 등
- 고민: 어떤 기술을 더 공부해야 할지, 이력서 방향 등"
                className="w-full rounded-2xl border border-gray-300 bg-white px-6 py-4 text-base resize-none"
                disabled={loading}
              />
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleCancel}
                className="px-12 py-3 rounded-xl border border-gray-300 text-gray-700 text-base font-normal hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                취 소
              </button>
              <button
                onClick={handleSubmit}
                className="px-12 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '수정 중...' : '완 료'}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* 정보 수정 완료 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[400px] shadow-xl">
            <div className="flex flex-col items-center">
              {/* 로고 */}
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">★</span>
                </div>
                <span className="text-lg font-bold ml-2">고민순삭</span>
              </div>

              {/* 메시지 */}
              <p className="text-lg font-semibold text-gray-800 mb-2">정보 수정이 완료되었습니다</p>

              {/* 확인 버튼 */}
              <button
                onClick={handleSuccessConfirm}
                className="w-full py-3 bg-[#2563eb] text-white rounded-xl text-base font-normal hover:bg-[#1d4ed8] transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[400px] shadow-xl">
            <div className="flex flex-col items-center">
              {/* 로고 */}
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">★</span>
                </div>
                <span className="text-lg font-bold ml-2">고민순삭</span>
              </div>

              {/* 메시지 */}
              <p className="text-lg font-semibold text-gray-800 mb-2">정보 수정을 그만두시겠습니까?</p>
              <p className="text-sm text-gray-600 mb-6">작성 중인 내용은 저장되지 않습니다</p>

              {/* 버튼 */}
              <div className="flex w-full gap-3">
                <button
                  onClick={handleConfirmCancel}
                  className="cursor-pointer flex-1 py-3 bg-[#ef4444] text-white rounded-xl text-base font-normal hover:bg-[#dc2626] transition-colors"
                >
                  취소하기
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="cursor-pointer flex-1 py-3 bg-[#2563eb] text-white rounded-xl text-base font-normal hover:bg-[#1d4ed8] transition-colors"
                >
                  계속 수정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditInfo;
