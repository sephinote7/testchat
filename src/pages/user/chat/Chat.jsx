import React from 'react';
import AIChat from './AIChat';
import ChatDefaultPage from './ChatDefaultPage';
import { Route, Routes } from 'react-router-dom';
import Counselor from './Counselor';

const Chat = () => {
  return (
    <Routes>
      <Route index element={<ChatDefaultPage />} />
      <Route path="withai" element={<AIChat />} />
      <Route path="counselor/*" element={<Counselor />} />
    </Routes>
  );
};

export default Chat;
