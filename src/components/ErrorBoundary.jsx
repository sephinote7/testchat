import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 헤더/푸터/라우트 등 전체 레이아웃에서 발생한 예기치 않은 오류를 잡아
 * 흰 화면 대신 안내 메시지와 복구 버튼을 보여줌.
 */
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[#f3f7ff] p-4">
          <div className="text-center max-w-md">
            <p className="text-gray-800 font-medium mb-2">일시적인 오류가 발생했습니다.</p>
            <p className="text-gray-600 text-sm mb-6">아래 버튼으로 다시 시도해 주세요.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-6 py-2.5 bg-[#2563eb] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors"
              >
                홈으로
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-xl font-medium hover:bg-[#eff6ff] transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
