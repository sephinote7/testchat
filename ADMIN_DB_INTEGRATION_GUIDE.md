# 관리자 페이지 DB 연동 가이드

## 개요

이 문서는 관리자 페이지(대시보드, 마이페이지, 통계자료, 알림)의 DB 연동을 위한 가이드입니다.

**관련 파일**:

- `src/pages/admin/DashBoard.jsx` (대시보드)
- `src/pages/admin/Admin.jsx` (SYSTEM 마이페이지)
- `src/pages/admin/Statistics.jsx` (통계자료)
- `src/pages/admin/Alarm.jsx` (알림)

---

## 1. 대시보드 (DashBoard.jsx)

### 기능

- 상담 유형별 통계 (고민/커리어/취업)
- 이번 주 상담 건수
- 평균 상담 시간
- 주요 키워드
- 위험 단어 감지 건수

### API 엔드포인트

#### 상담 통계 조회

```
GET /api/admin/dashboard/stats
```

**요청 파라미터**:

```javascript
{
  startDate: "2026-01-19",  // YYYY-MM-DD
  endDate: "2026-01-25"
}
```

**응답**:

```json
{
  "concern": {
    "count": 42,
    "avgTime": 35.5,
    "keywords": ["불안", "스트레스", "고민"],
    "riskCount": 3
  },
  "career": {
    "count": 28,
    "avgTime": 42.3,
    "keywords": ["이직", "진로"]
  },
  "job": {
    "count": 35,
    "avgTime": 38.7,
    "keywords": ["이력서", "면접"]
  },
  "period": {
    "start": "2026-01-19",
    "end": "2026-01-25"
  }
}
```

**구현 예시**:

```javascript
const fetchDashboardStats = async (startDate, endDate) => {
  try {
    const response = await fetch(`/api/admin/dashboard/stats?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('통계 조회 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    return null;
  }
};

// 사용
useEffect(() => {
  const [start, end] = dateRange.split(' ~ ');
  fetchDashboardStats(start, end).then((data) => {
    if (data) {
      setCounselStats(data);
    }
  });
}, [dateRange]);
```

---

## 2. SYSTEM 마이페이지 (Admin.jsx)

### 기능

- 상담사 프로필 표시
- 상담사 정보 수정 링크
- 최근 활동 내역 링크

### API 엔드포인트

#### 상담사 프로필 조회

```
GET /api/counselors/profile
```

**응답**:

```json
{
  "id": "c001",
  "name": "홍길동",
  "email": "hong@example.com",
  "profileImage": "https://example.com/profiles/c001.jpg",
  "title": "전문 상담사",
  "specialties": ["심리", "취업", "커리어"],
  "bio": "심리 상담과 커리어 코칭을 함께 진행합니다...",
  "totalSessions": 324,
  "rating": 4.9,
  "reviewCount": 155,
  "joinedAt": "2024-01-15"
}
```

#### 상담사 정보 수정

```
PUT /api/counselors/profile
```

**요청**:

```json
{
  "profileImage": "base64_string_or_url",
  "bio": "수정된 소개 내용",
  "specialties": ["심리", "취업"],
  "experience": ["심리상담 8년", "기업 멘토링 5년"]
}
```

**응답**:

```json
{
  "success": true,
  "profile": {
    /* 업데이트된 프로필 */
  }
}
```

#### 최근 활동 내역 조회

```
GET /api/counselors/activities
```

**요청 파라미터**:

```javascript
{
  page: 1,
  pageSize: 10,
  type: "all" | "session" | "review" | "schedule"
}
```

**응답**:

```json
{
  "activities": [
    {
      "id": "act001",
      "type": "session",
      "description": "김철수 님과 취업 상담 완료",
      "timestamp": "2026-02-10T14:30:00Z",
      "relatedUser": "u123",
      "relatedSession": "s456"
    },
    {
      "id": "act002",
      "type": "review",
      "description": "새로운 리뷰를 받았습니다 (⭐⭐⭐⭐⭐)",
      "timestamp": "2026-02-09T16:20:00Z",
      "relatedUser": "u124"
    }
  ],
  "totalCount": 48,
  "totalPages": 5
}
```

---

## 3. 통계자료 (Statistics.jsx)

### 기능

- 키워드별 파이 차트
- 키워드 비율 표시
- 기간별 필터링

### API 엔드포인트

#### 키워드 통계 조회

```
GET /api/admin/statistics/keywords
```

**요청 파라미터**:

```javascript
{
  startDate: "2026-01-19",
  endDate: "2026-01-25"
}
```

**응답**:

```json
{
  "keywords": [
    {
      "label": "고민",
      "count": 125,
      "percentage": 25.0,
      "color": "#5DD8D0"
    },
    {
      "label": "커리어",
      "count": 100,
      "percentage": 20.0,
      "color": "#5FC4E7"
    },
    {
      "label": "불안",
      "count": 90,
      "percentage": 18.0,
      "color": "#6B9EFF"
    },
    {
      "label": "자존감문제",
      "count": 75,
      "percentage": 15.0,
      "color": "#9B7EFF"
    },
    {
      "label": "스트레스",
      "count": 60,
      "percentage": 12.0,
      "color": "#C77EFF"
    },
    {
      "label": "자기계발",
      "count": 50,
      "percentage": 10.0,
      "color": "#82E8E8"
    }
  ],
  "totalCount": 500,
  "period": {
    "start": "2026-01-19",
    "end": "2026-01-25"
  }
}
```

**차트 라이브러리 추천**:

- Chart.js
- Recharts
- Victory
- D3.js

**Chart.js 예시**:

```javascript
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartComponent = ({ data }) => {
  const chartData = {
    labels: data.keywords.map((k) => k.label),
    datasets: [
      {
        data: data.keywords.map((k) => k.percentage),
        backgroundColor: data.keywords.map((k) => k.color),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};
```

---

## 4. 알림 (Alarm.jsx)

### 기능

- 공지사항 목록
- 위험 단어 감지 알림
- 알림 상태 관리 (미확인/확인/조치완료)

### API 엔드포인트

#### 공지사항 조회

```
GET /api/admin/notices
```

**요청 파라미터**:

```javascript
{
  page: 1,
  pageSize: 5
}
```

**응답**:

```json
{
  "notices": [
    {
      "id": "n001",
      "title": "중독, 끊는다고 끝나지 않는다? 반복 중독 막기",
      "content": "중독 예방 가이드...",
      "createdAt": "2026-02-10T10:00:00Z",
      "isRead": false,
      "priority": "high"
    }
  ],
  "totalCount": 25,
  "totalPages": 5,
  "unreadCount": 8
}
```

#### 위험 단어 감지 알림 조회

```
GET /api/admin/risk-alerts
```

**요청 파라미터**:

```javascript
{
  page: 1,
  pageSize: 10,
  status: "all" | "pending" | "resolved",
  riskLevel: "all" | "high" | "medium" | "low"
}
```

**응답**:

```json
{
  "alerts": [
    {
      "id": "alert001",
      "sessionId": "s123",
      "type": "concern",
      "counselorId": "c001",
      "counselorName": "홍길동",
      "userId": "u456",
      "userName": "김철수",
      "keyword": "자살",
      "riskLevel": "high",
      "status": "resolved",
      "context": "대화 전체 내용 또는 일부...",
      "detectedAt": "2026-01-20T15:30:00Z",
      "resolvedAt": "2026-01-20T17:10:00Z",
      "resolvedBy": "admin001",
      "resolveAction": "상담사에게 긴급 대응 가이드 전달, 사용자 보호자 연락",
      "note": "즉시 조치 완료, 추가 모니터링 진행 중"
    }
  ],
  "totalCount": 42,
  "totalPages": 5,
  "pendingCount": 3,
  "highRiskCount": 1
}
```

#### 위험 단어 감지 처리

```
PUT /api/admin/risk-alerts/:id/resolve
```

**요청**:

```json
{
  "action": "상담사에게 가이드 전달 및 보호자 연락",
  "note": "추가 모니터링 필요",
  "status": "resolved"
}
```

**응답**:

```json
{
  "success": true,
  "alert": {
    /* 업데이트된 알림 정보 */
  }
}
```

### 실시간 알림 (WebSocket)

**연결**:

```javascript
const ws = new WebSocket('wss://api.example.com/admin/alerts');

ws.onopen = () => {
  console.log('알림 WebSocket 연결됨');
  // 인증 토큰 전송
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
    case 'risk_alert':
      // 새로운 위험 단어 감지
      showNotification('위험 단어 감지', {
        body: `${message.keyword} 단어가 감지되었습니다.`,
        icon: '/icon-warning.png',
        tag: message.alertId,
      });
      updateAlertList(message.alert);
      break;

    case 'notice':
      // 새로운 공지사항
      showNotification('새 공지사항', {
        body: message.title,
        icon: '/icon-notice.png',
      });
      break;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket 오류:', error);
};

ws.onclose = () => {
  console.log('WebSocket 연결 종료');
  // 재연결 로직
  setTimeout(() => connectWebSocket(), 5000);
};
```

**브라우저 알림**:

```javascript
const showNotification = (title, options) => {
  // 알림 권한 요청
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // 알림 표시
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, options);

    notification.onclick = () => {
      window.focus();
      // 해당 알림 상세 페이지로 이동
      if (options.tag) {
        navigateToAlert(options.tag);
      }
    };
  }
};
```

---

## 위험 단어 관리 시스템

### 위험 단어 리스트

```javascript
const RISK_KEYWORDS = {
  high: ['자살', '죽음', '자해'],
  medium: ['우울', '불안', '공황'],
  low: ['힘들다', '외롭다', '지친다'],
};

const RISK_LEVELS = {
  high: {
    label: '높음',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    priority: 1,
    action: '즉시 대응 필요',
  },
  medium: {
    label: '주의',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    priority: 2,
    action: '모니터링 강화',
  },
  low: {
    label: '관찰',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    priority: 3,
    action: '일반 관찰',
  },
};
```

### 위험도 판단 로직

```javascript
const calculateRiskLevel = (keywords, context) => {
  // 감지된 키워드 확인
  const detectedKeywords = keywords.filter((k) => context.toLowerCase().includes(k.toLowerCase()));

  // 위험도 계산
  if (detectedKeywords.some((k) => RISK_KEYWORDS.high.includes(k))) {
    return { level: 'high', keywords: detectedKeywords };
  } else if (detectedKeywords.some((k) => RISK_KEYWORDS.medium.includes(k))) {
    return { level: 'medium', keywords: detectedKeywords };
  } else if (detectedKeywords.some((k) => RISK_KEYWORDS.low.includes(k))) {
    return { level: 'low', keywords: detectedKeywords };
  }

  return { level: 'none', keywords: [] };
};
```

---

## 데이터베이스 스키마

### dashboard_stats 테이블 (캐싱용)

```sql
CREATE TABLE dashboard_stats (
  id SERIAL PRIMARY KEY,
  stat_type VARCHAR(20) CHECK (stat_type IN ('concern', 'career', 'job')),
  date DATE NOT NULL,
  count INTEGER DEFAULT 0,
  avg_time DECIMAL(5,2),
  keywords JSONB,
  risk_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(stat_type, date)
);

CREATE INDEX idx_dashboard_stats_date ON dashboard_stats(date);
CREATE INDEX idx_dashboard_stats_type ON dashboard_stats(stat_type);
```

### keyword_stats 테이블

```sql
CREATE TABLE keyword_stats (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(100) NOT NULL,
  count INTEGER DEFAULT 1,
  percentage DECIMAL(5,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_keyword_stats_dates ON keyword_stats(start_date, end_date);
CREATE INDEX idx_keyword_stats_keyword ON keyword_stats(keyword);
```

### risk_alerts 테이블

```sql
CREATE TABLE risk_alerts (
  id VARCHAR(50) PRIMARY KEY,
  session_id VARCHAR(50) REFERENCES sessions(id),
  counselor_id VARCHAR(50) REFERENCES counselors(id),
  user_id VARCHAR(50) REFERENCES users(id),
  keyword VARCHAR(100) NOT NULL,
  risk_level VARCHAR(20) CHECK (risk_level IN ('high', 'medium', 'low')),
  status VARCHAR(20) CHECK (status IN ('pending', 'resolved')) DEFAULT 'pending',
  context TEXT,
  detected_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(50) REFERENCES users(id),
  resolve_action TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_risk_alerts_status ON risk_alerts(status);
CREATE INDEX idx_risk_alerts_level ON risk_alerts(risk_level);
CREATE INDEX idx_risk_alerts_detected ON risk_alerts(detected_at DESC);
```

### admin_notices 테이블

```sql
CREATE TABLE admin_notices (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  created_by VARCHAR(50) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_notices_created ON admin_notices(created_at DESC);
CREATE INDEX idx_admin_notices_priority ON admin_notices(priority);
```

### notice_reads 테이블 (읽음 표시)

```sql
CREATE TABLE notice_reads (
  notice_id VARCHAR(50) REFERENCES admin_notices(id),
  user_id VARCHAR(50) REFERENCES users(id),
  read_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (notice_id, user_id)
);
```

---

## 구현 체크리스트

### Phase 1: 대시보드

- [x] 대시보드 UI (모바일/PC)
- [x] 날짜 범위 선택
- [ ] 통계 API 연동
- [ ] 실시간 업데이트 (WebSocket)
- [ ] 데이터 캐싱

### Phase 2: SYSTEM 마이페이지

- [x] 마이페이지 UI (모바일/PC)
- [ ] 프로필 조회 API
- [ ] 프로필 수정 API
- [ ] 활동 내역 조회 API
- [ ] 이미지 업로드

### Phase 3: 통계자료

- [x] 통계 UI (모바일/PC)
- [x] 파이 차트 SVG
- [ ] 키워드 통계 API 연동
- [ ] 차트 라이브러리 연동
- [ ] 데이터 내보내기 (CSV/PDF)

### Phase 4: 알림

- [x] 알림 UI (모바일/PC)
- [x] 공지사항 목록
- [x] 위험 단어 감지 알림
- [ ] 공지사항 API 연동
- [ ] 위험 단어 API 연동
- [ ] 실시간 알림 (WebSocket)
- [ ] 브라우저 알림 (Notification API)

### Phase 5: 추가 기능

- [ ] 대시보드 커스터마이징
- [ ] 통계 리포트 생성
- [ ] 알림 필터링
- [ ] 위험 단어 자동 대응 시스템

---

## 보안 고려사항

### 1. 인증 및 권한

- 관리자만 접근 가능
- JWT 토큰 검증
- Role-Based Access Control (RBAC)

### 2. 민감 정보 보호

- 사용자 개인정보 마스킹
- 대화 내용 암호화 저장
- 접근 로그 기록

### 3. API 보안

- Rate Limiting
- CORS 설정
- SQL Injection 방지

---

## 참고 자료

- Chart.js: https://www.chartjs.org/
- Recharts: https://recharts.org/
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- Notification API: https://developer.mozilla.org/en-US/docs/Web/API/Notification
- React Query: https://tanstack.com/query/latest
