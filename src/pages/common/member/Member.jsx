import React from 'react';
import { Route, Routes } from 'react-router-dom';
import SignIn from './SignIn.jsx';
import SignUp from './SignUp.jsx';
import MyPage from '../mypage/MyPage.jsx';

const Member = () => {
  return (
    <Routes>
      <Route path="signin" element={<SignIn />} />
      <Route path="signup" element={<SignUp />} />
    </Routes>
  );
};

export default Member;
