import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRateHistory } from '@/lib/yahoo';

// 캐시: 1시간
let cache: { data: { date: string; rate: number }[]; updatedAt: string } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1시간

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);

    // 캐시 확인 (days가 30일 때만)
    if (days === 30 && cache && Date.now() - new Date(cache.updatedAt).getTime() < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cache.data,
        cached: true,
      });
    }

    const history = await getExchangeRateHistory(days);

    if (history.length === 0) {
      return NextResponse.json(
        { success: false, error: '환율 히스토리를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 30일 데이터면 캐시
    if (days === 30) {
      cache = {
        data: history,
        updatedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      data: history,
      cached: false,
    });
  } catch (error) {
    console.error('Exchange rate history API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
