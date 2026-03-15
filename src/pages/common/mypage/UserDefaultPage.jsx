import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { useAuthStore } from '../../../store/auth.store';
import { signOut, deleteMember } from '../../../axios/Auth';
import { getMyPoint } from '../../../api/walletApi';

const f_logo = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/f_logo.png';

const UserDefaultPage = () => {
  const navigate = useNavigate();
  const { nickname, email, accessToken } = useAuthStore();
  const [userPoints, setUserPoints] = useState(0);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

  const modifyimg =
    'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/user_modify.png';

  const bbsList =
    'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/bbs_list.png';

  const cmList =
    'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/cm_list.png';

  const cnslList =
    'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/cnsl_list.png';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteMember = async () => {
    if (!window.confirm('회원 탈퇴를 하시겠습니까?')) return;
    try {
      await deleteMember();
      setShowDeleteSuccessModal(true);
    } catch {
      alert('탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleCloseDeleteSuccessModal = () => {
    setShowDeleteSuccessModal(false);
    navigate('/');
  };

  useEffect(() => {
    const fetchMyPoint = async () => {
      if (!email) {
        setUserPoints(0);
        return;
      }
      try {
        const data = await getMyPoint(email);
        setUserPoints(data ?? 0);
      } catch {
        setUserPoints(0);
      }
    };

    fetchMyPoint().catch(() => {});
  }, [email, accessToken, nickname]);

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-20">
        {/* CONTENT */}
        <div className="px-6 pt-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">마이페이지</h1>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteMember}
                className="cursor-pointer bg-[#ef4444] hover:bg-[#dc2626] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                회원탈퇴
              </button>
              <button
                onClick={handleLogout}
                className="cursor-pointer bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
          {/* 포인트 정보 섹션 */}
          <div className="bg-[#3b82f6] rounded-2xl overflow-hidden mb-6 shadow-lg">
            <div className="text-center py-6 px-5">
              <p className="text-white text-sm mb-2">
                {nickname ? `${nickname} 님의 잔액` : ''}
              </p>
              <p className="text-white text-4xl font-bold">
                {userPoints.toLocaleString()} P
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-white/20">
              <button
                onClick={() => navigate('/mypage/point-usage')}
                className="bg-transparent text-white font-semibold py-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border-r border-white/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                사용 내역
              </button>
              <button
                onClick={() => navigate('/mypage/point-charge')}
                className="bg-transparent text-white font-semibold py-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                충전
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 회원정보 수정 */}
            <Link
              to="/mypage/editinfo"
              className="bg-[#2563eb] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-40 shadow-md"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <img src={modifyimg} alt="회원 수정" />
              </div>
              <span className="text-white font-bold text-base">
                회원정보 수정
              </span>
            </Link>

            {/* 상담 내역 */}
            <Link
              to="/mypage/clist"
              className="bg-[#5b9cff] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-40 shadow-md"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <img src={cnslList} alt="상담 내역" />
              </div>
              <span className="text-white font-bold text-base">상담 내역</span>
            </Link>

            {/* 내 작성 글 */}
            <Link
              to="/mypage/postlist"
              className="bg-[#2563eb] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-40 shadow-md"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <img src={bbsList} alt="내 작성" />
              </div>
              <span className="text-white font-bold text-base">내 작성 글</span>
            </Link>

            {/* 내 작성 댓글 */}
            <Link
              to="/mypage/commentlist"
              className="bg-[#5b9cff] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-40 shadow-md"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <img src={cmList} alt="작성 댓글" />
              </div>
              <span className="text-white font-bold text-base">
                내 작성 댓글
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-gray-800">마이페이지</h3>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteMember}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-10 py-3 rounded-xl text-[18px] font-normal transition-colors cursor-pointer"
              >
                회원탈퇴
              </button>
              <button
                onClick={handleLogout}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-10 py-3 rounded-xl text-[18px] font-normal transition-colors cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* 포인트 정보 섹션 */}
          <div className="mb-10">
            <div className="bg-[#3b82f6] rounded-3xl overflow-hidden shadow-xl">
              <div className="text-center py-12 px-10">
                <h4 className="text-white text-2xl mb-4">
                  {nickname ? `${nickname} 님의 잔액` : ''}
                </h4>
                <h4 className="text-white text-6xl font-bold">
                  {userPoints.toLocaleString()} P
                </h4>
              </div>
              <div className="grid grid-cols-2 border-t border-white/20">
                <button
                  onClick={() => navigate('/mypage/point-usage')}
                  className="cursor-pointer bg-transparent text-white text-[24px] font-bold px-8 py-6 flex items-center justify-center gap-3 hover:bg-white/10 transition-colors text-xl border-r border-white/20"
                >
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  사용 내역
                </button>
                <button
                  onClick={() => navigate('/mypage/point-charge')}
                  className="cursor-pointer bg-transparent text-white text-[24px] font-bold px-8 py-6 flex items-center justify-center gap-3 hover:bg-white/10 transition-colors text-xl"
                >
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  충전
                </button>
              </div>
            </div>
          </div>

          {/* BUTTONS GRID */}
          <div className="grid grid-cols-2 gap-8">
            {/* 회원정보 수정 */}
            <Link
              to="/mypage/editinfo"
              className="bg-[#1e40af] hover:bg-[#1e3a8a] rounded-3xl p-12 flex flex-col items-center justify-center gap-6 shadow-lg transition-colors h-[280px]"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                <img
                  src={modifyimg}
                  alt="회원정보 수정"
                  className="w-24 h-auto"
                />
              </div>
              <h5 className="text-white font-bold">회원정보 수정</h5>
            </Link>

            {/* 상담 내역 */}
            <Link
              to="/mypage/clist"
              className="bg-[#3b82f6] hover:bg-[#2563eb] rounded-3xl p-12 flex flex-col items-center justify-center gap-6 shadow-lg transition-colors h-[280px]"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                <img src={cnslList} alt="상담 내역" className="w-24 h-auto" />
              </div>
              <h5 className="text-white font-bold">상담 내역</h5>
            </Link>

            {/* 내 작성 글 */}
            <Link
              to="/mypage/postlist"
              className="bg-[#1e40af] hover:bg-[#1e3a8a] rounded-3xl p-12 flex flex-col items-center justify-center gap-6 shadow-lg transition-colors h-[280px]"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                <img src={bbsList} alt="내 작성 글" className="w-24 h-auto" />
              </div>
              <h5 className="text-white font-bold">내 작성 글</h5>
            </Link>

            {/* 내 작성 댓글 */}
            <Link
              to="/mypage/commentlist"
              className="bg-[#3b82f6] hover:bg-[#2563eb] rounded-3xl p-12 flex flex-col items-center justify-center gap-6 shadow-lg transition-colors h-[280px]"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                <img src={cmList} alt="내 작성 댓글" className="w-24 h-auto" />
              </div>
              <h5 className="text-white font-bold text-2xl">내 작성 댓글</h5>
            </Link>
          </div>
        </div>
      </div>

      {/* 회원 탈퇴 완료 모달 */}
      {showDeleteSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-[340px] rounded-3xl bg-white px-8 py-10 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <img src={f_logo} alt="로고" />
            </div>
            <h3 className="text-2xl lg:text-[30px] font-bold lg:font-semibold mb-3 text-gray-800">회원 탈퇴 완료</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6">정상적으로 회원 탈퇴가 완료되었습니다.</p>
            <button
              type="button"
              onClick={handleCloseDeleteSuccessModal}
              className="cursor-pointer w-full h-12 rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm lg:text-base font-semibold lg:font-normal transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDefaultPage;
