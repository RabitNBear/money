import type { Metadata } from 'next';
import NoticeDetailClient from './NoticeDetailClient';
import JsonLd, { getArticleJsonLd } from '@/components/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlmoosae.com';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

async function getNotice(id: string): Promise<Notice | null> {
  try {
    const res = await fetch(`${API_URL}/notice/${id}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const response = await res.json();
      return response.data || response;
    }
  } catch (error) {
    console.error('Failed to fetch notice for metadata:', error);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const notice = await getNotice(id);

  if (!notice) {
    return {
      title: '공지사항',
      description: '껄무새 공지사항',
    };
  }

  const description = notice.content.length > 160
    ? notice.content.substring(0, 157) + '...'
    : notice.content;

  return {
    title: notice.title,
    description,
    openGraph: {
      title: `${notice.title} | 껄무새`,
      description,
      url: `/notice/${id}`,
      type: 'article',
      publishedTime: notice.createdAt,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(notice.title)}&description=껄무새 공지사항`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `/notice/${id}`,
    },
  };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await getNotice(id);

  return (
    <>
      {notice && (
        <JsonLd
          data={getArticleJsonLd(SITE_URL, {
            title: notice.title,
            description: notice.content.length > 160
              ? notice.content.substring(0, 157) + '...'
              : notice.content,
            url: `/notice/${id}`,
            datePublished: notice.createdAt,
          })}
        />
      )}
      <NoticeDetailClient id={id} />
    </>
  );
}
