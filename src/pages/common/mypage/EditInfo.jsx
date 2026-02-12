import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { MBTI_OPTIONS } from '../../user/board/boardData';

const EditInfo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
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

  useEffect(() => {
    // 사용자 메타데이터에서 정보 가져오기
    if (user) {
      setFormData({
        nickname: user.user_metadata?.nickname || '',
        birthdate: user.user_metadata?.birthdate || '',
        newPassword: '',
        confirmPassword: '',
        introduction: user.user_metadata?.introduction || '',
      });
      setSelectedMbti(user.user_metadata?.mbti || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    // 프로필 사진 변경 기능 (추후 구현)
    alert('프로필 사진 변경 기능은 추후 구현 예정입니다.');
  };

  const handleCheckNickname = () => {
    // 중복 확인 기능 (추후 구현)
    alert('닉네임 중복 확인 기능은 추후 구현 예정입니다.');
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate('/mypage');
  };

  const handleSubmit = async () => {
    if (!formData.nickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    // 비밀번호 확인
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
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
      // 사용자 메타데이터 업데이트
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          nickname: formData.nickname,
          birthdate: formData.birthdate,
          mbti: selectedMbti,
          introduction: formData.introduction,
        },
      });

      if (metadataError) throw metadataError;

      // 비밀번호 변경 (입력한 경우만)
      if (formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });

        if (passwordError) throw passwordError;
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
            <div
              onClick={handleImageClick}
              className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer mb-4"
            >
              {profileImage ? (
                <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            <button
              onClick={handleImageClick}
              className="bg-[#2563eb] text-white px-6 py-2 rounded-xl text-sm font-semibold"
            >
              프로필 사진 변경
            </button>
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
                onClick={handleCheckNickname}
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
              placeholder="당신을 소개해주세요.&#10;당신의 상담에 큰 도움이 될거예요."
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
          <div className="flex items-center justify-between mb-8 px-[200px]">
            <h1 className="text-[30px] font-semibold text-gray-800">회원정보 수정</h1>
          </div>

          {/* CONTENT */}
          <div className="w-[1520px] mx-auto bg-white rounded-2xl shadow-sm p-16">
            <div className="flex gap-16">
              {/* LEFT: 프로필 사진 */}
              <div className="flex flex-col items-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">프로필 사진</h2>
                <div
                  onClick={handleImageClick}
                  className="relative w-48 h-48 rounded-full overflow-hidden cursor-pointer mb-6 border-4 border-gray-200"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleImageClick}
                  className="bg-[#2563eb] text-white px-8 py-3 rounded-xl text-base font-normal hover:bg-[#1d4ed8] transition-colors"
                >
                  사진 추가/변경
                </button>
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
                      onClick={handleCheckNickname}
                      className="bg-[#2563eb] text-white px-8 py-3 rounded-xl text-base font-normal hover:bg-[#1d4ed8] transition-colors whitespace-nowrap"
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

            {/* 자기 소개 */}
            <div className="mt-8">
              <label className="block text-lg font-semibold text-gray-800 mb-3">자기 소개</label>
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                rows={8}
                placeholder="당신을 소개해주세요.&#10;당신의 상담에 큰 도움이 될거예요."
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
              <p className="text-sm text-gray-600 mb-6">정상적으로 게시글이 등록되었습니다</p>

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
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 bg-[#ef4444] text-white rounded-xl text-base font-normal hover:bg-[#dc2626] transition-colors"
                >
                  취소하기
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 py-3 bg-[#2563eb] text-white rounded-xl text-base font-normal hover:bg-[#1d4ed8] transition-colors"
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
