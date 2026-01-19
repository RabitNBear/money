import type { Metadata } from 'next';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: '회원가입',
  description: '껄무새 계정을 만들어 배당금 계산기, 백테스팅, 포트폴리오 관리 기능을 이용하세요.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/signup',
  },
};

export default function SignupPage() {
  return <SignupClient />;
}
