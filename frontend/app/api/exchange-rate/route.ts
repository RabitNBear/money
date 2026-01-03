import { NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/yahoo';

// 캐시: 5분
let cache: { rate: number; updatedAt: string } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export async function GET() {
  try {
    // 캐시 확인
    if (cache && Date.now() - new Date(cache.updatedAt).getTime() < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cache,
        cached: true,
      });
    }

    const rate = await getExchangeRate();

    if (!rate) {
      return NextResponse.json(
        { success: false, error: '환율 정보를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 캐시 업데이트
    cache = {
      rate,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: cache,
      cached: false,
    });
  } catch (error) {
    console.error('Exchange rate API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
