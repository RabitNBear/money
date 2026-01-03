import { NextResponse } from 'next/server';
import type { EconomicEvent } from '@/types';

// 한국 금통위 일정 (2025-2026년)
// 실제로는 한국은행 발표 일정을 JSON 파일로 관리
const BOK_CALENDAR: EconomicEvent[] = [
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
  { id: 'bok-2026-02', date: '2026-02-26', country: 'KR', event: '금통위 기준금리 결정', importance: 'high' },
];

// 미국 FOMC 일정 (2025년) - 실제로는 FMP API 사용 권장
const FOMC_CALENDAR: EconomicEvent[] = [
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
];

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘 이후 일정만 필터링
    const upcomingEvents = [...BOK_CALENDAR, ...FOMC_CALENDAR]
      .filter((event) => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10); // 가장 가까운 10개

    return NextResponse.json({
      success: true,
      data: upcomingEvents,
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
