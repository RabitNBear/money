import type { Metadata } from 'next';
import StockClient from '../StockClient';
import JsonLd from '@/components/JsonLd';
import { getStockInfo } from '@/lib/yahoo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlms.com';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}): Promise<Metadata> {
  const { ticker } = await params;

  let stockName = ticker;
  let description = `${ticker} 실시간 주가, 배당금, 차트 조회`;

  try {
    const info = await getStockInfo(ticker);
    if (info) {
      stockName = info.name;
      description = `${info.name}(${ticker}) 실시간 주가 ${info.price.toLocaleString()}${info.currency}, 등락률 ${info.changePercent >= 0 ? '+' : ''}${info.changePercent.toFixed(2)}%`;
    }
  } catch {
    // fallback to ticker
  }

  return {
    title: `${ticker} - ${stockName} 주식 시세`,
    description,
    openGraph: {
      title: `${ticker} - ${stockName} 주식 시세 | 껄무새`,
      description,
      url: `/stock/${ticker}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(`${ticker} 주식 시세`)}&description=${encodeURIComponent(description)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `/stock/${ticker}`,
    },
  };
}

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;

  let stockName = ticker;
  let stockDescription = `${ticker} 실시간 주가, 배당금, 차트 조회`;

  try {
    const info = await getStockInfo(ticker);
    if (info) {
      stockName = info.name;
      stockDescription = `${info.name}(${ticker}) 실시간 주가, 배당수익률, 차트를 무료로 확인하세요.`;
    }
  } catch {
    // fallback to ticker
  }

  const stockJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `${ticker} 주식 시세`,
    url: `${SITE_URL}/stock/${ticker}`,
    description: stockDescription,
  };

  return (
    <>
      <JsonLd data={stockJsonLd} />
      <div className="sr-only">
        <h1>{stockName} {ticker}</h1>
        <p>{stockDescription}</p>
      </div>
      <StockClient initialTicker={ticker} />
    </>
  );
}
