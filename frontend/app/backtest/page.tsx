import type { Metadata } from 'next';
import BacktestClient from './BacktestClient';
import JsonLd, { getBacktestJsonLd } from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlms.com';

export const metadata: Metadata = {
  title: '그때 살 껄 - 주식 백테스팅',
  description: '과거에 특정 종목을 샀다면 현재 얼마를 벌었을지 시뮬레이션하세요. 삼성전자, 애플, 테슬라, SCHD 등 한국/미국 주식 백테스팅으로 투자 수익률을 확인해보세요.',
  keywords: ['주식 백테스팅', '과거 수익률 계산', '투자 시뮬레이션', '주식 수익률', '백테스트', '그때 살 껄', '삼성전자 백테스트', '테슬라 백테스트', '애플 백테스트', 'SCHD 백테스트', '미국 주식 백테스팅', '한국 주식 백테스팅', '주식 수익률 계산기'],
  openGraph: {
    title: '그때 살 껄 - 주식 백테스팅 | 껄무새',
    description: '과거에 특정 종목을 샀다면 현재 얼마를 벌었을지 시뮬레이션하세요.',
    url: '/backtest',
    images: [
      {
        url: '/api/og?title=그때 살 껄&description=과거 투자 수익률 시뮬레이션',
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: '/backtest',
  },
};

export default function BacktestPage() {
  return (
    <>
      <JsonLd data={getBacktestJsonLd(SITE_URL)} />
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">그때 살 껄 — 주식 백테스팅</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          과거 특정 시점에 주식을 샀다면 지금 얼마가 됐을지 시뮬레이션하세요.
          삼성전자, 애플, 테슬라, SCHD 등 한국·미국 주식의 과거 수익률을
          차트와 함께 확인할 수 있습니다.
        </p>
        <ul className="text-xs text-gray-400 dark:text-gray-500 flex flex-wrap gap-x-4 gap-y-1 mb-4">
          <li>· 투자 원금 대비 수익률 계산</li>
          <li>· 배당 재투자(DRIP) 시뮬레이션</li>
          <li>· 기간별 수익 차트</li>
          <li>· 한국·미국 전종목 지원</li>
        </ul>
      </div>
      <BacktestClient />
    </>
  );
}
