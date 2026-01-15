import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData, getMarket } from '@/lib/yahoo';
import { calculateCAGR } from '@/lib/utils';
import type { BacktestResult, ChartDataPoint } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const searchParams = request.nextUrl.searchParams;

    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const initialInvestment = Number(searchParams.get('amount')) || 10000000; // 기본 1000만원

    if (!ticker) {
      return NextResponse.json(
        { success: false, error: '티커를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 기본값: 10년 전부터 오늘까지
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 10 * 365 * 24 * 60 * 60 * 1000);

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

    // 수익률 계산
    const firstPrice = stockHistory[0].adjustedClose;
    const lastPrice = stockHistory[stockHistory.length - 1].adjustedClose;
    const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
    const finalValue = (initialInvestment * lastPrice) / firstPrice;

    // 연수 계산
    const years =
      (new Date(stockHistory[stockHistory.length - 1].date).getTime() -
        new Date(stockHistory[0].date).getTime()) /
      (365 * 24 * 60 * 60 * 1000);

    const cagr = calculateCAGR(firstPrice, lastPrice, years);

    // 벤치마크 수익률
    let benchmarkReturn = 0;
    if (benchmarkHistory.length >= 2) {
      const benchFirst = benchmarkHistory[0].adjustedClose;
      const benchLast = benchmarkHistory[benchmarkHistory.length - 1].adjustedClose;
      benchmarkReturn = ((benchLast - benchFirst) / benchFirst) * 100;
    }

    // 차트 데이터 생성 (YYYY-MM-DD 형식 유지)
    const chartData: ChartDataPoint[] = stockHistory.map((point) => ({
      date: point.date.slice(0, 10), // YYYY-MM-DD
      value: (initialInvestment * point.adjustedClose) / firstPrice,
      returnPercent: ((point.adjustedClose - firstPrice) / firstPrice) * 100,
    }));

    const benchmarkChartData: ChartDataPoint[] = benchmarkHistory.map((point) => {
      const benchFirst = benchmarkHistory[0]?.adjustedClose || 1;
      return {
        date: point.date.slice(0, 10), // YYYY-MM-DD
        value: (initialInvestment * point.adjustedClose) / benchFirst,
        returnPercent: ((point.adjustedClose - benchFirst) / benchFirst) * 100,
      };
    });

    const result: BacktestResult = {
      ticker,
      tickerName: ticker, // TODO: 종목명 조회 추가
      market,
      startDate: stockHistory[0].date,
      endDate: stockHistory[stockHistory.length - 1].date,
      initialInvestment,
      finalValue: Math.round(finalValue),
      totalReturn: Math.round(totalReturn * 100) / 100,
      cagr: Math.round(cagr * 100) / 100,
      benchmarkSymbol,
      benchmarkReturn: Math.round(benchmarkReturn * 100) / 100,
      history: chartData,
      benchmarkHistory: benchmarkChartData,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
