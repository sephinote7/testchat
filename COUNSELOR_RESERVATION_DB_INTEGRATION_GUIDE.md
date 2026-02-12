# 상담사 프로필 & 예약 DB 연동 가이드

## 개요

이 문서는 상담사 프로필 페이지와 예약/결제 기능의 DB 연동을 위한 가이드입니다.

**파일**: `src/pages/user/chat/CounselorView.jsx`

---

## 주요 기능

### 1. 상담사 프로필 페이지

- 배너 이미지와 프로필 사진
- 상담사 정보 (이름, 직함, 태그, 평점)
- 소개, 경력, 상담 진행 방식
- 상담 요금 (채팅/전화/방문)
- 리뷰 목록

### 2. 상담 예약 시스템

- 상담 유형 선택 (채팅/전화/방문)
- 날짜 선택 (캘린더)
- 시간 선택 (타임슬롯)
- 제목 및 상담 내용 입력

### 3. 결제 시스템

- **포인트 차감 방식** (현재)
- 포인트 충전 시스템 (향후 구현 필요)
- PG사 연동 (카드/계좌이체 등, 향후)

### 4. 예약 완료 안내

- 예약 완료 모달
- 예약 상태 표시

---

## API 엔드포인트

### 1. 상담사 프로필 조회

```
GET /api/counselors/:id
```

**응답**:

```json
{
  "id": "c001",
  "name": "김민준",
  "title": "전문 상담사",
  "profileImage": "https://example.com/profiles/c001.jpg",
  "bannerImage": "https://example.com/banners/c001.jpg",
  "rating": 4.9,
  "reviewCount": 155,
  "tags": ["심리", "취업", "커리어"],
  "summary": "취업 준비와 커리어 고민을 현실적으로 풀어드립니다.",
  "intro": "심리 상담과 커리어 코칭을 함께 진행합니다...",
  "experience": ["심리상담 8년", "기업 멘토링 5년", "이직 컨설팅 120건 이상"],
  "process": ["상담 목표 확인 및 현재 상태 진단", "실행 가능한 계획 수립", "후속 피드백 제공"],
  "prices": {
    "chat": 11000,
    "call": 22000,
    "visit": 33000
  },
  "available": true
}
```

---

### 2. 예약 가능 시간 조회

```
GET /api/counselors/:id/available-slots?date={date}
```

**요청 파라미터**:

```javascript
{
  date: '2026-02-15'; // YYYY-MM-DD 형식
}
```

**응답**:

```json
{
  "date": "2026-02-15",
  "availableSlots": [
    {
      "time": "10:00",
      "available": true
    },
    {
      "time": "11:00",
      "available": false,
      "reason": "이미 예약됨"
    },
    {
      "time": "14:00",
      "available": true
    }
  ],
  "timezone": "Asia/Seoul"
}
```

**구현 예시**:

```javascript
const fetchAvailableSlots = async (counselorId, date) => {
  try {
    const response = await fetch(`/api/counselors/${counselorId}/available-slots?date=${date}`);
    const data = await response.json();

    // 사용 불가능한 시간대를 Set으로 변환
    const disabled = new Set();
    data.availableSlots.forEach((slot) => {
      if (!slot.available) {
        disabled.add(slot.time);
      }
    });

    return disabled;
  } catch (error) {
    console.error('예약 가능 시간 조회 실패:', error);
    return new Set();
  }
};
```

---

### 3. 예약 생성

```
POST /api/reservations
```

**요청**:

```json
{
  "counselorId": "c001",
  "type": "chat",
  "date": "2026-02-15",
  "time": "14:00",
  "title": "취업 상담 받고 싶습니다",
  "content": "이력서 작성과 면접 준비에 대해 상담받고 싶습니다.",
  "userId": "u123"
}
```

**응답**:

```json
{
  "reservationId": "r001",
  "counselorId": "c001",
  "counselorName": "김민준",
  "type": "chat",
  "scheduledAt": "2026-02-15T14:00:00Z",
  "status": "pending",
  "amount": 11000,
  "paymentRequired": true,
  "paymentDeadline": "2026-02-14T23:59:59Z",
  "createdAt": "2026-02-10T10:30:00Z"
}
```

**구현 예시**:

```javascript
const createReservation = async (formData) => {
  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        counselorId: c_id,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        title: formData.title,
        content: formData.content,
      }),
    });

    if (!response.ok) {
      throw new Error('예약 생성 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('예약 생성 오류:', error);
    alert('예약 생성 중 오류가 발생했습니다.');
    return null;
  }
};
```

---

### 4. 포인트 결제 처리 (현재 구현)

```
POST /api/payments/point
```

**요청**:

```json
{
  "reservationId": "r001",
  "userId": "u123",
  "method": "point",
  "amount": 2000,
  "usedPoints": 2000,
  "counselorId": "c001",
  "type": "chat"
}
```

**응답**:

```json
{
  "paymentId": "p001",
  "reservationId": "r001",
  "status": "completed",
  "method": "point",
  "usedPoints": 2000,
  "finalAmount": 2000,
  "remainingPoints": 3000,
  "paidAt": "2026-02-10T10:35:00Z"
}
```

**포인트 부족 시 응답**:

```json
{
  "error": "insufficient_points",
  "message": "보유 포인트가 부족합니다.",
  "required": 2000,
  "available": 1000
}
```

**구현 예시**:

```javascript
const processPointPayment = async (reservationData) => {
  try {
    // 1. 사용자 포인트 조회
    const userPoints = await fetchUserPoints(userId);
    
    // 2. 포인트 부족 체크
    if (userPoints.current < reservationData.amount) {
      alert('보유 포인트가 부족합니다. 포인트를 충전해주세요.');
      return { success: false, error: 'insufficient_points' };
    }
    
    // 3. 포인트 결제 요청
    const response = await fetch('/api/payments/point', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        reservationId: reservationData.reservationId,
        userId: reservationData.userId,
        method: 'point',
        amount: reservationData.amount,
        usedPoints: reservationData.amount,
        counselorId: reservationData.counselorId,
        type: reservationData.type
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'completed') {
      return {
        success: true,
        paymentId: data.paymentId,
        remainingPoints: data.remainingPoints
      };
    }
  } catch (error) {
    console.error('포인트 결제 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

### 5. 포인트 조회

```
GET /api/users/:userId/points
```

**응답**:

```json
{
  "userId": "u123",
  "currentPoints": 5000,
  "reservedPoints": 0,
  "totalEarned": 50000,
  "totalUsed": 45000,
  "lastUpdated": "2026-02-10T10:35:00Z"
}
```

---

### 6. 카드 결제 처리 (향후 구현)

```
POST /api/payments
```

**요청**:

```json
{
  "reservationId": "r001",
  "method": "card",
  "amount": 11000,
  "paymentInfo": {
    "cardNumber": "****-****-****-1234",
    "cardCompany": "신한카드"
  }
}
```

**응답**:

```json
{
  "paymentId": "p001",
  "reservationId": "r001",
  "status": "completed",
  "amount": 11000,
  "method": "card",
  "approvalNumber": "12345678",
  "paidAt": "2026-02-10T10:35:00Z",
  "receipt": {
    "url": "https://example.com/receipts/p001.pdf",
    "number": "P-20260210-001"
  }
}
```

**결제 실패 응답**:

```json
{
  "error": "payment_failed",
  "message": "결제 승인이 거부되었습니다.",
  "reason": "insufficient_funds"
}
```

**구현 예시 (PG사 연동)**:

```javascript
const processPayment = async (reservationId, amount, method) => {
  try {
    // 1. 결제 요청 생성
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        reservationId,
        method,
        amount,
      }),
    });

    const data = await response.json();

    if (data.status === 'completed') {
      // 2. 결제 완료
      return {
        success: true,
        paymentId: data.paymentId,
        approvalNumber: data.approvalNumber,
      };
    } else if (data.status === 'pending') {
      // 3. PG사 결제창 띄우기 (예: 이니시스, KG이니시스 등)
      const paymentResult = await openPaymentWindow(data.paymentUrl);
      return paymentResult;
    }
  } catch (error) {
    console.error('결제 처리 오류:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// PG사 결제창 연동 예시
const openPaymentWindow = (paymentUrl) => {
  return new Promise((resolve) => {
    // 새 창으로 결제 페이지 열기
    const popup = window.open(paymentUrl, 'payment', 'width=500,height=600');

    // 결제 완료 메시지 수신
    window.addEventListener('message', (event) => {
      if (event.data.type === 'payment_complete') {
        popup.close();
        resolve({
          success: true,
          paymentId: event.data.paymentId,
          approvalNumber: event.data.approvalNumber,
        });
      } else if (event.data.type === 'payment_failed') {
        popup.close();
        resolve({
          success: false,
          error: event.data.error,
        });
      }
    });
  });
};
```

---

### 7. 리뷰 조회

```
GET /api/counselors/:id/reviews?page={page}&pageSize={pageSize}
```

**요청 파라미터**:

```javascript
{
  page: 1,
  pageSize: 10
}
```

**응답**:

```json
{
  "reviews": [
    {
      "id": "rv001",
      "userId": "u123",
      "userName": "김**",
      "rating": 5,
      "content": "정말 도움이 많이 되었습니다. 감사합니다!",
      "createdAt": "2026-01-15T10:30:00Z",
      "verified": true
    }
  ],
  "totalCount": 155,
  "totalPages": 16,
  "currentPage": 1,
  "averageRating": 4.9
}
```

---

## 예약 상태 관리

### 예약 상태 종류

```javascript
const RESERVATION_STATUS = {
  PENDING: 'pending', // 예약 대기 (결제 전)
  CONFIRMED: 'confirmed', // 예약 확정 (결제 완료)
  IN_PROGRESS: 'in_progress', // 상담 진행 중
  COMPLETED: 'completed', // 상담 완료
  CANCELLED: 'cancelled', // 예약 취소
  NO_SHOW: 'no_show', // 노쇼
};
```

### 예약 상태별 액션

```javascript
const ACTIONS_BY_STATUS = {
  pending: ['결제하기', '취소하기'],
  confirmed: ['수정하기', '취소하기', '상담 시작'],
  in_progress: ['상담 종료'],
  completed: ['리뷰 작성', '재예약'],
  cancelled: ['재예약'],
  no_show: [],
};
```

---

## 실시간 예약 가능 여부

### WebSocket 연동

```javascript
import { useEffect, useState } from 'react';

const useCounselorAvailability = (counselorId) => {
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const ws = new WebSocket(`wss://api.example.com/counselors/${counselorId}/availability`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setIsAvailable(data.available);
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    return () => ws.close();
  }, [counselorId]);

  return isAvailable;
};
```

---

## 캘린더 및 타임슬롯 관리

### 날짜 선택 제한

```javascript
// 과거 날짜 비활성화
const isPastDate = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return target < today;
};

// 특정 날짜 비활성화 (휴무일 등)
const isHoliday = (dateStr) => {
  const holidays = ['2026-01-01', '2026-03-01', '2026-05-05'];
  return holidays.includes(dateStr);
};

// 상담사의 근무 요일 확인
const isWorkingDay = (dateStr, counselorSchedule) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0(일) ~ 6(토)
  return counselorSchedule.workingDays.includes(dayOfWeek);
};
```

### 시간대 비활성화 로직

```javascript
const getDisabledSlots = async (counselorId, date) => {
  try {
    // 1. API에서 예약 가능 시간 조회
    const response = await fetch(`/api/counselors/${counselorId}/available-slots?date=${date}`);
    const data = await response.json();

    const disabled = new Set();

    // 2. 예약 불가능한 시간대 추가
    data.availableSlots.forEach((slot) => {
      if (!slot.available) {
        disabled.add(slot.time);
      }
    });

    // 3. 오늘 날짜인 경우 현재 시간 이전 비활성화
    const now = new Date();
    const targetDate = new Date(date);
    if (targetDate.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      TIME_SLOTS.forEach((slot) => {
        const slotHour = Number(slot.split(':')[0]);
        if (slotHour <= currentHour) {
          disabled.add(slot);
        }
      });
    }

    return disabled;
  } catch (error) {
    console.error('시간대 조회 오류:', error);
    return new Set();
  }
};
```

---

## 알림 및 리마인더

### 예약 확정 알림

```javascript
POST /api/notifications
{
  "userId": "u123",
  "type": "reservation_confirmed",
  "title": "상담 예약이 확정되었습니다",
  "message": "2026-02-15 14:00에 김민준 상담사와 채팅 상담이 예정되어 있습니다.",
  "data": {
    "reservationId": "r001",
    "scheduledAt": "2026-02-15T14:00:00Z"
  }
}
```

### 상담 전 리마인더

```javascript
// 상담 1일 전
{
  "type": "reservation_reminder",
  "title": "내일 상담이 예정되어 있습니다",
  "message": "내일 14:00에 김민준 상담사와 상담이 예정되어 있습니다.",
  "scheduledFor": "2026-02-14T09:00:00Z"
}

// 상담 1시간 전
{
  "type": "reservation_reminder",
  "title": "1시간 후 상담이 시작됩니다",
  "message": "1시간 후 김민준 상담사와 상담이 시작됩니다. 준비해주세요!",
  "scheduledFor": "2026-02-15T13:00:00Z"
}
```

---

## 에러 처리

### 예약 생성 실패 케이스

```javascript
const RESERVATION_ERRORS = {
  TIME_CONFLICT: {
    code: 'time_conflict',
    message: '선택하신 시간은 이미 예약되었습니다. 다른 시간을 선택해주세요.',
  },
  COUNSELOR_UNAVAILABLE: {
    code: 'counselor_unavailable',
    message: '해당 상담사는 현재 예약을 받지 않고 있습니다.',
  },
  INVALID_TIME: {
    code: 'invalid_time',
    message: '과거 시간으로는 예약할 수 없습니다.',
  },
  MAX_RESERVATIONS: {
    code: 'max_reservations',
    message: '동시 예약 가능한 상담 수를 초과했습니다.',
  },
};

// 에러 처리 예시
try {
  const reservation = await createReservation(formData);
} catch (error) {
  if (error.code === 'time_conflict') {
    alert(RESERVATION_ERRORS.TIME_CONFLICT.message);
    // 예약 가능 시간 다시 조회
    refreshAvailableSlots();
  } else {
    alert('예약 생성 중 오류가 발생했습니다.');
  }
}
```

---

## 구현 체크리스트

### Phase 1: 프로필 페이지

- [x] 상담사 프로필 UI (모바일/PC)
- [x] 배너 이미지 및 프로필 사진
- [x] 소개, 경력, 진행 방식 표시
- [x] 가격 정보 표시
- [ ] 리뷰 목록 API 연동
- [ ] 프로필 이미지 업로드

### Phase 2: 예약 시스템

- [x] 예약 모달 UI (모바일/PC)
- [x] 캘린더 UI
- [x] 타임슬롯 선택 UI
- [ ] 예약 가능 시간 API 연동
- [ ] 예약 생성 API 연동
- [ ] 실시간 예약 현황 반영

### Phase 3: 결제 시스템

- [x] 포인트 결제 모달 UI (모바일/PC)
- [x] 포인트 잔액 표시
- [x] 결제 후 잔여 포인트 계산
- [ ] 포인트 조회 API 연동
- [ ] 포인트 결제 API 연동
- [ ] 포인트 충전 기능
- [ ] PG사 연동 (이니시스, KG이니시스 등)
- [ ] 카드 결제
- [ ] 결제 검증
- [ ] 영수증 발행

### Phase 4: 알림 및 리마인더

- [ ] 예약 확정 알림
- [ ] 상담 전 리마인더 (1일 전, 1시간 전)
- [ ] 예약 취소 알림
- [ ] 리뷰 작성 요청

### Phase 5: 추가 기능

- [ ] 예약 수정/취소
- [ ] 노쇼 관리
- [ ] 상담 완료 후 자동 리뷰 요청
- [ ] 즐겨찾기 상담사

---

## 데이터베이스 스키마

### users_points 테이블 (포인트 관리)

```sql
CREATE TABLE users_points (
  user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id),
  current_points INTEGER DEFAULT 0 CHECK (current_points >= 0),
  reserved_points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_points_user ON users_points(user_id);
```

### point_transactions 테이블 (포인트 거래 내역)

```sql
CREATE TABLE point_transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  type VARCHAR(20) CHECK (type IN ('charge', 'use', 'refund', 'reward')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  related_payment_id VARCHAR(50),
  related_reservation_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created ON point_transactions(created_at DESC);
```

### payments 테이블 (결제 내역)

```sql
CREATE TABLE payments (
  id VARCHAR(50) PRIMARY KEY,
  reservation_id VARCHAR(50) REFERENCES reservations(id),
  user_id VARCHAR(50) REFERENCES users(id),
  method VARCHAR(20) CHECK (method IN ('point', 'card', 'bank_transfer', 'virtual_account')),
  amount INTEGER NOT NULL,
  used_points INTEGER DEFAULT 0,
  final_amount INTEGER NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  pg_transaction_id VARCHAR(100),
  approval_number VARCHAR(50),
  card_company VARCHAR(50),
  card_number VARCHAR(20),
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_amount INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_reservation ON payments(reservation_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### reservations 테이블

```sql
CREATE TABLE reservations (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  counselor_id VARCHAR(50) REFERENCES counselors(id),
  type VARCHAR(20) CHECK (type IN ('chat', 'call', 'visit')),
  scheduled_at TIMESTAMP NOT NULL,
  duration INTEGER DEFAULT 60,
  status VARCHAR(20) CHECK (status IN (
    'pending', 'confirmed', 'in_progress',
    'completed', 'cancelled', 'no_show'
  )),
  title VARCHAR(200),
  content TEXT,
  amount INTEGER NOT NULL,
  payment_id VARCHAR(50),
  payment_status VARCHAR(20) CHECK (payment_status IN (
    'pending', 'completed', 'refunded'
  )),
  chat_room_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT
);

CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_counselor ON reservations(counselor_id);
CREATE INDEX idx_reservations_scheduled ON reservations(scheduled_at);
CREATE INDEX idx_reservations_status ON reservations(status);
```

### available_slots 테이블 (캐싱용)

```sql
CREATE TABLE available_slots (
  counselor_id VARCHAR(50) REFERENCES counselors(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  available BOOLEAN DEFAULT true,
  reason VARCHAR(200),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (counselor_id, date, time)
);

CREATE INDEX idx_available_slots_date ON available_slots(date);
```

---

## 참고 자료

- PG사 연동 가이드: [이니시스](https://www.inicis.com), [KG이니시스](https://www.kginicis.com)
- 실시간 통신: WebSocket, Socket.io
- 알림: Firebase Cloud Messaging (FCM), AWS SNS
- 결제 검증: 서버 측 검증 필수 (보안)
