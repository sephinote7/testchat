import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { counselorProfile, counselorReviews } from './counselorProfileData';
import { useAuthStore } from '../../../store/auth.store';
import useAuth from '../../../hooks/useAuth';

const CounselorProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { accessToken, nickname } = useAuthStore();
  const { getUserInfo } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [hashTags, setHashTags] = useState([]);
  const [profile, setProfile] = useState('');
  const [text, setText] = useState('');

  // 별점 렌더링
  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  const handleReviewClick = (reviewId) => {
    navigate(`/system/info/review/${reviewId}`);
  };

  useEffect(() => {
    const fetchCounselorInfo = async () => {
      const data = await getUserInfo();
      setProfileImage(data?.imgUrl);
      setHashTags(data?.hashTags?.hashTag);
      setProfile(data?.profile);
      setText(data?.text);
      console.log(data);
    };

    fetchCounselorInfo();
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 헤더 */}
      <div className="bg-blue-600 text-white p-4 flex items-center lg:hidden">
        <button onClick={() => navigate(-1)} className="mr-4">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold">상담사 프로필</h1>
        <button
          onClick={() => navigate('/system/info/about')}
          className="cursor-pointer ml-auto bg-blue-600 text-white px-4 py-2 rounded border-2 border-white font-semibold hover:bg-blue-700 transition"
        >
          수정
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="bg-white">
        {/* 배너 이미지 */}
        <div className="relative">
          <img src={null} alt="배너" className="w-full h-48 object-cover" />
          {/* 프로필 사진 */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <img
              src={profileImage}
              alt="프로필"
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
          </div>
        </div>

        {/* 상담사 정보 */}
        <div className="pt-16 px-4 pb-6 text-center">
          <h2 className="text-xl font-bold mb-2">{nickname || ''} 상담사님</h2>
          <p className="text-blue-600 text-sm mb-3">{text}</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {hashTags?.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium"
              >
                # {tag} 상담
              </span>
            ))}
          </div>
        </div>

        {/* 심리상담사 소개 */}
        <div className="px-4 py-8 border-t border-gray-200">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* 제목 */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              심리상담사 소개
            </h3>

            {/* 구분선 */}
            <div className="w-12 h-1 bg-blue-500 rounded mb-6"></div>

            {/* 프로필 내용 */}
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {profile || ''}
            </p>
          </div>
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
                  <span className="text-yellow-500">
                    {renderStars(review.rating)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorProfile;
