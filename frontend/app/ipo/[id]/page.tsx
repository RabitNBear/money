import type { Metadata } from 'next';
import IpoDetailClient from './IpoDetailClient';
import JsonLd, { getIPOJsonLd } from '@/components/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlms.com';

interface IPO {
  id: string;
  companyName: string;
  subscriptionStart?: string;
  listingDate?: string;
  finalPrice?: number;
  priceRangeHigh?: number;
  leadUnderwriter?: string;
}

async function getIpo(id: string): Promise<IPO | null> {
  try {
    const res = await fetch(`${API_URL}/ipo/${id}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const response = await res.json();
      return response.data || response;
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
  const ipo = await getIpo(id);

  if (!ipo) {
    return {
      title: '공모주 정보',
      description: '껄무새 공모주 청약 일정',
    };
  }

  const price = ipo.finalPrice || ipo.priceRangeHigh;
  const description = `${ipo.companyName} 공모주 청약 일정${price ? `, 공모가 ${price.toLocaleString()}원` : ''}${ipo.leadUnderwriter ? `, 주관사 ${ipo.leadUnderwriter}` : ''}`;

  return {
    title: `${ipo.companyName} 공모주`,
    description,
    openGraph: {
      title: `${ipo.companyName} 공모주 | 껄무새`,
      description,
      url: `/ipo/${id}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(`${ipo.companyName} 공모주`)}&description=${encodeURIComponent('껄무새 공모주 청약 일정')}`,
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

export default async function IpoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ipo = await getIpo(id);

  return (
    <>
      {ipo && (
        <JsonLd
          data={getIPOJsonLd(SITE_URL, {
            id: ipo.id,
            companyName: ipo.companyName,
            offeringPrice: ipo.finalPrice || ipo.priceRangeHigh,
            expectedDate: ipo.subscriptionStart || ipo.listingDate || new Date().toISOString(),
            underwriter: ipo.leadUnderwriter,
          })}
        />
      )}
      <IpoDetailClient id={id} />
    </>
  );
}
