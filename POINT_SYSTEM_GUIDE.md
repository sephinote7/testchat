# 포인트 시스템 가이드

## 개요

이 문서는 고민순삭 플랫폼의 포인트 충전 및 사용 시스템에 대한 가이드입니다.

---

## 포인트 시스템 개요

### 포인트 사용처

1. **상담 예약 결제**: 상담사와의 채팅/전화/방문 상담 예약 시 포인트 차감
2. **프리미엄 기능**: AI 상담 고급 기능, 전문 상담 자료 등

### 포인트 획득 방법

1. **직접 충전**: 카드/계좌이체/간편결제
2. **이벤트 리워드**: 회원가입, 첫 상담, 리뷰 작성 등
3. **추천인 보상**: 신규 회원 추천 시
4. **정기 혜택**: 구독형 멤버십 가입 시

---

## 현재 구현 상태

### ✅ 구현 완료
- 예약 결제 시 포인트 차감 UI (모바일/PC)
- 포인트 잔액 표시
- 결제 후 잔여 포인트 계산 표시
- 포인트 부족 시 안내 메시지

### 🚧 구현 예정
- 포인트 충전 페이지
- 포인트 거래 내역 조회
- 포인트 환불 기능
- 포인트 선물하기

---

## API 엔드포인트

### 1. 포인트 잔액 조회

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

**구현 예시**:

```javascript
const fetchUserPoints = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}/points`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('포인트 조회 실패');
    }
    
    const data = await response.json();
    return {
      current: data.currentPoints,
      reserved: data.reservedPoints
    };
  } catch (error) {
    console.error('포인트 조회 오류:', error);
    return { current: 0, reserved: 0 };
  }
};
```

---

### 2. 포인트 충전

```
POST /api/points/charge
```

**요청**:

```json
{
  "userId": "u123",
  "amount": 10000,
  "method": "card",
  "paymentInfo": {
    "cardNumber": "****-****-****-1234",
    "cardCompany": "신한카드"
  }
}
```

**응답**:

```json
{
  "transactionId": "pt001",
  "userId": "u123",
  "type": "charge",
  "amount": 10000,
  "bonusPoints": 1000,
  "totalCharged": 11000,
  "balanceAfter": 16000,
  "paymentId": "p001",
  "status": "completed",
  "createdAt": "2026-02-10T10:35:00Z"
}
```

**실패 응답**:

```json
{
  "error": "payment_failed",
  "message": "결제 승인이 거부되었습니다.",
  "reason": "card_declined"
}
```

**구현 예시**:

```javascript
const chargePoints = async (amount, paymentMethod) => {
  try {
    const response = await fetch('/api/points/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: user.id,
        amount: amount,
        method: paymentMethod
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'completed') {
      alert(`${data.totalCharged.toLocaleString()}P 충전이 완료되었습니다!`);
      return {
        success: true,
        transactionId: data.transactionId,
        balanceAfter: data.balanceAfter
      };
    }
  } catch (error) {
    console.error('포인트 충전 오류:', error);
    alert('포인트 충전 중 오류가 발생했습니다.');
    return { success: false };
  }
};
```

---

### 3. 포인트 사용 (예약 결제)

```
POST /api/points/use
```

**요청**:

```json
{
  "userId": "u123",
  "amount": 2000,
  "reservationId": "r001",
  "description": "김민준 상담사 - 채팅 상담"
}
```

**응답**:

```json
{
  "transactionId": "pt002",
  "userId": "u123",
  "type": "use",
  "amount": 2000,
  "balanceAfter": 3000,
  "reservationId": "r001",
  "status": "completed",
  "createdAt": "2026-02-10T11:00:00Z"
}
```

**포인트 부족 시 응답**:

```json
{
  "error": "insufficient_points",
  "message": "보유 포인트가 부족합니다.",
  "required": 2000,
  "available": 1000,
  "shortage": 1000
}
```

---

### 4. 포인트 거래 내역 조회

```
GET /api/users/:userId/point-transactions?page=1&pageSize=20&type=all
```

**파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `pageSize`: 페이지당 항목 수 (기본값: 20)
- `type`: 거래 유형 필터 (`all`, `charge`, `use`, `refund`, `reward`)

**응답**:

```json
{
  "transactions": [
    {
      "id": "pt002",
      "type": "use",
      "amount": 2000,
      "balanceAfter": 3000,
      "description": "김민준 상담사 - 채팅 상담",
      "relatedReservationId": "r001",
      "createdAt": "2026-02-10T11:00:00Z"
    },
    {
      "id": "pt001",
      "type": "charge",
      "amount": 10000,
      "bonusPoints": 1000,
      "balanceAfter": 5000,
      "description": "포인트 충전 (신한카드)",
      "relatedPaymentId": "p001",
      "createdAt": "2026-02-10T10:35:00Z"
    }
  ],
  "totalCount": 2,
  "totalPages": 1,
  "currentPage": 1,
  "currentPoints": 3000
}
```

---

### 5. 포인트 환불

```
POST /api/points/refund
```

**요청**:

```json
{
  "userId": "u123",
  "transactionId": "pt002",
  "reason": "상담 취소"
}
```

**응답**:

```json
{
  "transactionId": "pt003",
  "userId": "u123",
  "type": "refund",
  "amount": 2000,
  "balanceAfter": 5000,
  "originalTransactionId": "pt002",
  "reason": "상담 취소",
  "status": "completed",
  "createdAt": "2026-02-10T12:00:00Z"
}
```

---

## 포인트 충전 페이지 구현 예시

### 기본 구조

```jsx
import React, { useState, useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';

const PointCharge = () => {
  const { user } = useAuth();
  const [currentPoints, setCurrentPoints] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // 충전 금액 옵션
  const chargeOptions = [
    { amount: 10000, bonus: 1000 },
    { amount: 30000, bonus: 3000 },
    { amount: 50000, bonus: 5000 },
    { amount: 100000, bonus: 15000 },
  ];
  
  useEffect(() => {
    // 포인트 조회
    fetchUserPoints(user.id).then(points => {
      setCurrentPoints(points.current);
    });
  }, [user.id]);
  
  const handleCharge = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    
    if (!amount || amount < 1000) {
      alert('최소 충전 금액은 1,000원입니다.');
      return;
    }
    
    const result = await chargePoints(amount, paymentMethod);
    
    if (result.success) {
      setCurrentPoints(result.balanceAfter);
      setSelectedAmount(0);
      setCustomAmount('');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 현재 포인트 */}
      <div className="bg-blue-600 text-white rounded-2xl p-6 mb-6">
        <p className="text-sm mb-2">현재 보유 포인트</p>
        <p className="text-4xl font-bold">{currentPoints.toLocaleString()} P</p>
      </div>
      
      {/* 충전 금액 선택 */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">충전 금액 선택</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {chargeOptions.map(option => (
            <button
              key={option.amount}
              onClick={() => {
                setSelectedAmount(option.amount);
                setCustomAmount('');
              }}
              className={`p-4 rounded-lg border-2 ${
                selectedAmount === option.amount
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <p className="font-bold text-lg">
                {option.amount.toLocaleString()}원
              </p>
              <p className="text-sm text-blue-600">
                +{option.bonus.toLocaleString()}P 보너스
              </p>
            </button>
          ))}
        </div>
        
        {/* 직접 입력 */}
        <input
          type="number"
          placeholder="직접 입력 (최소 1,000원)"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setSelectedAmount(0);
          }}
          className="w-full p-4 border-2 border-gray-200 rounded-lg"
        />
      </div>
      
      {/* 결제 수단 */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">결제 수단</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>신용카드</span>
          </label>
          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="bank"
              checked={paymentMethod === 'bank'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>계좌이체</span>
          </label>
          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="kakao"
              checked={paymentMethod === 'kakao'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>카카오페이</span>
          </label>
        </div>
      </div>
      
      {/* 충전하기 버튼 */}
      <button
        onClick={handleCharge}
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg"
      >
        충전하기
      </button>
    </div>
  );
};

export default PointCharge;
```

---

## 포인트 정책

### 충전 정책

1. **최소 충전 금액**: 1,000원
2. **최대 충전 금액**: 1,000,000원 (1회)
3. **보너스 정책**:
   - 10,000원 충전: +1,000P (10%)
   - 30,000원 충전: +3,000P (10%)
   - 50,000원 충전: +5,000P (10%)
   - 100,000원 충전: +15,000P (15%)

### 사용 정책

1. **사용 단위**: 1P = 1원
2. **최소 사용**: 제한 없음
3. **유효 기간**: 충전일로부터 5년
4. **우선 사용**: 먼저 충전한 포인트부터 사용

### 환불 정책

1. **환불 가능 케이스**:
   - 상담 예약 취소 (24시간 전 취소 시 100% 환불)
   - 상담사 불참 (100% 환불)
   - 시스템 오류로 인한 중복 결제 (100% 환불)

2. **환불 불가 케이스**:
   - 상담 시작 후
   - 노쇼 (예약자 불참)
   - 보너스 포인트 (충전액만 환불)

3. **현금 환불**:
   - 충전 후 7일 이내, 미사용 포인트에 한해 현금 환불 가능
   - 수수료 10% 차감

---

## 보안 고려사항

### 포인트 무결성

1. **트랜잭션 처리**: 모든 포인트 변동은 DB 트랜잭션으로 처리
2. **잔액 검증**: 포인트 사용 전 항상 잔액 확인
3. **로그 기록**: 모든 포인트 거래 내역 저장
4. **동시성 제어**: 락(Lock) 메커니즘으로 동시 사용 방지

### 부정 사용 방지

1. **충전 한도**: 1일 최대 충전 한도 설정
2. **이상 거래 감지**: 짧은 시간 내 반복 충전/사용 모니터링
3. **IP 추적**: 의심 거래 시 IP 차단
4. **본인 인증**: 일정 금액 이상 충전 시 본인 인증 필수

---

## 데이터베이스 스키마

### users_points 테이블

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
```

### point_transactions 테이블

```sql
CREATE TABLE point_transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  type VARCHAR(20) CHECK (type IN ('charge', 'use', 'refund', 'reward', 'expire')),
  amount INTEGER NOT NULL,
  bonus_points INTEGER DEFAULT 0,
  balance_after INTEGER NOT NULL,
  description TEXT,
  related_payment_id VARCHAR(50),
  related_reservation_id VARCHAR(50),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_payment FOREIGN KEY (related_payment_id) 
    REFERENCES payments(id) ON DELETE SET NULL,
  CONSTRAINT fk_reservation FOREIGN KEY (related_reservation_id) 
    REFERENCES reservations(id) ON DELETE SET NULL
);

CREATE INDEX idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_type ON point_transactions(type);
CREATE INDEX idx_point_transactions_created ON point_transactions(created_at DESC);
CREATE INDEX idx_point_transactions_expires ON point_transactions(expires_at);
```

---

## 구현 체크리스트

### Phase 1: 포인트 조회
- [ ] 포인트 조회 API
- [ ] 마이페이지에 포인트 표시
- [ ] 거래 내역 조회 페이지

### Phase 2: 포인트 충전
- [ ] 충전 페이지 UI
- [ ] 충전 금액 선택
- [ ] 결제 수단 선택
- [ ] PG사 연동
- [ ] 충전 완료 알림

### Phase 3: 포인트 사용
- [x] 예약 결제 시 포인트 차감 UI
- [ ] 포인트 사용 API
- [ ] 포인트 부족 시 충전 유도

### Phase 4: 포인트 관리
- [ ] 환불 처리
- [ ] 유효기간 관리
- [ ] 보너스 포인트 지급
- [ ] 포인트 선물하기

---

## 참고 자료

- PG사: [이니시스](https://www.inicis.com), [토스페이먼츠](https://www.tosspayments.com)
- 간편결제: 카카오페이, 네이버페이, 삼성페이
- 보안: PCI-DSS 준수, SSL/TLS 암호화
