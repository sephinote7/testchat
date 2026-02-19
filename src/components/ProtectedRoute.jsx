import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowRoles }) {
  const { user, loading } = useAuth();

  // 로딩 중일 때는 아무것도 표시하지 않음
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-[#2563eb] mb-2">고민순삭</div>
          <p className="text-sm text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user || !user.isLogin) {
    return <Navigate to="/member/signin" replace />;
  }

  // 권한이 없는 경우
  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
