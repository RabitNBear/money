# 껄무새 (Ggul-Moosae)

> "앱 설치 없이 1초 만에, 주식 행복회로를 돌리다."

한국 + 미국 주식 투자자를 위한 웹 기반 배당금 계산기 & 백테스팅 툴

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

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16, Tailwind CSS, Recharts, Zustand |
| API | Next.js API Routes (Serverless) |
| Data | yahoo-finance2 (무료, API 키 불필요) |
| Deploy | Vercel |

## 프로젝트 구조

```
money/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # 메인 대시보드
│   │   ├── calculator/page.tsx   # 배당금 계산기
│   │   ├── backtest/page.tsx     # 백테스팅
│   │   └── api/
│   │       ├── stock/[ticker]/   # 주식 정보 API
│   │       ├── exchange-rate/    # 환율 API
│   │       ├── market/           # 시장 지표 API
│   │       ├── history/[ticker]/ # 과거 주가 API
│   │       └── calendar/         # 경제 캘린더 API
│   ├── lib/
│   │   ├── yahoo.ts              # yahoo-finance2 래퍼
│   │   └── utils.ts              # 유틸리티 함수
│   ├── stores/
│   │   ├── useCalculatorStore.ts # 포트폴리오 상태
│   │   └── useThemeStore.ts      # 테마 상태
│   └── types/                    # TypeScript 타입 정의
├── README.md
└── CLAUDE.md
```

## 시작하기

```bash
# 의존성 설치
cd frontend
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

http://localhost:3000 에서 확인

## API 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/stock/[ticker]` | 주식 정보 (가격, 배당률) |
| `GET /api/exchange-rate` | USD/KRW 환율 (5분 캐시) |
| `GET /api/market` | 시장 지표 (지수, VIX) |
| `GET /api/history/[ticker]?start=&end=&amount=` | 백테스팅 데이터 |
| `GET /api/calendar` | 경제 캘린더 |

## 지원 시장

| 시장 | 티커 형식 | 예시 |
|------|----------|------|
| 미국 | SYMBOL | AAPL, MSFT, SCHD |
| 한국 | 종목코드.KS | 005930.KS (삼성전자) |
| 지수 | ^SYMBOL | ^GSPC, ^KS11 |

## 디자인

- **토스 증권** 스타일 레퍼런스
- 모바일 퍼스트 반응형
- 다크/라이트 모드 지원
- 한국식 색상: 수익 빨강, 손실 파랑

## 면책조항

본 서비스는 투자 권유가 아니며, 투자 판단의 책임은 본인에게 있습니다.
