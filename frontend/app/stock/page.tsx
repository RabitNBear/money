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
      <StockClient />
    </>
  );
}
