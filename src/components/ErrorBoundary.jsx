import React from 'react';

/**
 * 라우트/페이지에서 발생한 예기치 않은 오류를 잡아
 * 흰 화면 대신 안내 메시지와 새로고침 버튼을 보여줌.
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
        <div className="w-full min-h-[60vh] flex items-center justify-center bg-[#f3f7ff] p-4">
          <div className="text-center max-w-md">
            <p className="text-gray-700 mb-4">일시적인 오류가 발생했습니다.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#2563eb] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
