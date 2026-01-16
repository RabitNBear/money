// 배당 주기 타입
export type DividendFrequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

// 주식 정보 타입
export interface StockInfo {
  symbol: string;        // 티커 (AAPL, 005930.KS)
  name: string;          // 종목명 (Apple Inc., 삼성전자)
  market: 'US' | 'KR';   // 시장 구분
  currency: string;      // 통화 (USD, KRW)
  price: number;         // 현재가
  change: number;        // 등락액
  changePercent: number; // 등락률 (%)

  // 배당 데이터
  dividendRate: number;  // 주당 연간 배당금
  dividendYield: number; // 배당률 (%)
  exDividendDate?: string; // 배당락일
  dividendFrequency?: DividendFrequency; // 배당 주기
  dividendMonths?: number[]; // 배당 지급 월 [1-12]

  // 추가 정보
  previousClose: number; // 전일 종가
  dayHigh: number;       // 당일 고가
  dayLow: number;        // 당일 저가
  volume: number;        // 거래량
  marketCap?: number;    // 시가총액
}

// 시장 지수 타입
export interface MarketIndex {
  symbol: string;        // ^GSPC, ^KS11
  name: string;          // S&P 500, KOSPI
  market: 'US' | 'KR';
  price: number;
  change: number;
  changePercent: number;
}

// 공포/탐욕 지수 타입
export interface FearGreedIndex {
  value: number;         // VIX 또는 VKOSPI 값
  level: 'greed' | 'neutral' | 'fear' | 'extreme_fear';
  message: string;       // "시장이 낙관적이에요" 등
  market: 'US' | 'KR';
}

// 환율 타입
export interface ExchangeRate {
  rate: number;          // USD/KRW 환율
  change: number;        // 등락액
  changePercent: number; // 등락률
  updatedAt: string;     // 업데이트 시간
}

// 포트폴리오 종목 타입
export interface PortfolioItem {
  symbol: string;
  name: string;
  market: 'US' | 'KR';
  shares: number;        // 보유 주수
  avgPrice: number;      // 평균 매수가
  dividendYield: number; // 배당률
  annualDividend: number; // 연간 예상 배당금
}
