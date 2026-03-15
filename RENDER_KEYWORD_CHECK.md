# 이번 주 키워드 / 워드클라우드 안 나올 때 점검 (Render)

## 1. Render 쪽인지 확인하는 방법

### 1) 서비스가 실제로 떠 있는지

- Render 대시보드 → 해당 서비스 → **Logs** 탭에서 최근 로그 확인.
- `GET /weekly-keywords` 가 **200** 이고, 그 뒤에 Python 앱 로그(INFO 등)가 이어지면 **앱까지 요청이 도달한 것**입니다.
- 로그에 `APPLICATION LOADING` / `WELCOME TO RENDER` 만 반복되고, **앱 로그가 전혀 없으면** 요청이 앱에 도달하기 전에 끊기거나, 인스턴스가 아직 준비되지 않은 상태일 수 있습니다.

### 2) 브라우저에서 API 직접 호출

- **개발자 도구(F12) → Console** 에서 아래 실행:

```javascript
fetch('https://testchatpy.onrender.com/weekly-keywords', { credentials: 'omit' })
  .then(r => r.json())
  .then(d => console.log('키워드 응답:', d))
  .catch(e => console.error('에러:', e));
```

- **정상**: `{ count: N, keywords: [...] }` 형태로 출력 → **Render 앱은 동작 중**. 프론트/캐시/타이밍 쪽을 의심.
- **에러**: `Failed to fetch` / `net::ERR_...` / 타임아웃 → **네트워크 또는 Render 인스턴스 미응답** (콜드 스타트, 다운, 방화벽 등).

### 3) 워드클라우드 이미지

- 새 탭에서 `https://testchatpy.onrender.com/weekly-wordcloud` 열기.
- **이미지가 보이면**: Render는 정상. 프론트에서 같은 URL을 쓰는지, CORS/캐시 문제는 없는지 확인.
- **404 / 빈 페이지 / 로딩만 반복**: Render 앱에서 `weekly_wordcloud_image` 가 아직 준비되지 않았거나, ML 데이터 로딩 실패 가능성.

---

## 2. Render에서 자주 나는 원인

| 현상 | 가능 원인 |
|------|-----------|
| 브라우저에서 접속 시 "APPLICATION LOADING" 만 반복 | 무료 플랜 콜드 스타트 중이거나, 인스턴스가 아직 준비되지 않음. 1~2분 후 다시 시도. |
| `/weekly-keywords` 가 `200` 인데 `keywords: []` | ML 데이터(`load_ml_data`) 미로딩 또는 실패. Render 로그에서 DB 연결/에러 확인. |
| `/weekly-wordcloud` 가 404 | `weekly_wordcloud_image` 가 `None`. 위와 동일하게 ML 로딩 실패 가능. |
| 요청이 아예 실패 (타임아웃 등) | 인스턴스 슬립, 네트워크, 또는 요청 시간 초과. 프론트에서는 60초 타임아웃 + 5초 후 1회 재시도 적용됨. |

---

## 3. 프론트에서 할 수 있는 것

- 홈 "이번 주 키워드" 영역에 **"다시 시도"** 버튼이 있으면, Render가 늦게 깨어난 뒤에 눌러서 한 번 더 요청해 보기.
- 그래도 안 되면 위 1·2 항목대로 Render 로그와 `fetch('/weekly-keywords')` 결과를 확인하면 **Render 쪽 문제인지** 구분할 수 있습니다.
