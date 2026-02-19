import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/common/home/Home';
import Chat from './pages/user/chat/Chat';
import Board from './pages/user/board/Board';
import Info from './pages/user/info/Info';
import Member from './pages/common/member/Member';
import MyPage from './pages/common/mypage/MyPage';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingChatbot from './components/FloatingChatbot';
import Alarm from './pages/admin/Alarm';
import Statistics from './pages/admin/Statistics';
import Admin from './pages/admin/Admin';
import AdminActivities from './pages/admin/AdminActivities';
import EditAdminInfo from './pages/admin/EditAdminInfo';
import DashBoard from './pages/admin/DashBoard';
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

const App = () => {
  return (
    <>
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
            <ProtectedRoute allowRoles={['USER']}>
              <Chat />
            </ProtectedRoute>
          }
        />
        {/* BOARD */}
        <Route
          path="/board/*"
          element={
            <ProtectedRoute allowRoles={['USER']}>
              <Board />
            </ProtectedRoute>
          }
        />
        {/* INFO */}
        <Route
          path="/info/*"
          element={
            <ProtectedRoute allowRoles={['USER']}>
              <Info />
            </ProtectedRoute>
          }
        />

        {/* SYSTEM */}
        {/* COUNSELOR MY PAGE */}
        <Route
          path="/system/mypage"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <CounselorDefaultPage />
            </ProtectedRoute>
          }
        />
        {/* COUNSELOR PROFILE */}
        <Route
          path="/system/info/profile"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <CounselorProfile />
            </ProtectedRoute>
          }
        />
        {/* EDIT COUNSELOR INFO */}
        <Route
          path="/system/info/edit"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <EditCounselorInfo />
            </ProtectedRoute>
          }
        />
        {/* EDIT COUNSELOR ABOUT */}
        <Route
          path="/system/info/about"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <EditCounselorAbout />
            </ProtectedRoute>
          }
        />
        {/* SCHEDULE MANAGEMENT */}
        <Route
          path="/system/info/schedule"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <ScheduleManagement />
            </ProtectedRoute>
          }
        />
        {/* RISK CASE LIST */}
        <Route
          path="/system/info/risk-cases"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <RiskCaseList />
            </ProtectedRoute>
          }
        />
        {/* REVIEW LIST */}
        <Route
          path="/system/info/reviews"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <ReviewList />
            </ProtectedRoute>
          }
        />
        {/* REVIEW DETAIL */}
        <Route
          path="/system/info/review/:reviewId"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <ReviewDetail />
            </ProtectedRoute>
          }
        />
        {/* COUNSEL HISTORY - 활동 내역 요약 */}
        <Route
          path="/system/info/counsel-history"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <MyCounsel />
            </ProtectedRoute>
          }
        />
        {/* COUNSEL HISTORY LIST - 내 상담 내역 관리 */}
        <Route
          path="/system/info/counsel-history-list"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <MyCounselHistory />
            </ProtectedRoute>
          }
        />
        {/* OLD ROUTES - 기존 라우트 유지 */}
        <Route
          path="editinfo"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <EditInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="mycounsel"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <MyCounsel />
            </ProtectedRoute>
          }
        />
        <Route
          path="mycounsel/history"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <MyCounselHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="mycounsel/reservations"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <MyCounselReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="mycounsel/:id"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <MyCounselDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="about/*"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
              <About />
            </ProtectedRoute>
          }
        />

        {/* COUNSELOR CHAT WITH CLIENT */}
        <Route
          path="/counselor/:clientId/chat"
          element={
            <ProtectedRoute allowRoles={['COUNSELOR']}>
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
