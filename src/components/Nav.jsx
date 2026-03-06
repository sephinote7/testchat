import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';

const Nav = () => {
  let MENUS = [];
  const location = useLocation();
  const { loginStatus, roleName } = useAuthStore();

  if (location.pathname.startsWith('/member')) return null;

  // 상담사 페이지에서는 Nav 숨김
  if (
    location.pathname.startsWith('/mycounsel') ||
    location.pathname.startsWith('/system') ||
    location.pathname.startsWith('/editinfo') ||
    location.pathname.startsWith('/about')
  ) {
    return null;
  }

  // 상담사(SYSTEM) 역할은 네비게이션 바 표시 안 함
  if (roleName === 'SYSTEM') {
    return;
  }

  if (roleName === 'USER' || !roleName) {
    MENUS.push(
      { label: '홈', to: '/' },
      { label: '상담', to: '/chat' },
      { label: '게시판', to: '/board' },
      { label: 'INFO', to: '/info' },
      { label: loginStatus ? '마이페이지' : '로그인', to: loginStatus ? '/mypage' : '/member/signin' },
    );
  } else if (roleName === 'ADMIN') {
    MENUS.push(
      { label: '대시보드', to: '/dashboard' },
      { label: '알림', to: '/alarm' },
      { label: '통계자료', to: '/stats' },
      { label: '마이페이지', to: '/mypage' },
    );
  } else return;

  return (
    <>
      {/* 아이콘 필요하면 lucide-react install 후, 아이콘 사용 */}
      <nav className="lg:hidden text-main-02 bg-white fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] border-t">
        <div className="w-full mx-auto px-3">
          <ul className="flex h-14">
            {MENUS.map(({ label, to }) => (
              <li key={to} className="flex-1">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex h-full items-center justify-center pb-1 text-[12px] transition-colors
                 ${isActive ? 'font-semibold text-blue-600' : 'text-gray-500'}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Nav;
