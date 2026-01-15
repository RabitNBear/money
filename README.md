# 껄무새 (Ggul-Moosae)

> "앱 설치 없이 1초 만에, 주식 행복회로를 돌리다."

한국 + 미국 주식 투자자를 위한 웹 기반 배당금 계산기 & 백테스팅 툴

---

## 주요 기능

### 1. 메인 대시보드
- 한국/미국 시장 **한 화면에 동시 표시**
- 공포/탐욕 지수 (VIX 기반, 감성 문구 포함)
- 주요 지수 (KOSPI, KOSDAQ, S&P500, 나스닥, 다우)
- USD/KRW 실시간 환율

### 2. 배당금 계산기
- 티커 검색 (한국: 종목코드.KS, 미국: 심볼)
- 목표 월 배당금 → 필요 투자금/주수 계산
- 원화 기준 통일 계산

### 3. 백테스팅 (타임머신)
- 5/10/15/20년 과거 투자 시뮬레이션
- 벤치마크 비교 (한국: KOSPI, 미국: S&P500)
- 결과 자산 환산 ("소나타 2대", "강남 아파트 0.3채")
- CAGR(연평균 수익률) 계산

### 4. 경제 캘린더
- 한국: 금통위 기준금리 결정
- 미국: FOMC 금리 결정
- **공모주 일정**: 청약 시작/종료, 상장일

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
| **Frontend** | Next.js 16, Tailwind CSS, Recharts, Zustand |
| **Backend** | NestJS, Prisma, PostgreSQL |
| **Auth** | JWT + OAuth 2.0 (Google, Kakao) |
| **Security** | bcrypt, Helmet, Rate Limiting |
| **Data** | yahoo-finance2 (무료, API 키 불필요) |
| **Deploy** | Vercel (Frontend), Railway/Render (Backend) |

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
│   │   ├── login/               # 로그인
│   │   ├── signup/              # 회원가입
│   │   └── api/                 # Next.js API Routes
│   │       ├── stock/[ticker]/  # 주식 정보
│   │       ├── market/          # 시장 지표
│   │       ├── exchange-rate/   # 환율
│   │       ├── history/[ticker]/# 과거 주가
│   │       └── calendar/        # 경제 캘린더
│   ├── lib/                     # 유틸리티
│   ├── stores/                  # Zustand 상태관리
│   └── types/                   # TypeScript 타입
│
├── backend/                     # NestJS 백엔드
│   ├── src/
│   │   ├── auth/                # 인증 (JWT, OAuth)
│   │   ├── users/               # 사용자 관리
│   │   ├── portfolio/           # 포트폴리오
│   │   ├── watchlist/           # 관심종목
│   │   ├── schedule/            # 일정
│   │   ├── inquiry/             # 문의 (관리자 답변 기능 포함)
│   │   ├── notice/              # 공지사항 (관리자 CRUD)
│   │   ├── ipo/                 # 공모주/IPO (관리자 CRUD)
│   │   ├── prisma/              # DB 연결
│   │   └── common/              # 공통 모듈
│   │       └── email/           # 이메일 발송 (Nodemailer)
│   └── prisma/
│       └── schema.prisma        # DB 스키마
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

**옵션 A: DataGrip 사용**
1. PostgreSQL 서버 연결 (localhost:5432)
2. 새 Database 생성: `ggeulmuse`

**옵션 B: 터미널 사용**
```sql
CREATE DATABASE ggeulmuse;
```

#### 2-2. 환경변수 설정

`backend/.env` 파일 수정:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ggeulmuse?schema=public"

# JWT (32자 이상 랜덤 문자열로 변경)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Google OAuth (아래 가이드 참고)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# Kakao OAuth (아래 가이드 참고)
KAKAO_CLIENT_ID="your-kakao-rest-api-key"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
KAKAO_CALLBACK_URL="http://localhost:3001/api/auth/kakao/callback"

# Server
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Email (Gmail SMTP - 선택사항)
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

## OAuth 설정 가이드

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. **API 및 서비스 > 사용자 인증 정보**
4. **OAuth 클라이언트 ID 만들기** (웹 애플리케이션)
5. 승인된 리디렉션 URI 추가:
   - 개발: `http://localhost:3001/api/auth/google/callback`
   - 배포: `https://your-backend.com/api/auth/google/callback`
6. Client ID, Client Secret 복사 → `.env`에 입력

### Kakao OAuth

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 추가
3. **앱 키** 메뉴 → REST API 키 복사 → `KAKAO_CLIENT_ID`
4. **제품 설정 > 카카오 로그인** 활성화
5. **Redirect URI** 추가:
   - 개발: `http://localhost:3001/api/auth/kakao/callback`
   - 배포: `https://your-backend.com/api/auth/kakao/callback`
6. (선택) 이메일 수집: DevTalk에서 **비즈앱 전환 신청**

> **참고**: 두 플랫폼 모두 사업자 등록 없이 개인도 사용 가능합니다.

---

## API 엔드포인트

### 프론트엔드 API (Next.js)

| 엔드포인트 | 설명 | 캐시 |
|-----------|------|------|
| `GET /api/stock/[ticker]` | 주식 정보 (가격, 배당률) | - |
| `GET /api/market` | 시장 지표 (지수, VIX, 환율) | 5분 |
| `GET /api/exchange-rate` | USD/KRW 환율 | 5분 |
| `GET /api/exchange-rate/history` | 환율 히스토리 | 1시간 |
| `GET /api/history/[ticker]` | 백테스팅 데이터 | - |
| `GET /api/calendar` | 경제 캘린더 | - |
| `GET /api/search` | 종목 검색 | - |

### 백엔드 API (NestJS)

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

#### 문의 (인증 필요)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/inquiry` | 내 문의 목록 |
| POST | `/api/inquiry` | 문의 등록 |
| GET | `/api/inquiry/:id` | 문의 상세 |
| GET | `/api/inquiry/count` | 내 문의 수 |

#### 문의 (관리자)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/inquiry/admin/all` | 모든 문의 목록 |
| GET | `/api/inquiry/admin/:id` | 문의 상세 |
| PATCH | `/api/inquiry/:id/answer` | 문의 답변 |

#### 공지사항 (공개)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/notice` | 공지사항 목록 |
| GET | `/api/notice/latest` | 최신 공지사항 |
| GET | `/api/notice/:id` | 공지사항 상세 |

#### 공지사항 (관리자)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/notice` | 공지사항 작성 |
| PATCH | `/api/notice/:id` | 공지사항 수정 |
| DELETE | `/api/notice/:id` | 공지사항 삭제 |

#### 공모주/IPO (공개)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/ipo` | IPO 목록 |
| GET | `/api/ipo/upcoming` | 다가오는 IPO |
| GET | `/api/ipo/calendar` | 캘린더용 IPO |
| GET | `/api/ipo/:id` | IPO 상세 |

#### 공모주/IPO (관리자)
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/ipo` | IPO 추가 |
| PATCH | `/api/ipo/:id` | IPO 수정 |
| DELETE | `/api/ipo/:id` | IPO 삭제 |

---

## 지원 시장

| 시장 | 티커 형식 | 예시 |
|------|----------|------|
| 미국 | SYMBOL | AAPL, MSFT, SCHD |
| 한국 | 종목코드.KS | 005930.KS (삼성전자) |
| 지수 | ^SYMBOL | ^GSPC, ^KS11 |

---

## 광고 수익화 (Google AdSense)

### 신청 조건
- 독창적이고 유용한 콘텐츠
- 최소 10-15개 이상 페이지
- 도메인 등록 후 1-3개월 권장
- **필수 페이지**: 개인정보처리방침, 이용약관
- 사업자 등록: **불필요** (개인 가능)

### 신청 절차
1. [adsense.google.com](https://adsense.google.com) 접속
2. 웹사이트 URL 입력 (배포된 도메인)
3. 사이트에 AdSense 코드 삽입:
   ```html
   <!-- layout.tsx의 <head>에 추가 -->
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX"
        crossorigin="anonymous"></script>
   ```
4. 심사 대기 (1-14일)
5. 승인 후 광고 단위 생성 및 배치

### 추천 광고 배치
| 위치 | 광고 유형 |
|------|----------|
| 메인 페이지 하단 | 배너 (728x90) |
| 계산 결과 하단 | 인피드 광고 |
| 백테스팅 결과 | 네이티브 광고 |
| 사이드바 | 디스플레이 광고 |

---

## 개인정보처리방침 / 이용약관

### 작성 방법
- **변호사 필요 없음** (개인 프로젝트, 결제 기능 없음)
- 무료 생성기 사용 추천: [개인정보보호 포털](https://www.privacy.go.kr)

### 필수 포함 항목

**개인정보처리방침:**
1. 수집하는 개인정보 항목 (이메일, 닉네임 등)
2. 수집 목적
3. 보유 기간
4. 제3자 제공 여부
5. 정보주체의 권리
6. 개인정보 보호책임자 연락처

**이용약관:**
1. 서비스 목적 및 정의
2. 이용계약 성립
3. 서비스 이용
4. 회원의 의무
5. **면책조항** (특히 중요)
6. 분쟁 해결

### 면책조항 예시 (금융 서비스 필수)
```
본 서비스에서 제공하는 모든 정보는 투자 권유나 금융 조언이 아닙니다.
- 배당금 계산 결과는 참고용이며, 실제와 다를 수 있습니다.
- 과거 수익률이 미래 수익을 보장하지 않습니다.
- 투자에 대한 최종 결정과 책임은 이용자 본인에게 있습니다.
```

---

## 배포

### 프론트엔드 (Vercel)
```bash
cd frontend
vercel
```

### 백엔드 (Railway / Render)
1. GitHub 저장소 연결
2. 환경변수 설정
3. PostgreSQL 애드온 추가
4. 배포

---

## 디자인

- **토스 증권** 스타일 레퍼런스
- 모바일 퍼스트 반응형
- 다크/라이트 모드 지원
- 한국식 색상: 수익 빨강(#F04251), 손실 파랑(#2B83F6)

---

## 보안 체크리스트

- [x] 비밀번호 bcrypt 해싱 (saltRounds: 12)
- [x] JWT Access Token 15분, Refresh Token 7일
- [x] Rate Limiting 적용
- [x] CORS 설정 (프론트엔드 도메인만)
- [x] Helmet HTTP 헤더 보안
- [x] 입력값 검증 (class-validator)
- [x] 로그인 기록 저장
- [x] 회원 탈퇴 시 데이터 삭제
- [x] 관리자 권한 시스템 (Role enum, AdminGuard)
- [x] 이메일 인증 발송 (Gmail SMTP)

---

## 면책조항

본 서비스는 투자 권유가 아니며, 투자 판단의 책임은 본인에게 있습니다.
제공되는 모든 정보는 참고용이며, 실제 투자 결과와 다를 수 있습니다.

---

## 라이선스

MIT License
