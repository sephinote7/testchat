# 지도 기능 DB 연동 가이드

## 개요

이 문서는 취업지원 센터 위치 지도 기능의 DB 연동을 위한 가이드입니다.

**파일**: `src/pages/user/info/Map.jsx`

---

## 주요 기능

### 1. 센터 목록 조회 및 검색

- 취업지원 센터 목록 표시
- 센터명 검색 기능
- 페이지네이션 (7개씩)
- 사용자 위치 기반 거리 계산

### 2. 지도 표시

- Google Maps 또는 Kakao Maps API
- 센터 위치 마커 표시
- 사용자 현재 위치 표시

### 3. 센터 상세 정보

- 센터 클릭 시 상세 정보 모달
- 주소, 전화번호, 운영시간 등
- 길찾기 기능 연동

---

## API 엔드포인트

### 1. 센터 목록 조회

```
GET /api/centers
```

**요청 파라미터**:

```javascript
{
  query: string,      // 검색어 (센터명)
  page: number,       // 페이지 번호 (1부터 시작)
  pageSize: number,   // 페이지당 항목 수 (기본 7)
  lat: number,        // 사용자 위도 (선택)
  lng: number         // 사용자 경도 (선택)
}
```

**응답**:

```json
{
  "centers": [
    {
      "id": 1,
      "name": "서울특별시 구로구청",
      "address": "서울특별시 구로구 구로중앙로 1",
      "phone": "02-860-2114",
      "latitude": 37.4954,
      "longitude": 126.8876,
      "distanceKm": 1.2,
      "businessHours": "평일 09:00 - 18:00\n점심시간 12:00 - 13:00\n주말 및 공휴일 휴무",
      "description": "구로구 청년 일자리 지원 및 취업 상담 제공",
      "website": "https://www.guro.go.kr",
      "category": "government"
    }
  ],
  "totalCount": 40,
  "totalPages": 6,
  "currentLocation": {
    "lat": 37.5665,
    "lng": 126.978
  }
}
```

### 2. 센터 상세 정보

```
GET /api/centers/:id
```

**응답**:

```json
{
  "id": 1,
  "name": "서울특별시 구로구청",
  "address": "서울특별시 구로구 구로중앙로 1",
  "phone": "02-860-2114",
  "latitude": 37.4954,
  "longitude": 126.8876,
  "businessHours": "평일 09:00 - 18:00\n점심시간 12:00 - 13:00",
  "description": "구로구 청년 일자리 지원 및 취업 상담 제공",
  "website": "https://www.guro.go.kr",
  "category": "government",
  "services": ["취업 상담", "이력서 첨삭", "면접 코칭", "직업 훈련 정보 제공"],
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
}
```

---

## 지도 API 연동 가이드

### Option 1: Google Maps API

#### 1. 설치

```bash
npm install @react-google-maps/api
```

#### 2. 환경 변수 설정

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### 3. 구현 예시

```javascript
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [centers, setCenters] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 37.5665, lng: 126.978 });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap center={userLocation} zoom={13} mapContainerClassName="w-full h-[320px] lg:h-[600px]">
      {/* 센터 마커 */}
      {centers.map((center) => (
        <Marker
          key={center.id}
          position={{ lat: center.latitude, lng: center.longitude }}
          onClick={() => setSelectedCenter(center)}
          icon={{
            url: getCenterIcon(center.category),
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />
      ))}

      {/* 사용자 위치 마커 */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            url: '/icons/user-location.png',
            scaledSize: new window.google.maps.Size(30, 30),
          }}
        />
      )}
    </GoogleMap>
  );
};
```

---

### Option 2: Kakao Maps API

#### 1. HTML에 스크립트 추가

`public/index.html`:

```html
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&autoload=false"></script>
```

#### 2. 구현 예시

```javascript
useEffect(() => {
  window.kakao.maps.load(() => {
    const container = document.getElementById('map');
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978),
      level: 5,
    };

    const map = new window.kakao.maps.Map(container, options);

    // 센터 마커 추가
    centers.forEach((center) => {
      const markerPosition = new window.kakao.maps.LatLng(center.latitude, center.longitude);

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: map,
      });

      // 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedCenter(center);
      });
    });
  });
}, [centers]);

return <div id="map" className="w-full h-[320px] lg:h-[600px]" />;
```

---

## 사용자 위치 가져오기

```javascript
useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
      },
      (error) => {
        console.error('위치 정보 가져오기 실패:', error);
        // 기본 위치 설정 (서울시청)
        setUserLocation({ lat: 37.5665, lng: 126.978 });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
    setUserLocation({ lat: 37.5665, lng: 126.978 });
  }
}, []);
```

---

## 거리 계산

### Haversine 공식 (서버에서 계산 권장)

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance.toFixed(1); // km 단위, 소수점 1자리
}
```

---

## 센터 카테고리별 아이콘

```javascript
const getCenterIcon = (category) => {
  const icons = {
    government: '📍', // 구청, 시청 등
    youth: '🟡', // 청년센터
    welfare: '🟢', // 복지관
    support: '🟣', // 지원센터
    default: '📍',
  };

  return icons[category] || icons.default;
};

// 또는 이미지 아이콘 사용
const getCenterIconImage = (category) => {
  return `/icons/center-${category}.png`;
};
```

---

## 길찾기 기능

### Google Maps

```javascript
const openGoogleMapsDirection = (center) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;
  window.open(url, '_blank');
};
```

### Kakao Maps

```javascript
const openKakaoMapsDirection = (center) => {
  const url = `https://map.kakao.com/link/to/${center.name},${center.latitude},${center.longitude}`;
  window.open(url, '_blank');
};
```

---

## 구현 체크리스트

### Phase 1: 기본 기능

- [ ] 센터 목록 API 연동
- [ ] 검색 기능 구현
- [ ] 페이지네이션 구현
- [ ] 로딩 상태 표시

### Phase 2: 지도 연동

- [ ] 지도 API 선택 (Google/Kakao)
- [ ] 지도 초기화 및 표시
- [ ] 센터 마커 표시
- [ ] 마커 클릭 이벤트

### Phase 3: 위치 기반 기능

- [ ] 사용자 위치 가져오기
- [ ] 거리 계산 및 정렬
- [ ] 사용자 위치 마커 표시

### Phase 4: 상세 정보

- [ ] 센터 상세 모달 구현
- [ ] 길찾기 기능 연동
- [ ] 홈페이지 링크 연동

---

## 주의사항

### 성능 최적화

- 지도 마커는 최대 50개 이하로 제한 권장
- 페이지네이션으로 데이터 분할
- 지도 줌 레벨에 따라 마커 클러스터링 고려

### 개인정보 보호

- 사용자 위치 정보는 서버에 저장하지 않음
- 위치 권한 요청 시 명확한 안내 메시지

### 크로스 브라우저 대응

- Geolocation API 지원 확인
- iOS Safari의 위치 권한 처리 별도 고려

### 에러 처리

- 위치 정보 접근 거부 시 대체 방안
- 지도 API 로드 실패 시 처리
- 네트워크 오류 처리

---

## 테스트 시나리오

1. **검색 기능**

   - 센터명 검색
   - 빈 검색어 처리
   - 검색 결과 없음 처리

2. **위치 기반 기능**

   - 위치 권한 허용
   - 위치 권한 거부
   - 위치 정보 없을 때 기본 동작

3. **지도 기능**

   - 마커 클릭
   - 지도 이동 및 줌
   - 길찾기 버튼

4. **반응형**
   - 모바일 화면
   - PC 화면
   - 태블릿 화면

---

## 참고 자료

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Kakao Maps API](https://apis.map.kakao.com/)
- [Geolocation API](https://developer.mozilla.org/ko/docs/Web/API/Geolocation_API)
- [@react-google-maps/api 문서](https://react-google-maps-api-docs.netlify.app/)
