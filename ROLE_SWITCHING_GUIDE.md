# 🔄 역할 전환 테스트 가이드

이 가이드는 useAuth.js 코드 수정 없이 브라우저에서 역할(USER, COUNSELOR, ADMIN)을 전환하여 테스트하는 방법을 설명합니다.

---

## 📋 목차

1. [가장 쉬운 방법 - 한 줄 명령어](#방법-1-가장-쉬운-방법---한-줄-명령어)
2. [개발자 도구 콘솔 사용](#방법-2-개발자-도구-콘솔-사용)
3. [URL로 직접 이동](#방법-3-url로-직접-이동)
4. [현재 역할 확인](#현재-역할-확인)
5. [로그아웃](#로그아웃)

---

## 방법 1: 가장 쉬운 방법 - 한 줄 명령어

### 사용 방법:
1. 브라우저에서 `F12` 키를 눌러 개발자 도구 열기
2. `Console` 탭 선택
3. 아래 명령어 중 하나를 복사하여 붙여넣기
4. `Enter` 키 입력 → 자동으로 새로고침되며 역할 전환 완료!

### 명령어:

#### 👤 일반 유저로 전환
```javascript
localStorage.setItem('dummyUser', '{"isLogin":true,"role":"USER","email":"user@test.com","id":"user-123","nickname":"일반사용자"}'); location.reload();
```

#### 👨‍💼 상담사로 전환
```javascript
localStorage.setItem('dummyUser', '{"isLogin":true,"role":"COUNSELOR","email":"counselor@test.com","id":"counselor-123","nickname":"상담사"}'); location.reload();
```

#### 👨‍💻 관리자로 전환
```javascript
localStorage.setItem('dummyUser', '{"isLogin":true,"role":"ADMIN","email":"admin@test.com","id":"admin-123","nickname":"관리자"}'); location.reload();
```

---

## 방법 2: 개발자 도구 콘솔 사용

더 가독성 있는 방법입니다.

### 일반 유저로 전환:
```javascript
localStorage.setItem('dummyUser', JSON.stringify({
  isLogin: true,
  role: 'USER',
  email: 'user@test.com',
  id: 'user-123',
  nickname: '일반사용자'
}));
window.location.reload();
```

### 상담사로 전환:
```javascript
localStorage.setItem('dummyUser', JSON.stringify({
  isLogin: true,
  role: 'COUNSELOR',
  email: 'counselor@test.com',
  id: 'counselor-123',
  nickname: '상담사'
}));
window.location.reload();
```

### 관리자로 전환:
```javascript
localStorage.setItem('dummyUser', JSON.stringify({
  isLogin: true,
  role: 'ADMIN',
  email: 'admin@test.com',
  id: 'admin-123',
  nickname: '관리자'
}));
window.location.reload();
```

---

## 방법 3: URL로 직접 이동

각 역할의 주요 페이지로 바로 이동하여 테스트할 수 있습니다.

### 📍 주요 페이지 URL:

#### 일반 유저 (USER)
- 메인: `http://localhost:5173/`
- 상담: `http://localhost:5173/chat`
- 게시판: `http://localhost:5173/board`
- 마이페이지: `http://localhost:5173/mypage`

#### 상담사 (COUNSELOR)
- 마이페이지: `http://localhost:5173/system/mypage`
- 상담 내역: `http://localhost:5173/system/info/counsel-history`
- 리뷰 관리: `http://localhost:5173/system/info/reviews`
- 스케줄 관리: `http://localhost:5173/system/info/schedule`
- 위험군 조치 내역: `http://localhost:5173/system/info/risk-cases`

#### 관리자 (ADMIN)
- 마이페이지: `http://localhost:5173/admin`
- 대시보드: `http://localhost:5173/dashboard`
- 최신 정보: `http://localhost:5173/alarm`
- 통계 자료: `http://localhost:5173/stats`
- 최근 활동 내역: `http://localhost:5173/admin/activities`
- 정보 수정: `http://localhost:5173/admin/edit`

---

## 현재 역할 확인

현재 로그인된 역할을 확인하려면 콘솔에서:

```javascript
JSON.parse(localStorage.getItem('dummyUser'))
```

또는

```javascript
console.log(JSON.parse(localStorage.getItem('dummyUser')));
```

---

## 로그아웃

localStorage를 초기화하고 기본 유저로 돌아가려면:

```javascript
localStorage.removeItem('dummyUser');
window.location.reload();
```

---

## 💡 추가 팁

### 1. 빠른 전환을 위한 북마크릿
다음 코드를 북마크의 URL로 저장하면 클릭만으로 역할 전환이 가능합니다:

**일반 유저:**
```
javascript:(function(){localStorage.setItem('dummyUser','{"isLogin":true,"role":"USER","email":"user@test.com","id":"user-123","nickname":"일반사용자"}');location.reload();})();
```

**상담사:**
```
javascript:(function(){localStorage.setItem('dummyUser','{"isLogin":true,"role":"COUNSELOR","email":"counselor@test.com","id":"counselor-123","nickname":"상담사"}');location.reload();})();
```

**관리자:**
```
javascript:(function(){localStorage.setItem('dummyUser','{"isLogin":true,"role":"ADMIN","email":"admin@test.com","id":"admin-123","nickname":"관리자"}');location.reload();})();
```

### 2. 브라우저 확장 프로그램
Chrome 확장 프로그램으로 "EditThisCookie" 또는 "LocalStorage Manager"를 설치하면 GUI로 localStorage를 쉽게 관리할 수 있습니다.

### 3. 스니펫 저장
Chrome 개발자 도구의 Sources > Snippets에 위 코드를 저장해두면 더 편리합니다.

---

## ⚠️ 주의사항

1. **새로고침 필수**: 역할 전환 후 반드시 새로고침해야 적용됩니다.
2. **권한 제한**: 각 역할에 맞지 않는 페이지는 접근이 제한됩니다 (ProtectedRoute).
3. **로그아웃 시 초기화**: 로그아웃하면 localStorage가 삭제되고 useAuth.js의 기본값(현재 USER)으로 돌아갑니다.
4. **개발 환경 전용**: 이 방법은 개발/테스트 환경에서만 사용하세요. 프로덕션에서는 실제 인증 시스템을 사용해야 합니다.

---

## 🎯 역할별 주요 기능

### 👤 일반 유저 (USER)
- 상담 (AI 채팅, 상담사 찾기)
- 게시판 (글 작성, 댓글)
- 마이페이지 (상담 내역, 포인트, 작성글)
- 플로팅 챗봇 표시 ✅

### 👨‍💼 상담사 (COUNSELOR)
- 상담 내역 (대시보드, 수익 분석)
- 리뷰 관리
- 스케줄 관리
- 위험군 조치 내역
- 플로팅 챗봇 미표시 ❌

### 👨‍💻 관리자 (ADMIN)
- 대시보드 (상담 통계)
- 최신 정보 (공지사항, 위험 알림)
- 통계 자료 (키워드 분석)
- 최근 활동 내역 (위험 단어 감지)
- 플로팅 챗봇 미표시 ❌

---

## 🔧 문제 해결

### 역할 전환이 안 될 때:
1. 콘솔에 오류 메시지가 있는지 확인
2. localStorage가 제대로 저장되었는지 확인:
   ```javascript
   localStorage.getItem('dummyUser')
   ```
3. 브라우저 캐시 삭제 후 재시도
4. 시크릿/프라이빗 모드에서 테스트

### 페이지 접근이 안 될 때:
- ProtectedRoute로 보호된 페이지는 해당 역할만 접근 가능합니다
- 403 또는 리다이렉트가 발생하면 역할을 확인하세요

---

**작성일**: 2026.02.10  
**버전**: 1.0  
**작성자**: AI Assistant
