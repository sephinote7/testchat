import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CounselorView from '../../user/chat/CounselorView';
import EditAbout from './EditAbout';

const About = () => {
  return (
    <>
      <Routes>
        {/* 상담사 시점의 프로필과 사용자 시점의 프로필이 다른 부분이 적어서 컴포넌트 공유, role에 맞게 state로 다른 부분 적용시키면 됨 */}
        <Route index element={<CounselorView />} />
        <Route path="edit/:c_id" element={<EditAbout />} />
      </Routes>
    </>
  );
};

export default About;
