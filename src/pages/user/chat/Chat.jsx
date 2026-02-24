import React from 'react';
import AIChat from './AIChat';
import ChatDefaultPage from './ChatDefaultPage';
import { Route, Routes } from 'react-router-dom';
import Counselor from './Counselor';
import VisualChat from './visualchat';

const Chat = () => {
  return (
    <Routes>
      <Route index element={<ChatDefaultPage />} />
      <Route path="withai" element={<AIChat />} />
      <Route path="withai/:cnslId" element={<AIChat />} />
      <Route path="counselor/*" element={<Counselor />} />
      <Route path="visualchat/:id" element={<VisualChat />} />
    </Routes>
  );
};

export default Chat;
