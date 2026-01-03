import { NextResponse } from 'next/server';
import {
  getUSIndices,
  getKRIndices,
  getFearGreedIndex,
  getExchangeRate,
} from '@/lib/yahoo';

// 캐시: 5분
let cache: {
  us: Awaited<ReturnType<typeof getUSIndices>>;
  kr: Awaited<ReturnType<typeof getKRIndices>>;
  fearGreedUS: Awaited<ReturnType<typeof getFearGreedIndex>>;
  fearGreedKR: Awaited<ReturnType<typeof getFearGreedIndex>>;
  exchangeRate: number | null;
  updatedAt: string;
} | null = null;

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

    // 병렬로 모든 데이터 조회
    const [us, kr, fearGreedUS, fearGreedKR, exchangeRate] = await Promise.all([
      getUSIndices(),
      getKRIndices(),
      getFearGreedIndex('US'),
      getFearGreedIndex('KR'),
      getExchangeRate(),
    ]);

    // 캐시 업데이트
    cache = {
      us,
      kr,
      fearGreedUS,
      fearGreedKR,
      exchangeRate,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: cache,
      cached: false,
    });
  } catch (error) {
    console.error('Market API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
