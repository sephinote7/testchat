# 상담사 찾기 필터 기능 DB 연동 가이드

## 개요

이 문서는 상담사 찾기 페이지의 필터 기능 DB 연동을 위한 가이드입니다.

**파일**:

- `src/pages/common/home/Home.jsx` (상담 버튼 3개)
- `src/pages/user/chat/CounselorList.jsx` (상담사 목록 + 필터)

---

## 주요 기능

### 1. 메인 화면 상담 버튼 (3개)

- **고민 상담** → AI 상담 페이지로 이동
- **커리어 상담** → 상담사 찾기 (커리어 필터 적용)
- **취업 상담** → 상담사 찾기 (취업 필터 적용)

### 2. 상담사 찾기 페이지 필터

- **상담 유형**: 취업, 커리어, 심리
- **상담 방식**: 채팅, 전화, 방문
- **상담 가격**:
  - 10,000 ~ 20,000원
  - 20,000 ~ 30,000원
  - 30,000 ~ 40,000원
  - 40,000 ~ 50,000원
  - 50,000원 이상

### 3. 상담사 카드 정보

- 프로필 이미지
- 이름, 직함
- 평점 (별점 5점)
- 리뷰 수
- 태그 (전문 분야)
- 소개 (한 줄)
- 가격 정보 (채팅/전화/방문)

---

## API 엔드포인트

### 1. 상담사 목록 조회 (필터 적용)

```
GET /api/counselors
```

**요청 파라미터**:

```javascript
{
  filters: {
    category: string[],      // ['job', 'career', 'psychology']
    method: string[],        // ['chat', 'call', 'visit']
    priceRange: string[]     // ['10000-20000', '20000-30000', ...]
  },
  page: number,              // 페이지 번호 (1부터 시작)
  pageSize: number           // 페이지당 항목 수 (기본 7)
}
```

**요청 예시**:

```javascript
// URL 파라미터로 전송
GET /api/counselors?filters=%7B%22category%22%3A%5B%22job%22%2C%22career%22%5D%2C%22method%22%3A%5B%22chat%22%5D%2C%22priceRange%22%3A%5B%2220000-30000%22%5D%7D&page=1&pageSize=7

// 또는 POST 요청으로 body에 포함
POST /api/counselors/search
{
  "filters": {
    "category": ["job", "career"],
    "method": ["chat"],
    "priceRange": ["20000-30000"]
  },
  "page": 1,
  "pageSize": 7
}
```

**응답**:

```json
{
  "counselors": [
    {
      "id": "c001",
      "name": "김민준",
      "title": "상담사",
      "profileImage": "https://example.com/profiles/c001.jpg",
      "summary": "취업 상담 3년 경력의 전문 상담사입니다.",
      "tags": ["취업", "커리어", "이력서"],
      "reviewCount": 156,
      "rating": 4.8,
      "prices": {
        "chat": 22000,
        "call": 33000,
        "visit": 35000
      },
      "available": true,
      "sessions": 324,
      "specialties": ["이력서 첨삭", "면접 코칭", "커리어 상담"]
    }
  ],
  "totalCount": 42,
  "totalPages": 6,
  "currentPage": 1,
  "filters": {
    "category": ["job", "career"],
    "method": ["chat"],
    "priceRange": ["20000-30000"]
  }
}
```

### 2. 상담사 상세 정보

```
GET /api/counselors/:id
```

**응답**:

```json
{
  "id": "c001",
  "name": "김민준",
  "title": "상담사",
  "profileImage": "https://example.com/profiles/c001.jpg",
  "bio": "취업 상담 전문가로 3년간 300명 이상의 구직자를 도왔습니다...",
  "summary": "취업 상담 3년 경력의 전문 상담사입니다.",
  "tags": ["취업", "커리어", "이력서"],
  "reviewCount": 156,
  "rating": 4.8,
  "prices": {
    "chat": 22000,
    "call": 33000,
    "visit": 35000
  },
  "available": true,
  "sessions": 324,
  "specialties": ["이력서 첨삭", "면접 코칭", "커리어 상담", "자소서 작성"],
  "education": [
    {
      "degree": "석사",
      "major": "상담심리학",
      "school": "서울대학교"
    }
  ],
  "certifications": ["전문상담사 1급", "직업상담사 2급"],
  "experience": [
    {
      "title": "취업 상담사",
      "organization": "서울시 청년센터",
      "period": "2021.03 ~ 현재"
    }
  ],
  "reviews": [
    {
      "id": "r001",
      "userId": "u123",
      "userName": "김**",
      "rating": 5,
      "content": "정말 도움이 많이 되었습니다. 감사합니다!",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "schedule": {
    "availableDays": ["월", "화", "수", "목", "금"],
    "availableHours": "09:00 - 18:00",
    "timezone": "Asia/Seoul"
  }
}
```

---

## 필터링 로직

### 서버 측 필터링 (권장)

성능을 위해 서버에서 필터링 처리를 권장합니다.

```sql
-- 예시 SQL (PostgreSQL)
SELECT * FROM counselors
WHERE
  -- 상담 유형 필터
  (ARRAY_LENGTH($1::text[], 1) IS NULL OR
   EXISTS (
     SELECT 1 FROM UNNEST(specialties) AS spec
     WHERE spec = ANY($1::text[])
   ))
  AND
  -- 상담 방식 필터
  (ARRAY_LENGTH($2::text[], 1) IS NULL OR
   (('chat' = ANY($2::text[]) AND price_chat > 0) OR
    ('call' = ANY($2::text[]) AND price_call > 0) OR
    ('visit' = ANY($2::text[]) AND price_visit > 0)))
  AND
  -- 가격 범위 필터
  (ARRAY_LENGTH($3::text[], 1) IS NULL OR
   (LEAST(price_chat, price_call, price_visit) >= $min_price AND
    LEAST(price_chat, price_call, price_visit) <= $max_price))
ORDER BY rating DESC, sessions DESC
LIMIT $pageSize OFFSET ($page - 1) * $pageSize;
```

### 클라이언트 측 필터링 (현재 구현)

```javascript
const filteredCounselors = useMemo(() => {
  let result = counselors;

  // 카테고리 필터
  if (selectedCategories.length > 0) {
    result = result.filter((item) => {
      const tags = selectedCategories.map((cat) => categoryToTag[cat]);
      return tags.some((tag) => item.tags?.includes(tag));
    });
  }

  // 상담 방식 필터
  if (selectedMethods.length > 0) {
    result = result.filter((item) => {
      return selectedMethods.every((method) => {
        if (method === 'chat') return item.prices.chat > 0;
        if (method === 'call') return item.prices.call > 0;
        if (method === 'visit') return item.prices.visit > 0;
        return false;
      });
    });
  }

  // 가격 범위 필터
  if (selectedPriceRanges.length > 0) {
    result = result.filter((item) => {
      const minPrice = Math.min(item.prices.chat, item.prices.call, item.prices.visit);
      return selectedPriceRanges.some((range) => {
        const [min, max] = range.split('-').map(Number);
        if (max) {
          return minPrice >= min && minPrice <= max;
        } else {
          return minPrice >= min;
        }
      });
    });
  }

  return result;
}, [selectedCategories, selectedMethods, selectedPriceRanges]);
```

---

## URL 파라미터 처리

### Home에서 상담사 찾기로 이동 시

```javascript
// 커리어 상담 버튼
<Link to="/chat/counselor?category=career">

// 취업 상담 버튼
<Link to="/chat/counselor?category=job">
```

### CounselorList에서 URL 파라미터 읽기

```javascript
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();

useEffect(() => {
  const categoryParam = searchParams.get('category');
  if (categoryParam) {
    setSelectedCategories([categoryParam]);
  }
}, [searchParams]);
```

---

## 실시간 예약 가능 여부

### WebSocket 연동

```javascript
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/counselors/availability');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // { counselorId: 'c001', available: false }

    setCounselors((prev) => prev.map((c) => (c.id === data.counselorId ? { ...c, available: data.available } : c)));
  };

  return () => ws.close();
}, []);
```

### 폴링 (Polling)

```javascript
useEffect(() => {
  const fetchAvailability = async () => {
    const response = await fetch('/api/counselors/availability');
    const data = await response.json();
    // { counselors: [{ id: 'c001', available: true }, ...] }

    setCounselors((prev) =>
      prev.map((c) => {
        const updated = data.counselors.find((u) => u.id === c.id);
        return updated ? { ...c, available: updated.available } : c;
      })
    );
  };

  // 30초마다 업데이트
  const interval = setInterval(fetchAvailability, 30000);

  return () => clearInterval(interval);
}, []);
```

---

## 상담 예약 플로우

### 1. 상담사 선택

사용자가 상담사 카드를 클릭하면 상세 페이지로 이동

### 2. 상담 방식 선택

채팅 / 전화 / 방문 중 선택

### 3. 일정 선택

상담사의 가능한 시간대 표시 및 선택

### 4. 결제

선택한 상담 방식의 가격으로 결제 진행

### 5. 예약 완료

예약 정보를 DB에 저장하고 사용자에게 확인 알림

**API 예시**:

```javascript
POST /api/reservations
{
  "counselorId": "c001",
  "method": "chat",
  "scheduledAt": "2026-02-10T14:00:00Z",
  "duration": 60,
  "price": 22000,
  "paymentMethod": "card",
  "message": "취업 준비 관련 상담 부탁드립니다."
}

// 응답
{
  "reservationId": "r001",
  "counselorId": "c001",
  "counselorName": "김민준",
  "method": "chat",
  "scheduledAt": "2026-02-10T14:00:00Z",
  "status": "confirmed",
  "paymentStatus": "completed",
  "chatRoomId": "room_001"  // 채팅 상담인 경우
}
```

---

## 구현 체크리스트

### Phase 1: 기본 UI

- [x] 메인 화면 상담 버튼 3개 추가
- [x] 상담사 찾기 페이지 필터 UI 구현
- [x] 상담사 카드 레이아웃 구현
- [x] 페이지네이션 구현

### Phase 2: 필터 기능

- [x] 상담 유형 필터
- [x] 상담 방식 필터
- [x] 가격 범위 필터
- [x] URL 파라미터 처리

### Phase 3: DB 연동

- [ ] 상담사 목록 API 연동
- [ ] 필터 파라미터 전송
- [ ] 페이지네이션 API 연동
- [ ] 로딩 상태 표시

### Phase 4: 추가 기능

- [ ] 실시간 예약 가능 여부
- [ ] 상담사 상세 정보
- [ ] 예약 기능
- [ ] 검색 기능 (상담사 이름)
- [ ] 정렬 기능 (평점순, 리뷰순, 가격순)

---

## 데이터베이스 스키마 예시

### counselors 테이블

```sql
CREATE TABLE counselors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(100),
  profile_image VARCHAR(255),
  bio TEXT,
  summary VARCHAR(500),
  tags TEXT[],
  review_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  price_chat INTEGER,
  price_call INTEGER,
  price_visit INTEGER,
  available BOOLEAN DEFAULT true,
  sessions INTEGER DEFAULT 0,
  specialties TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_counselors_tags ON counselors USING GIN(tags);
CREATE INDEX idx_counselors_rating ON counselors(rating DESC);
CREATE INDEX idx_counselors_sessions ON counselors(sessions DESC);
```

### reservations 테이블

```sql
CREATE TABLE reservations (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  counselor_id VARCHAR(50) REFERENCES counselors(id),
  method VARCHAR(20) CHECK (method IN ('chat', 'call', 'visit')),
  scheduled_at TIMESTAMP NOT NULL,
  duration INTEGER DEFAULT 60,
  price INTEGER NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  chat_room_id VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_counselor ON reservations(counselor_id);
CREATE INDEX idx_reservations_scheduled ON reservations(scheduled_at);
```

---

## 주의사항

### 성능 최적화

- 필터 조합이 많을 경우 인덱스 최적화 필수
- 페이지네이션으로 데이터 분할
- 무한 스크롤 고려

### UX

- 필터 적용 시 즉시 결과 반영
- 로딩 상태 명확하게 표시
- 빈 결과에 대한 안내 메시지

### 보안

- 가격 정보는 서버에서 관리
- 예약 시 결제 검증 필수
- 사용자 인증 확인

---

## 참고 자료

- React Query: 서버 상태 관리
- Zustand: 클라이언트 상태 관리
- React Hook Form: 필터 폼 관리
- Date-fns: 날짜/시간 처리
