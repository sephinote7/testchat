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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    keywordsApi.getList()
      .then((list) => {
        if (cancelled) return;
        setKeywords(Array.isArray(list) ? list : []);
      })
      .catch(() => { if (!cancelled) setKeywords([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!addKeyword.keyword?.trim()) {
      alert('키워드를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    keywordsApi.add({
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
    risksApi.checkContent(checkContent)
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
              <Link to="/admin/activities" className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                활동 내역
              </Link>
            </li>
            <li>
              <Link to="/admin/keywords" className="flex items-center gap-4 px-6 py-4 rounded-lg bg-white/10 text-white">
                민감 키워드
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                대시보드
              </Link>
            </li>
            <li>
              <Link to="/admin" className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                마이페이지
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
                <button type="submit" disabled={submitting} className="h-10 px-6 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50">
                  {submitting ? '추가 중...' : '추가'}
                </button>
              </form>
            </div>

            {/* 내용 검사 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">내용 검사 (민감 키워드 탐지)</h2>
              <form onSubmit={handleCheckContent} className="flex gap-4 mb-4">
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
                <div className="p-4 bg-gray-50 rounded-lg">
                  {checkResult.error ? (
                    <p className="text-red-600">{checkResult.error}</p>
                  ) : (
                    <>
                      <p className="font-medium">민감 키워드 포함: {checkResult.has_sensitive_keywords ? '예' : '아니오'}</p>
                      <p className="text-sm text-gray-600">최대 위험도: {checkResult.max_severity}</p>
                      {checkResult.detected_keywords?.length > 0 && (
                        <ul className="mt-2 text-sm">
                          {checkResult.detected_keywords.map((d, i) => (
                            <li key={i}>{d.keyword} (severity: {d.severity})</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}
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
