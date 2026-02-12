import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CounselorList from './CounselorList';
import CounselorView from './CounselorView';
import CounselorChat from './CounselorChat';

const Counselor = () => {
  return (
    <Routes>
      <Route index element={<CounselorList />} />
      <Route path=":c_id" element={<CounselorView />} />
      <Route path=":c_id/chat" element={<CounselorChat />} />
    </Routes>
  );
};

export default Counselor;
