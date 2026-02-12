# 플로팅 챗봇 버튼 구현 가이드

## 개요

PC 화면 전용 플로팅 챗봇 버튼을 구현했습니다. 화면 우측 하단에 고정되어 있으며, 클릭 시 홈/채팅/설정 메뉴가 펼쳐집니다.

---

## 구현된 기능

### 1. **플로팅 버튼 위치**
- ✅ 화면 우측 하단에 고정 (`fixed bottom-8 right-8`)
- ✅ PC 화면에서만 표시 (`hidden lg:block`)
- ✅ 모바일에서는 숨김

### 2. **메뉴 펼침/접힘**
- ✅ 버튼 클릭 시 메뉴 토글
- ✅ 메뉴는 버튼 위쪽으로 펼쳐짐
- ✅ 메뉴 외부 클릭 시 자동 닫힘
- ✅ 부드러운 페이드인 애니메이션

### 3. **메뉴 구성**
- **홈**: 홈페이지로 이동 (`/`)
- **채팅**: 채팅/상담 페이지로 이동 (`/chat`)
- **설정**: 마이페이지로 이동 (`/mypage`)

### 4. **디자인**
- ✅ 파란색 테마 (`#2f80ed`)
- ✅ 둥근 모서리
- ✅ 그림자 효과
- ✅ 호버 시 확대 효과
- ✅ 버튼 회전 애니메이션 (열림/닫힘)

---

## 파일 구조

```
src/
├── App.jsx                          # FloatingChatbot 추가
├── components/
│   └── FloatingChatbot.jsx          # 플로팅 버튼 컴포넌트 (신규)
└── tailwind.config.js                # 애니메이션 추가
```

---

## 사용 방법

### 1. PC에서 확인
브라우저를 PC 크기로 확대하면 우측 하단에 파란색 원형 버튼이 나타납니다.

### 2. 메뉴 열기
플로팅 버튼을 클릭하면 버튼 위로 메뉴가 펼쳐집니다:
- 홈 아이콘
- 채팅 아이콘
- 설정 아이콘

### 3. 메뉴 닫기
- 다시 플로팅 버튼 클릭
- 메뉴 외부 영역 클릭
- 메뉴 항목 선택 (자동 이동 후 닫힘)

---

## 커스터마이징

### 메뉴 항목 변경

`src/components/FloatingChatbot.jsx` 파일에서 메뉴 항목을 수정할 수 있습니다:

```jsx
// 홈 버튼
<button onClick={() => handleMenuClick('/')}>
  {/* 아이콘 및 텍스트 */}
  <span>홈</span>
</button>

// 채팅 버튼
<button onClick={() => handleMenuClick('/chat')}>
  <span>채팅</span>
</button>

// 설정 버튼
<button onClick={() => handleMenuClick('/mypage')}>
  <span>설정</span>
</button>
```

### 색상 변경

파란색(`#2f80ed`) 대신 다른 색상을 사용하려면:

```jsx
// 메인 버튼
className="bg-[#2f80ed]"  // 원하는 색상으로 변경

// 메뉴 아이콘 배경
className="bg-[#2f80ed]"  // 원하는 색상으로 변경
```

### 위치 변경

우측 하단이 아닌 다른 위치에 배치하려면:

```jsx
// 현재: 우측 하단
<div className="fixed bottom-8 right-8">

// 좌측 하단
<div className="fixed bottom-8 left-8">

// 우측 상단
<div className="fixed top-8 right-8">
```

### 버튼 크기 변경

```jsx
// 현재: 64px (w-16 h-16)
<button className="w-16 h-16">

// 큰 버튼: 80px
<button className="w-20 h-20">

// 작은 버튼: 48px
<button className="w-12 h-12">
```

---

## 테스트

### 1. 버튼 표시 확인
- PC 화면 (1024px 이상): 버튼 표시됨 ✅
- 모바일 화면 (1024px 미만): 버튼 숨김 ✅

### 2. 메뉴 동작 확인
- 버튼 클릭 → 메뉴 펼쳐짐 ✅
- 메뉴 외부 클릭 → 메뉴 닫힘 ✅
- 메뉴 항목 클릭 → 페이지 이동 및 메뉴 닫힘 ✅

### 3. 애니메이션 확인
- 메뉴 펼칠 때 페이드인 효과 ✅
- 버튼 호버 시 확대 효과 ✅
- 메뉴 열림/닫힘 시 버튼 회전 ✅

---

## 추가 기능 아이디어

### 1. 실제 챗봇 연동
메뉴에서 "채팅"을 클릭하면 챗봇 창을 바로 열 수 있습니다:

```jsx
const [showChatWindow, setShowChatWindow] = useState(false);

// 채팅 버튼 클릭 시
<button onClick={() => setShowChatWindow(true)}>
  <span>채팅</span>
</button>

// 챗봇 창
{showChatWindow && (
  <div className="fixed bottom-24 right-8 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl">
    {/* 챗봇 UI */}
  </div>
)}
```

### 2. 알림 배지
메뉴 항목에 알림 개수 표시:

```jsx
<button className="relative">
  <span>채팅</span>
  {/* 알림 배지 */}
  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
    3
  </span>
</button>
```

### 3. 추가 메뉴 항목
더 많은 메뉴를 추가할 수 있습니다:

```jsx
// 알림 버튼
<button onClick={() => handleMenuClick('/notifications')}>
  <div className="w-12 h-12 bg-[#2f80ed] rounded-xl">
    {/* 알림 아이콘 */}
  </div>
  <span>알림</span>
</button>

// 도움말 버튼
<button onClick={() => handleMenuClick('/help')}>
  <div className="w-12 h-12 bg-[#2f80ed] rounded-xl">
    {/* 도움말 아이콘 */}
  </div>
  <span>도움말</span>
</button>
```

### 4. 키보드 단축키
ESC 키로 메뉴 닫기:

```jsx
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };
  
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [isOpen]);
```

---

## 스타일 가이드

### 색상 팔레트
- **주 색상**: `#2f80ed` (파란색)
- **호버 색상**: `#2670d4` (진한 파란색)
- **배경**: `#ffffff` (흰색)
- **텍스트**: `#111827` (진한 회색)

### 간격
- **버튼 크기**: 64px × 64px (4rem)
- **메뉴 너비**: 200px
- **메뉴 아이콘 크기**: 48px × 48px (3rem)
- **화면 여백**: 32px (2rem)

### 둥근 모서리
- **메인 버튼**: `rounded-full` (완전한 원)
- **메뉴 배경**: `rounded-3xl` (24px)
- **메뉴 아이콘**: `rounded-xl` (12px)
- **메뉴 항목**: `rounded-2xl` (16px)

---

## 문제 해결

### 1. 버튼이 보이지 않음
- PC 화면 크기인지 확인 (1024px 이상)
- `hidden lg:block` 클래스 확인
- z-index가 충분히 높은지 확인 (`z-50`)

### 2. 메뉴가 화면 밖으로 나감
- 화면 높이가 충분한지 확인
- 필요시 메뉴를 아래로 펼치도록 변경:
```jsx
// 위로 펼침 (현재)
<div className="absolute bottom-20 right-0">

// 아래로 펼침
<div className="absolute top-20 right-0">
```

### 3. 애니메이션이 작동하지 않음
- `tailwind.config.js`에 애니메이션이 추가되었는지 확인
- 개발 서버 재시작

### 4. 클릭이 안 됨
- 오버레이의 z-index 확인
- 버튼의 z-index가 오버레이보다 높은지 확인

---

## 브라우저 호환성

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 완료! 🎉

플로팅 챗봇 버튼이 구현되었습니다!

PC 화면에서 http://localhost:5173/ 접속 후 우측 하단의 파란색 버튼을 확인해보세요!
