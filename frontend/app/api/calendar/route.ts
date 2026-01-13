import { NextResponse } from 'next/server';
import type { EconomicEvent } from '@/types';

// 한국 금통위 일정 (2025-2026년)
// 출처: 한국은행 공식 발표 (https://www.bok.or.kr)
const BOK_CALENDAR: EconomicEvent[] = [
  // 2025년
  { id: 'bok-2025-01', date: '2025-01-16', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2025-02', date: '2025-02-27', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2025-04', date: '2025-04-17', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2025-05', date: '2025-05-29', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2025-07', date: '2025-07-17', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2025-08', date: '2025-08-28', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2025-10', date: '2025-10-16', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2025-11', date: '2025-11-27', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  // 2026년
  { id: 'bok-2026-01', date: '2026-01-15', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2026-02', date: '2026-02-12', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2026-04', date: '2026-04-10', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2026-05', date: '2026-05-14', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2026-07', date: '2026-07-16', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2026-08', date: '2026-08-13', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2026-10', date: '2026-10-22', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
  { id: 'bok-2026-11', date: '2026-11-12', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
];

// 미국 FOMC 일정 (2025-2026년)
// 출처: Federal Reserve (https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm)
const FOMC_CALENDAR: EconomicEvent[] = [
  // 2025년
  { id: 'fomc-2025-01', date: '2025-01-29', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2025-03', date: '2025-03-19', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2025-05', date: '2025-05-07', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2025-06', date: '2025-06-18', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2025-07', date: '2025-07-30', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2025-09', date: '2025-09-17', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2025-11', date: '2025-11-05', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2025-12', date: '2025-12-17', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  // 2026년
  { id: 'fomc-2026-01', date: '2026-01-28', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2026-03', date: '2026-03-18', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2026-04', date: '2026-04-29', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2026-06', date: '2026-06-17', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2026-07', date: '2026-07-29', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2026-09', date: '2026-09-16', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2026-10', date: '2026-10-28', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
  { id: 'fomc-2026-12', date: '2026-12-09', country: 'US', event: 'FOMC 금리 결정', importance: 'high' },
];

// 최근 10개의 일정만 보였던 코드를 달력넘길 때마다 일정 보이도록 수정
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start'); // 'yyyy-MM-dd'
    const end = searchParams.get('end');     // 'yyyy-MM-dd'

    const allEvents = [...BOK_CALENDAR, ...FOMC_CALENDAR];
    let filteredEvents;

    // 1. 날짜 범위 파라미터가 있는 경우 (달력을 넘길 때)
    if (start && end) {
      filteredEvents = allEvents
        .filter((event) => event.date >= start && event.date <= end)
        .sort((a, b) => a.date.localeCompare(b.date));
    }
    // 2. 파라미터가 없는 경우 (기존 메인 대시보드 등에서 호출할 때)
    else {
      const today = new Date().toISOString().split('T')[0];
      filteredEvents = allEvents
        .filter((event) => event.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 10);
    }

    return NextResponse.json({
      success: true,
      data: filteredEvents,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}