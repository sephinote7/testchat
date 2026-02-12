# 챗봇 도우미 시스템 구현 완료

## 개요

PC 화면 전용 플로팅 챗봇 버튼과 챗봇 창을 구현했습니다. 사용자가 웹사이트의 주요 기능에 쉽게 접근할 수 있도록 도와주는 가이드 챗봇입니다.

---

## 주요 기능

### 1. **홈 화면**
- 고민순삭 도우미 인사 메시지
- 3가지 주요 카테고리 버튼:
  - **이력서/자소서 가이드**
  - **회원가입 관련**
  - **상담 관련**
- 하단 네비게이션 (홈/채팅/설정)

### 2. **채팅 화면**
- 카테고리 선택 시 봇 응답 표시
- 관련 페이지 링크 제공
- 링크 클릭 시 해당 페이지로 이동
- 대화 내역 표시

### 3. **설정 화면**
- 대화 내역 초기화
- 알림 on/off 토글
- AI 채팅 스타일 선택 (현실적인/공감하는)
- 설정 저장 및 취소

---

## 카테고리별 제공 링크

### 이력서/자소서 가이드
```javascript
- INFO 링크 → /info
- 이력서 가이드 → /info/document
- 면접 가이드 → /info/interview
```

### 회원가입 관련
```javascript
- 로그인 페이지 링크 → /member/signin
- 회원가입 → /member/signup
```

### 상담 관련
```javascript
- 상담사 페이지 링크 → /chat/counselor
- AI 상담 → /chat/ai
- 전화 상담 → /chat/counselor
```

---

## 사용 방법

### 1. 챗봇 열기
- PC 화면에서 우측 하단의 파란색 챗봇 버튼 클릭
- 챗봇 창이 열리면서 홈 화면 표시

### 2. 카테고리 선택
- "이력서/자소서 가이드" 버튼 클릭
- "회원가입 관련" 버튼 클릭
- "상담 관련" 버튼 클릭

### 3. 페이지 이동
- 봇 응답에서 표시되는 링크 클릭
- 해당 페이지로 자동 이동
- 챗봇 창 자동 닫힘

### 4. 설정 변경
- 하단 네비게이션에서 "설정" 아이콘 클릭
- 원하는 설정 변경
- "저장" 버튼 클릭

---

## 화면 구성

### 챗봇 창 크기
- **너비**: 420px
- **높이**: 600px
- **위치**: 화면 우측 하단 (플로팅 버튼 위쪽)

### 디자인 특징
- ✅ 둥근 모서리 (`rounded-3xl`)
- ✅ 그라데이션 배경
- ✅ 부드러운 애니메이션
- ✅ 하단 네비게이션 (홈/채팅/설정)
- ✅ 모바일에서는 숨김

---

## 커스터마이징

### 1. 카테고리 추가

`handleCategoryClick` 함수에 새로운 카테고리를 추가할 수 있습니다:

```javascript
case 'new-category':
  botResponse = '새로운 카테고리 안내...';
  links = [
    { label: '링크 1', path: '/path1' },
    { label: '링크 2', path: '/path2' }
  ];
  break;
```

홈 화면에 버튼 추가:

```jsx
<button
  onClick={() => handleCategoryClick('new-category')}
  className="w-full px-4 py-2.5 text-sm font-medium text-[#2f80ed] bg-white border-2 border-[#2f80ed] rounded-xl hover:bg-blue-50 transition-colors"
>
  새로운 카테고리
</button>
```

### 2. 링크 수정

각 카테고리의 링크를 수정하려면 `handleCategoryClick` 함수의 해당 `case`를 수정:

```javascript
case 'resume':
  botResponse = '이력서/자소서 가이드로 안내합니다...';
  links = [
    { label: 'INFO 링크', path: '/info' },
    { label: '이력서 가이드', path: '/info/document' },
    { label: '면접 가이드', path: '/info/interview' },
    { label: '새로운 링크', path: '/new-path' } // 추가
  ];
  break;
```

### 3. 봇 응답 메시지 변경

```javascript
case 'resume':
  botResponse = '원하는 메시지로 변경...';
  // ...
  break;
```

### 4. 챗봇 창 크기 변경

```jsx
// 현재: 420px × 600px
<div className="... w-[420px] h-[600px] ...">

// 크게: 500px × 700px
<div className="... w-[500px] h-[700px] ...">

// 작게: 350px × 500px
<div className="... w-[350px] h-[500px] ...">
```

### 5. 색상 변경

주요 색상을 변경하려면:

```jsx
// 파란색 (#2f80ed) → 다른 색상으로 변경
className="bg-[#2f80ed]"  // 원하는 색상으로 변경
className="text-[#2f80ed]"  // 텍스트 색상
className="border-[#2f80ed]"  // 테두리 색상
```

---

## 상태 관리

### State 변수

```javascript
const [isOpen, setIsOpen] = useState(false);  // 챗봇 창 열림/닫힘
const [currentView, setCurrentView] = useState('home');  // 현재 화면 (home/chat/settings)
const [chatHistory, setChatHistory] = useState([]);  // 대화 내역
const [notificationsEnabled, setNotificationsEnabled] = useState(true);  // 알림 on/off
const [aiStyle, setAiStyle] = useState('empathetic');  // AI 스타일
```

### 화면 전환

```javascript
setCurrentView('home');      // 홈 화면
setCurrentView('chat');      // 채팅 화면
setCurrentView('settings');  // 설정 화면
```

---

## 테스트 방법

### 1. 기본 동작 확인
- [ ] PC 화면에서 플로팅 버튼 표시됨
- [ ] 버튼 클릭 시 챗봇 창 열림
- [ ] X 버튼 클릭 시 챗봇 창 닫힘
- [ ] 외부 영역 클릭 시 챗봇 창 닫힘

### 2. 홈 화면 테스트
- [ ] "이력서/자소서 가이드" 버튼 클릭 → 채팅 화면으로 전환
- [ ] "회원가입 관련" 버튼 클릭 → 채팅 화면으로 전환
- [ ] "상담 관련" 버튼 클릭 → 채팅 화면으로 전환

### 3. 채팅 화면 테스트
- [ ] 봇 응답 메시지 표시됨
- [ ] 링크 버튼들 표시됨
- [ ] 링크 클릭 시 해당 페이지로 이동
- [ ] 페이지 이동 후 챗봇 창 닫힘

### 4. 설정 화면 테스트
- [ ] "대화 내역 초기화" 버튼 작동
- [ ] 알림 토글 스위치 작동
- [ ] AI 스타일 선택 버튼 작동
- [ ] "저장" 버튼 클릭 시 알림 표시
- [ ] "취소" 버튼 클릭 시 홈으로 이동

### 5. 네비게이션 테스트
- [ ] 홈 아이콘 클릭 → 홈 화면
- [ ] 채팅 아이콘 클릭 → 채팅 화면
- [ ] 설정 아이콘 클릭 → 설정 화면
- [ ] 현재 화면 아이콘 하이라이트 표시

### 6. 반응형 테스트
- [ ] PC 화면 (1024px 이상): 챗봇 표시
- [ ] 모바일 화면 (1024px 미만): 챗봇 숨김

---

## 향후 개선 사항

### 1. AI 연동
실제 AI 챗봇 API와 연동하여 자연스러운 대화 구현

```javascript
const sendMessageToAI = async (message) => {
  const response = await fetch('/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, style: aiStyle })
  });
  return await response.json();
};
```

### 2. 대화 내역 저장
LocalStorage 또는 DB에 대화 내역 저장

```javascript
useEffect(() => {
  const savedHistory = localStorage.getItem('chatHistory');
  if (savedHistory) {
    setChatHistory(JSON.parse(savedHistory));
  }
}, []);

useEffect(() => {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}, [chatHistory]);
```

### 3. 사용자 입력 기능
텍스트 입력 필드 추가하여 사용자가 직접 질문 가능

```jsx
<div className="flex items-center gap-2 p-3 border-t">
  <input
    type="text"
    value={userInput}
    onChange={(e) => setUserInput(e.target.value)}
    placeholder="질문을 입력하세요..."
    className="flex-1 px-3 py-2 border rounded-lg"
  />
  <button onClick={handleSend}>
    <svg>전송 아이콘</svg>
  </button>
</div>
```

### 4. 검색 기능
키워드로 도움말 검색

```javascript
const searchHelp = (keyword) => {
  const results = helpArticles.filter(article =>
    article.title.includes(keyword) || article.content.includes(keyword)
  );
  return results;
};
```

### 5. 다국어 지원
영어, 일본어 등 다국어 지원

```javascript
const messages = {
  ko: {
    greeting: '안녕하세요, 고민순삭 도우미입니다.',
    resume: '이력서/자소서 가이드',
    // ...
  },
  en: {
    greeting: 'Hello, I am Gominsoon assistant.',
    resume: 'Resume/Cover Letter Guide',
    // ...
  }
};
```

---

## 문제 해결

### 1. 챗봇 창이 표시되지 않음
- PC 화면 크기 확인 (1024px 이상)
- `hidden lg:block` 클래스 확인
- z-index 충돌 확인

### 2. 링크 클릭 시 페이지 이동 안 됨
- React Router 설정 확인
- 경로가 올바른지 확인
- `navigate` 함수 동작 확인

### 3. 애니메이션이 작동하지 않음
- Tailwind config에 애니메이션 설정 확인
- 개발 서버 재시작

### 4. 설정이 저장되지 않음
- State 업데이트 확인
- `handleSaveSettings` 함수 확인
- 추후 LocalStorage 또는 DB 연동 필요

---

## 브라우저 호환성

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 완료! 🎉

고민순삭 도우미 챗봇이 완성되었습니다!

### 구현된 기능
- [x] 플로팅 버튼
- [x] 홈 화면 (3가지 카테고리)
- [x] 채팅 화면 (봇 응답 및 링크)
- [x] 설정 화면 (대화 초기화, 알림, AI 스타일)
- [x] 하단 네비게이션
- [x] 페이지 이동 기능

PC 화면에서 http://localhost:5173/ 접속 후 우측 하단의 챗봇 버튼을 확인해보세요! 🚀
