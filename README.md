# 껄무새 (Ggul-Moosae)

> "앱 설치 없이 1초 만에, 주식 행복회로를 돌리다."

한국 + 미국 주식 투자자를 위한 웹 기반 배당금 계산기 & 백테스팅 툴

## 주요 기능

### 1. 메인 대시보드
- 한국/미국 시장 동시 표시
- 공포/탐욕 지수 (VIX, VKOSPI)
- 주요 지수 (KOSPI, KOSDAQ, S&P500, 나스닥, 다우)
- USD/KRW 환율

### 2. 배당금 계산기
- 티커 검색 (한국: 종목명/코드, 미국: 심볼)
- 목표 월 배당금 → 필요 투자금 계산
- 포트폴리오 저장 (브라우저)

### 3. 백테스팅 (타임머신)
- 과거 투자 시뮬레이션
- 벤치마크 비교 (KOSPI, S&P500)
- 결과 자산 환산 ("소나타 2대", "강남 아파트 0.3채")
- 카카오톡 공유

### 4. 경제 캘린더
- 한국: 금통위, 기준금리
- 미국: FOMC, CPI, 고용지표

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14, Tailwind CSS, Recharts, Zustand |
| Backend | Next.js API Routes (Serverless) |
| Data | yahoo-finance2, FMP API |
| Deploy | Vercel |

## 프로젝트 구조

```
money/
├── frontend/          # Next.js 프론트엔드
│   ├── app/          # App Router 페이지
│   ├── components/   # React 컴포넌트
│   ├── lib/          # 유틸리티 함수
│   ├── stores/       # Zustand 스토어
│   ├── types/        # TypeScript 타입
│   └── data/         # 정적 데이터 (종목 리스트 등)
├── backend/          # 추후 확장용 (현재 미사용)
├── README.md
└── CLAUDE.md
```

## 시작하기

```bash
# 프론트엔드 실행
cd frontend
npm install
npm run dev
```

## 지원 시장

| 시장 | 티커 형식 | 예시 |
|------|----------|------|
| 미국 | SYMBOL | AAPL, MSFT |
| 한국 | 종목코드.KS | 005930.KS (삼성전자) |

## 면책조항

본 서비스는 투자 권유가 아니며, 투자 판단의 책임은 본인에게 있습니다.
