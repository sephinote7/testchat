import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import DashBoard from '../../admin/DashBoard';
import CounselorDefaultPage from '../../system/info/CounselorDefaultPage';
import { posts } from '../../user/board/boardData';

const keywordCloud = [
  { text: '면접준비', className: 'text-[32px]', style: { top: '20%', left: '8%' } },
  { text: '자소서', className: 'text-[24px]', style: { top: '15%', right: '15%' } },
  { text: '취업', className: 'text-[42px]', style: { top: '38%', left: '12%' } },
  { text: '커리어', className: 'text-[38px]', style: { top: '52%', left: '28%' } },
  { text: '이직', className: 'text-[22px]', style: { bottom: '25%', left: '8%' } },
  { text: '직무', className: 'text-[28px]', style: { bottom: '12%', left: '22%' } },
  { text: '경력', className: 'text-[18px]', style: { bottom: '8%', right: '25%' } },
  { text: '역량', className: 'text-[20px]', style: { top: '28%', right: '12%' } },
  { text: '스펙', className: 'text-[18px]', style: { bottom: '35%', right: '8%' } },
];

const getWithinDays = (iso, days) => {
  const now = new Date();
  const created = new Date(iso);
  const diffMs = now - created;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= days;
};

const scoreRealtime = (p) => p.likes * 2 + p.views * 0.2 + p.comments * 3;
const scoreRecommend = (p) => p.likes * 3 + p.comments * 5 + p.views * 0.1;

const Home = () => {
  const { user, loading } = useAuth();
  const [communityMode, setCommunityMode] = useState('realtime'); // realtime | week | month | recommend

  const communityTopPosts = useMemo(() => {
    const base = posts.filter((p) => !p.isNotice);

    if (communityMode === 'week') {
      return base
        .filter((p) => getWithinDays(p.createdAt, 7))
        .sort((a, b) => scoreRealtime(b) - scoreRealtime(a))
        .slice(0, 10);
    }
    if (communityMode === 'month') {
      return base
        .filter((p) => getWithinDays(p.createdAt, 30))
        .sort((a, b) => scoreRealtime(b) - scoreRealtime(a))
        .slice(0, 10);
    }
    if (communityMode === 'recommend') {
      return base.sort((a, b) => scoreRecommend(b) - scoreRecommend(a)).slice(0, 10);
    }

    return base.sort((a, b) => scoreRealtime(b) - scoreRealtime(a)).slice(0, 10);
  }, [communityMode]);

  // TODO: DB 연동 시 실제 공지글 가져오기
  const notices = useMemo(() => {
    return posts.filter((p) => p.isNotice).slice(0, 4);
  }, []);

  const chipClass = (active) =>
    `border px-3 py-1.5 rounded-[18px] text-[12px] cursor-pointer transition-all ${
      active ? 'border-[#2f80ed] bg-[#2f80ed] text-white font-bold' : 'border-[#d6e4ff] text-[#3b4a67] bg-white hover:border-[#2f80ed]'
    }`;

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f3f7ff]">
        <div className="text-center">
          <div className="text-lg font-bold text-[#2f80ed] mb-2">고민순삭</div>
          <p className="text-sm text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (user.role === 'ADMIN') return <DashBoard />;
  else if (user.role === 'USER')
    return (
      <div className="w-full">
        {/* MOBILE */}
        <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-[24px]">
          <header className="bg-[#2a5eea] h-16 flex items-center justify-center">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="text-lg leading-none" aria-hidden="true">
                ★
              </span>
              <span>고민순삭</span>
            </div>
          </header>

          <main className="px-[18px] pt-4 flex flex-col gap-[22px]">
            <section
              className="h-[170px] rounded-[14px] text-white p-[18px] flex items-end shadow-[0_10px_20px_rgba(0,0,0,0.18)] bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(0deg, rgba(0,0,0,0.38), rgba(0,0,0,0.38)), url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=780&q=80')",
              }}
            >
              <div>
                <p className="text-sm leading-[1.4] font-semibold">우리를 망치는 것은 다른 사람들의 눈을</p>
                <p className="text-sm leading-[1.4] font-semibold">지나치게 의식하는 것이다.</p>
                <span className="block mt-2 text-[11px] font-normal opacity-90">벤자민 프랭클린 | 명언/명대사</span>
              </div>
            </section>

            {/* TODO: DB 연동 시 각 상담 유형별 라우팅 및 필터링 */}
            <section className="flex flex-col gap-[14px]">
              {/* 고민 상담 → AI 상담 */}
              <Link
                to="/chat/withai"
                className="flex items-center justify-center gap-4 px-4 py-[22px] rounded-[14px] text-white no-underline shadow-[0_8px_16px_rgba(0,0,0,0.08)] bg-gradient-to-r from-[#2ed3c6] to-[#26b8ad]"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/70 flex items-center justify-center font-bold text-2xl bg-white/10">
                  <span>💬</span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold mb-1.5">고민 상담</h3>
                  <p className="text-[13px] font-medium">혼자서 풀지 못하던 고민,</p>
                  <p className="text-[13px] font-medium">지금 마음부터 가볍게 정리해보세요.</p>
                </div>
              </Link>

              {/* 커리어 상담 → 상담사 찾기 (커리어) */}
              <Link
                to="/chat/counselor?category=career"
                className="flex items-center justify-center gap-4 px-4 py-[22px] rounded-[14px] text-white no-underline shadow-[0_8px_16px_rgba(0,0,0,0.08)] bg-gradient-to-r from-[#4f9bff] to-[#2f80ed]"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/70 flex items-center justify-center font-bold text-2xl bg-white/10">
                  <span>💼</span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold mb-1.5">커리어 상담</h3>
                  <p className="text-[13px] font-medium">지금의 선택이 맞는지,</p>
                  <p className="text-[13px] font-medium">커리어 방향을 함께 점검해드려요.</p>
                </div>
              </Link>

              {/* 취업 상담 → 상담사 찾기 (취업) */}
              <Link
                to="/chat/counselor?category=job"
                className="flex items-center justify-center gap-4 px-4 py-[22px] rounded-[14px] text-white no-underline shadow-[0_8px_16px_rgba(0,0,0,0.08)] bg-gradient-to-r from-[#2563eb] to-[#1e40af]"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/70 flex items-center justify-center font-bold text-2xl bg-white/10">
                  <span>📝</span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold mb-1.5">취업 상담</h3>
                  <p className="text-[13px] font-medium">이력서부터 면접까지,</p>
                  <p className="text-[13px] font-medium">합격에 필요한 전략을 전해드립니다.</p>
                </div>
              </Link>
            </section>

            <section>
              <h4 className="text-[18px] font-bold mb-3">이번 주 키워드</h4>
              <div className="relative h-[210px] bg-white rounded-[14px] shadow-[0_10px_20px_rgba(31,41,55,0.08)] overflow-hidden">
                {keywordCloud.map((item) => (
                  <span
                    key={item.text}
                    className={`absolute text-[#2f80ed] font-bold opacity-75 ${item.className}`}
                    style={item.style}
                  >
                    {item.text}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-[14px] pt-[14px] px-3 pb-3 shadow-[0_10px_20px_rgba(31,41,55,0.08)]">
              <div className="flex items-center justify-between">
                <h4 className="text-[18px] font-bold">커뮤니티 인기글</h4>
                <Link
                  to="/board"
                  state={{ activeTab: '인기글' }}
                  className="text-[12px] text-[#6b7280] bg-transparent border-0"
                >
                  전체 보기 &gt;
                </Link>
              </div>
              <div className="flex gap-2 my-3">
                <button
                  type="button"
                  className={chipClass(communityMode === 'realtime')}
                  onClick={() => setCommunityMode('realtime')}
                >
                  실시간
                </button>
                <button
                  type="button"
                  className={chipClass(communityMode === 'week')}
                  onClick={() => setCommunityMode('week')}
                >
                  주간
                </button>
                <button
                  type="button"
                  className={chipClass(communityMode === 'month')}
                  onClick={() => setCommunityMode('month')}
                >
                  월간
                </button>
                <button
                  type="button"
                  className={chipClass(communityMode === 'recommend')}
                  onClick={() => setCommunityMode('recommend')}
                >
                  추천순
                </button>
              </div>
              <ol className="list-none p-0 m-0 flex flex-col gap-2">
                {communityTopPosts.map((p, index) => (
                  <li key={p.id} className="flex items-center gap-2.5 text-[13px] text-[#1f2937]">
                    <span className="font-bold text-[#4b5563] w-[26px]">{String(index + 1).padStart(2, '0')}</span>
                    <Link to={`/board/view/${p.id}`} className="truncate">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          </main>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:block w-full bg-[#f3f7ff] min-h-screen">
          <div className="max-w-[1520px] mx-auto px-6 py-8">
            {/* HERO */}
            <section
              className="h-[220px] rounded-[20px] text-white p-8 flex items-end shadow-[0_8px_24px_rgba(0,0,0,0.12)] bg-cover bg-center mb-8"
              style={{
                backgroundImage:
                  "linear-gradient(0deg, rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
              }}
            >
              <div>
                <p className="text-[18px] leading-[1.5] font-semibold mb-1">
                  우리를 망치는 것은 다른 사람들의 눈을 지나치게 의식하는 것이다.
                </p>
                <span className="block text-[13px] font-normal opacity-90">벤자민 프랭클린 | 명언/명대사</span>
              </div>
            </section>

            {/* QUICK TEST */}
            <section className="mb-8">
              <h3 className="text-[20px] font-bold text-[#111827] mb-4">내 취업 간단 테스트</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: '나에게 맞는 직무는?', desc: '직무 적성 테스트로 나와 맞는 직무를 찾아보세요' },
                  { title: '이력서 점검하기', desc: '내 이력서를 체크리스트로 점검해보세요' },
                  { title: '자소서 한 줄 팁', desc: '합격 자소서 작성을 위한 핵심 팁을 확인하세요' },
                ].map((t) => (
                  <div
                    key={t.title}
                    className="bg-white rounded-[16px] border-2 border-[#e5e7eb] p-5 hover:border-[#2f80ed] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-block bg-[#e0f2fe] text-[#0284c7] text-[11px] font-semibold px-3 py-1 rounded-full">
                        테스트
                      </span>
                    </div>
                    <p className="text-[15px] font-bold text-[#111827] mb-2">{t.title}</p>
                    <p className="text-[12px] text-[#6b7280] leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* MAIN CTA */}
            {/* TODO: DB 연동 시 각 버튼의 링크를 실제 상담 서비스로 연결 */}
            <section className="mb-8">
              <h3 className="text-[20px] font-bold text-[#111827] mb-4">지금 나에게 필요한 상담은 무엇인가요?</h3>
              <div className="grid grid-cols-3 gap-5">
                {/* 고민 상담 → AI 상담 */}
                <Link
                  to="/chat/withai"
                  className="bg-gradient-to-br from-[#2ed3c6] to-[#26b8ad] rounded-[20px] p-8 text-white shadow-[0_8px_24px_rgba(46,211,198,0.25)] hover:shadow-[0_12px_32px_rgba(46,211,198,0.35)] hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px]"
                >
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-[52px] mb-4">
                    💬
                  </div>
                  <p className="text-[26px] font-bold mb-2">고민 상담</p>
                  <p className="text-[14px] opacity-95 leading-relaxed">
                    혼자서 풀지 못하던 고민,
                    <br />
                    지금 마음부터 가볍게 정리해보세요.
                  </p>
                </Link>

                {/* 커리어 상담 → 상담사 찾기 (커리어) */}
                <Link
                  to="/chat/counselor?category=career"
                  className="bg-gradient-to-br from-[#4f9bff] to-[#2f80ed] rounded-[20px] p-8 text-white shadow-[0_8px_24px_rgba(47,128,237,0.25)] hover:shadow-[0_12px_32px_rgba(47,128,237,0.35)] hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px]"
                >
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-[52px] mb-4">
                    💼
                  </div>
                  <p className="text-[26px] font-bold mb-2">커리어 상담</p>
                  <p className="text-[14px] opacity-95 leading-relaxed">
                    지금의 선택이 맞는지,
                    <br />
                    커리어 방향을 함께 점검해드려요.
                  </p>
                </Link>

                {/* 취업 상담 → 상담사 찾기 (취업) */}
                <Link
                  to="/chat/counselor?category=job"
                  className="bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-[20px] p-8 text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px]"
                >
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-[52px] mb-4">
                    📝
                  </div>
                  <p className="text-[26px] font-bold mb-2">취업 상담</p>
                  <p className="text-[14px] opacity-95 leading-relaxed">
                    이력서부터 면접까지,
                    <br />
                    합격에 필요한 전략을 전해드립니다.
                  </p>
                </Link>
              </div>
            </section>

            {/* KEYWORDS */}
            <section className="mb-8">
              <h3 className="text-[20px] font-bold text-[#111827] mb-4">이번 주 키워드</h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="relative bg-white rounded-[20px] shadow-[0_4px_16px_rgba(31,41,55,0.06)] overflow-hidden p-6 h-full min-h-[320px]">
                  {keywordCloud.map((item) => (
                    <span
                      key={item.text}
                      className={`absolute text-[#2f80ed] font-bold opacity-80 ${item.className}`}
                      style={item.style}
                    >
                      {item.text}
                    </span>
                  ))}
                </div>
                <div className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(31,41,55,0.06)] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[16px] font-bold text-[#111827]">상위 키워드 TOP 10</p>
                    <p className="text-[12px] text-[#6b7280]">이번 주</p>
                  </div>
                  <ol className="space-y-2.5">
                    {[...keywordCloud]
                      .map((k) => k.text)
                      .slice(0, 9)
                      .concat(['포트폴리오'])
                      .slice(0, 10)
                      .map((t, idx) => (
                        <li key={`${t}-${idx}`} className="flex items-center gap-3 text-[13px]">
                          <span className="w-7 text-right font-bold text-[#4b5563]">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="flex-1 text-[#111827] font-medium">{t}</span>
                          <span className="text-[#6b7280] text-[12px] font-semibold">
                            {(100 - idx * 8).toFixed(0)}%
                          </span>
                        </li>
                      ))}
                  </ol>
                </div>
              </div>
            </section>

            {/* BOTTOM GRID: NOTICE + COMMUNITY */}
            <section className="grid grid-cols-2 gap-5">
              {/* 공지사항 */}
              <div className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(31,41,55,0.06)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[18px] font-bold text-[#111827]">공지사항</h4>
                  <Link to="/board" state={{ activeTab: '공지사항' }} className="text-[12px] text-[#6b7280] hover:text-[#2f80ed]">
                    더보기 &gt;
                  </Link>
                </div>
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <Link
                      key={notice.id}
                      to={`/board/view/${notice.id}`}
                      className="block border border-[#e5e7eb] rounded-[14px] overflow-hidden hover:shadow-md hover:border-[#2f80ed] transition-all"
                    >
                      <div className="h-[100px] bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80"
                          alt={notice.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-[13px] font-bold text-[#111827] line-clamp-1 mb-1">{notice.title}</p>
                        <p className="text-[11px] text-[#6b7280]">
                          {notice.author} | {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 커뮤니티 인기글 */}
              <div className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(31,41,55,0.06)] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[18px] font-bold text-[#111827]">커뮤니티 인기글</h4>
                  <Link to="/board" state={{ activeTab: '인기글' }} className="text-[12px] text-[#6b7280] hover:text-[#2f80ed]">
                    전체 보기 &gt;
                  </Link>
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    className={chipClass(communityMode === 'realtime')}
                    onClick={() => setCommunityMode('realtime')}
                  >
                    실시간
                  </button>
                  <button
                    type="button"
                    className={chipClass(communityMode === 'week')}
                    onClick={() => setCommunityMode('week')}
                  >
                    주간
                  </button>
                  <button
                    type="button"
                    className={chipClass(communityMode === 'month')}
                    onClick={() => setCommunityMode('month')}
                  >
                    월간
                  </button>
                  <button
                    type="button"
                    className={chipClass(communityMode === 'recommend')}
                    onClick={() => setCommunityMode('recommend')}
                  >
                    추천순
                  </button>
                </div>
                <ol className="list-none p-0 m-0 flex flex-col gap-2.5">
                  {communityTopPosts.map((p, index) => (
                    <li key={p.id} className="flex items-center gap-3 text-[13px] text-[#1f2937]">
                      <span className="font-bold text-[#4b5563] w-[28px] text-center">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Link
                        to={`/board/view/${p.id}`}
                        className="flex-1 truncate hover:text-[#2f80ed] font-medium transition-colors"
                      >
                        {p.title}
                      </Link>
                      <span className="text-[11px] text-[#6b7280]">👍 {p.likes}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  else return <CounselorDefaultPage />;
};

export default Home;
