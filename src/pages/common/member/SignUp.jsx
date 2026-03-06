import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { authApi } from '../../../axios/Auth';

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, getmemberInfoNicknameCheckYn } = useAuth();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    birthdate: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    mbti: '',
    introduction: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNickname = async () => {
    try {
      const { userInfoNicknameCheckYn: result } = await getmemberInfoNicknameCheckYn(formData.nickname);
      if (result === 'Y') {
        alert('해당 닉네임은 이미 등록되어 있습니다. 고유한 닉네임을 입력해주세요.');
        return;
      } else alert('사용 가능한 닉네임입니다.');
    } catch (error) {
      console.error('nickname duplicate chck error', error.message);
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.email || !formData.password || !formData.nickname) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      nickname: formData.nickname,
      birth: formData.birthdate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'),
      mbti: formData.mbti,
      text: formData.introduction,
      social: false,
      gender: null,
      persona: null,
      profile: null,
    });

    if (result) {
      setIsSuccessOpen(true);
      navigate('/');
    } else {
      setError('회원가입에 실패했습니다.');
    }

    setLoading(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#f3f7ff] flex items-center justify-center p-0 lg:p-8">
      {/* Mobile + PC Container */}
      <div className="w-full max-w-[390px] lg:max-w-[500px] lg:h-[1122px] min-h-screen lg:min-h-0 lg:overflow-y-auto mx-auto bg-[#f3f7ff] lg:bg-white lg:rounded-3xl lg:shadow-xl">
        <div className="px-6 pt-6 pb-28 lg:px-12 lg:py-10">
          {/* Header - PC에서 숨김 */}
          <header className="flex lg:hidden items-center gap-2 mb-4">
            <Link to="/member/signin" className="text-2xl leading-none text-gray-700">
              ←
            </Link>
            <div className="flex-1 flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">★</span>
              </div>
              <div className="text-xl font-bold text-gray-800">고민순삭</div>
            </div>
            <div className="w-8"></div>
          </header>

          <p className="text-xs lg:text-xs text-right text-red-600 mb-4 lg:mb-6 lg:mt-4">
            ※ 표시 사항은 필수 입력 항목
          </p>

          {error && (
            <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm lg:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:gap-4">
            <div>
              <label className="block text-sm lg:text-base font-semibold lg:font-normal mb-2 text-gray-700">
                이메일 *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일"
                className="w-full h-11 lg:h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm lg:text-base lg:font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                disabled={loading}
                required
              />
              {error && !formData.email && (
                <p className="mt-1 text-xs lg:text-xs text-red-600">유효하지 않은 이메일입니다</p>
              )}
            </div>

            <div>
              <label className="block text-sm lg:text-base font-semibold lg:font-normal mb-2 text-gray-700">
                닉네임 *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="닉네임"
                  className="flex-1 h-11 lg:h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm lg:text-base lg:font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="cursor-pointer w-20 lg:w-24 h-11 lg:h-12 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-xs lg:text-sm font-semibold lg:font-normal transition-colors"
                  disabled={loading}
                  onClick={handleNickname}
                >
                  중복 확인
                </button>
              </div>
              {error && !formData.nickname && (
                <p className="mt-1 text-xs lg:text-xs text-red-600">
                  사용할 수 없는 닉네임입니다 / 4자 이상 12자 이하의 닉네임을 사용해 주세요
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm lg:text-base font-semibold lg:font-normal mb-2 text-gray-700">
                비밀번호 *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호"
                className="w-full h-11 lg:h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm lg:text-base lg:font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                disabled={loading}
                required
              />
              <p className="mt-1 text-xs lg:text-xs text-gray-600">
                비밀번호는 6자 이상 대/소문자 및 특수문자를 포함하여야 합니다
              </p>
            </div>

            <div>
              <label className="block text-sm lg:text-base font-semibold lg:font-normal mb-2 text-gray-700">
                비밀번호 확인 *
              </label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="비밀번호 확인"
                className="w-full h-11 lg:h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm lg:text-base lg:font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                disabled={loading}
                required
              />
              {formData.password && formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                <p className="mt-1 text-xs lg:text-xs text-red-600">비밀번호가 틀립니다. 다시 확인해 주세요</p>
              )}
            </div>

            <div>
              <label className="block text-sm lg:text-base font-semibold lg:font-normal mb-2 text-gray-700">
                생년월일 *
              </label>
              <input
                type="text"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                placeholder="생년월일을 입력해 주세요 ex)20110308"
                className="w-full h-11 lg:h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm lg:text-base lg:font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                disabled={loading}
                required
              />
              <p className="mt-1 text-xs lg:text-sm text-red-600">생년월일은 '-'를 제외한 8자리 입력해주세요</p>
            </div>

            <div>
              <label className="block text-sm lg:text-base font-semibold lg:font-normal mb-2 text-gray-700">
                MBTI 리스트 *
              </label>
              <div className="flex gap-2">
                <select
                  name="mbti"
                  value={formData.mbti}
                  onChange={handleChange}
                  className="flex-1 h-11 lg:h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm lg:text-base lg:font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                  disabled={loading}
                >
                  <option value="">MBTI 유형(리스트형)</option>
                  <option value="ISTJ">ISTJ</option>
                  <option value="ISFJ">ISFJ</option>
                  <option value="INFJ">INFJ</option>
                  <option value="INTJ">INTJ</option>
                  <option value="ISTP">ISTP</option>
                  <option value="ISFP">ISFP</option>
                  <option value="INFP">INFP</option>
                  <option value="INTP">INTP</option>
                  <option value="ESTP">ESTP</option>
                  <option value="ESFP">ESFP</option>
                  <option value="ENFP">ENFP</option>
                  <option value="ENTP">ENTP</option>
                  <option value="ESTJ">ESTJ</option>
                  <option value="ESFJ">ESFJ</option>
                  <option value="ENFJ">ENFJ</option>
                  <option value="ENTJ">ENTJ</option>
                </select>
                <button
                  type="button"
                  className="cursor-pointer w-24 lg:w-28 h-11 lg:h-12 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-[10px] lg:text-xs font-semibold lg:font-normal transition-colors leading-tight"
                  disabled={loading}
                >
                  MBTI 검사하기
                  <br />
                  (단축창)
                </button>
              </div>
              <p className="mt-1 text-xs lg:text-xs text-gray-600">필수 입력입니다.</p>
            </div>

            <div>
              <label className="block text-sm lg:text-base font-semibold lg:font-normal mb-2 text-gray-700">
                자기 소개(메모스타) <span className="text-blue-600">(선택)</span>
              </label>
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                rows={3}
                placeholder="당신을 소개해주세요.&#10;당신의 상담에 큰 도움이 될거예요."
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm lg:text-base lg:font-normal lg:min-h-[100px] resize-none focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="cursor-pointer mt-3 lg:mt-6 h-11 lg:h-12 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm lg:text-base font-semibold lg:font-normal disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6 lg:mt-10 flex items-center justify-center gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">★</span>
              </div>
              <div>
                <div className="text-xs text-gray-600">Healing Therapy</div>
                <div className="font-semibold text-sm text-gray-700">고민순삭</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 회원가입 완료 모달 */}
      {isSuccessOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-[340px] rounded-3xl bg-white px-8 py-10 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">★</span>
              </div>
              <div>
                <div className="text-sm text-gray-600">Healing Therapy</div>
                <div className="font-bold text-lg text-gray-800">고민순삭</div>
              </div>
            </div>
            <h3 className="text-2xl lg:text-[30px] font-bold lg:font-semibold mb-3 text-gray-800">회원 가입 완료</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6">정상적으로 회원 가입이 완료되었습니다</p>
            <button className="block w-full h-12 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm lg:text-base font-semibold lg:font-normal leading-[3rem] transition-colors cursor-pointer">
              <Link to="/member/signin" onClick={() => setIsSuccessOpen(false)}>
                로그인으로
              </Link>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
