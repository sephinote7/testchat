import React, { useMemo } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import About from './About';
import DocumentGuide from './DocumentGuide';
import InterviewGuide from './InterviewGuide';
import Map from './Map';

const OPTIONS = [
  { value: 'about', label: '고민순삭 소개', to: '/info' },
  { value: 'd_guide', label: '이력서 가이드', to: '/info/d_guide' },
  { value: 'cover_guide', label: '자소서 가이드', to: '/info/cover_guide' },
  { value: 'map', label: '상담센터 위치', to: '/info/map' },
];

// Mobile용 OPTIONS (이력서/자소서 통합)
const MOBILE_OPTIONS = [
  { value: 'about', label: '고민순삭 소개', to: '/info' },
  { value: 'd_guide', label: '이력서 / 자소서 가이드', to: '/info/d_guide' },
  { value: 'i_guide', label: '면접 가이드', to: '/info/i_guide' },
  { value: 'map', label: '가까운 센터 위치', to: '/info/map' },
];

const getSelectedValue = (pathname) => {
  if (pathname.endsWith('/info') || pathname === '/info') return 'about';
  if (pathname.includes('/info/d_guide')) return 'd_guide';
  if (pathname.includes('/info/cover_guide')) return 'cover_guide';
  if (pathname.includes('/info/i_guide')) return 'i_guide';
  if (pathname.includes('/info/map')) return 'map';
  return 'about';
};

const Info = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selected = useMemo(() => getSelectedValue(location.pathname), [location.pathname]);

  return (
    <div className="w-full min-h-screen mx-auto bg-[#f3f7ff] pb-[90px] lg:pb-8">
      {/* Mobile Header */}
      <header className="lg:hidden bg-[#2a5eea] h-16 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <span className="text-lg leading-none" aria-hidden="true">
            ★
          </span>
          <span>고민순삭</span>
        </div>
      </header>

      <main className="px-[18px] lg:px-0 pt-4 lg:pt-8">
        {/* Mobile 드롭다운 */}
        <div className="lg:hidden">
          <select
            value={selected}
            onChange={(event) => {
              const next = MOBILE_OPTIONS.find((o) => o.value === event.target.value);
              if (next) navigate(next.to);
            }}
            className="w-full h-11 rounded-[10px] border border-[#dbe3f1] bg-white px-3 text-[13px]"
          >
            {MOBILE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* PC Container */}
        <div className="lg:max-w-[1520px] lg:mx-auto lg:bg-white lg:rounded-2xl lg:shadow-sm lg:overflow-hidden">
          {/* PC 탭 버튼 */}
          <div className="hidden lg:flex bg-white border-b border-gray-200">
            {OPTIONS.map((opt) => {
              const isActive = selected === opt.value;
              return (
                <Link
                  key={opt.value}
                  to={opt.to}
                  className={`flex-1 h-[72px] flex items-center justify-center text-[18px] font-medium transition-colors ${
                    isActive ? 'bg-[#2f80ed] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="pt-4 lg:p-12">
            <Routes>
              <Route index element={<About />} />
              <Route path="d_guide" element={<DocumentGuide type="resume" />} />
              <Route path="cover_guide" element={<DocumentGuide type="cover" />} />
              <Route path="i_guide" element={<InterviewGuide />} />
              <Route path="map" element={<Map />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Info;
