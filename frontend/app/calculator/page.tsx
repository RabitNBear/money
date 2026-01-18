import type { Metadata } from 'next';
import CalculatorClient from './CalculatorClient';
import JsonLd, { getCalculatorJsonLd } from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlms.com';

export const metadata: Metadata = {
  title: '배당금 계산기 - 월 배당금 시뮬레이션',
  description: '목표 월 배당금을 위한 필요 투자금을 계산하세요. SCHD, 삼성전자, JEPI, O 등 한국/미국 배당주 시뮬레이션으로 배당 투자 계획을 세워보세요. 세금 계산, 월별 배당금 차트 제공.',
  keywords: ['배당금 계산기', '월배당 계산', '배당 투자 시뮬레이션', 'SCHD 배당', 'JEPI 배당', '배당주 투자', '배당금 시뮬레이터', '배당 세금', '배당소득세', '월 100만원 배당', '삼성전자 배당', '미국 배당주', '한국 배당주'],
  openGraph: {
    title: '배당금 계산기 | 껄무새',
    description: '목표 월 배당금을 위한 필요 투자금을 계산하세요. 한국/미국 배당주 시뮬레이션.',
    url: '/calculator',
    images: [
      {
        url: '/api/og?title=배당금 계산기&description=목표 월 배당금 시뮬레이션',
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: '/calculator',
  },
};

export default function CalculatorPage() {
  return (
    <>
      <JsonLd data={getCalculatorJsonLd(SITE_URL)} />
      <CalculatorClient />
    </>
  );
}
