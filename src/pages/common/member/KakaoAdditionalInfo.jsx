import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useAuth from '../../../hooks/useAuth';
import { memberApi } from '../../../api/backendApi';
import { MBTI_OPTIONS } from '../../user/board/boardData';
import { useAuthStore } from '../../../store/auth.store';

const KakaoAdditionalInfo = () => {
  const navigate = useNavigate();
  const {
    getmemberInfoNicknameCheckYn,
    loading: authLoading,
    kakaoSignUp,
  } = useAuth();
  const { nickname } = useAuthStore();
  const setNickname = useAuthStore((state) => state.setNickname);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    birthdate: '',
    nickname: '',
    mbti: '',
    introduction: '',
  });

  // 뒤로가기나 이런 거 못 가게 해야 됨 !!

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nickname) {
      setError('닉네임 필수 입력 항목입니다.');
      return;
    }

    const birthRaw = formData.birthdate.replace(/-/g, '');
    let birth = null;
    if (birthRaw) {
      const birthRegex = /^\d{8}$/;
      if (!birthRegex.test(birthRaw)) {
        setError("생년월일은 '-'를 제외한 8자리로 입력해주세요. (예: 20110308)");
        return;
      }

      // 실제 날짜 검증
      const year = Number(birthRaw.substring(0, 4));
      const month = Number(birthRaw.substring(4, 6));
      const day = Number(birthRaw.substring(6, 8));

      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
      ) {
        setError('존재하지 않는 날짜입니다.');
        return;
      }

      const today = new Date();
      if (date > today) {
        setError('미래 날짜는 입력할 수 없습니다.');
        return;
      }

      birth = birthRaw;
    }

    setLoading(true);

    try {
      //       nickname: '',
      // birthdate: '',
      // mbti: '',
      // introduction: '',
      const result = await kakaoSignUp({
        nickname: formData.nickname,
        gender: null,
        mbti: formData.mbti || null,
        birth: birth
          ? birth.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3')
          : null,
        persona: formData.introduction || null,
        profile: null,
        text: null,
      });

      if (result) {
        setNickname(formData.nickname);
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        setError(error.response.data.detail);
      }
    }

    // try {
    //   const {
    //     data: { user: currentUser },
    //   } = await supabase.auth.getUser();
    //   if (!currentUser) {
    //     setError('로그인 세션이 없습니다. 다시 로그인해 주세요.');
    //     setLoading(false);
    //     navigate('/member/signin');
    //     return;
    //   }

    //   const { error: updateError } = await supabase.auth.updateUser({
    //     data: {
    //       ...currentUser.user_metadata,
    //       nickname: formData.nickname,
    //       birthdate: formData.birthdate,
    //       mbti: formData.mbti || '',
    //       introduction: formData.introduction || '',
    //       kakao_additional_done: true,
    //     },
    //   });

    //   if (updateError) throw updateError;

    //   // 백엔드 member 테이블에 동기화 (게시글 작성 등에 필요)
    //   const memberId = currentUser.email || currentUser.id;
    //   memberApi.sync({ memberId, nickname: formData.nickname }).catch(() => {});

    //   navigate('/', { replace: true });
    // } catch (err) {
    //   console.error('추가 정보 저장 오류:', err);
    //   setError(err.message || '저장에 실패했습니다. 다시 시도해 주세요.');
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleNickname = async () => {
    try {
      if (formData.nickname.trim() === '') {
        alert('닉네임을 입력해 주세요.');
        return;
      }
      const { userInfoNicknameCheckYn: result } =
        await getmemberInfoNicknameCheckYn(formData.nickname);
      if (result === 'Y') {
        alert(
          '해당 닉네임은 이미 등록되어 있습니다. 고유한 닉네임을 입력해주세요.',
        );
        return;
      } else alert('사용 가능한 닉네임입니다.');
    } catch (error) {
      const msg = error?.message ?? '닉네임 확인에 실패했습니다.';
      alert(msg);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f3f7ff] flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#f3f7ff] flex items-center justify-center p-0 lg:p-8">
      <div className="w-full max-w-[390px] lg:max-w-[500px] min-h-screen lg:min-h-0 lg:overflow-y-auto mx-auto bg-[#f3f7ff] lg:bg-white lg:rounded-3xl lg:shadow-xl">
        <div className="px-6 pt-6 pb-28 lg:px-12 lg:py-10">
          <header className="flex lg:hidden items-center gap-2 mb-4">
            <div className="flex-1 flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">★</span>
              </div>
              <div className="text-xl font-bold text-gray-800">고민순삭</div>
            </div>
            <div className="w-8"></div>
          </header>

          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mt-4 mb-1">
            카카오 로그인 완료!
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            서비스 이용을 위해 추가 정보를 입력해주세요.
          </p>
          <p className="text-xs text-red-600 mb-4">
            *표시 사항은 필수 입력 항목
          </p>

          {error && (
            <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 lg:gap-4"
          >
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                닉네임 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="닉네임"
                  className="flex-1 h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={handleNickname}
                  className="w-20 h-11 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-xs font-semibold transition-colors"
                  disabled={loading}
                >
                  중복확인
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                생년월일
              </label>
              <input
                type="text"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                placeholder="생년월일을 입력해 주세요 ex]20110308"
                className="w-full h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                MBTI 리스트
              </label>
              <div className="flex gap-2">
                <select
                  name="mbti"
                  value={formData.mbti}
                  onChange={handleChange}
                  className="flex-1 h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                  disabled={loading}
                >
                  <option value="">MBTI 작성(리스트로)</option>
                  {MBTI_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="w-24 h-11 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-[10px] font-semibold transition-colors leading-tight"
                  disabled={loading}
                >
                  MBTI 검사하기
                  <br />
                  (모달로)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                자기 소개(페르소나)
              </label>
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                rows={3}
                placeholder="당신을 소개해주세요. 당신의 상담에 큰 도움이 될거예요."
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="mt-3 h-11 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm font-semibold disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading ? '저장 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">★</span>
              </div>
              <div>
                <div className="text-xs text-gray-600">Happy Com. service</div>
                <div className="font-semibold text-sm text-gray-700">
                  고민순삭
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KakaoAdditionalInfo;
