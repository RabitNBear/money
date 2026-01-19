import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '껄무새의 개인정보 수집, 이용, 보관에 관한 정책을 안내합니다.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
