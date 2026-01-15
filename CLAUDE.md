# CLAUDE.md - 껄무새 프로젝트 가이드

## 프로젝트 개요

껄무새는 한국/미국 주식 투자자를 위한 웹 기반 배당금 계산기 + 백테스팅 툴입니다.

---

## 핵심 원칙

### 1. 프론트엔드 중심 아키텍처
- 주식 데이터는 **프론트엔드 API Routes**에서 처리 (yahoo-finance2)
- 사용자 데이터만 **백엔드**에서 관리 (인증, 포트폴리오, 관심종목)
- 무료 API 우선 (yahoo-finance2 - API 키 불필요)

### 2. 모바일 퍼스트
- 토스 증권 스타일 UI
- 카드 기반 레이아웃
- 큰 숫자, 작은 라벨

### 3. 한국 사용자 최적화
- 한글 UI
- 원화 기준 계산
- 수익 빨강(#F04251), 손실 파랑(#2B83F6) - 한국식

---

## 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS (다크모드 지원)
- **Charts**: Recharts
- **State**: Zustand (persist middleware)
- **Data**: yahoo-finance2

### Backend
- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT + OAuth 2.0 (Google, Kakao)
- **Security**: bcrypt, Helmet, Rate Limiting, class-validator

---

## 프로젝트 구조

```
money/
├── frontend/                    # Next.js 프론트엔드
│   ├── app/
│   │   ├── page.tsx             # 메인 대시보드
│   │   ├── calculator/          # 배당금 계산기
│   │   ├── backtest/            # 백테스팅
│   │   ├── calendar/            # 경제 캘린더
│   │   ├── mypage/              # 마이페이지
│   │   ├── mystock/             # 관심종목
│   │   ├── stock/               # 종목 상세
│   │   ├── login/               # 로그인
│   │   ├── signup/              # 회원가입
│   │   ├── notice/              # 공지사항
│   │   ├── qna/                 # Q&A
│   │   └── api/                 # Next.js API Routes (주식 데이터)
│   │       ├── stock/[ticker]/  # 주식 정보
│   │       ├── market/          # 시장 지표
│   │       ├── exchange-rate/   # 환율
│   │       ├── history/[ticker]/# 과거 주가
│   │       ├── calendar/        # 경제 캘린더
│   │       ├── search/          # 종목 검색
│   │       └── og/              # OG 이미지 생성
│   ├── lib/
│   │   ├── yahoo.ts             # yahoo-finance2 래퍼
│   │   └── utils.ts             # 유틸리티 함수
│   ├── stores/
│   │   ├── useCalculatorStore.ts # 포트폴리오 상태
│   │   └── useThemeStore.ts     # 테마 상태
│   ├── types/                   # TypeScript 타입
│   └── data/
│       └── stocks.json          # 한국/미국 종목 목록
│
├── backend/                     # NestJS 백엔드
│   ├── src/
│   │   ├── auth/                # 인증 모듈
│   │   │   ├── strategies/      # JWT, Google, Kakao 전략
│   │   │   ├── guards/          # 인증 가드 (JwtAuthGuard, AdminGuard)
│   │   │   ├── decorators/      # Public, CurrentUser
│   │   │   └── dto/             # RegisterDto, LoginDto
│   │   ├── users/               # 사용자 관리
│   │   ├── portfolio/           # 포트폴리오 CRUD
│   │   ├── watchlist/           # 관심종목 CRUD
│   │   ├── schedule/            # 일정 CRUD
│   │   ├── inquiry/             # 문의 관리 (관리자 답변 기능 포함)
│   │   ├── notice/              # 공지사항 (관리자 CRUD)
│   │   ├── ipo/                 # 공모주/IPO 관리 (관리자 CRUD)
│   │   ├── prisma/              # DB 연결
│   │   └── common/              # 공통 모듈
│   │       └── email/           # 이메일 발송 (Nodemailer)
│   ├── prisma/
│   │   └── schema.prisma        # DB 스키마
│   └── .env                     # 환경변수
│
├── README.md
└── CLAUDE.md
```

---

## API 엔드포인트

### 프론트엔드 API (Next.js) - 주식 데이터

```
GET /api/stock/[ticker]      - 주식 정보 (가격, 배당)
GET /api/market              - 시장 지표 (VIX, 지수, 환율)
GET /api/exchange-rate       - USD/KRW 환율
GET /api/exchange-rate/history - 환율 히스토리
GET /api/history/[ticker]    - 과거 주가 (백테스팅용)
GET /api/calendar            - 경제 캘린더
GET /api/search              - 종목 검색
GET /api/og                  - 공유 이미지 생성
```

### 백엔드 API (NestJS) - 사용자 데이터

```
# 인증
POST   /api/auth/register    - 회원가입
POST   /api/auth/login       - 로그인
POST   /api/auth/logout      - 로그아웃
POST   /api/auth/refresh     - 토큰 갱신
GET    /api/auth/me          - 내 정보
GET    /api/auth/google      - 구글 OAuth
GET    /api/auth/kakao       - 카카오 OAuth

# 사용자
PATCH  /api/users/profile    - 프로필 수정
DELETE /api/users/account    - 회원 탈퇴

# 포트폴리오
GET    /api/portfolio        - 목록 조회
GET    /api/portfolio/summary - 요약
POST   /api/portfolio        - 추가
PATCH  /api/portfolio/:id    - 수정
DELETE /api/portfolio/:id    - 삭제

# 관심종목
GET    /api/watchlist        - 목록 조회
POST   /api/watchlist        - 추가
DELETE /api/watchlist/:ticker - 삭제

# 일정
GET    /api/schedule         - 목록 조회
GET    /api/schedule/upcoming - 다가오는 일정
POST   /api/schedule         - 추가
PATCH  /api/schedule/:id     - 수정
DELETE /api/schedule/:id     - 삭제

# 문의
GET    /api/inquiry          - 목록 조회
POST   /api/inquiry          - 등록
GET    /api/inquiry/:id      - 상세
GET    /api/inquiry/count    - 문의 수 조회

# 문의 (관리자)
GET    /api/inquiry/admin/all     - 모든 문의 목록 조회 (관리자)
GET    /api/inquiry/admin/:id     - 문의 상세 조회 (관리자)
PATCH  /api/inquiry/:id/answer    - 문의 답변 (관리자)

# 공지사항
GET    /api/notice           - 목록 조회
GET    /api/notice/latest    - 최신
GET    /api/notice/:id       - 상세

# 공지사항 (관리자)
POST   /api/notice           - 공지사항 작성 (관리자)
PATCH  /api/notice/:id       - 공지사항 수정 (관리자)
DELETE /api/notice/:id       - 공지사항 삭제 (관리자)

# 공모주(IPO)
GET    /api/ipo              - IPO 목록 조회
GET    /api/ipo/upcoming     - 다가오는 IPO 조회
GET    /api/ipo/calendar     - 캘린더용 IPO 조회 (날짜 범위)
GET    /api/ipo/:id          - IPO 상세 조회

# 공모주(IPO) (관리자)
POST   /api/ipo              - IPO 추가 (관리자)
PATCH  /api/ipo/:id          - IPO 수정 (관리자)
DELETE /api/ipo/:id          - IPO 삭제 (관리자)
```

---

## 티커 형식

```typescript
// 미국 주식
"AAPL"      // Apple
"MSFT"      // Microsoft
"SCHD"      // Schwab US Dividend ETF

// 한국 주식 (yahoo-finance2)
"005930.KS" // 삼성전자
"000660.KS" // SK하이닉스

// 지수
"^GSPC"     // S&P 500
"^KS11"     // KOSPI
"^KQ11"     // KOSDAQ
"^VIX"      // VIX (공포지수)
```

---

## 디자인 시스템

### 색상
```css
/* 라이트 모드 */
--background: #FFFFFF;
--card: #F5F5F5;
--text: #1A1A1A;

/* 다크 모드 */
--background: #121212;
--card: #1E1E1E;
--text: #FFFFFF;

/* 공통 */
--profit: #F04251;   /* 수익 - 빨강 */
--loss: #2B83F6;     /* 손실 - 파랑 */
--neutral: #888888;  /* 중립 - 회색 */
```

### 타이포그래피
- 숫자 (가격, 수익률): 32-48px, 굵게
- 라벨: 12-14px, 회색
- 본문: 16px

### 간격
- 카드 내부: 16px
- 카드 간격: 12px
- 라운드 코너: 12-16px

---

## 공포/탐욕 기준

### VIX (미국)
| 범위 | 상태 | 색상 | 문구 |
|------|------|------|------|
| < 15 | 탐욕 | 초록 | "시장이 낙관적이에요" |
| 15-20 | 중립 | 회색 | "평온한 장세입니다" |
| 20-30 | 불안 | 노랑 | "긴장감이 감돌아요" |
| > 30 | 공포 | 빨강 | "공포에 질린 시장" |

### VKOSPI (한국)
동일한 기준 적용

---

## 개발 명령어

### 프론트엔드
```bash
cd frontend
npm install
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 빌드
npm run lint         # 린트
```

### 백엔드
```bash
cd backend
npm install
npx prisma migrate dev --name init   # DB 마이그레이션
npm run start:dev    # 개발 서버 (localhost:3001)
npm run build        # 빌드
```

---

## 환경변수 설정

### backend/.env
```env
# Database
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/ggeulmuse"

# JWT
JWT_SECRET="32자-이상-랜덤-문자열"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# Kakao OAuth
KAKAO_CLIENT_ID="xxx"
KAKAO_CLIENT_SECRET="xxx"
KAKAO_CALLBACK_URL="http://localhost:3001/api/auth/kakao/callback"

# Server
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=앱비밀번호16자리
SMTP_FROM="껄무새 <your-email@gmail.com>"
```

### frontend/.env.local (필요 시)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 주의사항

1. **API 에러 처리**: yahoo-finance2는 비공식 API이므로 항상 try-catch
2. **캐싱**: 환율/지수는 5분, 환율 히스토리는 1시간 캐싱
3. **한국 배당**: 연간/반기/분기 배당 주기가 다양함
4. **면책조항**: 모든 결과 화면에 표시 필수
5. **인증**: 사용자 데이터 API는 JWT 토큰 필수
6. **OAuth**: 사업자 등록 없이 개인도 Google/Kakao OAuth 사용 가능

---

## 보안 구현 사항

- [x] bcrypt 비밀번호 해싱 (saltRounds: 12)
- [x] JWT Access Token 15분, Refresh Token 7일
- [x] 토큰 블랙리스트 (로그아웃 시)
- [x] Rate Limiting (1초 10개, 1분 100개)
- [x] Helmet HTTP 헤더 보안
- [x] CORS 프론트엔드 도메인만 허용
- [x] class-validator 입력값 검증
- [x] 로그인 기록 저장
- [x] 회원 탈퇴 시 데이터 삭제 (30일 후 완전 삭제)

---

## 현재 구현 상태

### Frontend
- [x] 메인 대시보드 (한국/미국 시장 동시 표시)
- [x] 배당금 계산기
- [x] 백테스팅 (차트 포함)
- [x] 경제 캘린더 (금통위/FOMC + IPO 통합)
- [x] 마이페이지 (개인 일정 + 경제 일정 통합 캘린더)
- [x] 로그인/회원가입 (백엔드 연동 완료)
- [x] 공지사항/Q&A (관리자 CRUD UI 포함)
- [x] 다크/라이트 모드
- [x] 백엔드 연동 (로그인, 포트폴리오, 관심종목, 일정)

### Backend
- [x] 프로젝트 셋업 (NestJS, Prisma, PostgreSQL)
- [x] 인증 (JWT, Google OAuth, Kakao OAuth)
- [x] 사용자 관리 (프로필, 탈퇴)
- [x] 포트폴리오 CRUD
- [x] 관심종목 CRUD
- [x] 일정 CRUD
- [x] 문의 관리 (관리자 답변 기능 포함)
- [x] 공지사항 (관리자 CRUD)
- [x] 공모주/IPO 관리 (관리자 CRUD)
- [x] 관리자 권한 시스템 (Role enum, AdminGuard)
- [x] 이메일 인증 발송 (Gmail SMTP, Nodemailer)
- [ ] Redis 캐싱 (선택)
- [ ] 한투 API 실시간 시세 (선택)

### 배포
- [x] 프론트엔드 Vercel 배포
- [x] 백엔드 Railway 배포
- [x] PostgreSQL 프로덕션 설정
- [x] 도메인 연결

### 수익화
- [x] 개인정보처리방침/이용약관 페이지
- [ ] Google AdSense 신청
- [ ] 광고 배치

---

## DB 스키마 (Prisma)

주요 모델:
- **User**: 사용자 (이메일, 비밀번호, OAuth, role)
- **Portfolio**: 포트폴리오 (종목, 수량, 평균가)
- **Watchlist**: 관심종목
- **Schedule**: 사용자 일정
- **Inquiry**: 문의 (answeredBy - 관리자 답변자)
- **Notice**: 공지사항 (authorId - 작성 관리자)
- **IPO**: 공모주/청약 정보 (청약일정, 공모가, 상장일 등)
- **LoginHistory**: 로그인 기록
- **TokenBlacklist**: 토큰 블랙리스트

### Role 시스템
```prisma
enum Role {
  USER   // 일반 사용자
  ADMIN  // 관리자
}
```

### IPO 상태
```prisma
enum IPOStatus {
  UPCOMING      // 예정
  SUBSCRIPTION  // 청약중
  COMPLETED     // 청약완료
  LISTED        // 상장완료
}
```

자세한 스키마: `backend/prisma/schema.prisma` 참고

---

## 관리자 기능

### 관리자 권한 부여
DB에서 직접 사용자의 role을 ADMIN으로 변경:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

### 관리자 전용 기능
- **공지사항**: 작성, 수정, 삭제
- **문의 답변**: 사용자 문의에 답변
- **IPO 관리**: 공모주 정보 추가, 수정, 삭제

### AdminGuard 사용법
```typescript
@UseGuards(JwtAuthGuard, AdminGuard)
@Post()
async create() { ... }
```
