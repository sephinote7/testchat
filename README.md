# ![로고(마크)](https://crrxqwzygpifxmzxszdz.supabase.co/storage/v1/object/public/site_img/h_logo.png) AI 및 전문 상담 시스템 고민순삭 (GMSS) – Frontend (`testchat`)

**제작 기간**: 2026-01-07 ~ 2026-03-17

React 기반 사용자·상담사·관리자용 웹 프론트엔드입니다.  
AI 상담, 전문 상담(채팅/화상), 게시판, 마이페이지, 관리자 대시보드 등 **모든 화면과 UX**를 담당합니다.

---

## 👥 Who are we?

### 이하늘 (팀장)

- 상담 신청 플로우
- 로그인 / 회원가입
- 상담 수락 / 거절 UI
- 상담사·관리자 화면 설계
- 프로젝트 일정 관리

### 박종석

- DB 설계
- Query문 작성

### 임윤섭

- 로고 제작
- 홈페이지 디자인(메인·공통 컴포넌트)
- Entity 설계 협업
- 영상 제작, PPT 제작

### 김태길

- 챗봇, AI 상담, 화상 상담, 채팅 상담 화면 및 연동
- 공통 레이아웃 및 일부 홈페이지 디자인
- CI/CD 파이프라인 연동

### 강성진

- 게시판·댓글 CRUD 화면
- 카카오맵 기반 지원센터 지도
- 좋아요/싫어요, 민감 키워드 감지 UI
- 디자인 시안 구현

---

## 🧩 Overview

`testchat` 프로젝트는 고민순삭 서비스의 **React 프론트엔드**입니다.

- **유저**: AI 상담, 상담사 상담(채팅/화상), 게시판, 마이페이지 이용
- **상담사**: 상담 예약 관리, 실시간 채팅·화상 상담, 수익/상담 통계
- **관리자**: 상담 건수·매출·수수료·위험 키워드 현황 대시보드

전체 플로우는 **게시판 → 상담 예약 → 실시간 상담 → 요약 및 기록**으로 이어지며,  
사용자는 여러 화면을 오가도 흐름이 끊기지 않도록 설계했습니다.

---

## 🛠 기술 스택

<div>

<img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=white"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/Zustand-000000?style=flat-square"/>
<img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white"/>
<img src="https://img.shields.io/badge/PeerJS-FF6B6B?style=flat-square"/>
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white"/>
<img src="https://img.shields.io/badge/STOMP-000000?style=flat-square"/>
<img src="https://img.shields.io/badge/SockJS-000000?style=flat-square"/>
<img src="https://img.shields.io/badge/TossPayments-0064FF?style=flat-square"/>
<img src="https://img.shields.io/badge/Kakao_Maps-FFCD00?style=flat-square"/>

</div>

### 주요 라이브러리 버전 (프론트)

- **React** 19.2.0
- **Vite** 7.2.4
- **React Router DOM** 7.13.1
- **Tailwind CSS** 4.1.18
- **Zustand** 5.0.11
- **Axios** 1.13.2
- **Supabase JS** 2.93.3
- **PeerJS** 1.5.5
- **STOMP / SockJS**
- **TossPayments SDK** 2.5.0
- **Kakao Maps SDK** 1.2.0

---

## 🧱 주요 도메인별 기능

### 1. 인증 / 공통 레이아웃

- JWT 기반 로그인 / 회원가입 / 자동 로그인
- 역할별 라우팅(USER / SYSTEM / ADMIN)
- 헤더·하단 네비게이션 / 플로팅 챗봇 공통 레이아웃

### 2. 상담

- **AI 상담 (`AIChat`)**
  - Spring + `testchatpy` FastAPI 연동
  - 실시간 대화 및 종료 후 요약/기록 저장
- **채팅 상담 (`CounselorChat`)**
  - Supabase Realtime 기반 1:1 텍스트 상담
  - 상담 상태(C/D)·요약 저장 연동
- **화상 상담 (`VisualChat`)**
  - PeerJS + WebRTC로 1:1 화상 통화
  - 통화 중 텍스트 채팅, 통화 종료 후 녹화 다운로드
  - 음성(STT) + 채팅을 `testchatpy` 로 보내 요약 생성

### 3. 상담사 찾기 / 예약

- 상담사 리스트 / 상세 / 리뷰
- 예약 가능한 시간 표시, 예약/취소/수정 플로우
- 상담사 마이페이지에서 예약 승인/거절·스케줄 관리

### 4. 커뮤니티 게시판

- 공지 / 자유 / MBTI 게시판
- 글/댓글 CRUD, 이미지 첨부, 좋아요/싫어요
- 실시간 인기글, 기간별 인기글, 추천 글 노출

### 5. 위험 키워드 감지 UI

- Supabase `bbs_risk`, `sensitive_keywords` 연동
- 관리자/상담사 페이지에서 위험 게시글 모니터링

### 6. 마이페이지 / 포인트 / 결제

- 회원정보 수정, 작성 글/댓글, 상담 내역(예약/진행/완료)
- 포인트 충전(토스페이먼츠), 사용 내역

### 7. 플로팅 챗봇 ‘순삭이’

- 사이트 이용 안내 챗봇 (FastAPI `site-chat` 연동)
- 상담 알림: 진행 예정/진행 중 상담 목록 + 바로 이동

---

## 🚀 로컬 실행

```bash
cd testchat
npm install
npm run dev   # http://localhost:5173
```
