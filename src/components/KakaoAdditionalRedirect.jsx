import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * 카카오로 처음 로그인한 사용자는 추가 정보 입력 페이지로만 이동하도록 리다이렉트합니다.
 * (추가 정보를 완료한 뒤에는 일반 서비스 이용 가능)
 */
const KakaoAdditionalRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, needsKakaoAdditionalInfo } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!needsKakaoAdditionalInfo) return;

    const path = location.pathname;
    const isKakaoAdditionalPage = path === '/member/kakao-additional' || path.startsWith('/member/kakao-additional');
    if (isKakaoAdditionalPage) return;

    navigate('/member/kakao-additional', { replace: true });
  }, [loading, needsKakaoAdditionalInfo, location.pathname, navigate]);

  return null;
};

export default KakaoAdditionalRedirect;
