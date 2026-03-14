import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCounselorList } from '../../../api/cnslApi';

const ITEMS_PER_PAGE = 10;

const categoryMap = {
  job: 2,
  career: 3,
};

const methodMap = {
  board: 1,
  phone: 2,
  chat: 4,
  video: 5,
  visit: 6,
};

const CounselorList = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  // 필터 상태
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  // 별점 렌더링 함수
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating); // 꽉 찬 별 개수
    const hasHalfStar = rating % 1 >= 0.5; // 반 별 여부
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // 빈 별 개수

    // 꽉 찬 별
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="material-icons">
          star
        </span>,
      );
    }
    // 반 별
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="material-icons">
          star_half
        </span>,
      );
    }
    // 빈 별
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="material-icons">
          star_outline
        </span>,
      );
    }

    return stars;
  };

  // URL 파라미터에서 초기 category 설정
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [searchParams]);

  // TODO: DB 연동 시 counselors를 API 호출 결과로 대체
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        setLoading(true);

        const cnslCate =
          selectedCategories.length > 0 ? selectedCategories.map((cat) => String(categoryMap[cat])) : ['2', '3'];
        const cnslTp =
          selectedMethods.length > 0
            ? selectedMethods.map((method) => String(methodMap[method]))
            : ['1', '2', '4', '5', '6'];
        let minPrice = null;
        let maxPrice = null;

        const hashTags =
          selectedCategories?.length > 0 ? selectedCategories?.map((cat) => (cat === 'job' ? '취업' : '커리어')) : [''];

        if (selectedPriceRanges.length > 0) {
          const prices = selectedPriceRanges.map((range) => {
            const [min, max] = range.split('-').map((v) => (v ? Number(v) : null));
            return { min, max };
          });

          minPrice = Math.min(...prices.map((p) => p.min).filter((v) => v !== null));

          const maxValues = prices.map((p) => p.max).filter((v) => v !== null);
          maxPrice = maxValues.length > 0 ? Math.max(...maxValues) : null;
          if (maxPrice === null) maxPrice = 2147483647;
        }

        const data = await getCounselorList({
          page: 0,
          size: ITEMS_PER_PAGE,
          cnslCate: cnslCate,
          cnslTp: cnslTp,
          minPrice: minPrice,
          maxPrice: maxPrice,
          hashTags: hashTags || '',
        });

        console.log('test', data.content);

        setCounselors(data?.content);
        setTotalPages(data?.totalPages);
      } catch (error) {
        console.error('상담사 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, [selectedCategories, selectedMethods, selectedPriceRanges, page]);

  // 필터 토글 함수들
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
    setPage(1);
  };

  const toggleMethod = (method) => {
    setSelectedMethods((prev) => (prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]));
    setPage(1);
  };

  const togglePriceRange = (range) => {
    setSelectedPriceRanges((prev) => (prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]));
    setPage(1);
  };

  const safePage = Math.min(page, totalPages);

  // 체크박스 스타일 헬퍼
  const checkboxClass = (isChecked) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
      isChecked
        ? 'bg-[#2f80ed] border-[#2f80ed] text-white font-medium'
        : 'bg-white border-gray-300 text-gray-700 hover:border-[#2f80ed]/50'
    }`;

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-[90px]">
        <header className="bg-[#2f80ed] h-16 flex items-center justify-center text-white font-bold text-lg">
          상담사 찾기
        </header>

        <main className="px-[18px] pt-4 flex flex-col gap-4">
          {/* 필터 섹션 */}
          <div className="bg-white rounded-[14px] p-4 shadow-[0_8px_16px_rgba(0,0,0,0.06)]">
            {/* 상담 유형 */}
            {/* <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#374151] mb-2">상담 유형</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'job', label: '취업' },
                  { id: 'career', label: '커리어' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 text-[12px] rounded-lg border-2 transition-all ${
                      selectedCategories.includes(cat.id)
                        ? 'bg-[#2f80ed] border-[#2f80ed] text-white font-medium'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div> */}

            {/* 상담 방식 */}
            {/* <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#374151] mb-2">상담 방식</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'board', label: '게시판', type: '1' },
                  { id: 'phone', label: '전화', type: '2' },
                  { id: 'chat', label: '채팅', type: '4' },
                  { id: 'video', label: '화상', type: '5' },
                  { id: 'visit', label: '방문', type: '6' },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => toggleMethod(method.id)}
                    className={`px-3 py-1.5 text-[12px] rounded-lg border-2 transition-all ${
                      selectedMethods.includes(method.id)
                        ? 'bg-[#2f80ed] border-[#2f80ed] text-white font-medium'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div> */}

            {/* 상담 가격 */}
            {/* <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-2">상담 가격</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: '10000-20000', label: '10,000~20,000P' },
                  { id: '20000-30000', label: '20,000~30,000P' },
                  { id: '30000-40000', label: '30,000~40,000P' },
                  { id: '40000-50000', label: '40,000~50,000P' },
                  { id: '50000-', label: '50,000P~' },
                ].map((price) => (
                  <button
                    key={price.id}
                    type="button"
                    onClick={() => togglePriceRange(price.id)}
                    className={`px-3 py-1.5 text-[12px] rounded-lg border-2 transition-all ${
                      selectedPriceRanges.includes(price.id)
                        ? 'bg-[#2f80ed] border-[#2f80ed] text-white font-medium'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    {price.label}
                  </button>
                ))}
              </div>
            </div> */}
          </div>

          <section className="flex flex-col gap-3">
            {counselors.length === 0 ? (
              <div className="text-[13px] text-[#6b7280] text-center py-10">
                선택한 분야에 해당하는 상담사가 없습니다.
              </div>
            ) : (
              counselors?.map((item) => (
                <Link
                  key={item?.memberId}
                  to={`/chat/counselor/${item?.memberId}`}
                  className="bg-white rounded-[14px] p-4 shadow-[0_8px_16px_rgba(0,0,0,0.06)] flex gap-3 no-underline"
                >
                  <div className="w-[68px] h-[68px] rounded-full bg-[#e9efff] flex items-center justify-center text-[#2f80ed] font-bold text-[16px]">
                    {item?.nickname.slice(0, 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-bold text-[#111827]">{item?.nickname} 상담사</span>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-[#f59e0b] mb-1">
                      <div className="flex flex-row text-point items-center">{renderStars(item?.avgEvalPt || 0)}</div>
                      <span className="text-[#6b7280]">({item?.cnslCnt})</span>
                    </div>
                    {/* <p className="text-[12px] text-[#6b7280] mb-2">{item?.tags?.map((tag) => `#${tag}`).join(' ')}</p> */}
                    <p className="text-[12px] text-[#374151]">{item?.text}</p>
                    <div className="mt-3 grid grid-cols-3 text-[12px] text-[#111827]">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                        {item?.cnsl4Price?.toLocaleString()}P
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#60a5fa]" />
                        {item?.cnsl2Price?.toLocaleString()}P
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#fb923c]" />
                        {item?.cnsl1Price?.toLocaleString()}P
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </section>

          <div className="flex items-center justify-center gap-2 pt-2 text-[13px] text-[#1f2937]">
            <button
              type="button"
              className="px-2 py-1 rounded border border-[#d1d5db] disabled:opacity-40"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
            >
              이전
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNumber = idx + 1;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`w-7 h-7 rounded-full border text-[12px] ${
                    pageNumber === safePage
                      ? 'bg-[#2f80ed] border-[#2f80ed] text-white'
                      : 'bg-white border-[#d1d5db] text-[#374151]'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              type="button"
              className="px-2 py-1 rounded border border-[#d1d5db] disabled:opacity-40"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
            >
              다음
            </button>
          </div>
        </main>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-[36px] font-bold text-gray-800">상담사 찾기</h1>
            <button
              onClick={() => window.history.back()}
              className="cursor-pointer px-8 py-3 rounded-xl bg-[#2563eb] text-white text-base font-normal hover:bg-[#1d4ed8] transition-colors"
            >
              뒤로 가기
            </button>
          </div>

          {/* CONTENT: 2-column layout (Filter Sidebar + Counselor List) */}
          <div className="grid grid-cols-[280px_1fr] gap-8">
            {/* LEFT: 필터 사이드바 */}
            <aside className="space-y-6">
              {/* 상담 유형 필터 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">상담 유형</h3>
                <div className="space-y-2">
                  {[
                    { id: 'job', label: '취업', type: 2 },
                    { id: 'career', label: '커리어', type: 3 },
                  ].map((cat) => (
                    <label key={cat.id} className={checkboxClass(selectedCategories.includes(cat.id))}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="hidden"
                      />
                      <span className="flex-1">{cat.label}</span>
                      {selectedCategories.includes(cat.id) && <span>✓</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* 상담 방식 필터 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">상담 방식</h3>
                <div className="space-y-2">
                  {[
                    { id: 'board', label: '게시판', type: '1' },
                    { id: 'phone', label: '전화', type: '2' },
                    { id: 'chat', label: '채팅', type: '4' },
                    { id: 'video', label: '화상', type: '5' },
                    { id: 'visit', label: '방문', type: '6' },
                  ].map((method) => (
                    <label key={method.id} className={checkboxClass(selectedMethods.includes(method.id))}>
                      <input
                        type="checkbox"
                        checked={selectedMethods.includes(method.id)}
                        onChange={() => toggleMethod(method.id)}
                        className="hidden"
                      />
                      <span className="flex-1">{method.label}</span>
                      {selectedMethods.includes(method.id) && <span>✓</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* 상담 가격 필터 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">상담 가격</h3>
                <div className="space-y-2">
                  {[
                    { id: '10000-20000', label: '10,000 ~ 20,000P' },
                    { id: '20000-30000', label: '20,000 ~ 30,000P' },
                    { id: '30000-40000', label: '30,000 ~ 40,000P' },
                    { id: '40000-50000', label: '40,000 ~ 50,000P' },
                    { id: '50000-', label: '50,000P ~' },
                  ].map((price) => (
                    <label key={price.id} className={checkboxClass(selectedPriceRanges.includes(price.id))}>
                      <input
                        type="checkbox"
                        checked={selectedPriceRanges.includes(price.id)}
                        onChange={() => togglePriceRange(price.id)}
                        className="hidden"
                      />
                      <span className="flex-1 text-sm">{price.label}</span>
                      {selectedPriceRanges.includes(price.id) && <span>✓</span>}
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* RIGHT: 상담사 목록 */}
            <div>
              {/* 상담사 목록 */}
              <section className="flex flex-col gap-6">
                {counselors.length === 0 ? (
                  <div className="text-lg text-gray-600 text-center py-20 bg-white rounded-2xl shadow-sm">
                    선택한 필터에 해당하는 상담사가 없습니다.
                  </div>
                ) : (
                  counselors?.map((item) => (
                    <Link
                      key={item?.memberId}
                      to={`/chat/counselor/${item?.memberId}`}
                      className="bg-white rounded-2xl p-8 shadow-sm flex gap-8 no-underline hover:shadow-md transition-all group"
                    >
                      {item?.imgUrl ? (
                        <img
                          src={item?.imgUrl}
                          alt=""
                          className="block w-[140px] h-[140px] rounded-full object-cover overflow-hidden bg-gradient-to-br from-[#e9efff] to-[#d1e0ff] shadow-lg group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-[140px] h-[140px] rounded-full bg-gradient-to-br from-[#e9efff] to-[#d1e0ff] flex items-center justify-center text-[#2f80ed] font-bold text-4xl shadow-lg group-hover:scale-105 transition-transform">
                          {item?.nickname.slice(0, 1)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl font-bold text-gray-800">{item?.nickname} 상담사</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg text-[#f59e0b] mb-3">
                          <div className="flex flex-row text-point items-center">
                            {renderStars(item?.avgEvalPt || 0)}
                          </div>
                          <span className="text-gray-600">({item?.cnslCnt})</span>
                        </div>
                        {/* <p className="text-base text-gray-600 mb-4">{item?.tags.map((tag) => `#${tag}`).join(' ')}</p> */}
                        <p className="text-base text-gray-700 mb-6 leading-relaxed">{item?.text}</p>

                        <div className="grid grid-cols-4 gap-6 text-base text-gray-800">
                          <div className="flex items-center gap-2 bg-blue-50 px-4 py-3 rounded-lg">
                            <span className="w-3 h-3 rounded-full bg-[#60a5fa]" />
                            <span className="font-semibold">전화</span>
                            <span className="ml-auto">
                              {item?.cnsl2Price ? item.cnsl2Price.toLocaleString() + ' P' : '-'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 bg-green-50 px-4 py-3 rounded-lg">
                            <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                            <span className="font-semibold">채팅</span>
                            <span className="ml-auto">
                              {item?.cnsl4Price ? item.cnsl4Price.toLocaleString() + ' P' : '-'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 bg-purple-50 px-4 py-3 rounded-lg">
                            <span className="w-3 h-3 rounded-full bg-[#a78bfa]" />
                            <span className="font-semibold">화상</span>
                            <span className="ml-auto">
                              {item?.cnsl5Price ? item.cnsl5Price.toLocaleString() + ' P' : '-'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 bg-orange-50 px-4 py-3 rounded-lg">
                            <span className="w-3 h-3 rounded-full bg-[#fb923c]" />
                            <span className="font-semibold">방문</span>
                            <span className="ml-auto">
                              {item?.cnsl6Price ? item.cnsl6Price.toLocaleString() + ' P' : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </section>

              {/* 페이지네이션 */}
              <div className="flex items-center justify-center gap-3 pt-8 text-base text-gray-800">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={safePage === 1}
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
                        pageNumber === safePage
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
                  disabled={safePage === totalPages}
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CounselorList;
