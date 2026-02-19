import React from 'react';
import EditInfo from './EditInfo';
import EditInfo_Counselor from '../../system/info/EditInfo';
import CounselList from './CounselList';
import AICounselDetail from './AICounselDetail';
import CounselorCounselDetail from './CounselorCounselDetail';
import { Route, Routes } from 'react-router-dom';
import MyPost from './MyPost';
import MyComment from './MyComment';
import useAuth from '../../../hooks/useAuth';
import MyCounsel from '../../system/info/MyCounsel';
import About from '../../system/info/About';
import UserDefaultPage from './UserDefaultPage';
import CounselorDefaultPage from '../../system/info/CounselorDefaultPage';
import DashBoard from '../../admin/DashBoard';
import Alarm from '../../admin/Alarm';
import Statistics from '../../admin/Statistics';
import Admin from '../../admin/Admin';
import AdminActivities from '../../admin/AdminActivities';
import PointCharge from './PointCharge';
import PointUsageHistory from './PointUsageHistory';

const MyPage = () => {
  const { user } = useAuth();

  if (user.role === 'USER') {
    return (
      <Routes>
        <Route index element={<UserDefaultPage />} />
        <Route path="edit" element={<EditInfo />} />
        <Route path="editinfo" element={<EditInfo />} />
        <Route path="clist" element={<CounselList />} />
        <Route path="counsel/ai/:id" element={<AICounselDetail />} />
        <Route path="counsel/counselor/:id" element={<CounselorCounselDetail />} />
        <Route path="postlist" element={<MyPost />} />
        <Route path="commentlist" element={<MyComment />} />
        <Route path="point-charge" element={<PointCharge />} />
        <Route path="point-usage" element={<PointUsageHistory />} />
      </Routes>
    );
  } else if (user.role === 'SYSTEM') {
    return (
      <Routes>
        <Route index element={<CounselorDefaultPage />} />
        <Route path="edit" element={<EditInfo_Counselor />} />
        <Route path="editinfo" element={<EditInfo_Counselor />} />
        <Route path="about" element={<About />} />
        <Route path="mycounsel" element={<MyCounsel />} />
      </Routes>
    );
  } else if (user.role === 'ADMIN') {
    return (
      <Routes>
        <Route index element={<Admin />} />
        <Route path="edit" element={<EditInfo />} />
        <Route path="activities" element={<AdminActivities />} />
        <Route path="dashboard" element={<DashBoard />} />
        <Route path="alarm" element={<Alarm />} />
        <Route path="statistics" element={<Statistics />} />
      </Routes>
    );
  }

  return null;
};

export default MyPage;
