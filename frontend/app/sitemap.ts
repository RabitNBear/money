import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlmoosae.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/backtest`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/stock`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/notice`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. 동적 페이지 - 공지사항
  let noticePages: MetadataRoute.Sitemap = [];
  try {
    const noticeRes = await fetch(`${API_URL}/notice?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (noticeRes.ok) {
      const noticeData = await noticeRes.json();
      const notices = noticeData.data || noticeData || [];
      noticePages = notices.map((notice: { id: string; updatedAt?: string }) => ({
        url: `${SITE_URL}/notice/${notice.id}`,
        lastModified: notice.updatedAt ? new Date(notice.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch notices for sitemap:', error);
  }

  // 3. 동적 페이지 - IPO
  let ipoPages: MetadataRoute.Sitemap = [];
  try {
    const ipoRes = await fetch(`${API_URL}/ipo?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (ipoRes.ok) {
      const ipoData = await ipoRes.json();
      const ipos = ipoData.data || ipoData || [];
      ipoPages = ipos.map((ipo: { id: number; updatedAt?: string }) => ({
        url: `${SITE_URL}/ipo/${ipo.id}`,
        lastModified: ipo.updatedAt ? new Date(ipo.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch IPOs for sitemap:', error);
  }

  // 4. 인기 주식 페이지 (주요 종목만)
  const popularStocks = [
    // 미국 주요 종목
    'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA',
    // 인기 ETF
    'SCHD', 'VOO', 'QQQ', 'VTI', 'SPY', 'JEPI', 'JEPQ',
    // 한국 주요 종목
    '005930.KS', '000660.KS', '035720.KS', '035420.KS', '051910.KS',
    '006400.KS', '068270.KS', '207940.KS', '005380.KS', '000270.KS',
  ];

  const stockPages: MetadataRoute.Sitemap = popularStocks.map((ticker) => ({
    url: `${SITE_URL}/stock/${ticker}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...noticePages, ...ipoPages, ...stockPages];
}
