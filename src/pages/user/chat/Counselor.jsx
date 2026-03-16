import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import CounselorList from "./CounselorList";
import CounselorView from "./CounselorView";
import CounselorReviews from "./CounselorReviews";
import CounselorChat from "./CounselorChat";
import useAuth from "../../../hooks/useAuth";

const PcLogo =
  "https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/h_logo.png";

const Counselor = () => {
  const navigate = useNavigate();
  const { getUserInfo } = useAuth();
  const [showMbtiPersonaModal, setShowMbtiPersonaModal] = useState(false);
  const [profileCheckDone, setProfileCheckDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getUserInfo();
        if (cancelled) return;
        const mbti = data?.mbti != null ? String(data.mbti).trim() : "";
        const persona =
          data?.persona != null ? String(data.persona).trim() : "";
        if (!mbti || !persona) {
          setShowMbtiPersonaModal(true);
        }
      } catch {
        if (!cancelled) setShowMbtiPersonaModal(false);
      } finally {
        if (!cancelled) setProfileCheckDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getUserInfo]);

  const handleCancel = () => {
    setShowMbtiPersonaModal(false);
    navigate(-1);
  };

  const handleGoEditInfo = () => {
    setShowMbtiPersonaModal(false);
    navigate("/mypage/editinfo");
  };

  if (!profileCheckDone) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
        로딩 중...
      </div>
    );
  }

  if (showMbtiPersonaModal) {
    return (
      <div className="fixed inset-0 bg-black/40 lg:bg-black/50 z-50 flex items-center justify-center p-4 lg:p-8">
        <div className="w-[340px] lg:w-full lg:max-w-[500px] bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <img
              src={PcLogo}
              alt="고민순삭"
              className="h-10 lg:h-12 object-contain mb-4"
            />
            <h3 className="text-xl lg:text-2xl font-bold text-gray-800 text-center">
              상담사 상담을 위한 정보 입력
            </h3>
          </div>
          <p className="text-gray-600 text-center mb-8 lg:mb-10 text-sm lg:text-base leading-relaxed">
            상담사 상담을 진행하려면 <strong>MBTI</strong>와{" "}
            <strong>자기소개</strong> 정보가 필요합니다.
            <br />
            마이페이지에서 정보를 입력해 주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 lg:py-4 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              취소하기
            </button>
            <button
              type="button"
              onClick={handleGoEditInfo}
              className="flex-1 py-3 lg:py-4 px-6 rounded-xl bg-[#2563eb] text-white font-semibold hover:bg-[#1d4ed8] transition-colors"
            >
              정보 입력하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route index element={<CounselorList />} />
      <Route path=":c_id" element={<CounselorView />} />
      <Route path=":c_id/reviews" element={<CounselorReviews />} />
    </Routes>
  );
};

export default Counselor;
