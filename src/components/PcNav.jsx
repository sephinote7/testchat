import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PcNav = () => {
  let MENUS = [];
  const { user } = useAuth();
  const location = useLocation();

  if (user.role === 'USER') {
    MENUS.push(
      { label: 'Home', to: '/' },
      { label: '상담', to: '/chat' },
      { label: '게시판', to: '/board' },
      { label: 'INFO', to: '/info' },
      { label: user.isLogin ? '마이페이지' : '로그인', to: user.isLogin ? '/mypage' : '/member/signin' },
    );
  } else if (user.role === 'COUNSELOR') {
    MENUS.push({ label: '마이페이지', to: '/system/mypage' });
  } else if (user.role === 'ADMIN') {
    MENUS.push({ label: '마이페이지', to: '/admin' });
  } else {
    return null;
  }

  return (
    <nav className="hidden lg:block w-full bg-[#2563eb] top-0 left-0 z-50 shadow-sm">
      <div className="max-w-[1520px] mx-auto px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* 로고 영역 */}
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-white text-[26px] leading-none font-bold">★</span>
              <span className="text-white text-[26px] font-bold tracking-tight">고민순삭</span>
            </div>
          </NavLink>

          {/* 메뉴 */}
          <ul className="flex gap-8 items-center">
            {MENUS.map(({ label, to }) => {
              const isMyPage = label.includes('마이페이지') || label === '로그인';

              return (
                <li key={to}>
                  {isMyPage ? (
                    <NavLink
                      to={to}
                      className="px-6 py-2.5 bg-white text-[#2563eb] rounded-lg text-[16px] font-black hover:bg-blue-50 transition-all duration-200 shadow-md tracking-tight"
                      style={{ fontWeight: 900 }}
                    >
                      {label === '로그인' ? '로그인' : '마이페이지로 이동'}
                    </NavLink>
                  ) : (
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `text-[17px] font-medium transition-all duration-200 px-1 py-1
                      ${isActive ? 'text-white font-bold' : 'text-white/90 hover:text-white'}`
                      }
                    >
                      {label}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default PcNav;
