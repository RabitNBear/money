import { NextResponse } from 'next/server';
import type { EconomicEvent } from '@/types';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// IPO 데이터를 EconomicEvent 형식으로 변환
interface IPOData {
  id: string;
  companyName: string;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  listingDate: string | null;
  status: string;
}

function convertIPOToEvents(ipos: IPOData[]): EconomicEvent[] {
  const events: EconomicEvent[] = [];

  ipos.forEach((ipo) => {
    // 청약 시작일
    if (ipo.subscriptionStart) {
      events.push({
        id: `ipo-sub-start-${ipo.id}`,
        date: ipo.subscriptionStart.split('T')[0],
        country: 'KR',
        event: `[청약시작] ${ipo.companyName}`,
        importance: 'medium',
      });
    }

    // 청약 종료일
    if (ipo.subscriptionEnd) {
      events.push({
        id: `ipo-sub-end-${ipo.id}`,
        date: ipo.subscriptionEnd.split('T')[0],
        country: 'KR',
        event: `[청약마감] ${ipo.companyName}`,
        importance: 'medium',
      });
    }

    // 상장일
    if (ipo.listingDate) {
      events.push({
        id: `ipo-listing-${ipo.id}`,
        date: ipo.listingDate.split('T')[0],
        country: 'KR',
        event: `[상장] ${ipo.companyName}`,
        importance: 'high',
      });
    }
  });

  return events;
}

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

// IPO 데이터 가져오기
async function fetchIPOEvents(start?: string, end?: string): Promise<EconomicEvent[]> {
  try {
    // start와 end가 모두 있어야 백엔드 호출
    if (!start || !end) {
      return [];
    }

    const url = `${BACKEND_API_URL}/ipo/calendar?start=${start}&end=${end}`;
    const response = await fetch(url, {
      next: { revalidate: 300 }, // 5분 캐싱
    });

    if (!response.ok) {
      console.error('IPO API error:', response.status);
      return [];
    }

    const data = await response.json();
    return convertIPOToEvents(data.data || data || []);
  } catch (error) {
    console.error('Failed to fetch IPO events:', error);
    return [];
  }
}

// 최근 10개의 일정만 보였던 코드를 달력넘길 때마다 일정 보이도록 수정
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start'); // 'yyyy-MM-dd'
    const end = searchParams.get('end');     // 'yyyy-MM-dd'

    // IPO 이벤트 가져오기
    const ipoEvents = await fetchIPOEvents(start || undefined, end || undefined);

    const allEvents = [...BOK_CALENDAR, ...FOMC_CALENDAR, ...ipoEvents];
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