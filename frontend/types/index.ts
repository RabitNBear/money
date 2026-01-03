// 타입 재내보내기
export * from './stock';
export * from './history';

// 경제 캘린더 이벤트 타입
export interface EconomicEvent {
  id: string;
  date: string;          // YYYY-MM-DD
  time?: string;         // HH:mm (선택)
  country: 'US' | 'KR';
  event: string;         // "FOMC 금리 결정", "금통위"
  importance: 'high' | 'medium' | 'low';
  forecast?: string;     // 예상치
  previous?: string;     // 이전 값
  actual?: string;       // 실제 값 (발표 후)
}

// API 응답 공통 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cachedAt?: string;     // 캐시된 시간
}

// 테마 타입
export type Theme = 'light' | 'dark' | 'system';
