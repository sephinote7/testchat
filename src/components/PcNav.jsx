import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';

const PcNav = () => {
  let MENUS = [];
  // const { user } = useAuth();
  const location = useLocation();
  const { loginStatus, roleName, nickname } = useAuthStore();

  // 로고 이미지
  const PcLogo = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/h_logo.png';

  if (roleName === 'USER' || !roleName) {
    if (nickname?.split('_')[0] === 'social') {
      MENUS.push([]);
      return null;
    }
    MENUS.push(
      { label: 'HOME', to: '/' },
      { label: '상담', to: { pathname: '/chat', state: { fromNav: true } } },
      { label: '게시판', to: '/board' },
      { label: 'INFO', to: '/info' },
      {
        label: loginStatus ? '마이페이지' : '로그인',
        to: loginStatus ? '/mypage' : '/member/signin',
      },
    );
  } else if (roleName === 'SYSTEM') {
    if (location.pathname === '/system/mypage') return null;
    MENUS.push({ label: '마이페이지', to: '/system/mypage' });
  } else if (roleName === 'ADMIN') {
    // MENUS.push({ label: '마이페이지', to: '/admin' });
    return null;
  }

  return (
    <nav className="hidden lg:block w-full bg-[#2563eb] top-0 left-0 z-50 shadow-sm">
      <div className="max-w-[1520px] mx-auto px-8">
        <div className="flex items-center justify-between h-24">
          {/* 로고 영역 */}
          <NavLink
            to={roleName === 'SYSTEM' ? '/system/mypage' : roleName === 'ADMIN' ? '/alarm' : '/'}
            className="flex items-center gap-2.5"
          >
            <div className="flex items-center gap-1.5 w-24">
              {/* <span className="text-white text-[26px] leading-none font-bold">★</span>
              <span className="text-white text-[26px] font-bold tracking-tight">고민순삭</span> */}
              <img src={PcLogo} alt="로고" />
            </div>
          </NavLink>

          {/* 메뉴 */}
          <ul className="flex gap-8 items-center">
            {MENUS.map(({ label, to }) => {
              const isMyPage = label.includes('마이페이지') || label === '로그인';

              return (
                <li key={typeof to === 'object' ? to.pathname : to}>
                  {isMyPage ? (
                    <NavLink
                      to={to}
                      className="px-6 py-2.5 bg-white text-[#2563eb] rounded-lg !text-2xl font-black hover:bg-blue-50 transition-all duration-200 shadow-md tracking-tight"
                      style={{ fontWeight: 900 }}
                    >
                      {label === '로그인' ? '로그인' : '마이페이지로 이동'}
                    </NavLink>
                  ) : (
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `!text-2xl font-medium transition-all duration-200 px-1 py-1
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
