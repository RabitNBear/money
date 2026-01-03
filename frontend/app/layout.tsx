import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-white`}
      >
        <div className="min-h-screen flex flex-col">
          {/* 헤더 */}
          <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/" className="text-xl font-bold">
                껄무새
              </a>
              <nav className="flex items-center gap-4">
                <a
                  href="/calculator"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  배당 계산기
                </a>
                <a
                  href="/backtest"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  백테스팅
                </a>
              </nav>
            </div>
          </header>

          {/* 메인 컨텐츠 */}
          <main className="flex-1">{children}</main>

          {/* 푸터 */}
          <footer className="border-t border-gray-200 dark:border-gray-800 py-6">
            <div className="max-w-screen-xl mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-400">
              <p>
                본 서비스는 투자 권유가 아니며, 투자 판단의 책임은 본인에게
                있습니다.
              </p>
              <p className="mt-2">© 2025 껄무새. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
