import React from 'react';
import { useParams } from 'react-router-dom';
import BoardForm from './BoardForm';

const BoardEdit = () => {
  const { b_id } = useParams();
  return <BoardForm mode="edit" postId={b_id} />;
};

export default BoardEdit;
