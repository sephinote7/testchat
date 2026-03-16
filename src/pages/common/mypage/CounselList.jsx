import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { useAuthStore } from '../../../store/auth.store';
import { getMyCnslList } from '../../../api/myCnsl';
import { supabase } from '../../../lib/supabase';

const CounselList = () => {
  const { accessToken: token } = useAuth();
  const currentUserEmail = useAuthStore((s) => s.email);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai');
  const [counsels, setCounsels] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 10;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const cnslTp = activeTab === 'ai' ? '3' : activeTab === 'counselor' ? 'counselor' : null;
      const response = await getMyCnslList(page - 1, pageSize, cnslTp);
      let list = Array.isArray(response.content) ? response.content : [];
      // AI 탭: Spring에 없는 건 Supabase cnsl_reg에서 보완 (최신순 유지)
      if (activeTab === 'ai' && currentUserEmail) {
        const { data: supabaseRows } = await supabase
          .from('cnsl_reg')
          .select('cnsl_id, cnsl_title, cnsl_stat, created_at, cnsl_tp')
          .eq('member_id', currentUserEmail)
          .eq('cnsl_tp', '3')
          .order('created_at', { ascending: false });
        const springIds = new Set(list.map((c) => String(c.cnslId ?? c.cnsl_id)));
        const fromSupabase = (supabaseRows || [])
          .filter((r) => !springIds.has(String(r.cnsl_id)))
          .map((r) => ({
            cnslId: r.cnsl_id,
            cnsl_id: r.cnsl_id,
            cnslTp: '3',
            cnsl_tp: '3',
            cnslTitle: r.cnsl_title,
            cnsl_title: r.cnsl_title,
            cnslStat: r.cnsl_stat,
            cnsl_stat: r.cnsl_stat,
            createdAt: r.created_at,
            created_at: r.created_at,
            nickname: null,
          }));
        list = [...list, ...fromSupabase].sort((a, b) => {
          const tA = new Date(a.createdAt ?? a.created_at ?? 0).getTime();
          const tB = new Date(b.createdAt ?? b.created_at ?? 0).getTime();
          return tB - tA;
        });
      }
      setCounsels(list);
      setTotalElements(Math.max(response.totalElements ?? 0, list.length));
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setCounsels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 3. 토큰이 로드된 후에 데이터를 가져오도록 설정
    fetchData();
  }, [activeTab, page, token, currentUserEmail]);

  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  // 날짜 포맷팅 함수 (YYYY.MM.DD)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0].replace(/-/g, '.');
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-24">
        <header className="bg-[#2563eb] h-14 flex items-center justify-center px-5 relative text-white">
          <Link to="/mypage" className="absolute left-5 text-xl">
            ←
          </Link>
          <span className="font-bold text-lg">고민순삭</span>
        </header>

        <div className="px-5 pt-5 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">상담내역</h1>
        </div>

        <div className="px-5 pb-4 flex gap-2">
          {['ai', 'counselor'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === tab ? 'bg-[#2563eb] text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {tab === 'ai' ? 'AI상담' : '상담사 상담'}
            </button>
          ))}
        </div>

        <div className="px-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 font-medium">로딩 중...</div>
          ) : counsels.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-medium">
              {activeTab === 'ai' ? 'AI 상담 내역이 없습니다.' : '아직 상담 내역이 없습니다.'}
            </div>
          ) : (
            counsels.map((counsel) => {
              const cnslTp = counsel.cnslTp ?? counsel.cnsl_tp;
              const isAi = cnslTp === '3';
              const detailPath = isAi ? `/mypage/counsel/ai/${counsel.cnslId ?? counsel.cnsl_id}` : `/mypage/counsel/counselor/${counsel.cnslId ?? counsel.cnsl_id}`;
              const title = counsel.cnslTitle ?? counsel.cnsl_title;
              const stat = counsel.cnslStat ?? counsel.cnsl_stat;
              const createdAt = counsel.createdAt ?? counsel.created_at;
              return (
                <div
                  key={counsel.cnslId ?? counsel.cnsl_id}
                  onClick={() => navigate(detailPath)}
                  className="bg-white rounded-xl p-5 border border-gray-200 cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-gray-800 flex-1 pr-2 line-clamp-1">
                      {title}
                    </h3>
                    <span className="text-sm text-gray-400">{formatDate(createdAt)}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      상태 : <span className="text-[#2563eb] font-bold">{stat?.split(' ')[0] || ''}</span>
                    </p>
                    <p>
                      상담사 : <span className="font-medium text-gray-800">{counsel.nickname || '배정 대기'}</span>
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <span className="text-sm text-[#2563eb] font-bold underline underline-offset-4">상담 내용 보기</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="!font-bold text-gray-900">상담 내역</h3>
            <button
              onClick={() => navigate('/mypage')}
              className="px-8 py-3 rounded-xl bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors"
            >
              뒤로 가기
            </button>
          </div>

          <div className="flex gap-4 mb-8">
            {['ai', 'counselor'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`flex-1 py-5 rounded-2xl text-xl font-bold transition-all shadow-sm ${
                  activeTab === tab
                    ? 'bg-[#2563eb] text-white'
                    : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {tab === 'ai' ? '🤖 AI 상담 내역' : '🤝 전문가 상담 내역'}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {isLoading ? (
              <div className="bg-white rounded-2xl p-32 text-center text-gray-400 text-lg">
                데이터를 불러오는 중입니다...
              </div>
            ) : counsels.length === 0 ? (
              <div className="bg-white rounded-2xl p-32 text-center text-gray-400 text-lg">
                {activeTab === 'ai' ? 'AI 상담 내역이 없습니다.' : '아직 상담 내역이 없습니다.'}
              </div>
            ) : (
              counsels.map((counsel) => {
                const cnslTp = counsel.cnslTp ?? counsel.cnsl_tp;
                const isAi = cnslTp === '3';
                const detailPath = isAi ? `/mypage/counsel/ai/${counsel.cnslId ?? counsel.cnsl_id}` : `/mypage/counsel/counselor/${counsel.cnslId ?? counsel.cnsl_id}`;
                const title = counsel.cnslTitle ?? counsel.cnsl_title;
                const stat = counsel.cnslStat ?? counsel.cnsl_stat;
                const type = counsel.cnslType ?? counsel.cnsl_type;
                const createdAt = counsel.createdAt ?? counsel.created_at;
                return (
                  <div
                    key={counsel.cnslId ?? counsel.cnsl_id}
                    onClick={() => navigate(detailPath)}
                    className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 group-hover:text-[#2563eb] transition-colors">
                        {title}
                      </h3>
                      <span className="text-lg text-gray-400 font-medium">{formatDate(createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-12 text-lg text-gray-600">
                      <p>
                        상담 유형 : <span className="font-semibold text-gray-900">{type}</span>
                      </p>
                      <p>
                        상태 :{' '}
                        <span className="font-bold text-[#2563eb] px-3 py-1 bg-blue-50 rounded-full">
                          {stat?.split(' ')[0] || ''}
                        </span>
                      </p>
                      <p>
                        상담사 : <span className="font-semibold text-gray-900">{counsel.nickname ?? '시스템'}</span>
                      </p>
                    </div>
                    <div className="flex justify-end mt-2">
                      <span className="text-[#2563eb] font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        상담 상세보기 →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 페이지네이션 - 상담사 리스트와 동일 레이아웃 (1페이지만 있어도 노출) */}
          {totalPages >= 1 && (
            <div className="flex items-center justify-center gap-3 pt-8 text-base text-gray-800">
              <button
                type="button"
                className="px-6 py-3 rounded-lg border-2 border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                이전
              </button>
              {Array.from({ length: Math.min(10, totalPages) }).map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`w-12 h-12 rounded-lg border-2 text-base font-medium transition-colors ${
                      pageNumber === page
                        ? 'bg-[#2f80ed] border-[#2f80ed] text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                type="button"
                className="px-6 py-3 rounded-lg border-2 border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CounselList;
