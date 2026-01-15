import { NextRequest, NextResponse } from 'next/server';
import stocksData from '@/data/stocks.json';

export interface StockSearchResult {
  symbol: string;
  name: string;
  engName: string;
  market: 'US' | 'KR';
  hasDividend?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';
    const market = searchParams.get('market') as 'US' | 'KR' | null;
    const dividendOnly = searchParams.get('dividendOnly') === 'true';

    if (!query) {
      // 검색어 없으면 인기 종목 반환
      let popularData = stocksData.popular;
      if (dividendOnly) {
        popularData = popularData.filter((stock: { hasDividend?: boolean }) => stock.hasDividend);
      }
      return NextResponse.json({
        success: true,
        data: popularData,
      });
    }

    const results: StockSearchResult[] = [];

    // 한국 종목 검색
    if (!market || market === 'KR') {
      const krResults = stocksData.kr
        .filter(
          (stock: { name: string; engName: string; symbol: string; hasDividend?: boolean }) =>
            (stock.name.toLowerCase().includes(query) ||
            stock.engName.toLowerCase().includes(query) ||
            stock.symbol.toLowerCase().includes(query)) &&
            (!dividendOnly || stock.hasDividend)
        )
        .map((stock: { name: string; engName: string; symbol: string; hasDividend?: boolean }) => ({
          ...stock,
          market: 'KR' as const,
        }));
      results.push(...krResults);
    }

    // 미국 종목 검색
    if (!market || market === 'US') {
      const usResults = stocksData.us
        .filter(
          (stock: { name: string; engName: string; symbol: string; hasDividend?: boolean }) =>
            (stock.name.toLowerCase().includes(query) ||
            stock.engName.toLowerCase().includes(query) ||
            stock.symbol.toLowerCase().includes(query)) &&
            (!dividendOnly || stock.hasDividend)
        )
        .map((stock: { name: string; engName: string; symbol: string; hasDividend?: boolean }) => ({
          ...stock,
          market: 'US' as const,
        }));
      results.push(...usResults);
    }

    // 최대 10개 반환
    return NextResponse.json({
      success: true,
      data: results.slice(0, 10),
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
