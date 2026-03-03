import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CounselorList from './CounselorList';
import CounselorView from './CounselorView';

const Counselor = () => {
  return (
    <Routes>
      <Route index element={<CounselorList />} />
      <Route path=":c_id" element={<CounselorView />} />
    </Routes>
  );
};

export default Counselor;
