# 껄무새 (GGURLMOOSAE)

> "앱 설치 없이 1초 만에, 주식 행복회로를 돌리다."

한국 + 미국 주식 투자자를 위한 웹 기반 배당금 계산기 & 백테스팅 툴

**Live**: [https://ggurlms.com](https://ggurlms.com)

---

## 주요 기능

### 1. 메인 대시보드
- 한국/미국 시장 **한 화면에 동시 표시**
- 공포/탐욕 지수 (VIX/VKOSPI 기반, 감성 문구 포함)
- 주요 지수 (KOSPI, KOSDAQ, S&P500, 나스닥, 다우)
- USD/KRW 실시간 환율 + 차트

### 2. 배당금 계산기
- 티커 검색 (한국: 종목코드.KS, 미국: 심볼)
- 목표 월 배당금 → 필요 투자금/주수 계산
- 원화 기준 통일 계산
- 포트폴리오 관리

### 3. 백테스팅 (그때 살 껄)
- 5/10/15/20년 과거 투자 시뮬레이션
- 벤치마크 비교 (한국: KOSPI, 미국: S&P500)
- 결과 자산 환산 ("소나타 2대", "강남 아파트 0.3채")
- CAGR(연평균 수익률) 계산

### 4. 경제 캘린더
- 한국: 금통위 기준금리 결정
- 미국: FOMC 금리 결정
- **공모주 일정**: 수요예측, 청약, 환불, 상장일

### 5. 마이페이지 (로그인 필요)
- 포트폴리오 관리
- 관심종목 저장
- 개인 일정 관리 + **경제 일정 통합 표시**
- 문의하기

### 6. 관리자 기능
- 공지사항 작성/수정/삭제
- 문의 답변
- 공모주(IPO) 정보 관리

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4, Recharts, Zustand |
| **Backend** | NestJS 11, Prisma 6, PostgreSQL |
| **Auth** | JWT + OAuth 2.0 (Google, Kakao) |
| **Security** | bcrypt, Helmet, Rate Limiting, class-validator |
| **Data** | yahoo-finance2 (무료, API 키 불필요) |
| **SEO** | Next.js Metadata API, sitemap.xml, robots.txt, JSON-LD |
| **Deploy** | Vercel (Frontend), Railway (Backend) |

---

## 프로젝트 구조

```
money/
├── frontend/                    # Next.js 프론트엔드
│   ├── app/
│   │   ├── page.tsx             # 메인 대시보드 (서버)
│   │   ├── HomeClient.tsx       # 메인 대시보드 (클라이언트)
│   │   ├── ClientLayout.tsx     # 전역 레이아웃 (네비게이션, 인증)
│   │   ├── sitemap.ts           # 동적 사이트맵
│   │   ├── robots.ts            # 크롤러 규칙
│   │   ├── calculator/          # 배당금 계산기
│   │   ├── backtest/            # 백테스팅
│   │   ├── calendar/            # 경제 캘린더
│   │   ├── stock/               # 주식 시세
│   │   ├── mypage/              # 마이페이지
│   │   ├── mystock/             # 관심종목
│   │   ├── notice/              # 공지사항
│   │   ├── inquiry/             # 문의
│   │   ├── ipo/                 # 공모주 상세
│   │   ├── admin/               # 관리자
│   │   ├── login/               # 로그인
│   │   ├── signup/              # 회원가입
│   │   ├── findPw/              # 비밀번호 찾기
│   │   ├── privacy/             # 개인정보처리방침
│   │   ├── terms/               # 이용약관
│   │   └── api/                 # Next.js API Routes
│   │       ├── stock/[ticker]/  # 주식 정보
│   │       ├── price/[ticker]/  # 실시간 가격
│   │       ├── market/          # 시장 지표
│   │       ├── exchange-rate/   # 환율
│   │       ├── history/[ticker]/# 과거 주가
│   │       ├── calendar/        # 경제 캘린더
│   │       ├── search/          # 종목 검색
│   │       └── og/              # OG 이미지 생성
│   ├── components/
│   │   ├── JsonLd.tsx           # SEO 구조화 데이터
│   │   ├── EconomicCalendar.tsx # 경제 캘린더
│   │   ├── ExchangeRateChart.tsx# 환율 차트
│   │   ├── TickerSearch.tsx     # 티커 검색
│   │   └── ShareButton.tsx      # 공유 버튼
│   ├── lib/
│   │   ├── yahoo.ts             # yahoo-finance2 래퍼
│   │   ├── utils.ts             # 유틸리티 함수
│   │   └── apiClient.ts         # 백엔드 API 클라이언트
│   ├── stores/
│   │   ├── useCalculatorStore.ts # 포트폴리오 상태
│   │   └── useThemeStore.ts     # 테마 상태
│   ├── types/                   # TypeScript 타입
│   └── data/
│       └── stocks.json          # 한국/미국 종목 목록
│
├── backend/                     # NestJS 백엔드
│   ├── src/
│   │   ├── auth/                # 인증 모듈 (JWT, OAuth)
│   │   ├── users/               # 사용자 관리
│   │   ├── portfolio/           # 포트폴리오
│   │   ├── watchlist/           # 관심종목
│   │   ├── schedule/            # 일정
│   │   ├── inquiry/             # 문의 (관리자 답변 포함)
│   │   ├── notice/              # 공지사항 (관리자 CRUD)
│   │   ├── ipo/                 # 공모주/IPO (관리자 CRUD)
│   │   ├── prisma/              # DB 연결
│   │   └── common/              # 공통 모듈 (이메일, 필터, 인터셉터)
│   └── prisma/
│       └── schema.prisma        # DB 스키마 (12개 모델)
│
├── README.md
└── CLAUDE.md
```

---

## 시작하기

### 1. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```
→ http://localhost:3000

### 2. 백엔드 실행

#### 2-1. PostgreSQL 설정

```sql
CREATE DATABASE ggeulmuse;
```

#### 2-2. 환경변수 설정

`backend/.env` 파일:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ggeulmuse?schema=public"

# JWT (32자 이상 랜덤 문자열)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# Kakao OAuth
KAKAO_CLIENT_ID="your-kakao-rest-api-key"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
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

#### 2-3. DB 마이그레이션 및 실행

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run start:dev
```
→ http://localhost:3001
→ Swagger: http://localhost:3001/api

---

## API 엔드포인트

### 프론트엔드 API (Next.js) - 주식 데이터

| 엔드포인트 | 설명 | 캐시 |
|-----------|------|------|
| `GET /api/stock/[ticker]` | 주식 정보 (가격, 배당률) | - |
| `GET /api/price/[ticker]` | 실시간 가격 | - |
| `GET /api/market` | 시장 지표 (지수, VIX, 환율) | 5분 |
| `GET /api/exchange-rate` | USD/KRW 환율 | 5분 |
| `GET /api/exchange-rate/history` | 환율 히스토리 | 1시간 |
| `GET /api/history/[ticker]` | 백테스팅 데이터 | - |
| `GET /api/calendar` | 경제 캘린더 | - |
| `GET /api/search` | 종목 검색 | - |
| `GET /api/og` | OG 이미지 생성 | - |

### 백엔드 API (NestJS) - 사용자 데이터

#### 인증 (공개)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| GET | `/api/auth/google` | 구글 로그인 |
| GET | `/api/auth/kakao` | 카카오 로그인 |

#### 사용자 (인증 필요)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/auth/me` | 내 정보 |
| PATCH | `/api/users/profile` | 프로필 수정 |
| DELETE | `/api/users/account` | 회원 탈퇴 |

#### 포트폴리오 (인증 필요)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/portfolio` | 포트폴리오 목록 |
| GET | `/api/portfolio/summary` | 포트폴리오 요약 |
| POST | `/api/portfolio` | 종목 추가 |
| PATCH | `/api/portfolio/:id` | 종목 수정 |
| DELETE | `/api/portfolio/:id` | 종목 삭제 |

#### 관심종목 (인증 필요)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/watchlist` | 관심종목 목록 |
| POST | `/api/watchlist` | 관심종목 추가 |
| DELETE | `/api/watchlist/:ticker` | 관심종목 삭제 |

#### 일정 (인증 필요)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/schedule` | 일정 목록 |
| GET | `/api/schedule/upcoming` | 다가오는 일정 |
| POST | `/api/schedule` | 일정 추가 |
| PATCH | `/api/schedule/:id` | 일정 수정 |
| DELETE | `/api/schedule/:id` | 일정 삭제 |

#### 문의
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/inquiry` | 내 문의 목록 (인증) |
| POST | `/api/inquiry` | 문의 등록 (인증) |
| GET | `/api/inquiry/:id` | 문의 상세 (인증) |
| GET | `/api/inquiry/admin/all` | 모든 문의 (관리자) |
| PATCH | `/api/inquiry/:id/answer` | 문의 답변 (관리자) |

#### 공지사항
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/notice` | 공지사항 목록 (공개) |
| GET | `/api/notice/latest` | 최신 공지사항 (공개) |
| GET | `/api/notice/:id` | 공지사항 상세 (공개) |
| POST | `/api/notice` | 공지사항 작성 (관리자) |
| PATCH | `/api/notice/:id` | 공지사항 수정 (관리자) |
| DELETE | `/api/notice/:id` | 공지사항 삭제 (관리자) |

#### 공모주/IPO
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/ipo` | IPO 목록 (공개) |
| GET | `/api/ipo/upcoming` | 다가오는 IPO (공개) |
| GET | `/api/ipo/calendar` | 캘린더용 IPO (공개) |
| GET | `/api/ipo/:id` | IPO 상세 (공개) |
| POST | `/api/ipo` | IPO 추가 (관리자) |
| PATCH | `/api/ipo/:id` | IPO 수정 (관리자) |
| DELETE | `/api/ipo/:id` | IPO 삭제 (관리자) |

---

## 지원 시장

| 시장 | 티커 형식 | 예시 |
|------|----------|------|
| 미국 | SYMBOL | AAPL, MSFT, SCHD |
| 한국 | 종목코드.KS | 005930.KS (삼성전자) |
| 지수 | ^SYMBOL | ^GSPC, ^KS11 |

---

## SEO 구현

| 항목 | 상태 | 파일 |
|------|------|------|
| Metadata API | ✅ | 각 page.tsx |
| OpenGraph | ✅ | layout.tsx |
| Twitter Cards | ✅ | layout.tsx |
| sitemap.xml | ✅ | app/sitemap.ts |
| robots.txt | ✅ | app/robots.ts |
| JSON-LD | ✅ | components/JsonLd.tsx |
| Canonical URL | ✅ | 각 page.tsx |
| 동적 OG 이미지 | ✅ | api/og/route.tsx |

**검색엔진 등록:**
- ✅ Google Search Console
- ✅ 네이버 서치어드바이저

---

## 보안 체크리스트

- [x] 비밀번호 bcrypt 해싱 (saltRounds: 12)
- [x] JWT Access Token 15분, Refresh Token 7일
- [x] 토큰 블랙리스트 (로그아웃 시)
- [x] Rate Limiting (1초 10개, 1분 100개, 1시간 1000개)
- [x] Helmet HTTP 헤더 보안
- [x] CORS 설정 (프론트엔드 도메인만)
- [x] class-validator 입력값 검증
- [x] 로그인 기록 저장
- [x] 회원 탈퇴 시 데이터 CASCADE 삭제
- [x] 관리자 권한 시스템 (Role enum, AdminGuard)
- [x] 이메일 인증 발송 (Gmail SMTP)

---

## 디자인

- **토스 증권** 스타일 레퍼런스
- 모바일 퍼스트 반응형
- 다크/라이트 모드 지원
- 한국식 색상: 수익 빨강(#F04251), 손실 파랑(#2B83F6)

---

## 배포

### 프론트엔드 (Vercel)
```bash
cd frontend
vercel
```

### 백엔드 (Railway)
1. GitHub 저장소 연결
2. 환경변수 설정
3. PostgreSQL 애드온 추가
4. 배포

---

## 면책조항

본 서비스는 투자 권유가 아니며, 투자 판단의 책임은 본인에게 있습니다.
제공되는 모든 정보는 참고용이며, 실제 투자 결과와 다를 수 있습니다.

---

## 라이선스

MIT License
