import React from 'react';
import AIChat from './AIChat';
import ChatDefaultPage from './ChatDefaultPage';
import { Navigate, Route, Routes } from 'react-router-dom';
import Counselor from './Counselor';
import CounselorChat from './CounselorChat';
import VisualChat from './VisualChat';

const Chat = () => {
  return (
    <Routes>
      <Route index element={<ChatDefaultPage />} />
      <Route path="withai" element={<AIChat />} />
      <Route path="withai/:cnslId" element={<AIChat />} />
      <Route path="counselor/*" element={<Counselor />} />
      <Route path="cnslchat" element={<Navigate to="/chat/counselor" replace />} />
      <Route path="cnslchat/:id" element={<CounselorChat />} />
      <Route path="visualchat/:id" element={<VisualChat />} />
    </Routes>
  );
};

export default Chat;
