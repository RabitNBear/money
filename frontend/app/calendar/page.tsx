import type { Metadata } from 'next';
import CalendarClient from './CalendarClient';

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
  return <CalendarClient />;
}
