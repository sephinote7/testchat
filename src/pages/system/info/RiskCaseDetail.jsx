import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { risksApi, bbsApi } from '../../../api/backendApi';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
};

const RiskCaseDetail = () => {
  const { riskId } = useParams();
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);

  const [risk, setRisk] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const bbsId = risk?.bbsId != null ? Number(risk.bbsId) : null;

  const mapComment = (c) => ({
    id: c.cmt_id,
    author: c.memberId?.nickname ?? c.memberId?.memberId ?? c.member_id ?? '—',
    content: c.content,
    createdAt: c.created_at ?? c.createdAt,
    likeCount: c.likeCount ?? 0,
    dislikeCount: c.dislikeCount ?? 0,
    parentCmtId: c.parent_cmt_id ?? null,
  });

  const fetchComments = useCallback(() => {
    if (!bbsId) return;
    bbsApi
      .getComments(bbsId)
      .then((list) => setComments(Array.isArray(list) ? list.map(mapComment) : []))
      .catch(() => setComments([]));
  }, [bbsId]);

  useEffect(() => {
    if (!riskId) {
      setError('잘못된 접근입니다.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    risksApi
      .getById(riskId)
      .then((r) => {
        if (cancelled) return;
        setRisk(r);
        const id = Number(r.bbsId);
        return Promise.all([bbsApi.getById(id), bbsApi.getComments(id)]);
      })
      .then((result) => {
        if (cancelled || !result) return;
        const [b, commentList] = result;
        const author = b?.memberId?.nickname ?? b?.memberId?.email ?? (typeof b?.memberId === 'string' ? b.memberId : '—');
        setPost({
          id: b?.bbsId,
          title: b?.title,
          author,
          content: b?.content,
          createdAt: b?.created_at,
          bbsDiv: b?.bbs_div,
        });
        setComments(Array.isArray(commentList) ? commentList.map(mapComment) : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || '불러오기에 실패했습니다.');
          setRisk(null);
          setPost(null);
          setComments([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [riskId]);

  const handleSubmitComment = () => {
    const text = commentInput.trim();
    if (!text || !bbsId) return;
    if (!email) {
      alert('로그인 후 댓글을 작성할 수 있습니다.');
      return;
    }
    setCommentSubmitting(true);
    bbsApi
      .addComment(bbsId, { content: text }, email)
      .then(() => {
        setCommentInput('');
        fetchComments();
      })
      .catch((e) => alert(e?.message || '댓글 작성에 실패했습니다.'))
      .finally(() => setCommentSubmitting(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f7ff] flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error || !risk) {
    return (
      <div className="min-h-screen bg-[#f3f7ff] flex flex-col items-center justify-center p-8">
        <p className="text-red-600 mb-4">{error || '해당 위험군 게시글을 찾을 수 없습니다.'}</p>
        <button
          onClick={() => navigate('/system/info/risk-cases')}
          className="px-6 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8]"
        >
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f7ff]">
      <div className="max-w-[900px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/system/info/risk-cases')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            위험군 조치 내역으로
          </button>
        </div>

        {/* 위험 감지 정보 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-amber-800 mb-2">위험군 감지 정보</h2>
          <div className="flex flex-wrap gap-4 text-sm text-amber-900">
            <span>게시판: {risk.bbsDiv ?? '—'}</span>
            <span>감지일시: {formatDateTime(risk.createdAt)}</span>
            {risk.detectedKeywords && (
              <span className="font-medium">감지 키워드: {risk.detectedKeywords}</span>
            )}
            {risk.action && <span>조치: {risk.action}</span>}
          </div>
        </div>

        {/* 게시글 본문 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {post?.title ?? '(제목 없음)'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>작성자: {post?.author ?? '—'}</span>
              <span>작성일: {formatDateTime(post?.createdAt)}</span>
              {post?.bbsDiv && <span>게시판: {post.bbsDiv}</span>}
            </div>
          </div>
          <div className="p-6">
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {post?.content ?? risk?.content ?? '(내용 없음)'}
            </div>
          </div>
        </div>

        {/* 댓글 영역 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">댓글 ({comments.length})</h3>
          </div>

          {/* 댓글 작성 (상담사) */}
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <label className="block text-sm font-medium text-gray-700 mb-2">댓글 작성</label>
            <div className="flex gap-3">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="상담사 댓글을 입력하세요..."
                className="flex-1 min-h-[80px] px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                disabled={commentSubmitting}
              />
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={commentSubmitting || !commentInput.trim()}
                className="self-end px-6 py-3 bg-[#2563eb] text-white rounded-xl font-medium hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentSubmitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </div>

          {/* 댓글 목록 */}
          <div className="divide-y divide-gray-100">
            {comments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">아직 댓글이 없습니다.</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="font-medium text-gray-800">{c.author}</span>
                        <span>{formatDateTime(c.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCaseDetail;
