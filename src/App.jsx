import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import KakaoAdditionalRedirect from './components/KakaoAdditionalRedirect';
import Home from './pages/common/home/Home';
import Chat from './pages/user/chat/Chat';
import Board from './pages/user/board/Board';
import Info from './pages/user/info/Info';
import Member from './pages/common/member/Member';
import MyPage from './pages/common/mypage/MyPage';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingChatbot from './components/FloatingChatbot';
import Alarm from './pages/admin/Alarm';
import AdminNoticeForm from './pages/admin/AdminNoticeForm';
import Statistics from './pages/admin/Statistics';
import Admin from './pages/admin/Admin';
import AdminActivities from './pages/admin/AdminActivities';
import AdminKeywords from './pages/admin/AdminKeywords';
import EditAdminInfo from './pages/admin/EditAdminInfo';
import DashBoard from './pages/admin/DashBoard';
import SettlementsList from './pages/admin/SettlementsList';
import CounselorSettlementDetail from './pages/admin/CounselorSettlementDetail';
import EditInfo from './pages/system/info/EditInfo';
import MyCounsel from './pages/system/info/MyCounsel';
import MyCounselDetail from './pages/system/info/MyCounselDetail';
import MyCounselHistory from './pages/system/info/MyCounselHistory';
import MyCounselReservations from './pages/system/info/MyCounselReservations';
import About from './pages/system/info/About';
import CounselorDefaultPage from './pages/system/info/CounselorDefaultPage';
import CounselorProfile from './pages/system/info/CounselorProfile';
import ReviewDetail from './pages/system/info/ReviewDetail';
import ReviewList from './pages/system/info/ReviewList';
import EditCounselorInfo from './pages/system/info/EditCounselorInfo';
import EditCounselorAbout from './pages/system/info/EditCounselorAbout';
import CounselorClientChat from './pages/system/info/CounselorClientChat';
import ScheduleManagement from './pages/system/info/ScheduleManagement';
import RiskCaseList from './pages/system/info/RiskCaseList';
import RiskCaseDetail from './pages/system/info/RiskCaseDetail';
import { refreshAccessToken } from './axios/Auth';
import { useAuthStore } from './store/auth.store';

const App = () => {
  const { accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!accessToken) refreshAccessToken().finally(() => setIsLoading(false));
    else setIsLoading(false);
  }, [accessToken]);

  if (isLoading) return <div>로딩 중 ...</div>;

  return (
    <>
      {/* <KakaoAdditionalRedirect /> */}
      <Routes>
        {/* COMMON */}
        {/* HOME */}
        <Route path="/" element={<Home />} />
        {/* MEMBER */}
        <Route path="/member/*" element={<Member />} />
        {/* MY PAGE */}
        <Route path="/mypage/*" element={<MyPage />} />

        {/* USER */}
        {/* CHAT */}
        <Route
          path="/chat/*"
          element={
            <ProtectedRoute allowRoles={['USER', 'SYSTEM']}>
              <Chat />
            </ProtectedRoute>
          }
        />
        {/* BOARD */}
        <Route path="/board/*" element={<Board />} />
        {/* INFO */}
        <Route path="/info/*" element={<Info />} />

        {/* SYSTEM */}
        {/* COUNSELOR MY PAGE */}
        <Route
          path="/system/mypage"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <CounselorDefaultPage />
            </ProtectedRoute>
          }
        />
        {/* COUNSELOR PROFILE */}
        <Route
          path="/system/info/profile"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <CounselorProfile />
            </ProtectedRoute>
          }
        />
        {/* EDIT COUNSELOR INFO */}
        <Route
          path="/system/info/edit"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <EditCounselorInfo />
            </ProtectedRoute>
          }
        />
        {/* EDIT COUNSELOR ABOUT */}
        <Route
          path="/system/info/about"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <EditCounselorAbout />
            </ProtectedRoute>
          }
        />
        {/* SCHEDULE MANAGEMENT */}
        <Route
          path="/system/info/schedule"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <ScheduleManagement />
            </ProtectedRoute>
          }
        />
        {/* RISK CASE LIST */}
        <Route
          path="/system/info/risk-cases"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <RiskCaseList />
            </ProtectedRoute>
          }
        />
        {/* RISK CASE DETAIL - 상담사 게시글 보기 및 댓글 */}
        <Route
          path="/system/info/risk-case/:riskId"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <RiskCaseDetail />
            </ProtectedRoute>
          }
        />
        {/* REVIEW LIST */}
        <Route
          path="/system/info/reviews"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <ReviewList />
            </ProtectedRoute>
          }
        />
        {/* REVIEW DETAIL */}
        <Route
          path="/system/info/review/:reviewId"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <ReviewDetail />
            </ProtectedRoute>
          }
        />
        {/* COUNSEL HISTORY - 활동 내역 요약 */}
        <Route
          path="/system/info/counsel-history"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <MyCounsel />
            </ProtectedRoute>
          }
        />
        {/* COUNSEL HISTORY LIST - 내 상담 내역 관리 */}
        <Route
          path="/system/info/counsel-history-list"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <MyCounselHistory />
            </ProtectedRoute>
          }
        />

        {/* COUNSEL RESERVATION LIST - 내 상담 예약 관리 */}
        <Route
          path="/system/info/counsel-reservation-list"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <MyCounselReservations />
            </ProtectedRoute>
          }
        />

        {/* OLD ROUTES - 기존 라우트 유지 */}
        <Route
          path="editinfo"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <EditInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="mycounsel"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <MyCounsel />
            </ProtectedRoute>
          }
        />
        <Route
          path="mycounsel/history"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <MyCounselHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="mycounsel/reservations"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <MyCounselReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system/info/counsel/:id"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <MyCounselDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="about/*"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <About />
            </ProtectedRoute>
          }
        />

        {/* COUNSELOR CHAT WITH CLIENT */}
        <Route
          path="/counselor/:clientId/chat"
          element={
            <ProtectedRoute allowRoles={['SYSTEM']}>
              <CounselorClientChat />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        {/* ADMIN MY PAGE */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowRoles={['ADMIN']}>
              <Admin />
            </ProtectedRoute>
          }
        />
        {/* ADMIN ACTIVITIES */}
        <Route
          path="/admin/activities"
          element={
            <ProtectedRoute allowRoles={['ADMIN']}>
              <AdminActivities />
            </ProtectedRoute>
          }
        />
        {/* ADMIN KEYWORDS */}
        <Route
          path="/admin/keywords"
          element={
            <ProtectedRoute allowRoles={['ADMIN']}>
              <AdminKeywords />
            </ProtectedRoute>
          }
        />
        {/* ADMIN INFO EDIT */}
        <Route
          path="/admin/edit"
          element={
            <ProtectedRoute allowRoles={['ADMIN']}>
              <EditAdminInfo />
            </ProtectedRoute>
          }
        />
        {/* ALARM */}
        <Route
          path="/alarm/notice/write"
          element={
            <ProtectedRoute allowRoles={['ADMIN']}>
              <AdminNoticeForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alarm"
          element={
            <ProtectedRoute allowRoles={['ADMIN']}>
              <Alarm />
            </ProtectedRoute>
          }
        />
        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowRoles={['ADMIN']}>
              <DashBoard />
            </ProtectedRoute>
          }
        />
        {/* 정산 현황 · 상담사 전체 보기 */}
        <Route
          path="/admin/settlements"
          element={
            <ProtectedRoute allowRoles={['ADMIN']}>
              <SettlementsList />
            </ProtectedRoute>
          }
        />
        {/* 상담사별 정산 상세 */}
        <Route
          path="/admin/settlements/:counselorId"
          element={
            <ProtectedRoute allowRoles={['ADMIN']}>
              <CounselorSettlementDetail />
            </ProtectedRoute>
          }
        />
        {/* STATS */}
        <Route
          path="/stats"
          element={
            <ProtectedRoute allowRoles={['ADMIN']}>
              <Statistics />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* PC 전용 플로팅 챗봇 버튼 */}
      <FloatingChatbot />
    </>
  );
};

export default App;
