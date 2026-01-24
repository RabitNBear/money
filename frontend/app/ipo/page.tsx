import type { Metadata } from 'next';
import IpoDetailClient from './IpoDetailClient';
import JsonLd, { getIPOJsonLd } from '@/components/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlms.com';

interface IPO {
  id: number;
  companyName: string;
  ticker: string;
  market: string;
  offeringPrice: number;
  expectedDate: string;
  description: string;
}

async function getIPO(id: string): Promise<IPO | null> {
  try {
    const res = await fetch(`${API_URL}/ipo/${id}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch IPO for metadata:', error);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ipo = await getIPO(id);

  if (!ipo) {
    return {
      title: 'IPO 정보',
      description: '공모주 청약 정보',
    };
  }

  const description = `${ipo.companyName} (${ipo.ticker}) 공모주 청약 정보. 공모가 ${ipo.offeringPrice?.toLocaleString()}원, 예정일 ${new Date(ipo.expectedDate).toLocaleDateString('ko-KR')}`;

  return {
    title: `${ipo.companyName} IPO 정보`,
    description,
    keywords: [ipo.companyName, ipo.ticker, 'IPO', '공모주', '청약'],
    openGraph: {
      title: `${ipo.companyName} IPO | 껄무새`,
      description,
      url: `/ipo/${id}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(ipo.companyName + ' IPO')}&value=${encodeURIComponent(ipo.offeringPrice?.toLocaleString() + '원')}&description=공모가`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `/ipo/${id}`,
    },
  };
}

export default async function IPODetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ipo = await getIPO(id);

  return (
    <>
      {ipo && (
        <JsonLd
          data={getIPOJsonLd(SITE_URL, {
            companyName: ipo.companyName,
            description: ipo.description,
            offeringPrice: ipo.offeringPrice,
            expectedDate: ipo.expectedDate,
            id: ipo.id,
          })}
        />
      )}
      <IpoDetailClient id={id} />
    </>
  );
}
