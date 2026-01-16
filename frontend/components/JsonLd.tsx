interface JsonLdProps {
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// 홈페이지용 WebSite 스키마
export function getWebsiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '껄무새',
    alternateName: 'GGURLMOOSAE',
    url: siteUrl,
    description: '무료 배당금 계산기와 주식 백테스팅 도구',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/stock?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Organization 스키마
export function getOrganizationJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '껄무새',
    url: siteUrl,
    logo: `${siteUrl}/icon-192.png`,
  };
}

// SoftwareApplication 스키마 (배당금 계산기용)
export function getCalculatorJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '껄무새 배당금 계산기',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    description: '목표 월 배당금을 위한 필요 투자금을 계산하는 무료 도구',
    url: `${siteUrl}/calculator`,
  };
}

// Article 스키마 (공지사항용)
export function getArticleJsonLd(
  siteUrl: string,
  article: {
    title: string;
    description: string;
    url: string;
    datePublished: string;
    dateModified?: string;
  }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: `${siteUrl}${article.url}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Organization',
      name: '껄무새',
    },
    publisher: {
      '@type': 'Organization',
      name: '껄무새',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon-192.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}${article.url}`,
    },
  };
}

// FinancialProduct 스키마 (IPO용)
export function getIPOJsonLd(
  siteUrl: string,
  ipo: {
    companyName: string;
    description?: string;
    offeringPrice?: number;
    expectedDate: string;
    underwriter?: string;
    id: string | number;
  }
) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `${ipo.companyName} 공모주`,
    description: ipo.description || `${ipo.companyName} 공모주 청약 정보`,
    url: `${siteUrl}/ipo/${ipo.id}`,
  };

  if (ipo.underwriter) {
    jsonLd.provider = {
      '@type': 'Organization',
      name: ipo.underwriter,
    };
  }

  if (ipo.offeringPrice) {
    jsonLd.offers = {
      '@type': 'Offer',
      price: ipo.offeringPrice,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/PreOrder',
      availabilityStarts: ipo.expectedDate,
    };
  }

  return jsonLd;
}
