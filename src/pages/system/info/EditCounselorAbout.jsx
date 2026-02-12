import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditCounselorAbout = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    attachments: [],
    fontStyle: '본문',
    fontSize: '14px',
    textAlign: 'left',
    content: '',
    certifications: ['Vorem ipsum dolor sit amet', 'Vorem ipsum dolor sit amet', 'Vorem ipsum dolor sit amet'],
    otherInfo: ['Vorem ipsum dolor sit amet', 'Vorem ipsum dolor sit amet', 'Vorem ipsum dolor sit amet'],
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files],
    });
  };

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
    const newCertifications = formData.certifications.filter((_, i) => i !== index);
    setFormData({ ...formData, certifications: newCertifications });
  };

  const removeOtherInfo = (index) => {
    const newOtherInfo = formData.otherInfo.filter((_, i) => i !== index);
    setFormData({ ...formData, otherInfo: newOtherInfo });
  };

  const handleSubmit = () => {
    // 저장 로직 (백엔드 연동 시 구현)
    setShowSuccessModal(true);
  };

  const handleModalAction = (action) => {
    setShowSuccessModal(false);
    if (action === 'mypage') {
      navigate('/system/mypage');
    } else {
      navigate('/system/info/profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-center">
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

      {/* 메인 컨텐츠 */}
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">내용</h1>

        {/* 텍스트 에디터 툴바 */}
        <div className="bg-white rounded-lg mb-4 p-3 shadow">
          {/* 첫 번째 줄: 사진 첨부, 폰트 설정 */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b flex-wrap">
            <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span className="text-sm">사진 첨부</span>
              <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
            </label>

            <select
              className="px-3 py-2 border border-gray-300 rounded text-sm"
              value={formData.fontStyle}
              onChange={(e) => setFormData({ ...formData, fontStyle: e.target.value })}
            >
              <option value="본문">본문</option>
              <option value="제목">제목</option>
              <option value="부제목">부제목</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded text-sm"
              value={formData.fontSize}
              onChange={(e) => setFormData({ ...formData, fontSize: e.target.value })}
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

          {/* 첨부된 이미지 미리보기 */}
          {formData.attachments.length > 0 && (
            <div className="mb-3 flex gap-2 flex-wrap">
              {formData.attachments.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`attachment-${index}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    onClick={() => {
                      const newAttachments = formData.attachments.filter((_, i) => i !== index);
                      setFormData({ ...formData, attachments: newAttachments });
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 두 번째 줄: 텍스트 정렬 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() => handleTextAlign('left')}
              className={`p-2 rounded ${
                formData.textAlign === 'left' ? 'bg-blue-100' : 'bg-gray-100'
              } hover:bg-blue-50 transition`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => handleTextAlign('center')}
              className={`p-2 rounded ${
                formData.textAlign === 'center' ? 'bg-blue-100' : 'bg-gray-100'
              } hover:bg-blue-50 transition`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => handleTextAlign('right')}
              className={`p-2 rounded ${
                formData.textAlign === 'right' ? 'bg-blue-100' : 'bg-gray-100'
              } hover:bg-blue-50 transition`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => handleTextAlign('justify')}
              className={`p-2 rounded ${
                formData.textAlign === 'justify' ? 'bg-blue-100' : 'bg-gray-100'
              } hover:bg-blue-50 transition`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* 텍스트 입력 영역 */}
        <div className="bg-white rounded-lg p-4 shadow mb-4">
          <h2 className="text-lg font-bold mb-4">심리상담사 소개</h2>

          <h3 className="font-semibold mb-2">솔루션을 위한 첫 시작</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded min-h-[150px] mb-4"
            placeholder="내용을 입력하세요..."
            style={{
              textAlign: formData.textAlign,
              fontSize: formData.fontSize,
              fontWeight: formData.fontStyle === '제목' ? 'bold' : formData.fontStyle === '부제목' ? '600' : 'normal',
            }}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />

          <h3 className="font-semibold mb-2">공인 자격 및 경력</h3>
          <div className="space-y-2 mb-4">
            {formData.certifications.map((cert, index) => (
              <div key={index} className="flex gap-2">
                <span className="mt-2">•</span>
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  value={cert}
                  onChange={(e) => handleCertificationChange(index, e.target.value)}
                  placeholder="자격 또는 경력을 입력하세요"
                />
                <button
                  onClick={() => removeCertification(index)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded"
                >
                  삭제
                </button>
              </div>
            ))}
            <button onClick={addCertification} className="text-blue-600 text-sm hover:underline">
              + 항목 추가
            </button>
          </div>

          <h3 className="font-semibold mb-2">기타 경력</h3>
          <div className="space-y-2">
            {formData.otherInfo.map((info, index) => (
              <div key={index} className="flex gap-2">
                <span className="mt-2">•</span>
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  value={info}
                  onChange={(e) => handleOtherInfoChange(index, e.target.value)}
                  placeholder="기타 경력을 입력하세요"
                />
                <button
                  onClick={() => removeOtherInfo(index)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded"
                >
                  삭제
                </button>
              </div>
            ))}
            <button onClick={addOtherInfo} className="text-blue-600 text-sm hover:underline">
              + 항목 추가
            </button>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => navigate(-1)}
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

      {/* 정보 수정 완료 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex flex-col items-center text-center">
              {/* 로고 */}
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div className="text-sm text-gray-600">Healing Theraphy</div>
                <div className="text-lg font-bold text-gray-800">고민순삭</div>
              </div>

              <h3 className="text-xl font-bold mb-2">정보 수정 완료</h3>
              <p className="text-gray-600 mb-6">정보 수정이 완료되었습니다!</p>

              <div className="w-full space-y-3">
                <button
                  onClick={() => handleModalAction('mypage')}
                  className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition"
                >
                  메인으로
                </button>
                <button
                  onClick={() => handleModalAction('profile')}
                  className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition"
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
