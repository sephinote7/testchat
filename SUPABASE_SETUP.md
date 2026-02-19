# Supabase 인증 설정 가이드

이 프로젝트는 Supabase를 사용하여 사용자 인증(로그인/회원가입)을 처리합니다.

## 1. Supabase 프로젝트 설정

### 1.1 Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 및 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 설정
4. 프로젝트 생성 완료 대기

### 1.2 API 키 확인

1. 프로젝트 대시보드에서 `Settings` > `API` 메뉴로 이동
2. 다음 정보 복사:
   - `Project URL` (예: https://xxxxx.supabase.co)
   - `anon public` 키

## 2. 환경 변수 설정

`.env` 파일을 열고 Supabase 정보를 입력하세요:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. 사용자 테이블 설정 (선택사항)

추가 사용자 정보를 저장하려면 Supabase에서 테이블을 생성할 수 있습니다:

```sql
-- users 테이블 생성
CREATE TABLE public.users (
  id uuid REFERENCES auth.users PRIMARY KEY,
  email text,
  nickname text,
  birthdate text,
  mbti text,
  introduction text,
  role text DEFAULT 'USER',
  created_at timestamp with time zone DEFAULT now()
);

-- RLS(Row Level Security) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 정책 설정: 자신의 데이터만 읽기/쓰기 가능
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## 4. 사용자 역할(Role) 설정

현재 시스템은 3가지 역할을 지원합니다:

- `USER`: 일반 사용자
- `SYSTEM`: 상담사
- `ADMIN`: 관리자

회원가입 시 기본적으로 `USER` 역할이 할당됩니다. 역할을 변경하려면:

1. Supabase 대시보드 > `Authentication` > `Users` 메뉴
2. 사용자 선택 후 `User Metadata` 편집
3. `role` 필드에 원하는 역할 입력 (USER, SYSTEM, ADMIN)

## 5. 이메일 인증 설정

기본적으로 Supabase는 회원가입 시 이메일 인증을 요구합니다.

### 개발 중 이메일 인증 비활성화 (선택사항)

1. Supabase 대시보드 > `Authentication` > `Settings`
2. `Enable email confirmations` 옵션 비활성화

## 6. 로컬 개발 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 7. 주요 기능

### 로그인

- 경로: `/member/signin`
- 이메일과 비밀번호로 로그인

### 회원가입

- 경로: `/member/signup`
- 필수 정보: 이메일, 비밀번호, 닉네임, 생년월일
- 선택 정보: MBTI, 자기소개

### 로그아웃

- 마이페이지에서 로그아웃 버튼 클릭

## 8. 문제 해결

### "Invalid API key" 오류

- `.env` 파일의 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`가 올바른지 확인
- 개발 서버를 재시작 (`npm run dev`)

### 회원가입 후 로그인이 안 됨

- Supabase 대시보드에서 이메일 인증이 활성화되어 있는지 확인
- 이메일에서 인증 링크 클릭

### 사용자 역할이 제대로 표시되지 않음

- Supabase의 User Metadata에 `role` 필드가 설정되어 있는지 확인

## 9. 보안 참고사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요
- Supabase RLS(Row Level Security) 정책을 반드시 설정하세요
