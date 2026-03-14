import React, { useCallback, useEffect, useRef, useState } from 'react';
import { centersApi } from '../../../api/backendApi';

// 취업지원 센터 위치 - 카카오맵 + DB + 카카오 로컬 API 반경 검색
const PAGE_SIZE = 7;
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

const getCenterIcon = (category) => {
  const icons = { government: '📍', youth: '🟡', welfare: '🟢', support: '🟣', kakao: '🔵' };
  return icons[category] || '📍';
};

/** 카카오맵 길찾기 URL */
const getKakaoDirectionUrl = (name, latitude, longitude) => {
  const nameEnc = encodeURIComponent(name || '목적지');
  return `https://map.kakao.com/link/to/${nameEnc},${latitude},${longitude}`;
};

/** 목록/마커용 통일 아이템 (DB + 카카오 로컬) */
const normalizeItem = (item) => {
  if (item.source === 'kakao') {
    return {
      id: `kakao-${item.id}`,
      name: item.name,
      address: item.address,
      phone: item.phone,
      latitude: item.latitude,
      longitude: item.longitude,
      distanceKm: item.distanceKm,
      category: 'kakao',
      categoryName: item.categoryName,
      placeUrl: item.placeUrl,
      source: 'kakao',
    };
  }
  return { ...item, source: item.source || 'db' };
};

const RADIUS_KM = 5;
const ACCURACY_THRESHOLD_M = 500; // 이보다 크면 위치가 부정확하다고 간주

const Map = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null); // Geolocation 실패 시 메시지
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [withinRadiusOnly, setWithinRadiusOnly] = useState(true);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // 브라우저 Geolocation API로 사용자 위치 수신 (1회)
  useEffect(() => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 위치 정보를 지원하지 않습니다.');
      setUserLocation(DEFAULT_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);
        let warnMessage = null;
        if (typeof accuracy === 'number') {
          if (accuracy > ACCURACY_THRESHOLD_M) {
            warnMessage =
              '정확한 위치를 가져오지 못했습니다. 대략적인 위치로 표시되며, 지도를 이동하거나 검색으로 위치를 조정해 주세요.';
          }
          if (typeof console !== 'undefined' && console.info) {
            console.info('[Map] Geolocation 성공:', { lat: loc.lat, lng: loc.lng, accuracy });
          }
        } else if (typeof console !== 'undefined' && console.info) {
          console.info('[Map] Geolocation 성공:', { lat: loc.lat, lng: loc.lng });
        }
        setLocationError(warnMessage);
      },
      (err) => {
        const message =
          err.code === 1
            ? '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해 주세요.'
            : err.code === 2
              ? '위치를 확인할 수 없습니다. 네트워크 또는 GPS를 확인해 주세요.'
              : err.code === 3
                ? '위치 요청 시간이 초과되었습니다. 다시 시도해 주세요.'
                : '위치 정보를 가져올 수 없습니다.';
        setLocationError(message);
        setUserLocation(DEFAULT_CENTER);
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[Map] Geolocation 실패:', err.code, err.message, message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // 항상 최신 위치를 요청 (캐시 사용 안 함)
      }
    );
  }, []);

  // 센터 목록: 검색어 있으면 카카오 키워드 검색 + DB, 없으면 5km 이내 카카오 주변 + DB 또는 DB만
  useEffect(() => {
    const fetchCenters = async () => {
      setLoading(true);
      try {
        const searchQuery = query.trim();
        const hasSearchQuery = searchQuery.length > 0;

        if (hasSearchQuery) {
          // 사용자 검색어로 카카오 키워드 검색 + DB 검색 병합
          let kakaoList = [];
          let dbList = [];
          try {
            const kakaoRes = await centersApi.getKakaoKeywordSearch({
              query: searchQuery,
              lat: userLocation?.lat,
              lng: userLocation?.lng,
              radiusKm: userLocation ? RADIUS_KM : undefined,
            });
            const rawKakao = kakaoRes?.places ?? [];
            kakaoList = rawKakao.map(normalizeItem);
          } catch (e) {
            console.warn('카카오 키워드 검색 실패:', e.message);
          }
          try {
            const params = { query: searchQuery, page: 1, pageSize: 500 };
            if (userLocation) {
              params.lat = userLocation.lat;
              params.lng = userLocation.lng;
              params.radiusKm = RADIUS_KM;
            }
            const dbRes = await centersApi.getList(params);
            dbList = (dbRes?.centers ?? []).map((c) => ({ ...c, source: 'db' }));
          } catch (e) {
            console.warn('DB 센터 목록 조회 실패:', e.message);
          }
          const seenIds = new Set();
          const merged = [];
          [...dbList, ...kakaoList].forEach((item) => {
            const id = item.id ?? item.name;
            if (seenIds.has(id)) return;
            seenIds.add(id);
            merged.push(item);
          });
          merged.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
          setCenters(merged);
          setTotalCount(merged.length);
          setTotalPages(Math.max(1, Math.ceil(merged.length / PAGE_SIZE)));
          setPage(1);
        } else if (withinRadiusOnly && userLocation) {
          let kakaoList = [];
          let dbList = [];
          try {
            const kakaoRes = await centersApi.getKakaoNearby({
              lat: userLocation.lat,
              lng: userLocation.lng,
              radiusKm: RADIUS_KM,
            });
            const rawKakao = kakaoRes?.places ?? [];
            kakaoList = rawKakao.map(normalizeItem);
          } catch (e) {
            console.warn('카카오 주변 검색 실패:', e.message);
          }
          try {
            const dbRes = await centersApi.getList({
              query: '',
              page: 1,
              pageSize: 500,
              lat: userLocation.lat,
              lng: userLocation.lng,
              radiusKm: RADIUS_KM,
            });
            dbList = (dbRes?.centers ?? []).map((c) => ({ ...c, source: 'db' }));
          } catch (e) {
            console.warn('DB 센터 목록 조회 실패:', e.message);
          }
          const merged = [...dbList, ...kakaoList].sort(
            (a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999)
          );
          setCenters(merged);
          setTotalCount(merged.length);
          setTotalPages(Math.max(1, Math.ceil(merged.length / PAGE_SIZE)));
          setPage(1);
        } else {
          const params = { query: searchQuery, page, pageSize: PAGE_SIZE };
          if (userLocation) {
            params.lat = userLocation.lat;
            params.lng = userLocation.lng;
          }
          const data = await centersApi.getList(params);
          const list = (data.centers || []).map((c) => ({ ...c, source: 'db' }));
          setCenters(list);
          setTotalCount(data.totalCount ?? 0);
          setTotalPages(Math.max(1, data.totalPages ?? 1));
        }
      } catch (err) {
        console.error('센터 목록 조회 실패:', err);
        setCenters([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, [query, page, userLocation, withinRadiusOnly]);

  // 현재 위치로 지도 이동 + 주변 5km 반경이 보이도록 bounds 설정
  const moveToMyLocation = useCallback(() => {
    if (!userLocation || !mapInstanceRef.current || !window.kakao?.maps) return;
    const kakao = window.kakao.maps;
    const { lat, lng } = userLocation;
    // 위도 1도 ≈ 111km, 경도 1도 ≈ 88km(한국 위도) → 5km ≈ 0.045 / 0.057
    const deltaLat = RADIUS_KM / 111.32;
    const deltaLng = RADIUS_KM / (111.32 * Math.cos((lat * Math.PI) / 180));
    const sw = new kakao.LatLng(lat - deltaLat, lng - deltaLng);
    const ne = new kakao.LatLng(lat + deltaLat, lng + deltaLng);
    const bounds = new kakao.LatLngBounds(sw, ne);
    mapInstanceRef.current.setCenter(new kakao.LatLng(lat, lng));
    mapInstanceRef.current.setBounds(bounds, 80, 80, 80, 80);
  }, [userLocation]);

  // 카카오맵 스크립트 로드 및 지도 초기화 (마운트 시 1회)
  useEffect(() => {
    const APP_KEY = 'ccf8fe940c60dc7a693622e6595c22cd';

    const loadScriptAndInit = () => {
      if (!mapContainerRef.current) return;

      const initMap = () => {
        if (!mapContainerRef.current || !window.kakao?.maps) return;
        const kakao = window.kakao.maps;
        const center = new kakao.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
        const map = new kakao.Map(mapContainerRef.current, {
          center,
          level: 12,
        });
        mapInstanceRef.current = map;
        setMapReady(true);
      };

      if (window.kakao?.maps) {
        if (window.kakao.maps.load) {
          window.kakao.maps.load(initMap);
        } else {
          initMap();
        }
        return;
      }

      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${APP_KEY}&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(initMap);
      };
      document.head.appendChild(script);
    };

    loadScriptAndInit();
  }, []);

  // 센터/사용자 위치 변경 시 마커 갱신
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.kakao?.maps) return;
    const map = mapInstanceRef.current;
    const kakao = window.kakao.maps;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new kakao.LatLngBounds();
    let hasAny = false;

    centers.forEach((center) => {
      const pos = new kakao.LatLng(center.latitude, center.longitude);
      const marker = new kakao.Marker({ position: pos, map });
      bounds.extend(pos);
      hasAny = true;
      kakao.event.addListener(marker, 'click', () => setSelectedCenter(center));
      markersRef.current.push(marker);
    });

    // 현재 위치 마커
    if (userLocation) {
      const pos = new kakao.LatLng(userLocation.lat, userLocation.lng);
      const marker = new kakao.Marker({
        position: pos,
        map,
        title: '현재 위치',
      });
      bounds.extend(pos);
      hasAny = true;
      markersRef.current.push(marker);
    }

    if (hasAny) {
      map.setBounds(bounds, 80, 80, 80, 80);
    }
  }, [mapReady, centers, userLocation]);

  const pagedCenters = centers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const safePage = Math.min(Math.max(1, page), totalPages);

  return (
    <div>
      <h2 className="lg:hidden text-[20px] font-bold text-[#111827] mb-3">주변 취업지원 센터 위치</h2>

      <div className="bg-white lg:bg-transparent rounded-[14px] lg:rounded-none p-3 lg:p-0 shadow-[0_10px_20px_rgba(31,41,55,0.08)] lg:shadow-none">
        {/* 카카오맵 + 현재 위치 버튼 */}
        <div className="relative rounded-[12px] lg:rounded-2xl overflow-hidden border border-[#e5e7eb]">
          <div
            ref={mapContainerRef}
            id="kakao-map"
            className="w-full h-[320px] lg:h-[600px] bg-[#e5e7eb]"
          />
          {userLocation && mapReady && (
            <button
              type="button"
              onClick={moveToMyLocation}
              className="absolute bottom-3 right-3 z-10 flex items-center gap-2 px-3 py-2.5 bg-white border border-[#e5e7eb] rounded-xl shadow-md hover:bg-[#f9fafb] hover:border-[#2f80ed] transition-colors text-[13px] font-medium text-[#374151]"
              title="현재 위치로 이동 (주변 5km)"
            >
              <span className="text-lg" aria-hidden>📍</span>
              <span>현재 위치</span>
            </button>
          )}
          {locationError && (
            <div className="absolute top-3 left-3 right-3 z-10 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-800 shadow-sm">
              {locationError} 기본 위치(서울시청)로 표시됩니다.
            </div>
          )}
        </div>

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
            onClick={() => {
              setQuery('');
              setPage(1);
            }}
            className="h-10 lg:h-14 px-3 lg:px-6 rounded-[10px] lg:rounded-xl border border-[#dbe3f1] lg:bg-[#2f80ed] lg:text-white lg:border-[#2f80ed] text-[12px] lg:text-base text-[#374151] lg:hover:bg-[#2670d4] transition-colors"
          >
            <span className="lg:hidden">지우기</span>
            <span className="hidden lg:inline">검색</span>
          </button>
        </div>

        <div className="mt-3 lg:mt-6 flex flex-wrap items-center gap-2">
          {userLocation && (
            <button
              type="button"
              onClick={() => {
                setWithinRadiusOnly(!withinRadiusOnly);
                setPage(1);
              }}
              className={`text-[12px] lg:text-base px-3 py-1.5 rounded-lg border transition-colors ${
                withinRadiusOnly
                  ? 'bg-[#2f80ed] text-white border-[#2f80ed]'
                  : 'bg-white text-[#6b7280] border-[#dbe3f1] hover:border-[#2f80ed]'
              }`}
            >
              {withinRadiusOnly ? `현재 위치 기준 ${RADIUS_KM}km 이내` : '전체 보기'}
            </button>
          )}
          <p className="text-[12px] lg:text-base text-[#6b7280]">
            검색결과 총 <span className="font-semibold text-[#111827]">{totalCount}</span>건
            {withinRadiusOnly && userLocation && ` (반경 ${RADIUS_KM}km · 카카오+등록센터)`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-[#2f80ed] border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-gray-600 mt-4">센터 정보를 불러오는 중...</p>
          </div>
        ) : centers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-base text-gray-600">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="mt-2 lg:mt-6 space-y-2 lg:space-y-4">
              {pagedCenters.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCenter(item)}
                  className="flex items-start gap-3 lg:gap-4 border border-[#e5e7eb] rounded-[12px] lg:rounded-xl p-3 lg:p-5 hover:border-[#2f80ed] transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-[#2f80ed] font-bold text-lg lg:text-2xl flex-shrink-0">
                    {getCenterIcon(item.category)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] lg:text-[18px] font-semibold lg:font-medium text-[#111827] mb-1 lg:mb-2">
                      {item.name}
                      {item.source === 'kakao' && (
                        <span className="ml-1.5 text-[11px] text-[#6b7280] font-normal">(주변 시설)</span>
                      )}
                    </p>
                    {item.address && (
                      <p className="text-[11px] lg:text-[14px] text-[#6b7280] mb-1">{item.address}</p>
                    )}
                    {item.phone && (
                      <p className="text-[11px] lg:text-[14px] text-[#6b7280] mb-1">{item.phone}</p>
                    )}
                    {item.distanceKm != null && (
                      <p className="text-[12px] lg:text-base text-[#6b7280] font-normal">
                        {item.distanceKm} km
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCenter(item);
                      }}
                      className="px-3 py-1.5 text-xs lg:text-sm bg-[#2f80ed] text-white rounded-lg hover:bg-[#2670d4]"
                    >
                      상세보기
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          getKakaoDirectionUrl(item.name, item.latitude, item.longitude),
                          '_blank'
                        );
                      }}
                      className="px-3 py-1.5 text-xs lg:text-sm border border-[#2f80ed] text-[#2f80ed] rounded-lg hover:bg-[#2f80ed]/10"
                    >
                      길찾기
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 lg:gap-3 mt-4 lg:mt-8 text-[13px] lg:text-base">
              <button
                type="button"
                className="px-2 lg:px-3 py-1 lg:py-2 rounded lg:rounded-lg border border-[#d1d5db] disabled:opacity-40 hover:bg-gray-50 transition-colors"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                ‹
              </button>
              {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map((n) => (
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
              ))}
              <button
                type="button"
                className="px-2 lg:px-3 py-1 lg:py-2 rounded lg:rounded-lg border border-[#d1d5db] disabled:opacity-40 hover:bg-gray-50 transition-colors"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                ›
              </button>
            </div>
          </>
        )}
      </div>

      {selectedCenter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-[600px] w-full max-h-[80vh] overflow-y-auto p-6 lg:p-8">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {selectedCenter.name}
                {selectedCenter.source === 'kakao' && (
                  <span className="ml-2 text-sm font-normal text-gray-500">(주변 시설)</span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCenter(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {selectedCenter.address && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">주소</h4>
                  <p className="text-base text-gray-800">{selectedCenter.address}</p>
                </div>
              )}
              {selectedCenter.phone && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">전화번호</h4>
                  <p className="text-base text-gray-800">{selectedCenter.phone}</p>
                </div>
              )}
              {selectedCenter.businessHours && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">운영 시간</h4>
                  <p className="text-base text-gray-800 whitespace-pre-line">
                    {selectedCenter.businessHours}
                  </p>
                </div>
              )}
              {selectedCenter.distanceKm != null && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">거리</h4>
                  <p className="text-base text-gray-800">{selectedCenter.distanceKm} km</p>
                </div>
              )}
              {selectedCenter.categoryName && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">카테고리</h4>
                  <p className="text-base text-gray-800">{selectedCenter.categoryName}</p>
                </div>
              )}
              {selectedCenter.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">센터 소개</h4>
                  <p className="text-base text-gray-800 leading-relaxed">
                    {selectedCenter.description}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-4">
                {selectedCenter.website && (
                  <a
                    href={selectedCenter.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[120px] py-3 px-4 text-center bg-white border-2 border-[#2f80ed] text-[#2f80ed] rounded-xl font-medium hover:bg-[#2f80ed]/10 transition-colors"
                  >
                    홈페이지 방문
                  </a>
                )}
                {selectedCenter.placeUrl && (
                  <a
                    href={selectedCenter.placeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[120px] py-3 px-4 text-center bg-white border-2 border-[#e5e7eb] text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    카카오맵에서 보기
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      getKakaoDirectionUrl(
                        selectedCenter.name,
                        selectedCenter.latitude,
                        selectedCenter.longitude
                      ),
                      '_blank'
                    );
                  }}
                  className="flex-1 min-w-[120px] py-3 px-4 bg-[#2f80ed] text-white rounded-xl font-medium hover:bg-[#2670d4] transition-colors"
                >
                  길찾기 (카카오맵)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
