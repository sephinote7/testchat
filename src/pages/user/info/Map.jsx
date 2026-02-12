import React, { useMemo, useState } from 'react';

// TODO: DB 연동 가이드
// 이 페이지는 취업지원 센터 위치를 지도로 표시하고 검색하는 기능입니다
//
// DB 연동 시 필요한 작업:
//
// 1. 센터 목록 조회 API
//    - API: GET /api/centers?query={query}&page={page}&pageSize={pageSize}&lat={lat}&lng={lng}
//    - 요청 파라미터:
//      * query: 검색어 (센터명)
//      * page: 페이지 번호 (1부터 시작)
//      * pageSize: 페이지당 항목 수 (기본 7개)
//      * lat: 사용자 현재 위도 (선택, 거리 계산용)
//      * lng: 사용자 현재 경도 (선택, 거리 계산용)
//    - 응답:
//      {
//        centers: [
//          {
//            id: number,
//            name: string,
//            address: string,
//            phone: string,
//            latitude: number,
//            longitude: number,
//            distanceKm: number,    // 사용자 위치로부터의 거리
//            businessHours: string,  // 운영 시간
//            description: string,    // 센터 설명
//            website: string,        // 홈페이지 URL
//            category: string        // 센터 유형 (청년센터, 복지관, 구청 등)
//          }
//        ],
//        totalCount: number,
//        totalPages: number,
//        currentLocation: { lat: number, lng: number }
//      }
//
// 2. 사용자 위치 기반 검색
//    - navigator.geolocation.getCurrentPosition() 사용
//    - 위치 권한 허용 시 가까운 순으로 정렬
//    - 위치 권한 거부 시 기본 위치(예: 서울시청) 사용
//
// 3. 지도 마커 표시
//    - Google Maps API 또는 Kakao Maps API 사용
//    - 각 센터의 위도/경도로 마커 표시
//    - 마커 클릭 시 센터 상세 정보 표시
//    - 사용자 위치도 별도 마커로 표시
//
// 4. 상세 정보 모달
//    - 센터 클릭 시 상세 정보 모달 표시
//    - 주소, 전화번호, 운영시간, 홈페이지 등
//    - 길찾기 버튼 (Google Maps/Kakao Maps 연동)

// TODO: DB 연동 시 더미 데이터 삭제하고 API로 대체
const CENTER_ITEMS = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  name:
    index % 4 === 0
      ? '서울특별시 구로구청'
      : index % 4 === 1
      ? '서울시금천청년자립청소년센터'
      : index % 4 === 2
      ? '화원종합사회복지관'
      : '광명시청년정책지원센터',
  distanceKm: (1 + (index % 15) * 0.1).toFixed(1),
}));

const PAGE_SIZE = 7;

const Map = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // TODO: DB 연동 시 추가 필요한 상태
  // const [centers, setCenters] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [totalPages, setTotalPages] = useState(1);
  // const [userLocation, setUserLocation] = useState(null);
  // const [selectedCenter, setSelectedCenter] = useState(null); // 상세 정보 모달용

  // TODO: DB 연동 시 사용자 위치 가져오기
  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setUserLocation({
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude
  //         });
  //       },
  //       (error) => {
  //         console.error('위치 정보 가져오기 실패:', error);
  //         // 기본 위치 설정 (예: 서울시청)
  //         setUserLocation({ lat: 37.5665, lng: 126.9780 });
  //       }
  //     );
  //   }
  // }, []);

  // TODO: DB 연동 시 센터 목록 조회
  // useEffect(() => {
  //   const fetchCenters = async () => {
  //     try {
  //       setLoading(true);
  //       const params = new URLSearchParams({
  //         query: query,
  //         page: page.toString(),
  //         pageSize: PAGE_SIZE.toString(),
  //       });
  //
  //       if (userLocation) {
  //         params.append('lat', userLocation.lat.toString());
  //         params.append('lng', userLocation.lng.toString());
  //       }
  //
  //       const response = await fetch(`/api/centers?${params}`);
  //       const data = await response.json();
  //
  //       setCenters(data.centers);
  //       setTotalPages(data.totalPages);
  //     } catch (error) {
  //       console.error('센터 목록 조회 실패:', error);
  //       alert('센터 정보를 불러오는데 실패했습니다.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  //   fetchCenters();
  // }, [query, page, userLocation]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CENTER_ITEMS;
    return CENTER_ITEMS.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  return (
    <div>
      {/* Mobile 제목 */}
      <h2 className="lg:hidden text-[20px] font-bold text-[#111827] mb-3">주변 취업지원 센터 위치</h2>

      <div className="bg-white lg:bg-transparent rounded-[14px] lg:rounded-none p-3 lg:p-0 shadow-[0_10px_20px_rgba(31,41,55,0.08)] lg:shadow-none">
        {/* 지도 영역 */}
        {/* TODO: DB 연동 시 Google Maps API 또는 Kakao Maps API로 교체
            현재: iframe으로 단순 표시
            변경 후:
            1. Google Maps API 사용 예시:
               <GoogleMap
                 center={userLocation || { lat: 37.5665, lng: 126.9780 }}
                 zoom={13}
                 mapContainerClassName="w-full h-[320px] lg:h-[600px]"
               >
                 {centers.map(center => (
                   <Marker
                     key={center.id}
                     position={{ lat: center.latitude, lng: center.longitude }}
                     onClick={() => setSelectedCenter(center)}
                     icon={{
                       url: getCenterIcon(center.category),
                       scaledSize: new google.maps.Size(40, 40)
                     }}
                   />
                 ))}
                 {userLocation && (
                   <Marker
                     position={userLocation}
                     icon={{
                       url: '/icons/user-location.png',
                       scaledSize: new google.maps.Size(30, 30)
                     }}
                   />
                 )}
               </GoogleMap>
            
            2. Kakao Maps API 사용 예시:
               - script 태그로 Kakao Maps SDK 로드
               - useEffect로 지도 초기화
               - 마커 추가 및 이벤트 리스너 등록
        */}
        <div className="rounded-[12px] lg:rounded-2xl overflow-hidden border border-[#e5e7eb]">
          <iframe
            title="guro-map"
            src="https://www.google.com/maps?q=%EA%B5%AC%EB%A1%9C%EA%B5%AC%EC%B2%AD&output=embed"
            className="w-full h-[320px] lg:h-[600px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* 검색 영역 */}
        <div className="mt-3 lg:mt-8 flex items-center gap-2 lg:gap-4">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="센터 검색"
            className="flex-1 h-10 lg:h-14 rounded-[10px] lg:rounded-xl border border-[#dbe3f1] bg-white px-3 lg:px-4 text-[13px] lg:text-base focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
          />
          <button
            type="button"
            onClick={() => setQuery('')}
            className="h-10 lg:h-14 px-3 lg:px-6 rounded-[10px] lg:rounded-xl border border-[#dbe3f1] lg:bg-[#2f80ed] lg:text-white lg:border-[#2f80ed] text-[12px] lg:text-base text-[#374151] lg:hover:bg-[#2670d4] transition-colors"
          >
            <span className="lg:hidden">지우기</span>
            <span className="hidden lg:inline">검색</span>
          </button>
        </div>

        {/* 검색 결과 카운트 */}
        <p className="text-[12px] lg:text-base text-[#6b7280] mt-3 lg:mt-6">
          검색결과 총 <span className="font-semibold text-[#111827]">{filtered.length}</span>건이 검색 되었습니다.
        </p>

        {/* 센터 목록 */}
        {/* TODO: DB 연동 시 로딩 상태 및 빈 결과 처리
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-[#2f80ed] border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-gray-600 mt-4">센터 정보를 불러오는 중...</p>
              </div>
            ) : paged.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-base text-gray-600">검색 결과가 없습니다.</p>
              </div>
            ) : (
              ... 목록 표시 ...
            )}
        */}
        <div className="mt-2 lg:mt-6 space-y-2 lg:space-y-4">
          {paged.map((item, idx) => (
            <div
              key={item.id}
              // TODO: DB 연동 시 클릭 이벤트 추가
              // onClick={() => setSelectedCenter(item)}
              className="flex items-start gap-3 lg:gap-4 border border-[#e5e7eb] rounded-[12px] lg:rounded-xl p-3 lg:p-5 hover:border-[#2f80ed] transition-colors cursor-pointer"
            >
              {/* TODO: DB 연동 시 센터 카테고리별 아이콘 표시
                  const getCenterIcon = (category) => {
                    switch(category) {
                      case 'government': return '📍';
                      case 'youth': return '🟡';
                      case 'welfare': return '🟢';
                      case 'support': return '🟣';
                      default: return '📍';
                    }
                  }
              */}
              <div className="w-9 h-9 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-[#2f80ed] font-bold text-lg lg:text-2xl flex-shrink-0">
                {idx % 4 === 0 ? '📍' : idx % 4 === 1 ? '🟡' : idx % 4 === 2 ? '🟢' : '🟣'}
              </div>
              <div className="flex-1">
                <p className="text-[13px] lg:text-[18px] font-semibold lg:font-medium text-[#111827] mb-1 lg:mb-2">
                  {item.name}
                </p>
                {/* TODO: DB 연동 시 주소, 전화번호 등 추가 정보 표시 */}
                {/* <p className="text-[11px] lg:text-[14px] text-[#6b7280] mb-1">{item.address}</p> */}
                {/* <p className="text-[11px] lg:text-[14px] text-[#6b7280]">{item.phone}</p> */}
                <p className="text-[12px] lg:text-base text-[#6b7280] font-normal">{item.distanceKm} km</p>
              </div>
              {/* TODO: DB 연동 시 버튼 추가 (상세보기, 길찾기 등)
                  <div className="flex flex-col gap-2">
                    <button className="px-3 py-1.5 text-xs lg:text-sm bg-[#2f80ed] text-white rounded-lg hover:bg-[#2670d4]">
                      상세보기
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`, '_blank');
                      }}
                      className="px-3 py-1.5 text-xs lg:text-sm border border-[#2f80ed] text-[#2f80ed] rounded-lg hover:bg-[#2f80ed]/10"
                    >
                      길찾기
                    </button>
                  </div>
              */}
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center gap-2 lg:gap-3 mt-4 lg:mt-8 text-[13px] lg:text-base">
          <button
            type="button"
            className="px-2 lg:px-3 py-1 lg:py-2 rounded lg:rounded-lg border border-[#d1d5db] disabled:opacity-40 hover:bg-gray-50 transition-colors"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            ‹
          </button>
          {Array.from({ length: Math.min(6, totalPages) }).map((_, idx) => {
            const n = idx + 1;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`w-7 h-7 lg:w-10 lg:h-10 rounded lg:rounded-lg border transition-colors ${
                  n === safePage
                    ? 'bg-[#2f80ed] border-[#2f80ed] text-white'
                    : 'bg-white border-[#d1d5db] hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            );
          })}
          <button
            type="button"
            className="px-2 lg:px-3 py-1 lg:py-2 rounded lg:rounded-lg border border-[#d1d5db] disabled:opacity-40 hover:bg-gray-50 transition-colors"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            ›
          </button>
        </div>
      </div>

      {/* TODO: DB 연동 시 센터 상세 정보 모달 추가
          {selectedCenter && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-2xl max-w-[600px] w-full max-h-[80vh] overflow-y-auto p-6 lg:p-8">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                    {selectedCenter.name}
                  </h3>
                  <button
                    onClick={() => setSelectedCenter(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">주소</h4>
                    <p className="text-base text-gray-800">{selectedCenter.address}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">전화번호</h4>
                    <p className="text-base text-gray-800">{selectedCenter.phone}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">운영 시간</h4>
                    <p className="text-base text-gray-800 whitespace-pre-line">
                      {selectedCenter.businessHours}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">거리</h4>
                    <p className="text-base text-gray-800">{selectedCenter.distanceKm} km</p>
                  </div>
                  
                  {selectedCenter.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">센터 소개</h4>
                      <p className="text-base text-gray-800 leading-relaxed">
                        {selectedCenter.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    {selectedCenter.website && (
                      <a
                        href={selectedCenter.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 px-4 text-center bg-white border-2 border-[#2f80ed] text-[#2f80ed] rounded-xl font-medium hover:bg-[#2f80ed]/10 transition-colors"
                      >
                        홈페이지 방문
                      </a>
                    )}
                    <button
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.latitude},${selectedCenter.longitude}`,
                          '_blank'
                        );
                      }}
                      className="flex-1 py-3 px-4 bg-[#2f80ed] text-white rounded-xl font-medium hover:bg-[#2670d4] transition-colors"
                    >
                      길찾기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      */}
    </div>
  );
};

export default Map;
