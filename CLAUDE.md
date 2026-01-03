# CLAUDE.md - 껄무새 프로젝트 가이드

## 프로젝트 개요

껄무새는 한국/미국 주식 투자자를 위한 웹 기반 배당금 계산기 + 백테스팅 툴입니다.

## 핵심 원칙

### 1. 서버비 0원
- DB 없음 (클라이언트 localStorage 활용)
- Vercel Serverless 배포
- 무료 API 우선 (yahoo-finance2)

### 2. 모바일 퍼스트
- 토스 증권 스타일 UI
- 카드 기반 레이아웃
- 큰 숫자, 작은 라벨

### 3. 한국 사용자 최적화
- 한글 UI
- 원화 기준 계산
- 수익 빨강(#F04251), 손실 파랑(#2B83F6) - 한국식

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS (다크모드 지원)
- **Charts**: Recharts
- **State**: Zustand (persist middleware)
- **Data**: yahoo-finance2

## 주요 API 엔드포인트

```
GET /api/stock/[ticker]      - 주식 정보 (가격, 배당)
GET /api/exchange-rate       - USD/KRW 환율
GET /api/market              - 시장 지표 (VIX, VKOSPI, 지수)
GET /api/history/[ticker]    - 과거 주가 (백테스팅용)
GET /api/calendar            - 경제 캘린더
GET /api/og                  - 공유 이미지 생성
```

## 티커 형식

```typescript
// 미국 주식
"AAPL"      // Apple
"MSFT"      // Microsoft

// 한국 주식 (yahoo-finance2)
"005930.KS" // 삼성전자
"000660.KS" // SK하이닉스

// 지수
"^GSPC"     // S&P 500
"^KS11"     // KOSPI
"^KQ11"     // KOSDAQ
"^VIX"      // VIX (공포지수)
```

## 파일 구조

```
frontend/
├── app/
│   ├── page.tsx                    # 메인 대시보드
│   ├── calculator/page.tsx         # 배당금 계산기
│   ├── backtest/page.tsx           # 백테스팅
│   ├── layout.tsx                  # 루트 레이아웃
│   └── api/
│       ├── stock/[ticker]/route.ts
│       ├── exchange-rate/route.ts
│       ├── market/route.ts
│       ├── history/[ticker]/route.ts
│       ├── calendar/route.ts
│       └── og/route.tsx
├── components/
│   ├── TickerSearch.tsx            # 티커 검색 (자동완성)
│   ├── MarketCard.tsx              # 시장 카드 (한국/미국)
│   ├── FearGreedGauge.tsx          # 공포/탐욕 게이지
│   ├── DividendResult.tsx          # 배당금 계산 결과
│   ├── BacktestChart.tsx           # 백테스팅 차트
│   ├── AssetComparison.tsx         # 자산 환산 표시
│   ├── EconomicCalendar.tsx        # 경제 일정
│   ├── ShareButton.tsx             # 공유 버튼
│   ├── ThemeToggle.tsx             # 테마 토글
│   └── Disclaimer.tsx              # 면책조항
├── lib/
│   └── yahoo.ts                    # yahoo-finance2 래퍼
├── stores/
│   ├── useCalculatorStore.ts       # 포트폴리오 상태
│   └── useThemeStore.ts            # 테마 상태
├── types/
│   ├── stock.ts                    # StockInfo 타입
│   └── history.ts                  # BacktestResult 타입
└── data/
    ├── krx-stocks.json             # 한국 상장 종목
    └── bok-calendar.json           # 금통위 일정
```

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

## 주의사항

1. **API 에러 처리**: yahoo-finance2는 비공식 API이므로 항상 try-catch
2. **캐싱**: 환율, 지수는 5분 캐싱 권장
3. **한국 배당**: 연간/반기/분기 배당 주기가 다양함
4. **면책조항**: 모든 결과 화면에 표시 필수

## 개발 명령어

```bash
# 개발 서버
cd frontend && npm run dev

# 빌드
cd frontend && npm run build

# 린트
cd frontend && npm run lint
```

## 현재 구현 상태

### 완료
- [x] 프로젝트 기본 구조
- [x] 메인 대시보드 (한국/미국 시장 동시 표시)
- [x] 배당금 계산기 페이지
- [x] 백테스팅 페이지 (차트 포함)
- [x] API 라우트 (stock, market, exchange-rate, history, calendar)
- [x] Zustand 스토어 (포트폴리오, 테마)
- [x] 다크/라이트 모드 CSS 변수

### TODO
- [ ] 한국 종목 자동완성 (krx-stocks.json)
- [ ] OG 이미지 생성 API (/api/og)
- [ ] 카카오톡 공유 기능
- [ ] 테마 토글 버튼 컴포넌트
- [ ] 경제 캘린더 UI 컴포넌트
- [ ] Vercel 배포
