# 포인트 결제 시스템 업데이트

## 변경 사항 요약

예약 결제 방식을 **카드 결제**에서 **포인트 차감 방식**으로 변경했습니다.

---

## 주요 변경 파일

### 1. `src/pages/user/chat/CounselorView.jsx`

상담사 프로필 페이지의 예약 결제 모달을 포인트 차감 방식으로 변경했습니다.

#### 변경 내용

**결제 확인 섹션**:
- 상담사 정보
- 결제일 (예약 날짜 및 시간)
- 상담 유형 (채팅/전화/방문)

**최종 결제 섹션**:
- 보유 포인트: 사용자가 현재 보유한 포인트
- 사용 포인트: 이번 결제에서 차감할 포인트 (현재 테스트용 2,000P)
- 결제 포인트: 최종 결제 금액
- 현재 포인트: 결제 전 포인트 (보유 포인트와 동일)

**결제 후 잔여 포인트**:
- 결제 완료 후 남을 포인트를 크게 표시

**동의 체크박스**:
- 서비스 이용 및 포인트 결제 동의
- 취소 및 환불 규정 동의
- 두 항목 모두 체크해야 결제 가능

#### 포인트 계산 로직

```javascript
const userPoints = {
  reserved: 5000,    // 보유 포인트
  current: 5000,     // 현재 포인트
};

const paymentAmount = form.type ? counselor.prices[form.type] : 0;  // 상담 유형별 금액
const usedPoints = 2000;  // 사용할 포인트 (테스트용 고정값, DB 연동 시 변경)
const finalAmount = paymentAmount - usedPoints;  // 최종 결제 금액
const remainingPoints = userPoints.current - finalAmount;  // 결제 후 잔여 포인트
```

---

## 테스트 방법

### 1. 상담 예약 플로우

1. 상담사 프로필 페이지로 이동
   - 경로: `/chat/counselor/:c_id`
   
2. "상담 예약하기" 버튼 클릭
   
3. 예약 모달에서 정보 입력:
   - 상담 유형 선택 (채팅/전화/방문)
   - 예약 날짜 선택
   - 예약 시간 선택
   - 제목 입력
   - 상담 내용 입력
   
4. "예약 진행" 버튼 클릭
   
5. **포인트 결제 모달 확인**:
   - ✅ 결제확인 정보가 올바르게 표시되는지 확인
   - ✅ 보유 포인트: 5000 P
   - ✅ 사용 포인트: -2000 P
   - ✅ 결제 포인트: (상담 유형별 금액 - 2000) P
   - ✅ 현재 포인트: 5000 P
   - ✅ 결제 후 잔여 포인트: 정확히 계산되는지 확인
   
6. 두 개의 동의 체크박스 체크
   
7. "결제 완료하기" 버튼 클릭
   
8. 예약 완료 메시지 확인

### 2. UI 확인 사항

#### 모바일 버전
- 모달 크기: 340px 너비
- 헤더: "예약 후 결제하기" + 상담사 이름
- 섹션 구분이 명확한지
- 포인트 표시 색상 (파란색: 보유/현재, 빨간색: 사용)
- 버튼 활성화/비활성화 동작

#### PC 버전
- 모달 크기: 600px 최대 너비
- 더 큰 폰트 크기와 간격
- 그라데이션 버튼 효과
- 반응형 레이아웃

---

## DB 연동 시 필요한 작업

### 1. 포인트 조회 API 연동

현재 하드코딩된 포인트 값을 실제 API에서 조회하도록 변경:

```javascript
// CounselorView.jsx 145-149번 줄
const userPoints = {
  reserved: 5000,  // TODO: API에서 조회
  current: 5000,   // TODO: API에서 조회
};
```

변경 예시:
```javascript
const [userPoints, setUserPoints] = useState({ reserved: 0, current: 0 });

useEffect(() => {
  const fetchPoints = async () => {
    const response = await fetch(`/api/users/${userId}/points`);
    const data = await response.json();
    setUserPoints({
      reserved: data.currentPoints,
      current: data.currentPoints
    });
  };
  fetchPoints();
}, [userId]);
```

### 2. 포인트 사용 API 연동

`handlePaymentComplete` 함수에서 실제 포인트 차감 API 호출:

```javascript
// CounselorView.jsx 182-215번 줄
const handlePaymentComplete = async () => {
  try {
    const response = await fetch('/api/payments/point', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reservationId: 'temp_reservation_id',  // 실제 예약 ID
        userId: user.id,
        method: 'point',
        amount: finalAmount,
        usedPoints: usedPoints,
        counselorId: c_id,
        type: form.type
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'completed') {
      setShowPayment(false);
      setReservationDone(true);
      setPaymentAgreements({ serviceAgree: false, refundAgree: false });
      
      // 포인트 정보 갱신
      setUserPoints({
        reserved: data.remainingPoints,
        current: data.remainingPoints
      });
    } else if (data.error === 'insufficient_points') {
      alert('보유 포인트가 부족합니다. 포인트를 충전해주세요.');
      // 포인트 충전 페이지로 이동
      navigate('/mypage/point-charge');
    }
  } catch (error) {
    console.error('결제 실패:', error);
    alert('결제 처리 중 오류가 발생했습니다.');
  }
};
```

### 3. 포인트 부족 체크

결제 모달 표시 전에 포인트 부족 여부 확인:

```javascript
const handleReservationSubmit = (event) => {
  event.preventDefault();
  
  // 포인트 부족 체크
  if (userPoints.current < finalAmount) {
    const shortage = finalAmount - userPoints.current;
    const confirmCharge = window.confirm(
      `포인트가 ${shortage.toLocaleString()}P 부족합니다.\n포인트 충전 페이지로 이동하시겠습니까?`
    );
    
    if (confirmCharge) {
      navigate('/mypage/point-charge');
    }
    return;
  }
  
  setShowReservation(false);
  setShowPayment(true);
};
```

---

## 향후 개발 필요 사항

### 1. 포인트 충전 페이지
- 위치: `/mypage/point-charge`
- 기능:
  - 충전 금액 선택 (10,000원, 30,000원, 50,000원, 100,000원)
  - 직접 입력 기능
  - 보너스 포인트 안내
  - 결제 수단 선택 (카드/계좌이체/간편결제)
  - PG사 연동

### 2. 포인트 거래 내역
- 위치: `/mypage/point-history`
- 기능:
  - 충전/사용/환불 내역 조회
  - 날짜별 필터링
  - 상세 내역 모달

### 3. 포인트 정책 페이지
- 위치: `/info/point-policy`
- 내용:
  - 충전/사용/환불 정책
  - 유효기간 안내
  - 보너스 포인트 규정

### 4. 마이페이지 연동
- 메인 마이페이지에 포인트 잔액 표시
- "포인트 충전" 버튼 추가
- 최근 거래 내역 3건 표시

---

## 관련 문서

- **[COUNSELOR_RESERVATION_DB_INTEGRATION_GUIDE.md](./COUNSELOR_RESERVATION_DB_INTEGRATION_GUIDE.md)**: 예약 및 결제 시스템 전체 가이드
- **[POINT_SYSTEM_GUIDE.md](./POINT_SYSTEM_GUIDE.md)**: 포인트 시스템 상세 가이드
- **[DB_INTEGRATION_GUIDE.md](../DB_INTEGRATION_GUIDE.md)**: 전체 DB 연동 가이드

---

## 참고 이미지

사용자가 제공한 UI 디자인을 기반으로 구현되었습니다:
- 결제 확인 섹션 (회색 배경)
- 최종 결제 섹션 (하얀 배경, 테두리)
- 결제 후 잔여 포인트 (파란 배경)
- 동의 체크박스 (2개)
- 결제 완료하기 버튼 (파란색)

---

## 질문 및 피드백

추가 기능이나 수정이 필요한 경우 언제든지 말씀해 주세요!
