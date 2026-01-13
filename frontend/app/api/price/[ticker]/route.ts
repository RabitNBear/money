import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData, getMarket } from '@/lib/yahoo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const searchParams = request.nextUrl.searchParams;

    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!ticker) {
      return NextResponse.json(
        { success: false, error: '티커를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 기본값: 1년 전부터 오늘까지
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);

    const market = getMarket(ticker);
    const benchmarkSymbol = market === 'KR' ? '^KS11' : '^GSPC';

    // 병렬로 주식 데이터와 벤치마크 데이터 조회
    const [stockHistory, benchmarkHistory] = await Promise.all([
      getHistoricalData(ticker, start, end),
      getHistoricalData(benchmarkSymbol, start, end),
    ]);

    if (stockHistory.length === 0) {
      return NextResponse.json(
        { success: false, error: '과거 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 순수 주가 데이터 반환 (투자금 계산 없이)
    const priceHistory = stockHistory.map((point) => ({
      date: point.date.slice(0, 7), // YYYY-MM
      price: point.adjustedClose,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
    }));

    // 벤치마크 순수 데이터
    const benchmarkPriceHistory = benchmarkHistory.map((point) => ({
      date: point.date.slice(0, 7),
      price: point.adjustedClose,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ticker,
        market,
        benchmarkSymbol,
        startDate: stockHistory[0].date,
        endDate: stockHistory[stockHistory.length - 1].date,
        history: priceHistory,
        benchmarkHistory: benchmarkPriceHistory,
      },
    });
  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
