import type { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: '이용약관',
  description: '껄무새 서비스 이용에 관한 약관을 안내합니다.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
