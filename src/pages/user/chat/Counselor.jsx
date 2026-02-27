import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CounselorList from './CounselorList';
import CounselorChat from './CounselorChat';

const Counselor = () => {
  return (
    <Routes>
      <Route index element={<CounselorList />} />
      <Route path=":cnsl_id" element={<CounselorChat />} />
    </Routes>
  );
};

export default Counselor;
