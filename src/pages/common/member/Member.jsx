import React from 'react';
import { Route, Routes } from 'react-router-dom';
import SignIn from './SignIn.jsx';
import SignUp from './SignUp.jsx';
import KakaoAdditionalInfo from './KakaoAdditionalInfo.jsx';
import MyPage from '../mypage/MyPage.jsx';
import ProtectedRoute from '../../../components/ProtectedRoute.jsx';

const Member = () => {
  return (
    <Routes>
      <Route path="signin" element={<SignIn />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="kakao-additional" element={<KakaoAdditionalInfo />} />
    </Routes>
  );
};

export default Member;
