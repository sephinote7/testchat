import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getCommentsForPost, posts } from './boardData';
import useAuth from '../../../hooks/useAuth';

const BoardView = () => {
  const { b_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const postId = useMemo(() => Number(b_id), [b_id]);
  const post = useMemo(() => posts.find((p) => String(p.id) === String(b_id)), [b_id]);
  const [sort, setSort] = useState('latest'); // latest | popular
  const [commentInput, setCommentInput] = useState('');

  // 모달 상태
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const [comments, setComments] = useState(() => getCommentsForPost(postId));

  // 본인 작성 글인지 확인 (테스트를 위해 postId가 짝수면 본인 글로 간주)
  const isMyPost = postId % 2 === 0;

  const sortedComments = useMemo(() => {
    const list = [...comments];
    if (sort === 'popular') {
      return list.sort((a, b) => b.likes - a.likes);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [comments, sort]);

  const handleSubmitComment = () => {
    const text = commentInput.trim();
    if (!text) return;

    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setComments((prev) => [
      {
        id: `new-${Date.now()}`,
        postId,
        author: '나',
        content: text,
        createdAt,
        likes: 0,
        replies: 0,
      },
      ...prev,
    ]);
    setCommentInput('');
  };

  const handleDeletePost = () => {
    setShowDeletePostModal(false);
    alert('게시글이 삭제되었습니다.');
    navigate('/board');
  };

  const handleDeleteComment = () => {
    if (selectedCommentId) {
      setComments((prev) => prev.filter((c) => c.id !== selectedCommentId));
      setShowDeleteCommentModal(false);
      setSelectedCommentId(null);
    }
  };

  return (
    <div className="w-full">
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-24">
        <header className="bg-[#1f4ecf] h-14 flex items-center justify-center text-white font-bold">
          고민순삭
        </header>

        <div className="px-4 pt-4">
          {/* Mobile 뒤로가기 */}
          <div className="flex items-center justify-between mb-3">
            <Link to="/board" className="text-xl leading-none">
              ←
            </Link>
            <Link to="/board" className="border border-blue-500 text-blue-500 text-xs px-3 py-1 rounded-md">
              뒤로가기
            </Link>
          </div>

          {/* 게시글 제목 & 정보 */}
          <h2 className="text-lg font-bold mb-2">{post?.title ?? '게시글'}</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pb-3 border-b border-blue-300">
            <span className="font-normal">{post?.author ?? '작성자'}</span>
            <span className="font-normal">{post?.createdAt ? post.createdAt.replace('T', ' ').slice(0, 16) : '—'}</span>
            <span className="font-normal">조회 {post?.views ?? 0}</span>
            <span className="font-normal">좋아요 {post?.likes ?? 0}</span>
            <span className="font-normal">댓글 {comments.length}</span>
          </div>

          {/* 배지 */}
          {(post?.category === 'MBTI' || post?.isNotice) && (
            <div className="pt-3 flex gap-2">
              {post?.category === 'MBTI' && post.mbti && (
                <span className="inline-flex items-center text-xs text-[#2f80ed] border border-[#2f80ed] rounded-md px-2 py-0.5 bg-white font-normal">
                  MBTI · {post.mbti}
                </span>
              )}
              {post?.isNotice && (
                <span className="inline-flex items-center text-xs text-blue-600 border border-blue-600 rounded-md px-2 py-0.5 bg-white font-normal">
                  공지
                </span>
              )}
            </div>
          )}

          {/* 게시글 본문 */}
          <div className="py-4 text-sm leading-relaxed text-gray-800 font-normal">
            {post?.content ??
              `더미 게시글 내용입니다.

상세 화면 테스트를 위해 만들어진 페이지이며, 추후 실제 API 연동 시 게시글 본문/댓글을 서버에서 받아오도록 변경하면 됩니다.`}
          </div>

          {/* 좋아요/싫어요 */}
          <div className="flex items-center justify-center gap-5 py-4 border-y border-blue-300">
            <button type="button" className="flex flex-col items-center gap-1 text-blue-600 text-xs">
              <span className="w-10 h-10 rounded-full border-2 border-blue-400 flex items-center justify-center text-xl">
                👍
              </span>
              <span className="font-normal">좋아요</span>
              <span className="text-blue-600 font-normal">15</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-1 text-gray-500 text-xs">
              <span className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center text-xl">
                👎
              </span>
              <span className="font-normal">싫어요</span>
              <span className="text-gray-500 font-normal">2</span>
            </button>
          </div>

          {/* 댓글 헤더 */}
          <div className="flex items-center gap-3 text-gray-500 text-xs py-3">
            <span className="font-normal">댓글 {comments.length}</span>
            <div className="flex-1" />
            <button type="button" className="text-base">
              💬
            </button>
            <button type="button" className="text-base">
              🔗
            </button>
            <button type="button" className="text-base">
              🔆
            </button>
          </div>

          {/* 댓글 입력 */}
          <div className="bg-white rounded-md border border-gray-300 p-3">
            <textarea
              rows={3}
              className="w-full resize-none text-sm font-normal outline-none"
              placeholder="댓글을 입력해주세요"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleSubmitComment}
                className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-normal transition-colors"
              >
                등록
              </button>
            </div>
          </div>

          {/* 댓글 정렬 */}
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
            <button
              type="button"
              className={`font-normal ${sort === 'latest' ? 'text-gray-700 font-semibold' : ''}`}
              onClick={() => setSort('latest')}
            >
              최신순
            </button>
            <button
              type="button"
              className={`font-normal ${sort === 'popular' ? 'text-gray-700 font-semibold' : ''}`}
              onClick={() => setSort('popular')}
            >
              인기순
            </button>
          </div>

          {/* 댓글 목록 */}
          <div className="mt-3 flex flex-col gap-3">
            {sortedComments.map((comment) => (
              <div key={comment.id} className="bg-white border border-gray-200 rounded-md p-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{comment.author}</p>
                      {comment.author === '나' && (
                        <button
                          onClick={() => {
                            setSelectedCommentId(comment.id);
                            setShowDeleteCommentModal(true);
                          }}
                          className="text-xs text-red-500 hover:text-red-600 font-normal"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 mt-1 font-normal">{comment.content}</p>
                    <p className="text-[11px] text-gray-400 mt-2 font-normal">{comment.createdAt}</p>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2 font-normal">
                    <span>👍 {comment.likes}</span>
                    <span>💬 {comment.replies}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-center gap-3 text-xs text-gray-600 my-4">
            <button type="button" className="font-normal">
              〈
            </button>
            <span className="text-blue-600 font-semibold">1</span>
            <span className="font-normal">2</span>
            <span className="font-normal">3</span>
            <span className="font-normal">4</span>
            <span className="font-normal">5</span>
            <span className="font-normal">6</span>
            <button type="button" className="font-normal">
              〉
            </button>
          </div>
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-8">
          {/* PC 뒤로가기 */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/board" className="flex items-center gap-2 text-base font-normal text-gray-700 hover:text-[#2f80ed]">
              <span className="text-xl">←</span>
              목록으로
            </Link>
            {isMyPost && (
              <div className="flex gap-3">
                <Link
                  to={`/board/edit/${b_id}`}
                  className="px-6 py-2 rounded-lg bg-[#2f80ed] text-white text-sm font-normal hover:bg-[#2670d4] transition-colors"
                >
                  수정
                </Link>
                <button
                  onClick={() => setShowDeletePostModal(true)}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white text-sm font-normal hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* 게시글 제목 & 정보 */}
            <h2 className="text-[30px] font-semibold mb-4">{post?.title ?? '게시글'}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pb-6 border-b border-gray-200">
              <span className="font-normal">{post?.author ?? '작성자'}</span>
              <span className="font-normal">{post?.createdAt ? post.createdAt.replace('T', ' ').slice(0, 16) : '—'}</span>
              <span className="font-normal">조회 {post?.views ?? 0}</span>
              <span className="font-normal">좋아요 {post?.likes ?? 0}</span>
              <span className="font-normal">댓글 {comments.length}</span>
            </div>

            {/* 배지 */}
            {(post?.category === 'MBTI' || post?.isNotice) && (
              <div className="pt-4 flex gap-2">
                {post?.category === 'MBTI' && post.mbti && (
                  <span className="inline-flex items-center text-sm text-[#2f80ed] border border-[#2f80ed] rounded-md px-2 py-0.5 bg-white font-normal">
                    MBTI · {post.mbti}
                  </span>
                )}
                {post?.isNotice && (
                  <span className="inline-flex items-center text-sm text-blue-600 border border-blue-600 rounded-md px-2 py-0.5 bg-white font-normal">
                    공지
                  </span>
                )}
              </div>
            )}

            {/* 게시글 본문 */}
            <div className="py-8 text-base leading-relaxed text-gray-800 font-normal">
              {post?.content ??
                `더미 게시글 내용입니다.

상세 화면 테스트를 위해 만들어진 페이지이며, 추후 실제 API 연동 시 게시글 본문/댓글을 서버에서 받아오도록 변경하면 됩니다.`}
            </div>

            {/* 좋아요/싫어요 */}
            <div className="flex items-center justify-center gap-8 py-6 border-y border-gray-200">
              <button type="button" className="flex flex-col items-center gap-2 text-blue-600 text-sm">
                <span className="w-14 h-14 rounded-full border-2 border-blue-400 flex items-center justify-center text-2xl">
                  👍
                </span>
                <span className="font-normal">좋아요</span>
                <span className="text-blue-600 font-normal">15</span>
              </button>
              <button type="button" className="flex flex-col items-center gap-2 text-gray-500 text-sm">
                <span className="w-14 h-14 rounded-full border-2 border-gray-400 flex items-center justify-center text-2xl">
                  👎
                </span>
                <span className="font-normal">싫어요</span>
                <span className="text-gray-500 font-normal">2</span>
              </button>
            </div>

            {/* 댓글 헤더 */}
            <div className="flex items-center gap-3 text-gray-500 text-sm py-4">
              <span className="font-normal">댓글 {comments.length}</span>
              <div className="flex-1" />
              <button type="button" className="text-lg">
                💬
              </button>
              <button type="button" className="text-lg">
                🔗
              </button>
              <button type="button" className="text-lg">
                🔆
              </button>
            </div>

            {/* 댓글 입력 */}
            <div className="bg-gray-50 rounded-lg border border-gray-300 p-4 mb-6">
              <textarea
                rows={3}
                className="w-full resize-none text-base font-normal outline-none bg-transparent"
                placeholder="댓글을 입력해주세요"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-normal transition-colors"
                >
                  등록
                </button>
              </div>
            </div>

            {/* 댓글 정렬 */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <button
                type="button"
                className={`font-normal ${sort === 'latest' ? 'text-gray-700 font-semibold' : ''}`}
                onClick={() => setSort('latest')}
              >
                최신순
              </button>
              <button
                type="button"
                className={`font-normal ${sort === 'popular' ? 'text-gray-700 font-semibold' : ''}`}
                onClick={() => setSort('popular')}
              >
                인기순
              </button>
            </div>

            {/* 댓글 목록 */}
            <div className="flex flex-col gap-4">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-semibold">{comment.author}</p>
                        {comment.author === '나' && (
                          <button
                            onClick={() => {
                              setSelectedCommentId(comment.id);
                              setShowDeleteCommentModal(true);
                            }}
                            className="text-sm text-red-500 hover:text-red-600 font-normal"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-2 font-normal">{comment.content}</p>
                      <p className="text-xs text-gray-400 mt-3 font-normal">{comment.createdAt}</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 font-normal">
                      <span>👍 {comment.likes}</span>
                      <span>💬 {comment.replies}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600 my-8">
              <button type="button" className="font-normal">
                〈
              </button>
              <span className="text-blue-600 font-semibold">1</span>
              <span className="font-normal">2</span>
              <span className="font-normal">3</span>
              <span className="font-normal">4</span>
              <span className="font-normal">5</span>
              <span className="font-normal">6</span>
              <button type="button" className="font-normal">
                〉
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 게시글 삭제 확인 모달 */}
      {showDeletePostModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
          <div className="relative z-10 w-full max-w-[340px] lg:max-w-[400px] rounded-2xl lg:rounded-3xl bg-white px-6 lg:px-8 py-8 lg:py-10 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg lg:text-xl">★</span>
              </div>
              <div>
                <div className="text-xs lg:text-sm text-gray-600 font-normal">Healing Therapy</div>
                <div className="font-bold text-base lg:text-lg text-gray-800">고민순삭</div>
              </div>
            </div>
            <h3 className="text-xl lg:text-[24px] font-bold lg:font-medium mb-3 lg:mb-4 text-gray-800">
              게시글을 삭제하시겠습니까?
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 font-normal">삭제 후 복구가 불가능합니다</p>
            <div className="flex gap-3 lg:gap-4">
              <button
                onClick={() => setShowDeletePostModal(false)}
                className="flex-1 h-11 lg:h-12 rounded-lg lg:rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm lg:text-base font-normal transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeletePost}
                className="flex-1 h-11 lg:h-12 rounded-lg lg:rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm lg:text-base font-normal transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 삭제 확인 모달 */}
      {showDeleteCommentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
          <div className="relative z-10 w-full max-w-[340px] lg:max-w-[400px] rounded-2xl lg:rounded-3xl bg-white px-6 lg:px-8 py-8 lg:py-10 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg lg:text-xl">★</span>
              </div>
              <div>
                <div className="text-xs lg:text-sm text-gray-600 font-normal">Healing Therapy</div>
                <div className="font-bold text-base lg:text-lg text-gray-800">고민순삭</div>
              </div>
            </div>
            <h3 className="text-xl lg:text-[24px] font-bold lg:font-medium mb-3 lg:mb-4 text-gray-800">
              댓글을 삭제하시겠습니까?
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 font-normal">삭제 후 복구가 불가능합니다</p>
            <div className="flex gap-3 lg:gap-4">
              <button
                onClick={() => {
                  setShowDeleteCommentModal(false);
                  setSelectedCommentId(null);
                }}
                className="flex-1 h-11 lg:h-12 rounded-lg lg:rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm lg:text-base font-normal transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteComment}
                className="flex-1 h-11 lg:h-12 rounded-lg lg:rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm lg:text-base font-normal transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardView;
