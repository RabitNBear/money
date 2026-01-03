import { NextRequest, NextResponse } from 'next/server';
import { getStockInfo } from '@/lib/yahoo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;

    if (!ticker) {
      return NextResponse.json(
        { success: false, error: '티커를 입력해주세요.' },
        { status: 400 }
      );
    }

    const stockInfo = await getStockInfo(ticker);

    if (!stockInfo) {
      return NextResponse.json(
        { success: false, error: '종목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stockInfo,
      cachedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stock API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
