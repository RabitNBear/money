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

    // 기본값 설정 수정: startDate가 없으면 1970년(Unix Epoch)부터 조회
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(0); // 과거 모든 데이터를 위해 0으로 수정

    const market = getMarket(ticker);
    const benchmarkSymbol = market === 'KR' ? '^KS11' : '^GSPC';

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

    const priceHistory = stockHistory.map((point) => ({
      date: point.date.slice(0, 10),
      price: point.adjustedClose,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
    }));

    const benchmarkPriceHistory = benchmarkHistory.map((point) => ({
      date: point.date.slice(0, 10),
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