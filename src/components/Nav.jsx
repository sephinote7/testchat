import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const Nav = () => {
  let MENUS = [];
  const location = useLocation();
  const { loginStatus, roleName, nickname } = useAuthStore();

  if (location.pathname.startsWith('/member')) return null;

  const m_home = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/m_main_home.png';
  const m_chat = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/m_cheating.png';
  const m_board = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/m_board.png';
  const m_info = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/m_info.png';
  const m_login = 'https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/m_login.png';

  if (
    location.pathname.startsWith('/mycounsel') ||
    location.pathname.startsWith('/system') ||
    location.pathname.startsWith('/editinfo') ||
    location.pathname.startsWith('/about')
  ) {
    return null;
  }

  if (roleName === 'SYSTEM') return null;

  if (roleName === 'USER' || !roleName) {
    if (nickname?.split('_')[0] === 'social') {
      MENUS.push([]);
      return null;
    }
    MENUS.push(
      { label: '홈', to: '/', icon: m_home },
      { label: '상담', to: { pathname: '/chat', state: { fromNav: true } }, icon: m_chat },
      { label: '게시판', to: '/board', icon: m_board },
      { label: 'INFO', to: '/info', icon: m_info },
      {
        label: loginStatus ? '마이페이지' : '로그인',
        to: loginStatus ? '/mypage' : '/member/signin',
        icon: m_login,
      },
    );
  } else if (roleName === 'ADMIN') {
    // 관리자 메뉴에도 아이콘이 필요하다면 추가해주어야 합니다.
    // MENUS.push(
    //   { label: '대시보드', to: '/dashboard', icon: m_home },
    //   { label: '알림', to: '/alarm', icon: m_info },
    //   { label: '통계자료', to: '/stats', icon: m_board },
    //   { label: '마이페이지', to: '/mypage', icon: m_login },
    // );

    return;
  } else return null;

  return (
    <nav className="lg:hidden text-main-02 bg-white fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] border-t z-50">
      <div className="w-full mx-auto px-3">
        <ul className="flex h-16">
          {MENUS.map(({ label, to, icon }) => (
            <li key={typeof to === 'object' ? to.pathname : to} className="flex-1">
              <NavLink to={to} className="h-full w-full">
                {/* 핵심 수정 부분: isActive를 인자로 받는 함수형 자식 노드 */}
                {({ isActive }) => (
                  <div
                    className={`flex flex-col items-center justify-center h-full gap-1 transition-colors
                    ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}
                  >
                    {/* 이제 이 스코프 안에서 isActive를 안전하게 사용 가능합니다 */}
                    <img
                      src={icon}
                      alt={label}
                      className={`w-6 h-6 object-contain ${isActive ? '' : 'grayscale opacity-70'}`}
                    />
                    <span className="!text-xs">{label}</span>
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
