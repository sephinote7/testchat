import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAiConsultStore } from '../../../stores/useAiConsultStore';
import useAuth from '../../../hooks/useAuth';
import CounselorDefaultPage from '../../system/info/CounselorDefaultPage';
import { posts } from '../../user/board/boardData';
import {
  getMonthlyPopularPosts,
  getMonthlyPopularPosts_py,
  getRealtimePopularPosts,
  getRecommendedPosts,
  getWeeklyKeywords,
  getWeeklyPopularPosts,
} from "../../../api/bbsApi";
import { useAuthStore } from "../../../store/auth.store";
import { bbsApi } from "./../../../api/backendApi";

const mobileLogo =
  "https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/h_logo(m).png";
const nomal_cnsl =
  "https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/nomal_cnsl.png";
const career_cnsl =
  "https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/career_cnsl.png";
const employment_cnsl =
  "https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/employment_cnsl.png";

const Home = () => {
  const { user, loading } = useAuth();
  const { email, accessToken, roleName } = useAuthStore();
  const [communityMode, setCommunityMode] = useState('realtime'); // realtime | week | month | recommend
  const [communityTopPosts, setCommunityTopPosts] = useState([]);
  const [keywordCloud, setKeywordCloud] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        let data = null; // 초기값을 null로 설정

        if (communityMode === "realtime") {
          data = await getRealtimePopularPosts(communityMode);
        } else if (communityMode === "week") {
          data = await getWeeklyPopularPosts(communityMode);
        } else if (communityMode === "month") {
          if (accessToken) {
            const res = await getMonthlyPopularPosts_py();
            data = res?.posts;
          } else {
            data = await getMonthlyPopularPosts(communityMode);
          }
        } else if (communityMode === "recommend") {
          if (accessToken) {
            data = await getRecommendedPosts(email);
            data = data.recommendations;
          }
        }
        console.log('test', data);
        setCommunityTopPosts(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
              ? data.content
              : [],
        );
      } catch (error) {
        setCommunityTopPosts([]);
        if (error.response) {
          setErrorMessage(error.response.data?.detail || '서버 오류가 발생했습니다.');
        } else if (error.request) {
          setErrorMessage('서버 응답이 없습니다. 네트워크를 확인해 주세요.');
        } else setErrorMessage(error.message || '알 수 없는 에러가 발생했습니다. 새로고침을 해 주세요.');
      }
    };

    const fetchWeeklyKeywords = async () => {
      try {
        const data = await getWeeklyKeywords();
        setKeywordCloud(data?.keywords || []); // undefined 방지
      } catch (err) {
        setKeywordCloud([]);
      }
    };

    fetchPopularPosts();
    fetchWeeklyKeywords();
  }, [communityMode, accessToken, email]); // accessToken이 변할 때(갱신 등) 다시 불러오도록 추가

  // TODO: DB 연동 시 실제 공지글 가져오기
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // 공지사항 DB 연동 (bbs_div=NOTI, 최대 4건)
  useEffect(() => {
    let cancelled = false;
    setLoadingNotices(true);
    bbsApi
      .getList({ bbs_div: "NOTI", page: 1, limit: 4, del_yn: "N" })
      .then((res) => {
        if (cancelled) return;
        const content = Array.isArray(res?.content) ? res.content : [];
        setNotices(
          content.map((row) => ({
            id: row.bbsId,
            title: row.title ?? "",
            author:
              row.memberId?.nickname ?? row.memberId?.memberId ?? "관리자",
            createdAt:
              row.created_at ?? row.createdAt ?? new Date().toISOString(),
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setNotices([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingNotices(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // // 커뮤니티 인기글 DB 연동 (실시간/주간 API, 월간·추천순은 주간 데이터 활용)
  // useEffect(() => {
  //   let cancelled = false;
  //   setLoadingPopular(true);
  //   const apiCall = communityMode === 'realtime' ? bbsApi.getPopularRealtime() : bbsApi.getPopularWeekly();
  //   apiCall
  //     .then((res) => {
  //       if (cancelled) return;
  //       const arr = Array.isArray(res)
  //         ? res
  //         : (res?.content ?? res?.data ?? (res && typeof res === 'object' && !Array.isArray(res) ? [] : []));
  //       const rawList = Array.isArray(arr) ? arr : [];
  //       let items = rawList.slice(0, 10).map((p) => ({
  //         id: p.bbsId ?? p.id,
  //         title: p.title ?? '',
  //         likes: p.bbsLikeCount ?? p.likes ?? 0,
  //         views: p.views ?? 0,
  //         commentCount: p.commentCount ?? 0,
  //         postScore: p.postScore ?? 0,
  //       }));
  //       if (communityMode === 'recommend' && items.length > 0) {
  //         items = [...items].sort((a, b) => (b.postScore ?? 0) - (a.postScore ?? 0));
  //       }
  //       setCommunityTopPosts(items);
  //     })
  //     .catch((err) => {
  //       if (!cancelled) setCommunityTopPosts([]);
  //       console.warn('[Home] 인기글 로드 실패:', err?.message ?? err);
  //     })
  //     .finally(() => {
  //       if (!cancelled) setLoadingPopular(false);
  //     });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [communityMode]);

  const chipClass = (active) =>
    `border px-3 py-1.5 rounded-[18px] text-[12px] cursor-pointer transition-all ${
      active
        ? "border-[#2f80ed] bg-[#2f80ed] text-white font-bold"
        : "border-[#d6e4ff] text-[#3b4a67] bg-white hover:border-[#2f80ed]"
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

  if (roleName === 'ADMIN') return null;
  else if (roleName === 'USER' || !roleName)
    return (
      <div className="w-full">
        {/* MOBILE */}
        <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-[24px]">
          <header className="bg-[#2a5eea] h-16 flex items-center justify-center">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <img
                src={mobileLogo}
                alt="로고"
                className="w-18 h-auto"
              />
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
                <p className="text-sm leading-[1.4] font-semibold">
                  우리를 망치는 것은 다른 사람들의 눈을
                </p>
                <p className="text-sm leading-[1.4] font-semibold">
                  지나치게 의식하는 것이다.
                </p>
                <span className="block mt-2 text-[11px] font-normal opacity-90">
                  벤자민 프랭클린 | 명언/명대사
                </span>
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
                  <img src={nomal_cnsl} alt="고민상담" className="w-12"/>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold mb-1.5">고민 상담</h3>
                  <p className="text-[13px] font-medium">
                    혼자서 풀지 못하던 고민,
                  </p>
                  <p className="text-[13px] font-medium">
                    지금 마음부터 가볍게 정리해보세요.
                  </p>
                </div>
              </Link>

              {/* 커리어 상담 → 상담사 찾기 (커리어) */}
              <Link
                to="/chat/counselor?category=career"
                className="flex items-center justify-center gap-4 px-4 py-[22px] rounded-[14px] text-white no-underline shadow-[0_8px_16px_rgba(0,0,0,0.08)] bg-gradient-to-r from-[#4f9bff] to-[#2f80ed]"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/70 flex items-center justify-center font-bold text-2xl bg-white/10">
                                    <img src={career_cnsl} alt="커리어상담" className="w-10"/>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold mb-1.5">커리어 상담</h3>
                  <p className="text-[13px] font-medium">
                    지금의 선택이 맞는지,
                  </p>
                  <p className="text-[13px] font-medium">
                    커리어 방향을 함께 점검해드려요.
                  </p>
                </div>
              </Link>

              {/* 취업 상담 → 상담사 찾기 (취업) */}
              <Link
                to="/chat/counselor?category=job"
                className="flex items-center justify-center gap-4 px-4 py-[22px] rounded-[14px] text-white no-underline shadow-[0_8px_16px_rgba(0,0,0,0.08)] bg-gradient-to-r from-[#2563eb] to-[#1e40af]"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/70 flex items-center justify-center font-bold text-2xl bg-white/10">
                                    <img src={employment_cnsl} alt="취업상담" className="w-10"/>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold mb-1.5">취업 상담</h3>
                  <p className="text-[13px] font-medium">
                    이력서부터 면접까지,
                  </p>
                  <p className="text-[13px] font-medium">
                    합격에 필요한 전략을 전해드립니다.
                  </p>
                </div>
              </Link>
            </section>

            {/* 운영 환경에서는 localhost 이미지 호출을 사용하지 않습니다. */}

            <section className="bg-white rounded-[14px] pt-[14px] px-3 pb-3 shadow-[0_10px_20px_rgba(31,41,55,0.08)]">
              <div className="flex items-center justify-between">
                <h4 className="text-[18px] font-bold">커뮤니티 인기글</h4>
                <Link
                  to="/board"
                  state={{ activeTab: "인기글" }}
                  className="text-[12px] text-[#6b7280] bg-transparent border-0"
                >
                  전체 보기 &gt;
                </Link>
              </div>
              <div className="flex gap-2 my-3">
                <button
                  type="button"
                  className={chipClass(communityMode === "realtime")}
                  onClick={() => setCommunityMode("realtime")}
                >
                  실시간
                </button>
                <button
                  type="button"
                  className={chipClass(communityMode === "week")}
                  onClick={() => setCommunityMode("week")}
                >
                  주간
                </button>
                <button
                  type="button"
                  className={chipClass(communityMode === "month")}
                  onClick={() => setCommunityMode("month")}
                >
                  월간
                </button>
                <button
                  type="button"
                  className={chipClass(communityMode === "recommend")}
                  onClick={() => setCommunityMode("recommend")}
                >
                  추천순
                </button>
              </div>
              {communityTopPosts?.length > 0 ? (
                <ol className="list-none p-0 m-0 flex flex-col gap-2">
                  {communityTopPosts.map((p, index) => (
                    <li key={p.bbsId || p.bbs_id} className="flex items-center gap-2.5 text-[13px] text-[#1f2937]">
                      <span className="font-bold text-[#4b5563] w-[26px]">{String(index + 1).padStart(2, '0')}</span>
                      <Link to={`/board/view/${p.bbsId || p.bbs_id}`} className="truncate">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="flex justify-center items-center h-64 text-[#6b7280] text-lg">{errorMessage}</div>
              )}
            </section>
          </main>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:block w-full bg-[#f3f7ff] min-h-screen">
          <div className="max-w-[1520px] mx-auto px-6 py-8">
            {/* HERO */}
            <section
              className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen h-[380px] text-white p-8 flex items-center justify-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)] bg-cover bg-center mb-8"
              style={{
                backgroundImage:
                  "linear-gradient(0deg, rgba(0,0,0,0.75)), url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
              }}
            >
              <div>
                <p className="!text-5xl leading-[1.5] !font-semibold mb-5">
                  우리를 망치는 것은 다른 사람들의 눈을 지나치게 의식하는
                  것이다.
                </p>
                <span className="block text-[13px] font-normal opacity-90">
                  벤자민 프랭클린 | 명언/명대사
                </span>
              </div>
            </section>

            {/* QUICK TEST */}
            <section className="my-10">
              <h3 className="!text-4xl !font-semibold text-[#111827] mb-8">
                내 취업 간단 테스트
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    title: '나에게 맞는 직무는?',
                    desc: '직무 적성 테스트로 나와 맞는 직무를 찾아보세요',
                    url: '',
                  },
                  {
                    title: '이력서 점검하기',
                    desc: '내 이력서를 체크리스트로 점검해보세요',
                    url: '/info/d_guide',
                  },
                  {
                    title: '자소서 한 줄 팁',
                    desc: '합격 자소서 작성을 위한 핵심 팁을 확인하세요',
                    url: '/info/cover_guide',
                  },
                ].map((t) => (
                  <div
                    key={t.title}
                    className="bg-white rounded-[16px] border-2 border-[#e5e7eb] p-5 hover:border-[#2f80ed] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(t.url)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-block bg-[#e0f2fe] text-[#0284c7] text-[11px] font-semibold px-3 py-1 rounded-full">
                        테스트
                      </span>
                    </div>
                    <p className="!text-2xl !font-medium text-[#111827] mb-2">
                      {t.title}
                    </p>
                    <p className="!text-xl text-[#6b7280] leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* MAIN CTA */}
            {/* TODO: DB 연동 시 각 버튼의 링크를 실제 상담 서비스로 연결 */}
            <section className="my-10">
              <h3 className="!text-4xl !font-semibold text-[#111827] mb-8">
                지금 나에게 필요한 상담은 무엇인가요?
              </h3>
              <div className="grid grid-cols-3 gap-5">
                {/* 고민 상담 → AI 상담 */}
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      activeCnslId
                        ? `/chat/withai/${activeCnslId}`
                        : "/chat/withai",
                    )
                  }
                  className="bg-gradient-to-br from-[#2ed3c6] to-[#26b8ad] rounded-[20px] p-8 text-white shadow-[0_8px_24px_rgba(46,211,198,0.25)] hover:shadow-[0_12px_32px_rgba(46,211,198,0.35)] hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px] border-0 cursor-pointer"
                >
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-[52px] mb-4">
                    <img src={nomal_cnsl} alt="고민 상담" />
                  </div>
                  <p className="!text-2xl !font-semibold mb-2">고민 상담</p>
                  <p className="!text-xl opacity-95 leading-relaxed">
                    혼자서 풀지 못하던 고민,
                    <br />
                    지금 마음부터 가볍게 정리해보세요.
                  </p>
                </button>

                {/* 커리어 상담 → 상담사 찾기 (커리어) */}
                <Link
                  to="/chat/counselor?category=career"
                  className="bg-gradient-to-br from-[#4f9bff] to-[#2f80ed] rounded-[20px] p-8 text-white shadow-[0_8px_24px_rgba(47,128,237,0.25)] hover:shadow-[0_12px_32px_rgba(47,128,237,0.35)] hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px]"
                >
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-[52px] mb-4">
                    <img src={career_cnsl} alt="커리어 상담" />
                  </div>
                  <p className="!text-2xl !font-semibold mb-2">커리어 상담</p>
                  <p className="!text-xl opacity-95 leading-relaxed">
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
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-[52px] mb-4">
                    <img src={employment_cnsl} alt="취업 상담" />
                  </div>
                  <p className="!text-2xl !font-semibold mb-2">취업 상담</p>
                  <p className="!text-xl opacity-95 leading-relaxed">
                    이력서부터 면접까지,
                    <br />
                    합격에 필요한 전략을 전해드립니다.
                  </p>
                </Link>
              </div>
            </section>

            {/* KEYWORDS */}
            <section className="mb-8">
              <h3 className="!text-4xl !font-bold text-[#111827] mb-4">
                이번 주 키워드
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="relative bg-white rounded-[20px] shadow-[0_4px_16px_rgba(31,41,55,0.06)] overflow-hidden p-6 h-full min-h-[320px] flex items-center justify-center">
                  {/* 운영 환경에서는 localhost 이미지 호출을 사용하지 않습니다. */}
                </div>
                <div className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(31,41,55,0.06)] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="!text-3xl !font-semibold text-[#111827]">
                      상위 키워드 TOP 10
                    </p>
                    <p className="!text-base text-[#6b7280]">이번 주</p>
                  </div>
                  <ol className="space-y-2.5">
                    {[...keywordCloud]
                      .map((k) => k.keyword)
                      .slice(0, 9)
                      .concat(["포트폴리오"])
                      .slice(0, 10)
                      .map((t, idx) => (
                        <li
                          key={`${t}-${idx}`}
                          className="flex items-center gap-3 !text-[18px]"
                        >
                          <span className="w-7 text-right font-bold text-[#4b5563]">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 text-[#111827] !font-medium">
                            {t}
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
                  <h4 className="text-[18px] font-bold text-[#111827]">
                    공지사항
                  </h4>
                  <Link
                    to="/board"
                    state={{ activeTab: "공지사항" }}
                    className="text-[12px] text-[#6b7280] hover:text-[#2f80ed]"
                  >
                    더보기 &gt;
                  </Link>
                </div>
                {loadingNotices ? (
                  <p className="text-[13px] text-[#6b7280] py-6">
                    공지사항을 불러오는 중...
                  </p>
                ) : notices.length === 0 ? (
                  <p className="text-[13px] text-[#6b7280] py-6">
                    등록된 공지사항이 없습니다.
                  </p>
                ) : (
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
                          <p className="text-[13px] font-bold text-[#111827] line-clamp-1 mb-1">
                            {notice.title}
                          </p>
                          <p className="text-[11px] text-[#6b7280]">
                            {notice.author} |{" "}
                            {new Date(notice.createdAt).toLocaleDateString(
                              "ko-KR",
                            )}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 커뮤니티 인기글 */}
              <div className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(31,41,55,0.06)] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[18px] font-bold text-[#111827]">
                    커뮤니티 인기글
                  </h4>
                  <Link
                    to="/board"
                    state={{ activeTab: "인기글" }}
                    className="text-[12px] text-[#6b7280] hover:text-[#2f80ed]"
                  >
                    전체 보기 &gt;
                  </Link>
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    className={chipClass(communityMode === "realtime")}
                    onClick={() => setCommunityMode("realtime")}
                  >
                    실시간
                  </button>
                  <button
                    type="button"
                    className={chipClass(communityMode === "week")}
                    onClick={() => setCommunityMode("week")}
                  >
                    주간
                  </button>
                  <button
                    type="button"
                    className={chipClass(communityMode === "month")}
                    onClick={() => setCommunityMode("month")}
                  >
                    월간
                  </button>
                  <button
                    type="button"
                    className={chipClass(communityMode === "recommend")}
                    onClick={() => setCommunityMode("recommend")}
                  >
                    추천순
                  </button>
                </div>
                {communityTopPosts?.length > 0 ? (
                  <ol className="list-none p-0 m-0 flex flex-col gap-2.5">
                    {communityTopPosts.map((p, index) => {
                      return (
                        <li key={p.bbsId || p.bbs_id} className="flex items-center gap-3 text-[13px] text-[#1f2937]">
                          <span className="font-bold text-[#4b5563] w-[28px] text-center">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <Link
                            to={`/board/view/${p.bbsId || p.bbs_id}`}
                            className="flex-1 truncate hover:text-[#2f80ed] font-medium transition-colors"
                          >
                            {p.title}
                          </Link>
                          <span className="text-[11px] text-[#6b7280]">👍 {p.bbsLikeCount || p.likeCnt || 0}</span>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <div className="flex justify-center items-center h-64 text-[#6b7280] text-lg">{errorMessage}</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  else return <CounselorDefaultPage />;
};

export default Home;
