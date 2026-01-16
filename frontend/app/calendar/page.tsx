import type { Metadata } from 'next';
import CalendarClient from './CalendarClient';

export const metadata: Metadata = {
  title: '주식 달력',
  description: 'FOMC, 금통위 등 글로벌 경제 지표와 주요 일정을 확인하세요. 한국/미국 시장의 중요 이벤트를 한눈에 볼 수 있습니다.',
  keywords: ['경제 캘린더', 'FOMC 일정', '금통위', '주식 일정', '경제 지표', '주식 달력'],
  openGraph: {
    title: '주식 달력 | 껄무새',
    description: 'FOMC, 금통위 등 글로벌 경제 지표와 주요 일정을 확인하세요.',
    url: '/calendar',
    images: [
      {
        url: '/api/og?title=주식 달력&description=글로벌 경제 일정',
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
