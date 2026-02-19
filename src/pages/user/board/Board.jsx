import React from 'react';
import BoardList from './BoardList';
import BoardWrite from './BoardWrite';
import { Route, Routes } from 'react-router-dom';
import BoardView from './BoardView';
import BoardEdit from './BoardEdit';

const Board = () => {
  return (
    <Routes>
      <Route index element={<BoardList />} />
      <Route path="write" element={<BoardWrite />} />
      <Route path="view/:b_id" element={<BoardView />} /> {/* http://localhost:5173/board/view/2 */}
      <Route path="edit/:b_id" element={<BoardEdit />} /> {/* http://localhost:5173/board/edit/2 */}
    </Routes>
  );
};

export default Board;
