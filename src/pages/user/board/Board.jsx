import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../../components/ProtectedRoute';
import BoardList from './BoardList';
import BoardWrite from './BoardWrite';
import BoardView from './BoardView';
import BoardEdit from './BoardEdit';

const Board = () => {
  return (
    <Routes>
      <Route index element={<BoardList />} />
      <Route
        path="write"
        element={
          <ProtectedRoute allowRoles={['USER']}>
            <BoardWrite />
          </ProtectedRoute>
        }
      />
      <Route path="view/:b_id" element={<BoardView />} />
      <Route
        path="edit/:b_id"
        element={
          <ProtectedRoute allowRoles={['USER']}>
            <BoardEdit />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default Board;
