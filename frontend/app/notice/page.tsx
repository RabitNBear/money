import type { Metadata } from 'next';
import NoticeClient from './NoticeClient';

export const metadata: Metadata = {
  title: '공지사항',
  description: '껄무새 서비스 관련 공지사항, 업데이트, 이벤트 소식을 확인하세요.',
  keywords: ['공지사항', '껄무새 공지', '서비스 업데이트', '이벤트'],
  openGraph: {
    title: '공지사항 | 껄무새',
    description: '껄무새 서비스 관련 공지사항을 확인하세요.',
    url: '/notice',
    images: [
      {
        url: '/api/og?title=공지사항&description=껄무새 서비스 소식',
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: '/notice',
  },
};

export default function NoticePage() {
  return <NoticeClient />;
}
