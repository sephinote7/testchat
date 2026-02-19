import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// TODO: DB 연동 가이드
// 이 페이지는 상담사 정보 수정 페이지입니다
//
// DB 연동 시 필요한 작업:
// 1. 상담사 정보 조회 API
//    - API: GET /api/counselors/me
//    - 응답:
//      {
//        profileImage: string,
//        tags: string[],
//        email: string
//      }
//
// 2. 프로필 이미지 업로드 API
//    - API: POST /api/counselors/me/profile-image
//    - 요청: FormData with file
//    - 응답: { imageUrl: string }
//
// 3. 비밀번호 변경 API
//    - API: PUT /api/counselors/me/password
//    - 요청: { currentPassword: string, newPassword: string }
//    - 유효성: 8자 이상, 영문+숫자+특수문자
//
// 4. 상담 태그 업데이트 API
//    - API: PUT /api/counselors/me/tags
//    - 요청: { tags: string[] }
//    - 최대 3개 제한
//
// 5. 전체 정보 업데이트 API
//    - API: PUT /api/counselors/me
//    - 요청:
//      {
//        profileImage: string,
//        password: string,
//        tags: string[]
//      }

const EditCounselorInfo = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
    selectedTags: [],
  });

  // TODO: DB 연동 시 초기 데이터 로드
  // useEffect(() => {
  //   const loadCounselorInfo = async () => {
  //     const response = await fetch('/api/counselors/me', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     setFormData({
  //       ...formData,
  //       selectedTags: data.tags || []
  //     });
  //     setProfileImage(data.profileImage);
  //   };
  //   loadCounselorInfo();
  // }, []);

  const availableTags = ['커리어', '진로', '연애'];

  const handleTagSelect = (e) => {
    const value = e.target.value;
    if (value && !formData.selectedTags.includes(value)) {
      setFormData({
        ...formData,
        selectedTags: [...formData.selectedTags, value],
      });
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      selectedTags: formData.selectedTags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (formData.selectedTags.length > 3) {
      alert('상담 태그는 최대 3개까지 선택 가능합니다.');
      return;
    }

    // TODO: DB 연동 시 API 호출
    // try {
    //   const response = await fetch('/api/counselors/me', {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}`
    //     },
    //     body: JSON.stringify({
    //       profileImage: profileImage,
    //       password: formData.newPassword,
    //       tags: formData.selectedTags
    //     })
    //   });
    //
    //   if (!response.ok) throw new Error('수정 실패');
    //
    //   const data = await response.json();
    //   setShowSuccessModal(true);
    // } catch (error) {
    //   console.error('정보 수정 오류:', error);
    //   alert('정보 수정에 실패했습니다.');
    // }

    // 저장 로직 (백엔드 연동 시 구현)
    setShowSuccessModal(true);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleModalAction = (action) => {
    setShowSuccessModal(false);
    if (action === 'mypage') {
      navigate('/mypage'); // PC/모바일 모두 동일한 마이페이지 경로
    } else {
      navigate('/system/info/profile');
    }
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden min-h-screen bg-gray-100 relative">
        {/* 헤더 */}
        <div className="bg-blue-600 text-white p-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">상담사 정보 수정</h1>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="p-4">
          {/* 프로필 사진 */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-300 mb-4 overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">👤</div>
              )}
            </div>
            <label className="bg-blue-600 text-white px-6 py-2 rounded font-medium w-full max-w-sm text-center cursor-pointer hover:bg-blue-700 transition">
              사진 추가/변경
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          {/* 비밀번호 변경 */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">비밀번호 변경</h2>
            <input
              type="password"
              placeholder="새 비밀번호"
              className="w-full p-3 mb-3 border border-gray-300 rounded"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              className="w-full p-3 border border-gray-300 rounded"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          {/* 상담 태그 설정 */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">상담 태그 설정</h2>
            <select className="w-full p-3 border border-gray-300 rounded mb-3" onChange={handleTagSelect} value="">
              <option value="">원하는 상담 태그를 선택해주세요 (최대 3개)</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            {/* 선택된 태그 표시 */}
            {formData.selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button onClick={() => handleTagRemove(tag)} className="text-blue-600 hover:text-blue-800">
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleCancel}
              className="flex-1 border border-blue-600 text-blue-600 py-3 rounded font-medium hover:bg-blue-50 transition"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition"
            >
              완료
            </button>
          </div>
        </div>
      </div>

      {/* PC VERSION */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-800">상담사 정보 수정</h1>
          </div>

          {/* MAIN CONTENT */}
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            {/* 프로필 사진과 입력 필드 */}
            <div className="flex items-start gap-8 mb-12">
              {/* 프로필 사진 */}
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-gray-800 mb-4">프로필 사진</h2>
                <div className="w-40 h-40 rounded-full bg-gray-200 mb-4 overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-gray-500">👤</div>
                  )}
                </div>
                <label className="bg-[#2563eb] text-white px-8 py-3 rounded-xl font-semibold cursor-pointer hover:bg-[#1e40af] transition text-center">
                  사진 추가/변경
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              {/* 입력 필드들 */}
              <div className="flex-1 flex flex-col gap-6">
                {/* 상담 태그 설정 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">상담 태그 설정</h3>
                  <select
                    className="w-full p-4 border-2 border-gray-300 rounded-xl mb-4 focus:border-[#2563eb] focus:outline-none transition text-base"
                    onChange={handleTagSelect}
                    value=""
                  >
                    <option value="">원하는 상담 태그를 선택해주세요 (최대 3개)</option>
                    {availableTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>

                  {/* 선택된 태그 표시 */}
                  {formData.selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {formData.selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-base font-medium flex items-center gap-3"
                        >
                          {tag}
                          <button
                            onClick={() => handleTagRemove(tag)}
                            className="text-blue-700 hover:text-blue-900 text-lg"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 비밀번호 변경 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">비밀번호 변경</h3>
                  <input
                    type="password"
                    placeholder="새 비밀번호"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-[#2563eb] focus:outline-none transition"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">비밀번호 확인</h3>
                  <input
                    type="password"
                    placeholder="비밀번호 확인"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-[#2563eb] focus:outline-none transition"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-6">
              <button
                onClick={handleCancel}
                className="flex-1 border-2 border-[#2563eb] text-[#2563eb] py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white py-4 rounded-xl text-lg font-bold hover:shadow-lg transition"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 정보 수정 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 max-w-sm lg:max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              {/* 로고 */}
              <div className="mb-4 lg:mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-xl lg:rounded-2xl flex items-center justify-center mb-2">
                  <svg
                    className="w-10 h-10 lg:w-12 lg:h-12 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div className="text-sm lg:text-base text-gray-600">Healing Theraphy</div>
                <div className="text-lg lg:text-xl font-bold text-gray-800">고민순삭</div>
              </div>

              <h3 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-3">정보 수정을 그만두시겠습니까?</h3>
              <p className="text-gray-600 lg:text-lg mb-6 lg:mb-8">작성 중인 내용은 저장되지 않습니다</p>

              <div className="w-full flex gap-3 lg:gap-4">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    navigate(-1);
                  }}
                  className="flex-1 bg-red-500 text-white py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold lg:text-lg hover:bg-red-600 transition"
                >
                  취소하기
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-[#2563eb] text-white py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold lg:text-lg hover:bg-[#1e40af] transition"
                >
                  계속 수정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 정보 수정 완료 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-10 max-w-sm lg:max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              {/* 로고 */}
              <div className="mb-6 lg:mb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3">
                  <svg
                    className="w-10 h-10 lg:w-12 lg:h-12 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div className="text-sm lg:text-base text-gray-600">Healing Theraphy</div>
                <div className="text-lg lg:text-2xl font-bold text-gray-800">고민순삭</div>
              </div>

              <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">정보 수정이 완료되었습니다</h3>
              <p className="text-gray-600 lg:text-lg mb-8 lg:mb-10">정상적으로 계정이 등록되었습니다</p>

              <div className="w-full">
                <button
                  onClick={() => handleModalAction('mypage')}
                  className="w-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white py-4 lg:py-5 rounded-xl lg:rounded-2xl font-bold text-lg lg:text-xl hover:shadow-lg transition"
                >
                  홈으로
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditCounselorInfo;
