# 상담사 상담 내역 DB 연동 가이드

## 개요

이 문서는 상담사 상담 내역 관련 페이지의 DB 연동을 위한 가이드입니다.

**관련 파일**:

- `src/pages/system/info/MyCounsel.jsx` (활동 내역 요약)
- `src/pages/system/info/MyCounselHistory.jsx` (상담 내역 관리)
- `src/pages/system/info/MyCounselDetail.jsx` (상담 예약 상세)

---

## 1. 활동 내역 요약 (MyCounsel.jsx)

### 기능

- 기간 내 상담 건수 통계
- 활동 타임라인 차트
- 최근 상담 내역 (완료된 상담 3개)
- 상담 예약 관리 (예정/수락된 상담 3개)

### API 엔드포인트

#### 상담 통계 조회

```
GET /api/counselors/me/stats
```

**요청 파라미터**:

```javascript
{
  period: '전체' | '이번 주' | '완료' | '3개월';
}
```

**응답**:

```json
{
  "riskCount": 2, // 위험군 상담 건수
  "completedCount": 45, // 완료 상담 건수
  "reservedCount": 8, // 예약 상담 건수
  "totalCount": 55, // 전체 상담 건수
  "period": "전체"
}
```

**구현 예시**:

```javascript
const fetchCounselStats = async (period) => {
  try {
    const response = await fetch(`/api/counselors/me/stats?period=${encodeURIComponent(period)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('통계 조회 실패');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('통계 조회 오류:', error);
    return {
      riskCount: 0,
      completedCount: 0,
      reservedCount: 0,
      totalCount: 0,
    };
  }
};
```

#### 활동 타임라인 조회

```
GET /api/counselors/me/timeline
```

**요청 파라미터**:

```javascript
{
  period: '전체' | '이번 주' | '완료' | '3개월';
}
```

**응답**:

```json
{
  "timeline": [
    {
      "day": "월",
      "reserved": 5,
      "completed": 3
    },
    {
      "day": "화",
      "reserved": 7,
      "completed": 4
    }
    // ... 나머지 요일
  ],
  "maxValue": 10
}
```

#### 상담 내역 조회 (요약용)

```
GET /api/counselors/me/counsels
```

**요청 파라미터**:

```javascript
{
  limit: 3,
  status: 'completed' | 'scheduled,accepted'
}
```

**응답**:

```json
{
  "counsels": [
    {
      "id": "c001",
      "title": "상담제목 : 너무많은일이있었어나무힘들...",
      "clientId": "u123",
      "clientName": "고길동",
      "reservationDate": "2026-01-16T18:00:00Z",
      "status": "completed",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "totalCount": 45
}
```

---

## 2. 상담 내역 관리 (MyCounselHistory.jsx)

### 기능

- 탭별 상담 내역 필터링 (상담 예정 / 진행중 / 상담 완료)
- 페이지네이션
- 상담 상세 보기

### API 엔드포인트

#### 상담 내역 조회 (전체)

```
GET /api/counselors/me/counsels
```

**요청 파라미터**:

```javascript
{
  status: 'scheduled' | 'inProgress' | 'completed' | 'all',
  page: 1,
  pageSize: 10
}
```

**응답**:

```json
{
  "counsels": [
    {
      "id": "c001",
      "title": "상담제목 : 너무많은일이있었어나무힘들...",
      "clientId": "u123",
      "clientName": "고길동",
      "clientProfileImage": "https://example.com/profiles/u123.jpg",
      "reservationDate": "2026-01-16T18:00:00Z",
      "status": "scheduled",
      "priority": "normal",
      "tags": ["진로", "커리어"],
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalCount": 25,
    "totalPages": 3
  },
  "statusCounts": {
    "scheduled": 5,
    "inProgress": 3,
    "completed": 17
  }
}
```

**상태 정의**:

- `scheduled`: 상담 예정 (수락되었지만 아직 시작하지 않은 상담)
- `inProgress`: 상담 진행 중 (현재 진행 중인 상담)
- `completed`: 상담 완료 (종료된 상담)

**구현 예시**:

```javascript
const fetchCounsels = async (status, page, pageSize) => {
  try {
    const response = await fetch(`/api/counselors/me/counsels?status=${status}&page=${page}&pageSize=${pageSize}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('상담 내역 조회 실패');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('상담 내역 조회 오류:', error);
    throw error;
  }
};

// 사용
useEffect(() => {
  const loadCounsels = async () => {
    setLoading(true);
    try {
      const data = await fetchCounsels(activeTab, currentPage, itemsPerPage);
      setCounsels(data.counsels);
      setTotalPages(data.pagination.totalPages);
      setStatusCounts(data.statusCounts);
    } catch (error) {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  loadCounsels();
}, [activeTab, currentPage]);
```

---

## 3. 상담 예약 상세 (MyCounselDetail.jsx)

### 기능

- 상담 예약 상세 정보 조회
- 상담 수락/거절
- 상담 시작 (채팅방 입장)

### API 엔드포인트

#### 상담 상세 조회

```
GET /api/counselors/me/counsels/:id
```

**응답**:

```json
{
  "id": "c001",
  "title": "제목 : 너무많은일이있었어힘들다...",
  "content": "상담 요청 내용...",
  "detailedContent": "상세 내용...",
  "clientId": "u123",
  "clientName": "임살미",
  "clientProfileImage": "https://example.com/profiles/u123.jpg",
  "clientMbti": "INTP",
  "clientGender": "남성",
  "clientAge": 32,
  "clientPersona": "상담자 페르소나 정보...",
  "reservationDate": "2026-01-14T16:00:00Z",
  "status": "scheduled",
  "priority": "normal",
  "tags": ["진로", "커리어"],
  "chatRoomId": "chat001",
  "createdAt": "2026-01-10T10:00:00Z",
  "updatedAt": "2026-01-10T10:00:00Z"
}
```

**구현 예시**:

```javascript
const fetchCounselDetail = async (counselId) => {
  try {
    const response = await fetch(`/api/counselors/me/counsels/${counselId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('상담을 찾을 수 없습니다.');
      }
      throw new Error('상담 조회 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('상담 조회 오류:', error);
    throw error;
  }
};

// 사용
useEffect(() => {
  const loadCounselDetail = async () => {
    try {
      const data = await fetchCounselDetail(id);
      setCounselData(data);
    } catch (error) {
      alert(error.message);
      navigate(-1);
    }
  };

  loadCounselDetail();
}, [id]);
```

#### 상담 수락

```
PUT /api/counselors/me/counsels/:id/accept
```

**응답**:

```json
{
  "success": true,
  "message": "상담이 수락되었습니다.",
  "counsel": {
    "id": "c001",
    "status": "scheduled",
    "acceptedAt": "2026-01-15T10:00:00Z"
  }
}
```

**구현 예시**:

```javascript
const acceptCounsel = async (counselId) => {
  try {
    const response = await fetch(`/api/counselors/me/counsels/${counselId}/accept`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('상담 수락 실패');

    const data = await response.json();

    // 알림 발송 (클라이언트에게)
    await sendNotification(counselData.clientId, {
      type: 'counsel_accepted',
      counselId: counselId,
      message: '상담이 수락되었습니다.',
    });

    return data;
  } catch (error) {
    console.error('상담 수락 오류:', error);
    throw error;
  }
};
```

#### 상담 거절

```
PUT /api/counselors/me/counsels/:id/reject
```

**요청**:

```json
{
  "reason": "일정이 맞지 않아서 거절합니다."
}
```

**응답**:

```json
{
  "success": true,
  "message": "상담이 거절되었습니다.",
  "counsel": {
    "id": "c001",
    "status": "rejected",
    "rejectedAt": "2026-01-15T10:00:00Z",
    "rejectReason": "일정이 맞지 않아서 거절합니다."
  }
}
```

#### 상담 시작 (채팅방 입장)

```
POST /api/counselors/me/counsels/:id/start
```

**응답**:

```json
{
  "success": true,
  "chatRoomId": "chat001",
  "counsel": {
    "id": "c001",
    "status": "inProgress",
    "startedAt": "2026-01-16T18:00:00Z"
  }
}
```

**구현 예시**:

```javascript
const startCounsel = async (counselId) => {
  try {
    const response = await fetch(`/api/counselors/me/counsels/${counselId}/start`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.message || '상담을 시작할 수 없습니다.');
      }
      throw new Error('상담 시작 실패');
    }

    const data = await response.json();

    // 채팅 페이지로 이동
    navigate(`/chat/counselor/${data.chatRoomId}`);

    return data;
  } catch (error) {
    console.error('상담 시작 오류:', error);
    alert(error.message);
  }
};
```

---

## 4. 데이터베이스 스키마

### counsels 테이블

```sql
CREATE TABLE counsels (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  detailed_content TEXT,
  counselor_id VARCHAR(50) REFERENCES counselors(id) ON DELETE CASCADE,
  client_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  reservation_date TIMESTAMP NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'scheduled', 'inProgress', 'completed', 'rejected', 'cancelled')) DEFAULT 'pending',
  priority VARCHAR(20) CHECK (priority IN ('high', 'normal', 'low')) DEFAULT 'normal',
  tags TEXT[],
  chat_room_id VARCHAR(50),
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  reject_reason TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_counsels_counselor ON counsels(counselor_id);
CREATE INDEX idx_counsels_client ON counsels(client_id);
CREATE INDEX idx_counsels_status ON counsels(status);
CREATE INDEX idx_counsels_reservation_date ON counsels(reservation_date);
CREATE INDEX idx_counsels_created_at ON counsels(created_at DESC);
```

### counsel_stats 테이블 (캐싱용)

```sql
CREATE TABLE counsel_stats (
  id SERIAL PRIMARY KEY,
  counselor_id VARCHAR(50) REFERENCES counselors(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL,
  risk_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  reserved_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(counselor_id, period)
);

CREATE INDEX idx_counsel_stats_counselor ON counsel_stats(counselor_id);
```

### counsel_timeline 테이블 (캐싱용)

```sql
CREATE TABLE counsel_timeline (
  id SERIAL PRIMARY KEY,
  counselor_id VARCHAR(50) REFERENCES counselors(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL,
  day_of_week VARCHAR(10) NOT NULL,
  reserved_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  date DATE NOT NULL,
  UNIQUE(counselor_id, period, date)
);

CREATE INDEX idx_counsel_timeline_counselor ON counsel_timeline(counselor_id);
CREATE INDEX idx_counsel_timeline_date ON counsel_timeline(date DESC);
```

---

## 5. 실시간 업데이트 (WebSocket)

### WebSocket 연결

```javascript
const ws = new WebSocket('wss://api.example.com/counselors/updates');

ws.onopen = () => {
  console.log('WebSocket 연결됨');
  ws.send(
    JSON.stringify({
      type: 'auth',
      token: authToken,
    })
  );
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'new_counsel_request':
      // 새로운 상담 요청
      showNotification('새 상담 요청', {
        body: `${message.clientName}님의 상담 요청이 도착했습니다.`,
        icon: '/icon-counsel.png',
      });
      refreshCounselList();
      break;

    case 'counsel_cancelled':
      // 상담 취소
      showNotification('상담 취소', {
        body: `${message.clientName}님이 상담을 취소했습니다.`,
        icon: '/icon-warning.png',
      });
      refreshCounselList();
      break;

    case 'stats_updated':
      // 통계 업데이트
      updateStats(message.stats);
      break;
  }
};
```

---

## 6. 구현 체크리스트

### Phase 1: 활동 내역 요약

- [x] UI 구현 (모바일/PC)
- [ ] 통계 API 연동
- [ ] 타임라인 API 연동
- [ ] 상담 내역 API 연동
- [ ] 실시간 업데이트

### Phase 2: 상담 내역 관리

- [x] UI 구현 (모바일/PC)
- [x] 탭 기능
- [x] 페이지네이션
- [ ] 상담 목록 API 연동
- [ ] 필터링 기능

### Phase 3: 상담 상세

- [x] UI 구현 (모바일/PC)
- [x] 상담 시작하기 버튼
- [ ] 상담 조회 API 연동
- [ ] 상담 수락/거절 API 연동
- [ ] 상담 시작 API 연동
- [ ] 채팅 연동

### Phase 4: 추가 기능

- [ ] 알림 기능
- [ ] 통계 차트 개선
- [ ] 엑셀 다운로드
- [ ] 상담 메모 기능

---

## 7. 에러 처리

### 에러 코드

```javascript
const COUNSEL_ERRORS = {
  NOT_FOUND: { code: 404, message: '상담을 찾을 수 없습니다.' },
  ALREADY_ACCEPTED: { code: 400, message: '이미 수락된 상담입니다.' },
  ALREADY_REJECTED: { code: 400, message: '이미 거절된 상담입니다.' },
  CANNOT_START: { code: 400, message: '상담을 시작할 수 없습니다.' },
  NOT_SCHEDULED: { code: 400, message: '예정된 상담이 아닙니다.' },
  UNAUTHORIZED: { code: 403, message: '권한이 없습니다.' },
};
```

---

## 참고 자료

- Chart.js: https://www.chartjs.org/
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- React Query: https://tanstack.com/query/latest
