import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '껄무새 - 주식 배당금 계산기 & 백테스팅',
  description:
    '앱 설치 없이 1초 만에, 한국/미국 주식 배당금 계산과 백테스팅을 경험하세요.',
  keywords: ['배당금', '주식', '백테스팅', '배당 계산기', 'SCHD', '미국주식', '한국주식'],
  openGraph: {
    title: '껄무새 - 주식 배당금 계산기 & 백테스팅',
    description: '앱 설치 없이 1초 만에, 주식 행복회로를 돌리다.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0d0d' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          {/* 헤더 */}
          <header className="sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur-md">
            <div className="max-w-screen-lg mx-auto px-5 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl">🦜</span>
                <span className="text-lg font-bold tracking-tight">껄무새</span>
              </Link>
              <nav className="flex items-center gap-1">
                <Link
                  href="/calculator"
                  className="btn-ghost px-3 py-2 rounded-lg text-sm font-medium"
                >
                  배당 계산기
                </Link>
                <Link
                  href="/backtest"
                  className="btn-ghost px-3 py-2 rounded-lg text-sm font-medium"
                >
                  백테스팅
                </Link>
              </nav>
            </div>
          </header>

          {/* 메인 컨텐츠 */}
          <main className="flex-1">{children}</main>

          {/* 푸터 */}
          <footer className="mt-auto py-8 px-5">
            <div className="max-w-screen-lg mx-auto">
              <div className="text-center space-y-3">
                <p className="text-xs text-[var(--neutral)]">
                  본 서비스는 투자 권유가 아니며, 투자 판단의 책임은 본인에게
                  있습니다.
                </p>
                <p className="text-xs text-[var(--neutral)]">
                  © 2025 껄무새. Made with 🦜
                </p>
              </div>
            </div>
          </footer>
        </div>

        {/* 모바일 하단 네비게이션 */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--border)] md:hidden safe-area-bottom">
          <div className="flex items-center justify-around h-16">
            <Link
              href="/"
              className="flex flex-col items-center gap-1 py-2 px-4 text-[var(--neutral)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">홈</span>
            </Link>
            <Link
              href="/calculator"
              className="flex flex-col items-center gap-1 py-2 px-4 text-[var(--neutral)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">계산기</span>
            </Link>
            <Link
              href="/backtest"
              className="flex flex-col items-center gap-1 py-2 px-4 text-[var(--neutral)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-xs font-medium">백테스팅</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
