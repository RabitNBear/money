import type { Metadata } from 'next';
import Script from 'next/script';
import ClientLayout from './ClientLayout';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlms.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '껄무새 - 배당금 계산기 & 백테스팅',
    template: '%s | 껄무새',
  },
  description: '무료 배당금 계산기와 주식 백테스팅 도구. 한국/미국 주식 배당 투자 시뮬레이션으로 월 배당 목표를 계획하세요.',
  keywords: [
    '배당금 계산기',
    '주식 백테스팅',
    '배당주',
    '미국 주식 배당',
    '한국 주식 배당',
    '배당 투자',
    'SCHD 배당',
    '월배당',
    '배당금 시뮬레이션',
    '주식 수익률 계산',
  ],
  authors: [{ name: 'RabitNBear' }],
  creator: '껄무새',
  publisher: '껄무새',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: '껄무새',
    title: '껄무새 - 배당금 계산기 & 백테스팅',
    description: '무료 배당금 계산기와 주식 백테스팅 도구. 한국/미국 주식 배당 투자 시뮬레이션.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: '껄무새 - 배당금 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '껄무새 - 배당금 계산기 & 백테스팅',
    description: '무료 배당금 계산기와 주식 백테스팅 도구.',
    images: ['/api/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        {/* Google AdSense */}
        {ADSENSE_ID && (
          <meta name="google-adsense-account" content={ADSENSE_ID} />
        )}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0a0a0b" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
          body {
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
          }
          .font-logo {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          }
        `}} />
      </head>
      <body className="antialiased text-white bg-[#0a0a0b]">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
