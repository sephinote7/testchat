import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { useAuthStore } from '../../../store/auth.store';
import { bbsApi } from '../../../api/backendApi';

const formatCommentDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
};

const f_logo =
  'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/f_logo.png';

const BoardView = () => {
  const { b_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeEmail = useAuthStore((s) => s.email);
  const storeAccessToken = useAuthStore((s) => s.accessToken);
  const { roleName } = useAuthStore();
  const postId = useMemo(() => Number(b_id), [b_id]);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('latest');
  const [commentInput, setCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentLikeSubmitting, setCommentLikeSubmitting] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [likeSubmitting, setLikeSubmitting] = useState(false);

  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const [comments, setComments] = useState([]);

  const mapCommentRow = useCallback(
    (c) => ({
      id: c.cmt_id,
      postId,
      author: c.memberId?.nickname ?? c.memberId?.memberId ?? '—',
      content: c.content,
      createdAt: c.created_at ?? c.createdAt,
      likeCount: c.likeCount ?? 0,
      dislikeCount: c.dislikeCount ?? 0,
      memberId: c.memberId?.memberId ?? c.member_id,
    }),
    [postId],
  );

  const fetchComments = useCallback(() => {
    if (!postId) return;
    bbsApi
      .getComments(postId)
      .then((list) => {
        const mapped = (list || []).map(mapCommentRow);
        setComments(mapped);
      })
      .catch(() => setComments([]));
  }, [postId, mapCommentRow]);

  const fetchLikeCounts = useCallback(() => {
    if (!postId) return;
    bbsApi
      .getLikeCounts(postId)
      .then((res) => {
        setLikeCount(res.likeCount ?? 0);
        setDislikeCount(res.dislikeCount ?? 0);
      })
      .catch(() => {});
  }, [postId]);

  // 상세/댓글/좋아요 병렬 요청으로 로딩 시간 단축
  useEffect(() => {
    if (!b_id || !postId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      bbsApi.getById(b_id),
      bbsApi.getComments(postId),
      bbsApi.getLikeCounts(postId),
    ])
      .then(([b, commentList, likeRes]) => {
        if (cancelled) return;
        const author =
          b.memberId?.nickname ??
          b.memberId?.email ??
          (typeof b.memberId === 'string' ? b.memberId : '알 수 없음');
        const category =
          b.bbs_div === 'NOTI'
            ? '공지'
            : b.bbs_div === 'FREE'
              ? '자유'
              : b.bbs_div || '자유';
        setPost({
          id: b.bbsId,
          category,
          isNotice: b.bbs_div === 'NOTI',
          title: b.title,
          author,
          createdAt: b.created_at,
          views: b.views ?? 0,
          likes: likeRes?.likeCount ?? 0,
          comments: Array.isArray(commentList) ? commentList.length : 0,
          mbti: b.mbti,
          content: b.content,
        });
        const mapped = (commentList || []).map(mapCommentRow);
        setComments(mapped);
        setLikeCount(likeRes?.likeCount ?? 0);
        setDislikeCount(likeRes?.dislikeCount ?? 0);
      })
      .catch(() => {
        if (!cancelled) setPost(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [b_id, postId]);

  const isMyPost = false;

  const sortedComments = useMemo(() => {
    const list = [...comments];
    if (sort === 'popular') {
      return list.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
    }
    return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [comments, sort]);

  // Supabase 세션 또는 Spring 로그인(store) — Spring 로그인 시 user는 비어 있음
  const userIdForApi = user?.email ?? user?.id ?? storeEmail ?? null;
  const isLoggedIn = user?.isLogin === true || !!storeAccessToken;

  const handleSubmitComment = () => {
    const text = commentInput.trim();
    if (!text) return;
    if (!isLoggedIn || !userIdForApi) {
      alert('로그인 후 댓글을 작성할 수 있습니다.');
      return;
    }
    setCommentSubmitting(true);
    bbsApi
      .addComment(postId, { content: text }, userIdForApi)
      .then(() => {
        setCommentInput('');
        fetchComments();
      })
      .catch((e) =>
        alert(e?.message || '댓글 작성 실패. 로그인 후 이용해 주세요.'),
      )
      .finally(() => setCommentSubmitting(false));
  };

  const copyPostUrl = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => alert('게시글 링크가 복사되었습니다.'))
      .catch(() => {
        try {
          const ta = document.createElement('textarea');
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          alert('게시글 링크가 복사되었습니다.');
        } catch {
          alert('복사에 실패했습니다.');
        }
      });
  }, []);

  const handleCommentLike = (cmtId, isLike) => {
    if (!isLoggedIn || !userIdForApi) {
      alert('로그인 후 이용해 주세요.');
      return;
    }
    setCommentLikeSubmitting(cmtId);
    bbsApi
      .toggleCommentLike(cmtId, { is_like: isLike }, userIdForApi)
      .then(() => fetchComments())
      .catch((e) => alert(e?.message || '처리 실패'))
      .finally(() => setCommentLikeSubmitting(null));
  };

  const handleDeletePost = () => {
    if (!isLoggedIn) {
      alert('로그인 후 삭제할 수 있습니다.');
      return;
    }
    setShowDeletePostModal(false);
    bbsApi
      .delete(postId, userIdForApi)
      .then(() => {
        alert('게시글이 삭제되었습니다.');
        navigate('/board');
      })
      .catch((e) => alert(e?.message || '삭제 실패'));
  };

  const handleDeleteComment = () => {
    if (!selectedCommentId) return;
    bbsApi
      .deleteComment(selectedCommentId, userIdForApi)
      .then(() => {
        setComments((prev) => prev.filter((c) => c.id !== selectedCommentId));
        setShowDeleteCommentModal(false);
        setSelectedCommentId(null);
      })
      .catch((e) => alert(e?.message || '삭제 실패'));
  };

  const handleLike = (isLike) => {
    if (likeSubmitting) return;
    if (!isLoggedIn) {
      alert('로그인 후 좋아요를 누를 수 있습니다.');
      return;
    }
    setLikeSubmitting(true);
    bbsApi
      .toggleLike(postId, { is_like: isLike }, userIdForApi)
      .then((res) => {
        if (res.likeCounts) {
          setLikeCount(res.likeCounts.likeCount ?? 0);
          setDislikeCount(res.likeCounts.dislikeCount ?? 0);
        } else fetchLikeCounts();
      })
      .catch((e) => alert(e?.message || '로그인 후 이용해 주세요.'))
      .finally(() => setLikeSubmitting(false));
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
            <Link
              to="/board"
              className="border border-blue-500 text-blue-500 text-xs px-3 py-1 rounded-md"
            >
              뒤로가기
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              로딩 중...
            </div>
          ) : !post ? (
            <div className="py-10 text-center text-sm text-gray-500">
              게시글을 찾을 수 없습니다.
            </div>
          ) : (
            <div>
              {/* 게시글 제목 & 정보 */}
              <h2 className="text-lg font-bold mb-2">{post.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pb-3 border-b border-blue-300">
                <span className="font-normal">{post?.author ?? '작성자'}</span>
                <span className="font-normal">
                  {post?.createdAt
                    ? post.createdAt.replace('T', ' ').slice(0, 16)
                    : '—'}
                </span>
                <span className="font-normal">조회 {post?.views ?? 0}</span>
                <span className="font-normal">좋아요 {likeCount}</span>
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
                  `더미 게시글 내용입니다.\n\n상세 화면 테스트용.`}
              </div>

              {/* 좋아요/싫어요 */}
              <div className="flex items-center justify-center gap-5 py-4 border-y border-blue-300">
                <button
                  type="button"
                  onClick={() => handleLike(true)}
                  disabled={likeSubmitting || !isLoggedIn}
                  className="flex flex-col items-center gap-1 text-blue-600 text-xs disabled:opacity-60"
                  title={
                    !isLoggedIn ? '로그인 후 좋아요를 누를 수 있습니다.' : ''
                  }
                >
                  <span className="w-10 h-10 rounded-full border-2 border-blue-400 flex items-center justify-center text-xl">
                    👍
                  </span>
                  <span className="font-normal">좋아요</span>
                  <span className="text-blue-600 font-normal">{likeCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLike(false)}
                  disabled={likeSubmitting || !isLoggedIn}
                  className="flex flex-col items-center gap-1 text-gray-500 text-xs disabled:opacity-60"
                  title={
                    !isLoggedIn ? '로그인 후 싫어요를 누를 수 있습니다.' : ''
                  }
                >
                  <span className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center text-xl">
                    👎
                  </span>
                  <span className="font-normal">싫어요</span>
                  <span className="text-gray-500 font-normal">
                    {dislikeCount}
                  </span>
                </button>
              </div>

              {/* 댓글 헤더 */}
              <div className="flex items-center gap-3 text-gray-500 text-xs py-3">
                <span className="font-normal">댓글 {comments.length}</span>
                <div className="flex-1" />
                <button
                  type="button"
                  className="text-base p-1 rounded hover:bg-gray-100 transition-colors"
                  title="게시글 URL 복사"
                  aria-label="게시글 링크 복사"
                  onClick={copyPostUrl}
                >
                  📎
                </button>
              </div>

              {/* 댓글 입력 */}
              <div className="bg-white rounded-md border border-gray-300 p-3">
                <textarea
                  rows={3}
                  className="w-full resize-none text-sm font-normal outline-none"
                  placeholder={
                    isLoggedIn
                      ? '댓글을 입력해주세요'
                      : '로그인 후 댓글을 달 수 있습니다.'
                  }
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  readOnly={!isLoggedIn}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleSubmitComment}
                    disabled={commentSubmitting || !isLoggedIn}
                    className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-normal transition-colors disabled:opacity-60"
                  >
                    {commentSubmitting ? '등록 중...' : '등록'}
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

              {/* 댓글 목록 + 페이지네이션 */}
              <div className="mt-3 flex flex-col gap-3">
                {sortedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white border border-gray-200 rounded-md p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">
                            {comment.author}
                          </p>
                          {userIdForApi &&
                            String(comment.memberId) ===
                              String(userIdForApi) && (
                              <button
                                type="button"
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
                        <p className="text-xs text-gray-700 mt-1 font-normal">
                          {comment.content}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-2 font-normal">
                          {formatCommentDate(comment.createdAt)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <button
                            type="button"
                            disabled={
                              commentLikeSubmitting === comment.id ||
                              !isLoggedIn
                            }
                            onClick={() => handleCommentLike(comment.id, true)}
                            className="text-[11px] px-2 py-0.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                          >
                            👍 {comment.likeCount ?? 0}
                          </button>
                          <button
                            type="button"
                            disabled={
                              commentLikeSubmitting === comment.id ||
                              !isLoggedIn
                            }
                            onClick={() => handleCommentLike(comment.id, false)}
                            className="text-[11px] px-2 py-0.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                          >
                            👎 {comment.dislikeCount ?? 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

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
          )}
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-8">
          {loading ? (
            <div className="py-20 text-center text-gray-500">로딩 중...</div>
          ) : !post ? (
            <div className="py-20 text-center text-gray-500">
              게시글을 찾을 수 없습니다.
            </div>
          ) : (
            <>
              {/* PC 뒤로가기 */}
              <div className="flex items-center justify-between mb-6">
                <Link
                  to={roleName === 'ADMIN' ? '/alarm' : '/board'}
                  className="flex items-center gap-2 text-base font-normal text-gray-700 hover:text-[#2f80ed]"
                >
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
                <h2 className="text-[30px] font-semibold mb-4">
                  {post?.title ?? '게시글'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pb-6 border-b border-gray-200">
                  <span className="font-normal">
                    {post?.author ?? '작성자'}
                  </span>
                  <span className="font-normal">
                    {post?.createdAt
                      ? post.createdAt.replace('T', ' ').slice(0, 16)
                      : '—'}
                  </span>
                  <span className="font-normal">조회 {post?.views ?? 0}</span>
                  <span className="font-normal">좋아요 {likeCount}</span>
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

                {/* 좋아요/싫어요 - 로그인 시에만 활성화 */}
                <div className="flex items-center justify-center gap-8 py-6 border-y border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleLike(true)}
                    disabled={likeSubmitting || !isLoggedIn}
                    className="flex flex-col items-center gap-2 text-blue-600 text-sm disabled:opacity-60"
                    title={
                      !isLoggedIn ? '로그인 후 좋아요를 누를 수 있습니다.' : ''
                    }
                  >
                    <span className="w-14 h-14 rounded-full border-2 border-blue-400 flex items-center justify-center text-2xl">
                      👍
                    </span>
                    <span className="font-normal">좋아요</span>
                    <span className="text-blue-600 font-normal">
                      {likeCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLike(false)}
                    disabled={likeSubmitting || !isLoggedIn}
                    className="flex flex-col items-center gap-2 text-gray-500 text-sm disabled:opacity-60"
                    title={
                      !isLoggedIn ? '로그인 후 싫어요를 누를 수 있습니다.' : ''
                    }
                  >
                    <span className="w-14 h-14 rounded-full border-2 border-gray-400 flex items-center justify-center text-2xl">
                      👎
                    </span>
                    <span className="font-normal">싫어요</span>
                    <span className="text-gray-500 font-normal">
                      {dislikeCount}
                    </span>
                  </button>
                </div>

                {/* 댓글 헤더 */}
                <div className="flex items-center gap-3 text-gray-500 text-sm py-4">
                  <span className="font-normal">댓글 {comments.length}</span>
                  <div className="flex-1" />
                  <button
                    type="button"
                    className="text-lg p-1 rounded hover:bg-gray-100 transition-colors"
                    title="게시글 URL 복사"
                    aria-label="게시글 링크 복사"
                    onClick={copyPostUrl}
                  >
                    📎
                  </button>
                </div>

                {/* 댓글 입력 */}
                <div className="bg-gray-50 rounded-lg border border-gray-300 p-4 mb-6">
                  <textarea
                    rows={3}
                    className="w-full resize-none text-base font-normal outline-none bg-transparent"
                    placeholder={
                      isLoggedIn
                        ? '댓글을 입력해주세요'
                        : '로그인 후 댓글을 달 수 있습니다.'
                    }
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    readOnly={!isLoggedIn}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleSubmitComment}
                      disabled={commentSubmitting || !isLoggedIn}
                      className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-normal transition-colors disabled:opacity-60"
                    >
                      {commentSubmitting ? '등록 중...' : '등록'}
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

                {/* 댓글 목록 (평면 리스트, 좋아요/싫어요 연동) */}
                <div className="flex flex-col gap-4">
                  {sortedComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-base font-semibold">
                              {comment.author}
                            </p>

                            {userIdForApi &&
                              String(comment.memberId) ===
                                String(userIdForApi) && (
                                <button
                                  type="button"
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

                          <p className="text-sm text-gray-700 mt-2 font-normal">
                            {comment.content}
                          </p>

                          <p className="text-xs text-gray-400 mt-3 font-normal">
                            {formatCommentDate(comment.createdAt)}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <button
                              type="button"
                              disabled={
                                commentLikeSubmitting === comment.id ||
                                !isLoggedIn
                              }
                              onClick={() =>
                                handleCommentLike(comment.id, true)
                              }
                              className="text-sm px-3 py-1 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50"
                            >
                              👍 좋아요 {comment.likeCount ?? 0}
                            </button>

                            <button
                              type="button"
                              disabled={
                                commentLikeSubmitting === comment.id ||
                                !isLoggedIn
                              }
                              onClick={() =>
                                handleCommentLike(comment.id, false)
                              }
                              className="text-sm px-3 py-1 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50"
                            >
                              👎 싫어요 {comment.dislikeCount ?? 0}
                            </button>
                          </div>
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
            </>
          )}
        </div>
      </div>

      {/* 게시글 삭제 확인 모달 */}
      {showDeletePostModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
          <div className="relative z-10 w-full max-w-[340px] lg:max-w-[400px] rounded-2xl lg:rounded-3xl bg-white px-6 lg:px-8 py-8 lg:py-10 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-4 lg:mb-6">
              <img src={f_logo} alt="로고" />
            </div>
            <h3 className="text-xl lg:text-[24px] font-bold lg:font-medium mb-3 lg:mb-4 text-gray-800">
              게시글을 삭제하시겠습니까?
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 font-normal">
              삭제 후 복구가 불가능합니다
            </p>
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
              <img src={f_logo} alt="로고" />
            </div>
            <h3 className="text-xl lg:text-[24px] font-bold lg:font-medium mb-3 lg:mb-4 text-gray-800">
              댓글을 삭제하시겠습니까?
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 font-normal">
              삭제 후 복구가 불가능합니다
            </p>
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
