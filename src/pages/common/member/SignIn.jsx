import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    const result = await signIn(email, password);

    if (result.success) {
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setError(result.error || '로그인에 실패했습니다.');
    }

    setLoading(false);
  };

  const handleKakaoLogin = () => {
    // TODO: 카카오톡 로그인 API 연동
    console.log('카카오톡 로그인 클릭');
  };

  return (
    <div className="relative w-full min-h-screen bg-[#f3f7ff] flex items-center justify-center p-4 lg:p-8">
      {/* Mobile + PC Container */}
      <div className="w-full max-w-[390px] lg:max-w-[500px] lg:max-h-[800px] min-h-screen lg:min-h-0 lg:overflow-y-auto mx-auto bg-[#f3f7ff] lg:bg-white lg:rounded-3xl lg:shadow-xl">
        <div className="px-6 pt-6 pb-24 lg:px-12 lg:py-12">
          {/* Header - PC에서 숨김 */}
          <header className="flex lg:hidden items-center gap-2 mb-6">
            <Link to="/" className="text-2xl leading-none text-gray-700">
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:gap-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm lg:text-base font-semibold lg:font-normal mb-2 text-gray-700">
                아이디
              </label>
              <input
                type="email"
                placeholder="아이디"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 lg:h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm lg:text-base lg:font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                disabled={loading}
              />
              {error && email === '' && (
                <p className="mt-1 text-xs lg:text-xs text-red-600">유효하지 않은 아이디입니다</p>
              )}
            </div>

            <div>
              <label className="block text-sm lg:text-base font-semibold lg:font-normal mb-2 text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 lg:h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm lg:text-base lg:font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                disabled={loading}
              />
              {error && password === '' && (
                <p className="mt-1 text-xs lg:text-xs text-red-600">아이디 혹은 패스워드를 다시 확인해 주세요</p>
              )}
            </div>

            <button
              type="submit"
              className="mt-2 h-11 lg:h-12 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm lg:text-base font-semibold lg:font-normal disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            {/* 카카오톡 로그인 버튼 */}
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="h-11 lg:h-12 rounded-xl bg-[#FEE500] hover:bg-[#FDDC00] text-[#191919] text-sm lg:text-base font-semibold lg:font-normal flex items-center justify-center gap-2 transition-colors"
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.8 6.7L6 21.5c-.1.4.3.8.7.6l4.6-3c.2 0 .4 0 .7 0 5.5 0 10-3.6 10-8s-4.5-8-10-8z" />
              </svg>
              카카오톡 로그인
            </button>

            <div className="flex gap-3 mt-1">
              <button
                type="button"
                className="flex-1 h-10 lg:h-11 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-xs lg:text-sm font-semibold lg:font-normal transition-colors"
              >
                아이디/비밀번호 찾기
              </button>
              <Link
                to="/member/signup"
                className="flex-1 h-10 lg:h-11 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-xs lg:text-sm font-semibold lg:font-normal flex items-center justify-center transition-colors"
              >
                회원가입
              </Link>
            </div>
          </form>

          <div className="mt-8 lg:mt-10 flex items-center justify-center gap-2 text-xs lg:text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm lg:text-sm">★</span>
              </div>
              <div>
                <div className="text-xs lg:text-xs text-gray-600">Healing Therapy</div>
                <div className="font-semibold text-sm lg:text-sm text-gray-700">고민순삭</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 로그인 완료 모달 */}
      {showSuccessModal && (
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
            <h3 className="text-2xl lg:text-[30px] font-bold lg:font-semibold mb-3 text-gray-800">로그인 완료</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6">정상적으로 로그인 되었습니다</p>
            <button
              onClick={() => navigate('/')}
              className="w-full h-12 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm lg:text-base font-semibold lg:font-normal transition-colors"
            >
              로그인으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
