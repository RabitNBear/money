import type { Metadata } from 'next';
import CalendarClient from './CalendarClient';
import JsonLd, { getCalendarJsonLd } from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlms.com';

export const metadata: Metadata = {
  title: '경제 캘린더 - FOMC, 금통위, 공모주 일정',
  description: 'FOMC 일정, 금통위 일정, 공모주 청약 일정을 한눈에 확인하세요. 한국/미국 시장의 중요 경제 이벤트와 IPO 일정을 무료로 제공합니다.',
  keywords: ['경제 캘린더', 'FOMC 일정', 'FOMC 2025', '금통위 일정', '금통위 2025', '공모주 일정', 'IPO 일정', 'IPO 청약', '주식 일정', '경제 지표', '미국 금리', '한국 금리', '기준금리'],
  openGraph: {
    title: '경제 캘린더 - FOMC, 금통위, 공모주 일정 | 껄무새',
    description: 'FOMC 일정, 금통위 일정, 공모주 청약 일정을 한눈에 확인하세요.',
    url: '/calendar',
    images: [
      {
        url: '/api/og?title=경제 캘린더&description=FOMC, 금통위, 공모주 일정',
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: '/calendar',
  },
};

export default function CalendarPage() {
  return (
    <>
      <JsonLd data={getCalendarJsonLd(SITE_URL)} />
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">경제 캘린더</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          FOMC 회의, 금통위 기준금리 결정, 공모주 청약 일정을 한눈에 확인하세요.
          한국·미국 시장에 영향을 주는 주요 경제 이벤트와 IPO 일정을 무료로 제공합니다.
        </p>
        <ul className="text-xs text-gray-400 dark:text-gray-500 flex flex-wrap gap-x-4 gap-y-1 mb-4">
          <li>· FOMC 금리 결정 일정</li>
          <li>· 한국은행 금통위 일정</li>
          <li>· 공모주 수요예측·청약·환불·상장일</li>
          <li>· 월별 캘린더 뷰</li>
        </ul>
      </div>
      <CalendarClient />
    </>
  );
}
