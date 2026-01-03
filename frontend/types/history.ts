// 과거 주가 데이터 포인트
export interface HistoryPoint {
  date: string;          // YYYY-MM-DD
  open: number;          // 시가
  high: number;          // 고가
  low: number;           // 저가
  close: number;         // 종가
  adjustedClose: number; // 수정 종가 (배당, 분할 반영)
  volume: number;        // 거래량
}

// 백테스팅 결과 타입
export interface BacktestResult {
  ticker: string;
  tickerName: string;
  market: 'US' | 'KR';

  // 투자 정보
  startDate: string;
  endDate: string;
  initialInvestment: number;  // 초기 투자금 (원화)

  // 수익 정보
  finalValue: number;         // 최종 평가액 (원화)
  totalReturn: number;        // 총 수익률 (%)
  cagr: number;               // 연평균 수익률 (%)

  // 벤치마크 비교
  benchmarkSymbol: string;    // ^GSPC 또는 ^KS11
  benchmarkReturn: number;    // 벤치마크 수익률 (%)

  // 차트 데이터
  history: ChartDataPoint[];
  benchmarkHistory: ChartDataPoint[];
}

// 차트용 데이터 포인트
export interface ChartDataPoint {
  date: string;          // YYYY-MM
  value: number;         // 평가액 (원화)
  returnPercent: number; // 누적 수익률 (%)
}

// 자산 환산 타입
export interface AssetComparison {
  label: string;         // "소나타", "강남 아파트"
  value: number;         // 자산 가격 (원화)
  count: number;         // 환산 개수 (예: 2.3대)
  emoji: string;         // 이모지
}

// 백테스팅 요청 파라미터
export interface BacktestRequest {
  ticker: string;
  startDate: string;
  endDate: string;
  initialInvestment: number; // 원화
}
