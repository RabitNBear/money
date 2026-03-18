import type { Metadata } from 'next';
import StockClient from './StockClient';
import JsonLd, { getStockJsonLd } from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlms.com';

export const metadata: Metadata = {
  title: '주식 시세 - 한국/미국 주가 조회',
  description: '삼성전자, 애플, 테슬라, SCHD 등 한국/미국 주식 실시간 시세를 확인하세요. 주가 차트, 일별 가격 히스토리, 관심종목 저장 기능을 무료로 제공합니다.',
  keywords: ['주식 시세', '실시간 주가', '주식 차트', '미국 주식', '한국 주식', '주가 조회', '삼성전자 주가', '애플 주가', '테슬라 주가', 'SCHD 주가', '나스닥', '코스피', 'S&P500'],
  openGraph: {
    title: '주식 시세 | 껄무새',
    description: '한국/미국 주식 실시간 시세와 차트를 확인하세요.',
    url: '/stock',
    images: [
      {
        url: '/api/og?title=주식 시세&description=실시간 주가 차트',
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: '/stock',
  },
};

export default function StockPage() {
  return (
    <>
      <JsonLd data={getStockJsonLd(SITE_URL)} />
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">주식 시세 조회</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          한국·미국 주식 실시간 시세를 조회하세요.
          삼성전자, 애플, 테슬라, SCHD 등 코스피·나스닥 종목의
          주가 차트, 배당 정보, 52주 고저가를 무료로 확인할 수 있습니다.
        </p>
        <ul className="text-xs text-gray-400 dark:text-gray-500 flex flex-wrap gap-x-4 gap-y-1 mb-4">
          <li>· 실시간 주가 및 등락률</li>
          <li>· 배당수익률·배당금 정보</li>
          <li>· 52주 고저가·시가총액</li>
          <li>· 관심종목 저장</li>
        </ul>
      </div>
      <StockClient />
    </>
  );
}
