import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: '로그인',
  description: '껄무새에 로그인하여 포트폴리오 관리, 관심종목 저장 등 다양한 기능을 이용하세요.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
