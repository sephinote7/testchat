import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import useAuth from '../../../hooks/useAuth';

const EditCounselorAbout = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const { getUserInfo } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    fontStyle: '본문',
    fontSize: '14px',
    textAlign: 'left',
    profile: '',
  });

  const handleTextAlign = (align) => {
    setFormData({ ...formData, textAlign: align });
  };

  const handleCertificationChange = (index, value) => {
    const newCertifications = [...formData.certifications];
    newCertifications[index] = value;
    setFormData({ ...formData, certifications: newCertifications });
  };

  const handleOtherInfoChange = (index, value) => {
    const newOtherInfo = [...formData.otherInfo];
    newOtherInfo[index] = value;
    setFormData({ ...formData, otherInfo: newOtherInfo });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, ''],
    });
  };

  const addOtherInfo = () => {
    setFormData({
      ...formData,
      otherInfo: [...formData.otherInfo, ''],
    });
  };

  const removeCertification = (index) => {
    const newCertifications = formData.certifications.filter(
      (_, i) => i !== index,
    );
    setFormData({ ...formData, certifications: newCertifications });
  };

  const removeOtherInfo = (index) => {
    const newOtherInfo = formData.otherInfo.filter((_, i) => i !== index);
    setFormData({ ...formData, otherInfo: newOtherInfo });
  };

  const handleSubmit = async () => {
    try {
      await editInfo({
        profile: formData.profile || null,
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('프로필 수정 오류: ', error);
      alert('프로필 수정에 실패했습니다: ' + error.message);
    }
  };

  const handleModalAction = (action) => {
    setShowSuccessModal(false);
    if (action === 'mypage') {
      navigate('/system/mypage');
    } else {
      navigate('/system/info/profile');
    }
  };

  useEffect(() => {
    const fetchCounselorInfo = async () => {
      const data = await getUserInfo();
      setFormData({ ...formData, profile: data?.profile });
    };

    fetchCounselorInfo();
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <div className="bg-blue-600 text-white p-4 flex items-center justify-center md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none" aria-hidden="true">
            ★
          </span>
          <span className="font-bold text-lg">고민순삭</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="absolute right-4 px-3 py-1 border border-white rounded text-sm hover:bg-blue-700 transition"
        >
          뒤로가기
        </button>
      </div>

      <div className="p-4 sm:p-6 md:p-8 max-w-[1520px] mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">내용</h1>

        <div className="bg-white rounded-lg mb-4 p-3 sm:p-4 shadow">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mb-3 pb-3 border-b">
            <select
              className="px-3 py-2 border border-gray-300 rounded text-sm sm:text-base"
              value={formData.fontStyle}
              onChange={(e) =>
                setFormData({ ...formData, fontStyle: e.target.value })
              }
            >
              <option value="본문">본문</option>
              <option value="제목">제목</option>
              <option value="부제목">부제목</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded text-sm sm:text-base"
              value={formData.fontSize}
              onChange={(e) =>
                setFormData({ ...formData, fontSize: e.target.value })
              }
            >
              <option value="10px">10px</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleTextAlign('left')}
              className={`cursor-pointer p-2 rounded ${
                formData.textAlign === 'left' ? 'bg-blue-100' : 'bg-gray-100'
              } hover:bg-blue-50 transition`}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h10M4 18h16"
                />
              </svg>
            </button>
            <button
              onClick={() => handleTextAlign('center')}
              className={`cursor-pointer p-2 rounded ${
                formData.textAlign === 'center' ? 'bg-blue-100' : 'bg-gray-100'
              } hover:bg-blue-50 transition`}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <button
              onClick={() => handleTextAlign('right')}
              className={`cursor-pointer p-2 rounded ${
                formData.textAlign === 'right' ? 'bg-blue-100' : 'bg-gray-100'
              } hover:bg-blue-50 transition`}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M10 12h10M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow mb-4">
          <h2 className="text-lg sm:text-xl font-bold mb-4">심리상담사 소개</h2>

          <h3 className="font-semibold mb-2">프로필 또는 자격 및 경력</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded min-h-[200px] sm:min-h-[250px]"
            placeholder="상담사 소개, 자격, 경력 등을 자유롭게 입력하세요..."
            style={{
              textAlign: formData.textAlign,
              fontSize: formData.fontSize,
              fontWeight:
                formData.fontStyle === '제목'
                  ? 'bold'
                  : formData.fontStyle === '부제목'
                    ? '600'
                    : 'normal',
            }}
            value={formData.profile}
            onChange={(e) =>
              setFormData({
                ...formData,
                profile: e.target.value,
              })
            }
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer flex-1 border border-blue-600 text-blue-600 py-3 rounded font-medium hover:bg-blue-50 transition"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="cursor-pointer flex-1 bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition"
          >
            완료
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm sm:max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600"
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
                <div className="text-sm sm:text-base text-gray-600">
                  Healing Theraphy
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-800">
                  고민순삭
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                정보 수정 완료
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                정보 수정이 완료되었습니다!
              </p>

              <div className="w-full space-y-3 sm:space-y-0 sm:flex sm:gap-3">
                <button
                  onClick={() => handleModalAction('mypage')}
                  className="w-full sm:flex-1 bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition"
                >
                  메인으로
                </button>
                <button
                  onClick={() => handleModalAction('profile')}
                  className="w-full sm:flex-1 bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition"
                >
                  이전으로
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCounselorAbout;
