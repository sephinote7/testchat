# 🔐 Supabase 실제 로그인 가이드

이 가이드는 더미 로그인 대신 실제 Supabase 인증을 사용하여 로그인하는 방법을 설명합니다.

---

## 📋 목차

1. [더미 로그인 비활성화](#1-더미-로그인-비활성화)
2. [Supabase 회원가입](#2-supabase-회원가입)
3. [Supabase 로그인](#3-supabase-로그인)
4. [역할(Role) 설정](#4-역할role-설정)
5. [문제 해결](#5-문제-해결)

---

## 1. 더미 로그인 비활성화

현재 시스템은 더미 로그인이 활성화되어 있습니다. 실제 Supabase 로그인을 사용하려면:

### Step 1: localStorage 초기화

브라우저 개발자 도구 콘솔(`F12`)에서:

```javascript
localStorage.removeItem('dummyUser');
window.location.reload();
```

### Step 2: 로그아웃 상태 확인

이제 로그아웃 상태가 되어야 합니다. 헤더에 "로그인" 버튼이 보이는지 확인하세요.

---

## 2. Supabase 회원가입

### 방법 A: 웹 UI 사용 (추천)

1. 로그인 페이지로 이동: `http://localhost:5173/member/signin`
2. "회원가입" 링크 클릭 또는 `/member/signup` 페이지로 직접 이동
3. 회원가입 폼 작성:
   - 이메일 (예: `test@example.com`)
   - 비밀번호 (최소 6자 이상)
   - 닉네임, 생년월일, MBTI 등 추가 정보
4. "회원가입" 버튼 클릭
5. Supabase에서 확인 이메일이 발송됩니다

### 방법 B: Supabase 대시보드 사용

1. Supabase 프로젝트 대시보드에 접속
2. `Authentication` > `Users` 메뉴로 이동
3. `Add user` 버튼 클릭
4. 이메일과 비밀번호 입력
5. `Create user` 버튼 클릭
6. **중요**: User 생성 후 `user_metadata`에 역할 정보를 추가해야 합니다:
   ```json
   {
     "role": "USER",
     "nickname": "테스트유저"
   }
   ```

---

## 3. Supabase 로그인

### 웹 UI에서 로그인:

1. 로그인 페이지로 이동: `http://localhost:5173/member/signin`
2. 이메일과 비밀번호 입력
3. "로그인" 버튼 클릭
4. 로그인 성공 시 자동으로 메인 페이지로 이동

### 로그인 흐름:

```
SignIn.jsx → useAuth.signIn() → supabase.auth.signInWithPassword()
→ Supabase 인증 성공 → useAuth가 세션 감지 → user 상태 업데이트
```

---

## 4. 역할(Role) 설정

Supabase 사용자의 역할은 `user_metadata.role`에 저장됩니다.

### 4-1. 회원가입 시 역할 설정

회원가입 시 역할은 자동으로 `USER`로 설정됩니다.

`src/hooks/useAuth.js`의 `signUp` 함수:
```javascript
const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: metadata.role || 'USER',  // 기본값: USER
        nickname: metadata.nickname || '',
        // ...
      },
    },
  });
};
```

### 4-2. 기존 사용자 역할 변경 (Supabase 대시보드)

상담사나 관리자 계정을 만들려면:

1. Supabase 대시보드 접속
2. `Authentication` > `Users` 메뉴
3. 사용자 선택 후 `...` 메뉴 클릭
4. `Edit user` 선택
5. `User Metadata` 섹션에서:

**일반 유저:**
```json
{
  "role": "USER",
  "nickname": "일반사용자"
}
```

**상담사:**
```json
{
  "role": "COUNSELOR",
  "nickname": "상담사"
}
```

**관리자:**
```json
{
  "role": "ADMIN",
  "nickname": "관리자"
}
```

6. `Save` 버튼 클릭
7. 해당 계정으로 다시 로그인

### 4-3. SQL로 역할 변경 (고급)

Supabase SQL Editor에서:

```sql
-- 특정 이메일의 역할을 COUNSELOR로 변경
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "COUNSELOR"}'::jsonb
WHERE email = 'counselor@example.com';

-- 특정 이메일의 역할을 ADMIN으로 변경
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "ADMIN"}'::jsonb
WHERE email = 'admin@example.com';
```

---

## 5. 문제 해결

### 문제 1: 로그인해도 더미 유저로 표시됨

**원인**: localStorage에 dummyUser가 남아있어서 실제 로그인보다 우선순위가 높음

**해결**:
```javascript
// 콘솔에서 실행
localStorage.removeItem('dummyUser');
window.location.reload();
```

### 문제 2: 역할이 제대로 반영되지 않음

**원인**: user_metadata에 role이 없거나 잘못 설정됨

**해결**:
1. Supabase 대시보드에서 user_metadata 확인
2. role 필드가 'USER', 'COUNSELOR', 'ADMIN' 중 하나인지 확인
3. 대소문자 정확히 일치하는지 확인

### 문제 3: 이메일 확인이 필요하다고 나옴

**원인**: Supabase 프로젝트 설정에서 이메일 확인이 활성화됨

**해결 방법 A - 이메일 확인 비활성화 (개발용)**:
1. Supabase 대시보드 접속
2. `Authentication` > `Providers` > `Email`
3. `Confirm email` 옵션 비활성화
4. `Save` 버튼 클릭

**해결 방법 B - 이메일 확인 링크 사용**:
1. 회원가입 후 이메일 확인
2. Supabase에서 보낸 확인 링크 클릭
3. 이메일 확인 완료 후 로그인

**해결 방법 C - 수동으로 이메일 확인 처리**:
Supabase 대시보드에서:
1. `Authentication` > `Users`
2. 사용자 선택
3. `Email Confirmed` 옵션 체크
4. `Save`

### 문제 4: 로그인 후 권한이 없다고 나옴

**원인**: 역할이 올바르게 설정되지 않았거나 ProtectedRoute가 해당 역할을 허용하지 않음

**해결**:
1. 콘솔에서 현재 사용자 정보 확인:
```javascript
supabase.auth.getUser().then(({ data }) => console.log(data.user.user_metadata));
```
2. role 값 확인 및 수정

---

## 🎯 전체 프로세스 요약

### 개발 환경에서 테스트하기:

#### 방법 1: 더미 로그인 사용 (현재 방식)
- 코드 수정 없이 localStorage로 역할 전환
- 빠른 테스트에 유용
- `ROLE_SWITCHING_GUIDE.md` 참고

#### 방법 2: 실제 Supabase 로그인 사용
1. localStorage 초기화: `localStorage.removeItem('dummyUser')`
2. Supabase에 테스트 계정 생성 (각 역할별로)
3. 로그인 페이지에서 실제 로그인

---

## 📝 테스트 계정 예시

개발 환경에서 사용할 테스트 계정을 Supabase에 미리 생성해두면 편리합니다:

| 역할 | 이메일 | 비밀번호 | 용도 |
|------|--------|----------|------|
| USER | `user@test.com` | `test1234` | 일반 유저 테스트 |
| COUNSELOR | `counselor@test.com` | `test1234` | 상담사 기능 테스트 |
| ADMIN | `admin@test.com` | `test1234` | 관리자 기능 테스트 |

**주의**: 프로덕션 환경에서는 강력한 비밀번호를 사용하세요!

---

## 🔧 useAuth.js 동작 원리

현재 useAuth는 다음 우선순위로 동작합니다:

1. **Supabase 세션 확인**
   - 실제 로그인된 Supabase 세션이 있으면 사용
   - `user_metadata.role`에서 역할 가져오기

2. **localStorage의 dummyUser 확인**
   - Supabase 세션이 없으면 localStorage 확인
   - dummyUser가 있으면 해당 정보 사용

3. **기본값**
   - 둘 다 없으면 useAuth.js의 기본 설정값 사용

### 실제 로그인으로 완전히 전환하려면:

`src/hooks/useAuth.js` 수정:

```javascript
// 현재 (더미 로그인 우선):
if (session?.user) {
  // Supabase 로그인 사용
} else {
  // localStorage의 dummyUser 사용 ← 이 부분 때문에 더미 로그인 우선
}
```

실제 로그인만 사용하려면 localStorage 체크 로직을 제거하면 됩니다.

---

## ⚡ 빠른 참고

### 더미 로그인 → 실제 로그인 전환:
```javascript
localStorage.removeItem('dummyUser');
window.location.href = '/member/signin';
```

### 실제 로그인 → 더미 로그인 전환:
```javascript
localStorage.setItem('dummyUser', '{"isLogin":true,"role":"USER","email":"user@test.com","id":"user-123","nickname":"일반사용자"}');
location.reload();
```

### 현재 인증 상태 확인:
```javascript
// 더미 로그인 확인
console.log('Dummy User:', JSON.parse(localStorage.getItem('dummyUser') || 'null'));

// Supabase 세션 확인
supabase.auth.getSession().then(({ data }) => console.log('Supabase Session:', data.session));
```

---

## 📞 도움이 필요하면

- Supabase 설정 확인: `.env` 파일의 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY` 확인
- 네트워크 오류: 브라우저 개발자 도구의 Network 탭에서 API 호출 확인
- 인증 오류: Console 탭에서 오류 메시지 확인

---

**작성일**: 2026.02.10  
**버전**: 1.0  
**관련 파일**: `src/hooks/useAuth.js`, `src/pages/common/member/SignIn.jsx`
