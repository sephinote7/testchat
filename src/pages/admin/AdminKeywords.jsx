import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { keywordsApi, risksApi } from '../../api/backendApi';

const AdminKeywords = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addKeyword, setAddKeyword] = useState({ keyword: '', category: '', severity: 3 });
  const [submitting, setSubmitting] = useState(false);
  const [checkContent, setCheckContent] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [riskPage, setRiskPage] = useState(1);
  const [riskList, setRiskList] = useState({ content: [], totalPages: 1, loading: false });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    keywordsApi
      .getList()
      .then((list) => {
        if (cancelled) return;
        setKeywords(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setKeywords([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRiskList((prev) => ({ ...prev, loading: true }));
    risksApi
      .getList({ page: riskPage, limit: 10 })
      .then((res) => {
        if (cancelled) return;
        const content = res.content ?? [];
        const total = res.totalElements ?? content.length;
        const totalPages = res.totalPages ?? Math.max(1, Math.ceil(total / 10));
        setRiskList({
          content,
          totalPages,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) setRiskList({ content: [], totalPages: 1, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [riskPage]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!addKeyword.keyword?.trim()) {
      alert('키워드를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    keywordsApi
      .add({
        keyword: addKeyword.keyword.trim(),
        category: addKeyword.category || 'general',
        severity: Math.min(5, Math.max(1, Number(addKeyword.severity) || 3)),
      })
      .then(() => {
        setAddKeyword({ keyword: '', category: '', severity: 3 });
        return keywordsApi.getList();
      })
      .then((list) => setKeywords(Array.isArray(list) ? list : []))
      .catch((e) => alert(e?.message || '추가 실패'))
      .finally(() => setSubmitting(false));
  };

  const handleCheckContent = (e) => {
    e.preventDefault();
    if (!checkContent.trim()) {
      setCheckResult(null);
      return;
    }
    risksApi
      .checkContent(checkContent)
      .then((res) => setCheckResult(res))
      .catch(() => setCheckResult({ error: '검사 실패' }));
  };

  return (
    <>
      <aside className="fixed top-0 left-0 bottom-0 z-10 w-[280px] bg-[#2d3e50] text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-[#2ed3c6] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">★</span>
          </div>
          <span className="text-xl font-bold">고민순삭</span>
        </div>
        <nav className="px-4 py-8">
          <ul className="space-y-1">
            <li>
              <Link
                to="/alarm"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="text-lg">최신정보</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"
                  />
                </svg>
                <span className="text-lg">대시보드</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/keywords"
                className="flex items-center gap-4 px-6 py-4 rounded-lg bg-white/10 text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span className="text-lg">민감키워드</span>
              </Link>
            </li>
            <li>
              <Link
                to="/stats"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-lg">통계자료</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-lg">마이페이지</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="min-h-screen flex flex-col pl-[280px] bg-[#f3f7ff]">
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <header className="bg-white px-10 py-5 flex items-center justify-end gap-4 border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-700">{user?.email?.split('@')[0] || '관리자'}님</span>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-lg text-base font-semibold hover:bg-blue-50"
            >
              로그아웃
            </button>
          </header>

          <div className="flex-1 px-16 py-12">
            <div className="max-w-[1520px] mx-auto">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">민감 키워드 관리</h1>
              <p className="text-lg text-gray-600 mb-10">등록된 민감 키워드 목록 및 내용 검사</p>

              {/* 키워드 추가 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">키워드 추가</h2>
                <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">키워드</label>
                    <input
                      type="text"
                      value={addKeyword.keyword}
                      onChange={(e) => setAddKeyword((p) => ({ ...p, keyword: e.target.value }))}
                      className="h-10 px-3 border border-gray-300 rounded-lg"
                      placeholder="키워드"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">분류</label>
                    <input
                      type="text"
                      value={addKeyword.category}
                      onChange={(e) => setAddKeyword((p) => ({ ...p, category: e.target.value }))}
                      className="h-10 px-3 border border-gray-300 rounded-lg"
                      placeholder="category"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">위험도 (1~5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={addKeyword.severity}
                      onChange={(e) => setAddKeyword((p) => ({ ...p, severity: e.target.value }))}
                      className="h-10 px-3 border border-gray-300 rounded-lg w-20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-10 px-6 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50"
                  >
                    {submitting ? '추가 중...' : '추가'}
                  </button>
                </form>
              </div>

              {/* 민감 키워드 감지된 게시글 목록 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">민감 키워드 감지된 게시글</h2>
                <p className="text-sm text-gray-600 mb-6">
                  게시판에 등록된 글 중 민감 키워드가 감지된 게시글 목록입니다.
                </p>
                {riskList.loading ? (
                  <div className="py-12 text-center text-gray-500">로딩 중...</div>
                ) : riskList.content.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">감지된 게시글이 없습니다.</div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {riskList.content.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item.bbsId != null) {
                              navigate(`/board/view/${item.bbsId}`);
                            }
                          }}
                          className="p-5 border border-gray-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/30 transition-colors cursor-pointer"
                        >
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
                            <span className="px-2 py-0.5 bg-gray-100 rounded">게시판: {item.bbsDiv ?? '—'}</span>
                            <span>글번호: {item.bbsId}</span>
                            {item.memberId && <span>작성자: {item.memberId}</span>}
                            {item.createdAt && (
                              <span>감지일시: {new Date(item.createdAt).toLocaleString('ko-KR')}</span>
                            )}
                          </div>
                          <p className="text-gray-800 mb-2 line-clamp-3">{item.content || '(내용 없음)'}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {item.detectedKeywords && (
                              <span className="text-amber-700 font-medium">감지 키워드: {item.detectedKeywords}</span>
                            )}
                            {item.action && <span className="text-sm text-gray-600">조치: {item.action}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRiskPage((p) => Math.max(1, p - 1))}
                        disabled={riskPage === 1}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
                      >
                        이전
                      </button>
                      <span className="px-4 text-sm text-gray-600">
                        {riskPage} / {riskList.totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRiskPage((p) => p + 1)}
                        disabled={riskPage >= riskList.totalPages}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
                      >
                        다음
                      </button>
                    </div>
                  </>
                )}

                {/* 직접 텍스트 검사 (보조) */}
                <details className="mt-8 pt-6 border-t border-gray-200">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                    직접 텍스트 검사 (민감 키워드 포함 여부 / 위험도)
                  </summary>
                  <form onSubmit={handleCheckContent} className="flex gap-4 mt-4">
                    <textarea
                      value={checkContent}
                      onChange={(e) => setCheckContent(e.target.value)}
                      className="flex-1 min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="검사할 텍스트를 입력하세요"
                    />
                    <button type="submit" className="h-10 px-6 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                      검사
                    </button>
                  </form>
                  {checkResult && (
                    <div className="p-4 mt-4 bg-gray-50 rounded-lg">
                      {checkResult.error ? (
                        <p className="text-red-600">{checkResult.error}</p>
                      ) : (
                        <>
                          <p className="font-medium">
                            민감 키워드 포함: {checkResult.has_sensitive_keywords ? '예' : '아니오'}
                          </p>
                          <p className="text-sm text-gray-600">최대 위험도: {checkResult.max_severity}</p>
                          {checkResult.detected_keywords?.length > 0 && (
                            <ul className="mt-2 text-sm">
                              {checkResult.detected_keywords.map((d, i) => (
                                <li key={i}>
                                  {d.keyword} (severity: {d.severity})
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </details>
              </div>

              {/* 키워드 목록 */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <h2 className="text-xl font-semibold text-gray-800 p-6 border-b">등록된 키워드 목록</h2>
                {loading ? (
                  <div className="p-12 text-center text-gray-500">로딩 중...</div>
                ) : keywords.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">등록된 키워드가 없습니다.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#2563eb] text-white">
                        <th className="px-6 py-4 text-left font-bold">ID</th>
                        <th className="px-6 py-4 text-left font-bold">키워드</th>
                        <th className="px-6 py-4 text-left font-bold">분류</th>
                        <th className="px-6 py-4 text-left font-bold">위험도</th>
                        <th className="px-6 py-4 text-left font-bold">활성</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map((kw) => (
                        <tr key={kw.keywordId} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4">{kw.keywordId}</td>
                          <td className="px-6 py-4 font-medium">{kw.keyword}</td>
                          <td className="px-6 py-4">{kw.category ?? '—'}</td>
                          <td className="px-6 py-4">{kw.severity}</td>
                          <td className="px-6 py-4">{kw.isActive ? '활성' : '비활성'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminKeywords;
