# 채팅 기능 DB 연동 가이드

## 개요

이 문서는 채팅 관련 기능의 DB 연동을 위한 가이드입니다.
각 파일에 `TODO` 주석으로 상세한 구현 가이드가 포함되어 있습니다.

---

## 파일별 DB 연동 포인트

### 1. ChatDefaultPage.jsx

**경로**: `src/pages/user/chat/ChatDefaultPage.jsx`

**기능**: 채팅 타입 선택 화면 (AI 상담 vs 상담사 상담)

**연동 필요 사항**:

- 사용자 인증 상태 확인
- AI 상담 이용 가능 여부 (이용 횟수 제한)
- 상담사 예약 가능 여부

---

### 2. CounselorList.jsx

**경로**: `src/pages/user/chat/CounselorList.jsx`

**기능**: 상담사 목록 및 검색

**API 엔드포인트**:

```
GET /api/counselors?category={category}&page={page}&pageSize={pageSize}
```

**요청 파라미터**:

- `category`: 'psychology' | 'job' | 'career' | 'love' | '' (전체)
- `page`: 페이지 번호 (1부터 시작)
- `pageSize`: 페이지당 항목 수 (기본 5개)

**응답 형식**:

```json
{
  "counselors": [
    {
      "id": "string",
      "name": "string",
      "title": "string",
      "summary": "string",
      "tags": ["string"],
      "reviewCount": 0,
      "rating": 0,
      "prices": {
        "chat": 0,
        "call": 0,
        "visit": 0
      },
      "available": true
    }
  ],
  "totalCount": 0,
  "totalPages": 0
}
```

---

### 3. AIChat.jsx

**경로**: `src/pages/user/chat/AIChat.jsx`

**기능**: AI 상담 채팅

**API 엔드포인트**:

#### 1) 세션 시작

```
POST /api/chat/ai/sessions
```

**요청**:

```json
{
  "userId": "string"
}
```

**응답**:

```json
{
  "sessionId": "string",
  "createdAt": "ISO 8601 datetime"
}
```

#### 2) 채팅 기록 조회

```
GET /api/chat/ai/sessions/:sessionId/messages
```

**응답**:

```json
{
  "messages": [
    {
      "id": "string",
      "role": "ai" | "user",
      "text": "string",
      "timestamp": "ISO 8601 datetime"
    }
  ]
}
```

#### 3) 메시지 전송

```
POST /api/chat/ai/sessions/:sessionId/messages
```

**요청**:

```json
{
  "message": "string",
  "timestamp": "ISO 8601 datetime"
}
```

**응답**:

```json
{
  "userMessage": {
    "id": "string",
    "role": "user",
    "text": "string",
    "timestamp": "ISO 8601 datetime"
  },
  "aiMessage": {
    "id": "string",
    "role": "ai",
    "text": "string",
    "timestamp": "ISO 8601 datetime"
  }
}
```

#### 4) 세션 종료

```
PUT /api/chat/ai/sessions/:sessionId/complete
```

**요청**:

```json
{
  "completedAt": "ISO 8601 datetime"
}
```

#### 5) WebSocket (선택사항)

```
ws://your-domain/api/chat/ai/:sessionId
```

실시간 AI 응답 수신용

---

### 4. CounselorChat.jsx

**경로**: `src/pages/user/chat/CounselorChat.jsx`

**기능**: 상담사와의 1:1 채팅

**API 엔드포인트**:

#### 1) 상담사 정보 조회

```
GET /api/counselors/:counselorId
```

**응답**:

```json
{
  "id": "string",
  "name": "string",
  "title": "string",
  "summary": "string",
  "tags": ["string"],
  "reviewCount": 0,
  "rating": 0,
  "prices": { "chat": 0, "call": 0, "visit": 0 },
  "available": true
}
```

#### 2) 예약 정보 확인

```
GET /api/reservations/:userId/counselor/:counselorId
```

**응답**:

```json
{
  "reservationId": "string",
  "counselorId": "string",
  "userId": "string",
  "reservationDate": "ISO 8601 datetime",
  "status": "pending" | "confirmed" | "in-progress" | "completed"
}
```

#### 3) 채팅 세션 시작

```
POST /api/chat/counselor/sessions
```

**요청**:

```json
{
  "counselorId": "string",
  "userId": "string",
  "reservationId": "string"
}
```

**응답**:

```json
{
  "sessionId": "string",
  "status": "active"
}
```

#### 4) 채팅 기록 조회

```
GET /api/chat/counselor/sessions/:sessionId/messages
```

**응답**:

```json
{
  "messages": [
    {
      "id": "string",
      "role": "counselor" | "user",
      "text": "string",
      "timestamp": "ISO 8601 datetime",
      "readBy": ["userId1", "userId2"],
      "status": "sent" | "delivered" | "read"
    }
  ]
}
```

#### 5) 메시지 전송

```
POST /api/chat/counselor/sessions/:sessionId/messages
```

**요청**:

```json
{
  "message": "string",
  "senderId": "string",
  "timestamp": "ISO 8601 datetime"
}
```

**응답**:

```json
{
  "message": {
    "id": "string",
    "role": "user",
    "text": "string",
    "timestamp": "ISO 8601 datetime",
    "status": "sent"
  }
}
```

#### 6) WebSocket (실시간 통신)

```
ws://your-domain/api/chat/counselor/:sessionId
```

**이벤트 타입**:

- `message`: 새 메시지 수신
- `typing`: 상대방이 입력 중
- `read`: 메시지 읽음 상태
- `counselor-joined`: 상담사 입장
- `counselor-left`: 상담사 퇴장

**메시지 형식**:

```json
{
  "type": "message",
  "data": {
    "id": "string",
    "role": "counselor" | "user",
    "text": "string",
    "timestamp": "ISO 8601 datetime"
  }
}
```

---

## 구현 순서 권장사항

### Phase 1: 기본 기능

1. 상담사 목록 조회 및 페이지네이션
2. AI 채팅 세션 생성 및 메시지 전송 (HTTP)
3. 상담사 채팅 세션 생성 및 메시지 전송 (HTTP)

### Phase 2: 실시간 기능

4. AI 채팅 WebSocket 연결 (실시간 응답)
5. 상담사 채팅 WebSocket 연결 (실시간 메시지)
6. 입력 중(typing) 표시 기능

### Phase 3: 고급 기능

7. 메시지 읽음 상태 추적
8. 파일 첨부 기능
9. 이모지 및 리액션 기능
10. 채팅 검색 기능

---

## 보안 고려사항

### 인증/인가

- 모든 API 요청에 JWT 토큰 포함
- WebSocket 연결 시 초기 핸드셰이크에서 인증
- 세션 소유권 검증 (userId 확인)

### 데이터 검증

- 입력 메시지 길이 제한 (예: 5000자)
- XSS 방지를 위한 HTML 이스케이핑
- SQL Injection 방지

### 개인정보 보호

- 채팅 내용 암호화 (TLS/SSL)
- 민감 정보 로깅 금지
- 일정 기간 후 채팅 기록 자동 삭제 정책

---

## 에러 처리

### 공통 에러 코드

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자용 메시지",
    "details": "개발자용 상세 정보"
  }
}
```

### 주요 에러 케이스

- `UNAUTHORIZED`: 인증 실패
- `SESSION_NOT_FOUND`: 세션을 찾을 수 없음
- `COUNSELOR_NOT_AVAILABLE`: 상담사 예약 불가
- `MESSAGE_TOO_LONG`: 메시지 길이 초과
- `RATE_LIMIT_EXCEEDED`: 요청 횟수 제한 초과

---

## 테스트 체크리스트

### 기능 테스트

- [ ] 상담사 목록 조회 및 필터링
- [ ] 페이지네이션 동작
- [ ] AI 채팅 세션 생성
- [ ] 메시지 송수신 (AI)
- [ ] 메시지 송수신 (상담사)
- [ ] WebSocket 연결 및 재연결
- [ ] 세션 종료

### 에지 케이스

- [ ] 네트워크 끊김 시 재연결
- [ ] 중복 메시지 방지
- [ ] 빈 메시지 전송 방지
- [ ] 긴 메시지 처리
- [ ] 동시 다발적 메시지 전송

### 성능 테스트

- [ ] 대량 메시지 로딩 속도
- [ ] WebSocket 연결 안정성
- [ ] 메모리 누수 확인

---

## 참고사항

- 각 파일의 주석에 더 상세한 구현 가이드가 포함되어 있습니다
- 실제 구현 시 백엔드 API 스펙에 맞게 조정이 필요합니다
- WebSocket은 선택사항이며, 폴링(Polling)으로 대체 가능합니다
- 프로덕션 배포 전 부하 테스트 필수입니다
