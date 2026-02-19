import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { counselorProfile, counselorReviews } from './counselorProfileData';

const CounselorProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 별점 렌더링
  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  const handleReviewClick = (reviewId) => {
    navigate(`/system/info/review/${reviewId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">상담사 프로필</h1>
        <button
          onClick={() => navigate('/system/info/about')}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded border-2 border-white font-semibold hover:bg-blue-700 transition"
        >
          수정
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="bg-white">
        {/* 배너 이미지 */}
        <div className="relative">
          <img src={counselorProfile.profileImage} alt="배너" className="w-full h-48 object-cover" />
          {/* 프로필 사진 */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <img
              src="https://via.placeholder.com/120"
              alt="프로필"
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
          </div>
        </div>

        {/* 상담사 정보 */}
        <div className="pt-16 px-4 pb-6 text-center">
          <h2 className="text-xl font-bold mb-2">{counselorProfile.name}</h2>
          <p className="text-blue-600 text-sm mb-3">{counselorProfile.title}</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {counselorProfile.tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* 심리상담사 소개 */}
        <div className="px-4 py-6 border-t border-gray-200">
          <h3 className="text-lg font-bold mb-3">심리상담사 소개</h3>

          <h4 className="font-semibold mb-2">{counselorProfile.introduction.title}</h4>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{counselorProfile.introduction.content}</p>

          <h4 className="font-semibold mb-2">공인 자격 및 경력</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            {counselorProfile.certifications.map((cert, index) => (
              <li key={index} className="text-gray-700 text-sm">
                {cert}
              </li>
            ))}
          </ul>

          <h4 className="font-semibold mb-2">기타 경력</h4>
          <ul className="list-disc list-inside space-y-1">
            {counselorProfile.otherInfo.map((info, index) => (
              <li key={index} className="text-gray-700 text-sm">
                {info}
              </li>
            ))}
          </ul>
        </div>

        {/* 심리상담 세션 소개 */}
        <div className="px-4 py-6 border-t border-gray-200">
          <h3 className="text-lg font-bold mb-3">{counselorProfile.detailedIntro.title}</h3>

          <h4 className="font-semibold mb-2">{counselorProfile.detailedIntro.subtitle}</h4>
          <ul className="list-disc list-inside space-y-2">
            {counselorProfile.detailedIntro.sections.map((section, index) => (
              <li key={index} className="text-gray-700 text-sm leading-relaxed">
                {section.content}
              </li>
            ))}
          </ul>
        </div>

        {/* 상담 진행 방식 */}
        <div className="px-4 py-6 border-t border-gray-200">
          <h3 className="text-lg font-bold mb-3">{counselorProfile.expectation.title}</h3>

          <ol className="space-y-4">
            {counselorProfile.expectation.steps.map((step) => (
              <li key={step.step} className="text-gray-700 text-sm leading-relaxed">
                <span className="font-semibold">{step.step}.</span> {step.content}
              </li>
            ))}
          </ol>
        </div>

        {/* 상담 리뷰 */}
        <div className="px-4 py-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">상담 리뷰</h3>
            <button
              onClick={() => navigate('/system/info/reviews')}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              전체 보기 +
            </button>
          </div>

          <div className="space-y-4">
            {counselorReviews.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleReviewClick(review.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{review.author}</span>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <div className="mb-2">
                  <span className="text-yellow-500">{renderStars(review.rating)}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorProfile;
