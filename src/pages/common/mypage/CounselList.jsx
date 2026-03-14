import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { getMyCnslList } from '../../../api/myCnsl';

const CounselList = () => {
  const { accessToken: token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai');
  const [counsels, setCounsels] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 10;

  const fetchData = async () => {
    // 1. 토큰이 없으면 호출하지 않음

    setIsLoading(true);
    try {
      // 2. API 호출 시 token과 activeTab을 함께 전달 (백엔드 요구사항에 따라 인자 조절)
      // Spring Boot Pageable은 0부터 시작하므로 page - 1
      const response = await getMyCnslList(page - 1, pageSize);

      setCounsels(response.content || []);
      setTotalElements(response.totalElements || 0);
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
  }, [activeTab, page, token]); // token 의존성 추가

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
          ) : (
            counsels.map((counsel) => (
              <div
                key={counsel.cnslId}
                onClick={() => navigate(`/mypage/counsel/counselor/${counsel.cnslId}`)}
                className="bg-white rounded-xl p-5 border border-gray-200 cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  {/* DTO: getCnslTitle() -> cnslTitle */}
                  <h3 className="text-base font-semibold text-gray-800 flex-1 pr-2 line-clamp-1">
                    {counsel.cnslTitle}
                  </h3>
                  <span className="text-sm text-gray-400">{formatDate(counsel.createdAt)}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {/* DTO: getCnslStat() -> cnslStat */}
                  <p>
                    상태 : <span className="text-[#2563eb] font-bold">{counsel.cnslStat?.split(' ')[0] || ''}</span>
                  </p>
                  {/* DTO: getNickname() -> nickname */}
                  <p>
                    상담사 : <span className="font-medium text-gray-800">{counsel.nickname || '배정 대기'}</span>
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className="text-sm text-[#2563eb] font-bold underline underline-offset-4">상담 내용 보기</span>
                </div>
              </div>
            ))
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
                console.log('test', counsel);
                return (
                  <div
                    key={counsel.cnslId}
                    onClick={() => navigate(`/mypage/counsel/counselor/${counsel.cnslId}`)}
                    className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 group-hover:text-[#2563eb] transition-colors">
                        {counsel.cnslTitle}
                      </h3>
                      <span className="text-lg text-gray-400 font-medium">{formatDate(counsel.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-12 text-lg text-gray-600">
                      <p>
                        상담 유형 : <span className="font-semibold text-gray-900">{counsel.cnslType}</span>
                      </p>
                      <p>
                        상태 :{' '}
                        <span className="font-bold text-[#2563eb] px-3 py-1 bg-blue-50 rounded-full">
                          {counsel.cnslStat?.split(' ')[0] || ''}
                        </span>
                      </p>
                      <p>
                        상담사 : <span className="font-semibold text-gray-900">{counsel.nickname || '시스템'}</span>
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
        </div>
      </div>
    </>
  );
};

export default CounselList;
