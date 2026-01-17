import YahooFinance from 'yahoo-finance2';
import type { StockInfo, MarketIndex, FearGreedIndex, HistoryPoint, DividendFrequency } from '@/types';
import stocksData from '@/data/stocks.json';

// yahoo-finance2 v3 인스턴스 생성
const yahooFinance = new YahooFinance();

// stocks.json에서 종목 정보 찾기
interface StockEntry {
  symbol: string;
  name: string;
  engName: string;
  hasDividend: boolean;
  dividendFrequency?: DividendFrequency;
  dividendMonths?: number[];
}

// 한국 주식 배당 데이터 하드코딩 (Yahoo Finance API 미지원)
// 2024년 기준 배당금 정보
interface KRDividendData {
  dividendRate: number;      // 연간 주당 배당금 (원)
  dividendYield: number;     // 배당률 (%)
  dividendFrequency: DividendFrequency;
  dividendMonths: number[];
}

const KR_DIVIDEND_DATA: Record<string, KRDividendData> = {
  '005930.KS': {  // 삼성전자
    dividendRate: 1444,       // 361원 × 4분기
    dividendYield: 2.5,
    dividendFrequency: 'quarterly',
    dividendMonths: [2, 5, 8, 11]  // 실제 지급월
  },
  '000660.KS': {  // SK하이닉스
    dividendRate: 1200,
    dividendYield: 0.6,
    dividendFrequency: 'quarterly',
    dividendMonths: [2, 5, 8, 11]
  },
  '035420.KS': {  // 네이버
    dividendRate: 1026,
    dividendYield: 0.4,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '035720.KS': {  // 카카오
    dividendRate: 68,
    dividendYield: 0.2,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '005380.KS': {  // 현대차
    dividendRate: 10000,
    dividendYield: 4.5,
    dividendFrequency: 'quarterly',
    dividendMonths: [3, 6, 9, 12]
  },
  '000270.KS': {  // 기아
    dividendRate: 5600,
    dividendYield: 5.0,
    dividendFrequency: 'quarterly',
    dividendMonths: [3, 6, 9, 12]
  },
  '055550.KS': {  // 신한지주
    dividendRate: 2120,
    dividendYield: 4.5,
    dividendFrequency: 'quarterly',
    dividendMonths: [3, 6, 9, 12]
  },
  '105560.KS': {  // KB금융
    dividendRate: 3060,
    dividendYield: 4.0,
    dividendFrequency: 'quarterly',
    dividendMonths: [3, 6, 9, 12]
  },
  '086790.KS': {  // 하나금융지주
    dividendRate: 3000,
    dividendYield: 5.0,
    dividendFrequency: 'quarterly',
    dividendMonths: [3, 6, 9, 12]
  },
  '017670.KS': {  // SK텔레콤
    dividendRate: 3540,
    dividendYield: 6.5,
    dividendFrequency: 'quarterly',
    dividendMonths: [2, 5, 8, 11]
  },
  '030200.KS': {  // KT
    dividendRate: 1960,
    dividendYield: 5.0,
    dividendFrequency: 'quarterly',
    dividendMonths: [3, 6, 9, 12]
  },
  '032830.KS': {  // 삼성생명
    dividendRate: 4000,
    dividendYield: 4.5,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '003550.KS': {  // LG
    dividendRate: 3000,
    dividendYield: 3.5,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '051910.KS': {  // LG화학
    dividendRate: 6000,
    dividendYield: 2.0,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '006400.KS': {  // 삼성SDI
    dividendRate: 1000,
    dividendYield: 0.3,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '066570.KS': {  // LG전자
    dividendRate: 1000,
    dividendYield: 1.0,
    dividendFrequency: 'semiannual',
    dividendMonths: [4, 9]
  },
  '034730.KS': {  // SK
    dividendRate: 5000,
    dividendYield: 3.0,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '096770.KS': {  // SK이노베이션
    dividendRate: 2200,
    dividendYield: 2.0,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '009150.KS': {  // 삼성전기
    dividendRate: 2000,
    dividendYield: 1.5,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '012330.KS': {  // 현대모비스
    dividendRate: 5000,
    dividendYield: 2.5,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '028260.KS': {  // 삼성물산
    dividendRate: 2000,
    dividendYield: 1.5,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '018260.KS': {  // 삼성에스디에스
    dividendRate: 2400,
    dividendYield: 1.5,
    dividendFrequency: 'annual',
    dividendMonths: [4]
  },
  '015760.KS': {  // 한국전력
    dividendRate: 0,
    dividendYield: 0,
    dividendFrequency: 'annual',
    dividendMonths: []
  },
  '373220.KS': {  // LG에너지솔루션
    dividendRate: 0,
    dividendYield: 0,
    dividendFrequency: 'annual',
    dividendMonths: []
  }
};

function getKRDividendData(symbol: string): KRDividendData | null {
  return KR_DIVIDEND_DATA[symbol] || null;
}

function getStockEntry(symbol: string): StockEntry | null {
  const allStocks = [...stocksData.kr, ...stocksData.us, ...stocksData.popular] as StockEntry[];
  return allStocks.find(s => s.symbol === symbol) || null;
}

function getKoreanName(symbol: string): string | null {
  const stock = getStockEntry(symbol);
  return stock?.name || null;
}

// Yahoo Finance Quote 응답 타입 정의
interface YahooQuoteResult {
  symbol?: string;
  shortName?: string;
  longName?: string;
  currency?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketPreviousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  trailingAnnualDividendRate?: number;
  trailingAnnualDividendYield?: number;
  exDividendDate?: Date;
}

// Yahoo Finance Historical 응답 타입 정의
interface YahooHistoricalResult {
  date: Date;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  adjClose?: number;
  volume?: number;
}

// 시장 판별 함수
export function getMarket(symbol: string): 'US' | 'KR' {
  return symbol.endsWith('.KS') || symbol.endsWith('.KQ') ? 'KR' : 'US';
}

// VIX/VKOSPI 값에 따른 공포/탐욕 레벨 판정
export function getFearGreedLevel(value: number): {
  level: FearGreedIndex['level'];
  message: string;
} {
  if (value < 15) {
    return { level: 'greed', message: '시장이 낙관적이에요' };
  } else if (value < 20) {
    return { level: 'neutral', message: '평온한 장세입니다' };
  } else if (value < 30) {
    return { level: 'fear', message: '긴장감이 감돌아요' };
  } else {
    return { level: 'extreme_fear', message: '공포에 질린 시장' };
  }
}

// 주식 정보 조회
export async function getStockInfo(symbol: string): Promise<StockInfo | null> {
  try {
    const quote = await yahooFinance.quote(symbol) as YahooQuoteResult;
    if (!quote) return null;

    const market = getMarket(symbol);
    // stocks.json에서 종목 정보를 먼저 찾음
    const stockEntry = getStockEntry(symbol);
    const name = stockEntry?.name || quote.shortName || quote.longName || symbol;

    // 한국 주식은 하드코딩된 배당 데이터 사용 (Yahoo Finance API 미지원)
    const krDividendData = market === 'KR' ? getKRDividendData(symbol) : null;

    // 배당 데이터 결정: 한국 하드코딩 > Yahoo API > stocks.json
    const dividendRate = krDividendData?.dividendRate ?? quote.trailingAnnualDividendRate ?? 0;
    const dividendYield = krDividendData?.dividendYield ?? (quote.trailingAnnualDividendYield ?? 0) * 100;
    const dividendFrequency = krDividendData?.dividendFrequency ?? stockEntry?.dividendFrequency;
    const dividendMonths = krDividendData?.dividendMonths ?? stockEntry?.dividendMonths;

    return {
      symbol: quote.symbol || symbol,
      name,
      market,
      currency: quote.currency || (market === 'KR' ? 'KRW' : 'USD'),
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      dividendRate,
      dividendYield,
      exDividendDate: quote.exDividendDate?.toISOString?.()?.split('T')[0],
      dividendFrequency,
      dividendMonths,
      previousClose: quote.regularMarketPreviousClose || 0,
      dayHigh: quote.regularMarketDayHigh || 0,
      dayLow: quote.regularMarketDayLow || 0,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap,
    };
  } catch (error) {
    console.error(`Failed to fetch stock info for ${symbol}:`, error);
    return null;
  }
}

// 시장 지수 조회
export async function getMarketIndex(symbol: string): Promise<MarketIndex | null> {
  try {
    const quote = await yahooFinance.quote(symbol) as YahooQuoteResult;
    if (!quote) return null;

    const market = symbol === '^KS11' || symbol === '^KQ11' ? 'KR' : 'US';

    return {
      symbol: quote.symbol || symbol,
      name: quote.shortName || quote.longName || symbol,
      market,
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
    };
  } catch (error) {
    console.error(`Failed to fetch market index for ${symbol}:`, error);
    return null;
  }
}

// 공포/탐욕 지수 조회 (VIX 또는 VKOSPI)
export async function getFearGreedIndex(market: 'US' | 'KR'): Promise<FearGreedIndex | null> {
  try {
    // 미국: VIX, 한국: VKOSPI (yahoo에서 제공 안하면 KOSPI 변동성으로 대체)
    const symbol = market === 'US' ? '^VIX' : '^KS11'; // VKOSPI가 없으면 KOSPI 사용
    const quote = await yahooFinance.quote(symbol) as YahooQuoteResult;
    if (!quote) return null;

    const value = quote.regularMarketPrice || 0;
    const { level, message } = getFearGreedLevel(value);

    return {
      value,
      level,
      message,
      market,
    };
  } catch (error) {
    console.error(`Failed to fetch fear/greed index for ${market}:`, error);
    return null;
  }
}

// 환율 조회 (USD/KRW)
export async function getExchangeRate(): Promise<number | null> {
  try {
    const quote = await yahooFinance.quote('USDKRW=X') as YahooQuoteResult;
    return quote?.regularMarketPrice || null;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return null;
  }
}

// 과거 주가 데이터 조회
export async function getHistoricalData(
  symbol: string,
  startDate: Date,
  endDate: Date
): Promise<HistoryPoint[]> {
  try {
    const result = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d', // 일간 데이터
    }) as YahooHistoricalResult[];

    return result.map((item: YahooHistoricalResult) => ({
      date: item.date.toISOString().split('T')[0],
      open: item.open || 0,
      high: item.high || 0,
      low: item.low || 0,
      close: item.close || 0,
      adjustedClose: item.adjClose || item.close || 0,
      volume: item.volume || 0,
    }));
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);
    return [];
  }
}

// 여러 지수 한번에 조회
export async function getMultipleIndices(symbols: string[]): Promise<MarketIndex[]> {
  const results = await Promise.all(symbols.map(getMarketIndex));
  return results.filter((result): result is MarketIndex => result !== null);
}

// 미국 주요 지수 조회
export async function getUSIndices(): Promise<MarketIndex[]> {
  return getMultipleIndices(['^GSPC', '^IXIC', '^DJI']); // S&P500, 나스닥, 다우
}

// 한국 주요 지수 조회
export async function getKRIndices(): Promise<MarketIndex[]> {
  return getMultipleIndices(['^KS11', '^KQ11']); // KOSPI, KOSDAQ
}

// 환율 히스토리 조회 (USD/KRW)
export async function getExchangeRateHistory(
  days: number = 30
): Promise<{ date: string; rate: number }[]> {
  try {
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await yahooFinance.historical('USDKRW=X', {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    }) as YahooHistoricalResult[];

    return result.map((item: YahooHistoricalResult) => ({
      date: item.date.toISOString().split('T')[0],
      rate: item.close || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch exchange rate history:', error);
    return [];
  }
}
