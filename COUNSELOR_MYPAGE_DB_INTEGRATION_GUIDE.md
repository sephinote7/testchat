# 상담사 마이페이지 DB 연동 가이드

## 개요

이 문서는 상담사(SYSTEM) 마이페이지와 정보 수정 페이지의 DB 연동을 위한 가이드입니다.

**관련 파일**:

- `src/pages/system/info/CounselorDefaultPage.jsx` (상담사 마이페이지)
- `src/pages/system/info/EditCounselorInfo.jsx` (상담사 정보 수정)

---

## 1. 상담사 마이페이지 (CounselorDefaultPage.jsx)

### 기능

- 상담사 환영 메시지
- 상담사 정보 수정 링크
- 상담 내역 조회 링크
- 상담사 소개페이지 링크
- 로그아웃

### API 엔드포인트

#### 상담사 프로필 조회

```
GET /api/counselors/me
```

**요청 헤더**:

```javascript
{
  'Authorization': 'Bearer {access_token}',
  'Content-Type': 'application/json'
}
```

**응답**:

```json
{
  "id": "counselor-001",
  "name": "홍길동",
  "email": "counselor@example.com",
  "profileImage": "https://example.com/profiles/counselor-001.jpg",
  "title": "심리상담 전문가",
  "tags": ["커리어", "진로", "연애"],
  "totalSessions": 324,
  "completedSessions": 298,
  "rating": 4.9,
  "reviewCount": 155,
  "joinedAt": "2024-01-15T00:00:00Z",
  "isActive": true
}
```

**구현 예시**:

```javascript
import { useEffect, useState } from 'react';

const CounselorDefaultPage = () => {
  const [counselorProfile, setCounselorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounselorProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');

        const response = await fetch('/api/counselors/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('프로필 조회 실패');
        }

        const data = await response.json();
        setCounselorProfile(data);
      } catch (error) {
        console.error('프로필 조회 오류:', error);
        // 에러 처리 (로그인 페이지로 리다이렉트 등)
      } finally {
        setLoading(false);
      }
    };

    fetchCounselorProfile();
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <p>안녕하세요 {counselorProfile.name} 상담사님</p>
      {/* ... 나머지 UI */}
    </div>
  );
};
```

#### 로그아웃 API

```
POST /api/auth/logout
```

**요청**:

```javascript
{
  refreshToken: string; // 리프레시 토큰 (선택)
}
```

**응답**:

```json
{
  "success": true,
  "message": "로그아웃 성공"
}
```

**구현 예시**:

```javascript
const handleLogout = async () => {
  if (!window.confirm('로그아웃 하시겠습니까?')) return;

  try {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('로그아웃 실패');
    }

    // 로컬 스토리지 정리
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');

    // 홈으로 리다이렉트
    navigate('/');
  } catch (error) {
    console.error('로그아웃 오류:', error);
    alert('로그아웃에 실패했습니다.');
  }
};
```

---

## 2. 상담사 정보 수정 (EditCounselorInfo.jsx)

### 기능

- 프로필 이미지 업로드/변경
- 비밀번호 변경
- 상담 태그 설정 (최대 3개)

### API 엔드포인트

#### 현재 정보 조회

```
GET /api/counselors/me
```

**응답**: 위와 동일

#### 프로필 이미지 업로드

```
POST /api/counselors/me/profile-image
```

**요청** (FormData):

```javascript
const formData = new FormData();
formData.append('image', file); // File object
```

**응답**:

```json
{
  "success": true,
  "imageUrl": "https://example.com/profiles/counselor-001-new.jpg",
  "thumbnailUrl": "https://example.com/profiles/counselor-001-new-thumb.jpg"
}
```

**구현 예시**:

```javascript
const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 파일 크기 체크 (예: 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB 이하만 가능합니다.');
    return;
  }

  // 파일 형식 체크
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    return;
  }

  try {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/counselors/me/profile-image', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('이미지 업로드 실패');
    }

    const data = await response.json();

    // 미리보기 업데이트
    setProfileImage(data.imageUrl);

    alert('프로필 이미지가 업데이트되었습니다.');
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    alert('이미지 업로드에 실패했습니다.');
  }
};
```

#### 비밀번호 변경

```
PUT /api/counselors/me/password
```

**요청**:

```json
{
  "currentPassword": "current_password",
  "newPassword": "new_password_123!@#"
}
```

**응답**:

```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다."
}
```

**비밀번호 유효성 검사 규칙**:

- 최소 8자 이상
- 영문 대소문자, 숫자, 특수문자 중 3가지 이상 조합
- 연속된 문자 3개 이상 불가 (예: abc, 123)
- 이전 비밀번호와 동일 불가

**구현 예시**:

```javascript
const validatePassword = (password) => {
  if (password.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const validConditions = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (validConditions < 3) {
    return '영문 대소문자, 숫자, 특수문자 중 3가지 이상 조합해야 합니다.';
  }

  // 연속된 문자 체크
  for (let i = 0; i < password.length - 2; i++) {
    const code1 = password.charCodeAt(i);
    const code2 = password.charCodeAt(i + 1);
    const code3 = password.charCodeAt(i + 2);

    if (code2 === code1 + 1 && code3 === code2 + 1) {
      return '연속된 문자를 3개 이상 사용할 수 없습니다.';
    }
  }

  return null; // 유효함
};

const handlePasswordChange = async () => {
  // 유효성 검사
  const error = validatePassword(formData.newPassword);
  if (error) {
    alert(error);
    return;
  }

  if (formData.newPassword !== formData.confirmPassword) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

  try {
    const token = localStorage.getItem('access_token');

    const response = await fetch('/api/counselors/me/password', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '비밀번호 변경 실패');
    }

    alert('비밀번호가 변경되었습니다.');

    // 폼 초기화
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    alert(error.message || '비밀번호 변경에 실패했습니다.');
  }
};
```

#### 상담 태그 업데이트

```
PUT /api/counselors/me/tags
```

**요청**:

```json
{
  "tags": ["커리어", "진로", "연애"]
}
```

**응답**:

```json
{
  "success": true,
  "tags": ["커리어", "진로", "연애"],
  "message": "상담 태그가 업데이트되었습니다."
}
```

**태그 제약사항**:

- 최대 3개까지 선택 가능
- 태그는 사전 정의된 목록에서만 선택
- 중복 선택 불가

**구현 예시**:

```javascript
const AVAILABLE_TAGS = ['커리어', '진로', '연애', '대인관계', '가족', '우울', '불안', '스트레스', '자존감', '중독'];

const handleTagSelect = (e) => {
  const value = e.target.value;

  if (!value) return;

  if (formData.selectedTags.length >= 3) {
    alert('상담 태그는 최대 3개까지 선택 가능합니다.');
    return;
  }

  if (formData.selectedTags.includes(value)) {
    alert('이미 선택된 태그입니다.');
    return;
  }

  setFormData({
    ...formData,
    selectedTags: [...formData.selectedTags, value],
  });
};

const handleTagRemove = (tagToRemove) => {
  setFormData({
    ...formData,
    selectedTags: formData.selectedTags.filter((tag) => tag !== tagToRemove),
  });
};

const handleTagsUpdate = async () => {
  try {
    const token = localStorage.getItem('access_token');

    const response = await fetch('/api/counselors/me/tags', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: formData.selectedTags,
      }),
    });

    if (!response.ok) {
      throw new Error('태그 업데이트 실패');
    }

    const data = await response.json();
    alert('상담 태그가 업데이트되었습니다.');
  } catch (error) {
    console.error('태그 업데이트 오류:', error);
    alert('태그 업데이트에 실패했습니다.');
  }
};
```

#### 전체 정보 업데이트 (한 번에)

```
PUT /api/counselors/me
```

**요청**:

```json
{
  "profileImage": "https://example.com/profiles/new-image.jpg",
  "password": "new_password_123!@#", // 선택
  "tags": ["커리어", "진로", "연애"]
}
```

**응답**:

```json
{
  "success": true,
  "message": "정보가 업데이트되었습니다.",
  "counselor": {
    "id": "counselor-001",
    "name": "홍길동",
    "profileImage": "https://example.com/profiles/new-image.jpg",
    "tags": ["커리어", "진로", "연애"],
    "updatedAt": "2026-02-10T10:30:00Z"
  }
}
```

**통합 업데이트 구현 예시**:

```javascript
const handleSubmit = async () => {
  // 유효성 검사
  if (formData.newPassword) {
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
  }

  if (formData.selectedTags.length === 0) {
    if (!window.confirm('상담 태그를 선택하지 않았습니다. 계속하시겠습니까?')) {
      return;
    }
  }

  try {
    const token = localStorage.getItem('access_token');

    const updateData = {
      tags: formData.selectedTags,
    };

    // 프로필 이미지가 변경된 경우만 포함
    if (profileImage && profileImage.startsWith('data:')) {
      updateData.profileImage = profileImage;
    }

    // 비밀번호가 입력된 경우만 포함
    if (formData.newPassword) {
      updateData.password = formData.newPassword;
    }

    const response = await fetch('/api/counselors/me', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '정보 수정 실패');
    }

    const data = await response.json();

    // 성공 모달 표시
    setShowSuccessModal(true);
  } catch (error) {
    console.error('정보 수정 오류:', error);
    alert(error.message || '정보 수정에 실패했습니다.');
  }
};
```

---

## 3. 데이터베이스 스키마

### counselors 테이블

```sql
CREATE TABLE counselors (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_image VARCHAR(500),
  title VARCHAR(200),
  bio TEXT,
  experience TEXT[],
  specialties TEXT[],
  tags VARCHAR(50)[],  -- 최대 3개
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT chk_tags_count CHECK (array_length(tags, 1) <= 3),
  CONSTRAINT chk_rating_range CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_counselors_email ON counselors(email);
CREATE INDEX idx_counselors_tags ON counselors USING GIN(tags);
CREATE INDEX idx_counselors_active ON counselors(is_active);
CREATE INDEX idx_counselors_rating ON counselors(rating DESC);
```

### counselor_tags 테이블 (태그 마스터)

```sql
CREATE TABLE counselor_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 초기 태그 데이터
INSERT INTO counselor_tags (name, display_name, category) VALUES
('career', '커리어', '직업'),
('job', '진로', '직업'),
('love', '연애', '관계'),
('relationship', '대인관계', '관계'),
('family', '가족', '관계'),
('depression', '우울', '심리'),
('anxiety', '불안', '심리'),
('stress', '스트레스', '심리'),
('self_esteem', '자존감', '심리'),
('addiction', '중독', '심리');
```

### password_history 테이블 (비밀번호 이력 - 재사용 방지)

```sql
CREATE TABLE password_history (
  id SERIAL PRIMARY KEY,
  counselor_id VARCHAR(50) REFERENCES counselors(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_history_counselor ON password_history(counselor_id);

-- 최근 5개 비밀번호만 보관하는 트리거
CREATE OR REPLACE FUNCTION limit_password_history()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM password_history
  WHERE counselor_id = NEW.counselor_id
  AND id NOT IN (
    SELECT id FROM password_history
    WHERE counselor_id = NEW.counselor_id
    ORDER BY created_at DESC
    LIMIT 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_limit_password_history
AFTER INSERT ON password_history
FOR EACH ROW
EXECUTE FUNCTION limit_password_history();
```

---

## 4. 보안 고려사항

### 인증 및 권한

1. **JWT 토큰 인증**

   - Access Token: 짧은 유효기간 (15분)
   - Refresh Token: 긴 유효기간 (7일)
   - HttpOnly 쿠키에 저장

2. **권한 확인**
   - SYSTEM role 확인
   - 본인 정보만 수정 가능
   - Middleware에서 권한 체크

```javascript
// 서버 미들웨어 예시
const verifyCounselorAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'SYSTEM') {
      return res.status(403).json({ error: '상담사 권한이 필요합니다.' });
    }

    req.counselorId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};
```

### 비밀번호 보안

1. **해싱**: bcrypt (salt rounds: 10)
2. **이전 비밀번호 재사용 방지**: 최근 5개 확인
3. **비밀번호 변경 알림**: 이메일 발송

```javascript
const bcrypt = require('bcrypt');

// 비밀번호 해싱
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// 비밀번호 확인
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// 이전 비밀번호 확인
const checkPasswordHistory = async (counselorId, newPassword) => {
  const history = await db.query(
    'SELECT password_hash FROM password_history WHERE counselor_id = $1 ORDER BY created_at DESC LIMIT 5',
    [counselorId]
  );

  for (const record of history.rows) {
    if (await bcrypt.compare(newPassword, record.password_hash)) {
      return false; // 재사용 불가
    }
  }

  return true; // 사용 가능
};
```

### 이미지 업로드 보안

1. **파일 크기 제한**: 5MB
2. **파일 형식 제한**: jpg, png, gif, webp
3. **파일명 난수화**: UUID 사용
4. **이미지 최적화**: 압축 및 리사이징

```javascript
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('지원하지 않는 파일 형식입니다.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// 이미지 처리
const processImage = async (buffer) => {
  // 원본 (800x800 리사이징)
  const resized = await sharp(buffer).resize(800, 800, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();

  // 썸네일 (200x200)
  const thumbnail = await sharp(buffer).resize(200, 200, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();

  return { resized, thumbnail };
};

// 업로드 핸들러
app.post('/api/counselors/me/profile-image', verifyCounselorAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    const { resized, thumbnail } = await processImage(req.file.buffer);

    const filename = `${uuidv4()}.jpg`;
    const thumbFilename = `${uuidv4()}_thumb.jpg`;

    // S3 또는 로컬 저장소에 업로드
    const imageUrl = await uploadToStorage(filename, resized);
    const thumbnailUrl = await uploadToStorage(thumbFilename, thumbnail);

    // DB 업데이트
    await db.query('UPDATE counselors SET profile_image = $1, updated_at = NOW() WHERE id = $2', [
      imageUrl,
      req.counselorId,
    ]);

    res.json({
      success: true,
      imageUrl,
      thumbnailUrl,
    });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    res.status(500).json({ error: '이미지 업로드에 실패했습니다.' });
  }
});
```

---

## 5. 에러 처리

### 에러 코드 정의

```javascript
const ERROR_CODES = {
  // 인증
  UNAUTHORIZED: { code: 401, message: '인증이 필요합니다.' },
  FORBIDDEN: { code: 403, message: '권한이 없습니다.' },
  INVALID_TOKEN: { code: 401, message: '유효하지 않은 토큰입니다.' },

  // 비밀번호
  INVALID_PASSWORD: { code: 400, message: '현재 비밀번호가 일치하지 않습니다.' },
  WEAK_PASSWORD: { code: 400, message: '비밀번호가 보안 요구사항을 충족하지 않습니다.' },
  PASSWORD_REUSE: { code: 400, message: '최근 사용한 비밀번호는 재사용할 수 없습니다.' },

  // 태그
  TAG_LIMIT_EXCEEDED: { code: 400, message: '태그는 최대 3개까지 선택 가능합니다.' },
  INVALID_TAG: { code: 400, message: '유효하지 않은 태그입니다.' },

  // 이미지
  FILE_TOO_LARGE: { code: 400, message: '파일 크기는 5MB 이하만 가능합니다.' },
  INVALID_FILE_TYPE: { code: 400, message: '지원하지 않는 파일 형식입니다.' },

  // 기타
  NOT_FOUND: { code: 404, message: '리소스를 찾을 수 없습니다.' },
  SERVER_ERROR: { code: 500, message: '서버 오류가 발생했습니다.' },
};
```

### 클라이언트 에러 처리

```javascript
const handleApiError = (error) => {
  if (error.response) {
    // 서버 응답 있음
    switch (error.response.status) {
      case 401:
        // 로그인 페이지로 리다이렉트
        localStorage.clear();
        window.location.href = '/login';
        break;
      case 403:
        alert('권한이 없습니다.');
        break;
      case 400:
        alert(error.response.data.message || '잘못된 요청입니다.');
        break;
      case 500:
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        break;
      default:
        alert('오류가 발생했습니다.');
    }
  } else if (error.request) {
    // 요청은 보냈지만 응답 없음
    alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
  } else {
    // 기타 오류
    alert('오류가 발생했습니다.');
  }
};
```

---

## 6. 구현 체크리스트

### Phase 1: 상담사 마이페이지

- [x] 마이페이지 UI (모바일/PC)
- [x] 3개 메뉴 버튼
- [ ] 프로필 조회 API 연동
- [ ] 로그아웃 API 연동
- [ ] 로딩 상태 표시

### Phase 2: 정보 수정 페이지

- [x] 정보 수정 UI (모바일/PC)
- [x] 프로필 이미지 업로드 UI
- [x] 비밀번호 변경 UI
- [x] 상담 태그 선택 UI
- [ ] 이미지 업로드 API 연동
- [ ] 비밀번호 변경 API 연동
- [ ] 태그 업데이트 API 연동
- [ ] 유효성 검사 구현

### Phase 3: 모달

- [x] 취소 확인 모달 UI
- [x] 정보 수정 완료 모달 UI
- [x] 모달 액션 연결

### Phase 4: 추가 기능

- [ ] 프로필 이미지 크롭 기능
- [ ] 비밀번호 강도 표시
- [ ] 실시간 유효성 검사
- [ ] 변경 이력 로그

---

## 7. 테스트 시나리오

### 상담사 마이페이지

1. 로그인 후 마이페이지 접근
2. 상담사 이름 표시 확인
3. 각 메뉴 버튼 클릭 시 올바른 페이지로 이동
4. 로그아웃 클릭 시 확인 모달 표시
5. 로그아웃 후 홈으로 리다이렉트 확인

### 정보 수정

1. 프로필 이미지 업로드

   - 5MB 이하 이미지 업로드 성공
   - 5MB 초과 이미지 업로드 실패
   - 비이미지 파일 업로드 실패
   - 미리보기 정상 표시

2. 비밀번호 변경

   - 8자 미만 입력 시 오류
   - 조건 미충족 시 오류 (영문+숫자+특수문자)
   - 비밀번호 불일치 시 오류
   - 정상 변경 시 성공 모달

3. 상담 태그

   - 3개까지 선택 가능
   - 4개 선택 시 오류
   - 태그 삭제 기능
   - 변경 사항 저장

4. 취소 기능
   - 취소 버튼 클릭 시 확인 모달
   - "취소하기" 선택 시 이전 페이지로 이동
   - "계속 수정하기" 선택 시 모달 닫힘

---

## 8. 성능 최적화

### 이미지 최적화

- WebP 형식 사용
- Lazy Loading
- CDN 활용
- 썸네일 생성

### API 호출 최적화

- 디바운싱 (태그 검색)
- 낙관적 업데이트 (UI 먼저 업데이트)
- 에러 발생 시 롤백

### 캐싱

- 프로필 정보 캐싱 (5분)
- 태그 목록 캐싱 (1시간)
- 이미지 브라우저 캐싱

---

## 참고 자료

- JWT 인증: https://jwt.io/
- bcrypt: https://www.npmjs.com/package/bcrypt
- Multer: https://www.npmjs.com/package/multer
- Sharp: https://sharp.pixelplumbing.com/
- React Hook Form: https://react-hook-form.com/
