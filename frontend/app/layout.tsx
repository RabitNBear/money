'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import './globals.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // 로그인 상태 확인 (쿠키 기반)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include', // 쿠키 포함
        });
        if (res.ok) {
          const response = await res.json();
          const userData = response.data || response;
          setIsLoggedIn(true);
          setUserName(userData.name || '사용자');
          setIsAdmin(userData.role === 'ADMIN');
        } else {
          setIsLoggedIn(false);
          setUserName(null);
          setIsAdmin(false);
        }
      } catch {
        setIsLoggedIn(false);
        setUserName(null);
        setIsAdmin(false);
      }
    };
    checkAuth();

    // 커스텀 이벤트로 로그인/로그아웃 감지
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // 로그아웃 핸들러 (쿠키 기반)
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
      });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoggedIn(false);
      setUserName(null);
      setIsAdmin(false);
      setIsUserMenuOpen(false);
      window.dispatchEvent(new Event('authChange'));
      router.push('/');
    }
  };

  const navLinks = [
    { name: 'CALCULATOR', href: '/calculator' },
    { name: 'BACKTEST', href: '/backtest' },
    { name: 'MY STOCK', href: '/mystock' },
    { name: 'STOCK', href: '/stock' },
    { name: 'CALENDAR', href: '/calendar' },
  ];

  const secondaryLinks = [
    { name: '공지사항', href: '/notice' },
    { name: '고객센터', href: '/inquiry' },
  ];

  return (
    <html lang="ko">
      <head>
        <title>껄무새</title>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0a0a0b" />
      </head>
      <body className="antialiased text-white bg-[#0a0a0b]">
        <header className="fixed top-0 left-0 right-0 z-[100]">
          {/* 헤더 : 배경색과 블러 적용 */}
          <div className="relative z-[110] border-b border-white/5 backdrop-blur-xl bg-black/60">
            <div className="max-w-[1400px] mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
              {/* 로고 */}
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <span className="text-lg sm:text-xl font-black tracking-tighter">GGEULMUSE</span>
              </Link>

              {/* 데스크탑 네비게이션 */}
              <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* 데스크탑 서브 링크 */}
              <div className="hidden lg:flex items-center gap-6">

                {/* 로그인/사용자 정보 */}
                {isLoggedIn ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <User size={16} />
                      <span>{userName}</span>
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-8 w-40 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <Link
                          href="/mypage"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-white/70 hover:bg-white/10 transition-colors"
                        >
                          <User size={14} />
                          마이페이지
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-white/70 hover:bg-white/10 transition-colors"
                          >
                            <Settings size={14} />
                            관리자
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-red-400 hover:bg-white/10 transition-colors"
                        >
                          <LogOut size={14} />
                          로그아웃
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-[11px] font-bold tracking-[0.1em] opacity-40 hover:opacity-100 transition-opacity"
                  >
                    로그인
                  </Link>
                )}

                {secondaryLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[11px] font-bold tracking-[0.1em] opacity-40 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>


              {/* 모바일 메뉴 버튼 : z-index를 높게 설정하여 메뉴 위에서도 보이게 */}
              <button
                className="lg:hidden p-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
              </button>
            </div>
          </div>

          {/* 모바일 전용 오버레이 메뉴 : 배경 투명도 해결 */}
          <div className={`
            fixed inset-0 bg-[#0a0a0b] z-[105] lg:hidden transition-all duration-300 ease-in-out
            ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
          `}>
            {/* 내부 컨텐츠 : pt-24를 주어 헤더 바와 겹치지 않게 배치 */}
            <nav className="flex flex-col p-8 pt-28 gap-10 h-full overflow-y-auto">
              {/* 메인 메뉴 */}
              <div className="flex flex-col gap-6 border-b border-white/10 pb-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[32px] font-black tracking-tighter uppercase active:opacity-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* 서브 메뉴 */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[14px] font-bold opacity-40 hover:opacity-100 active:opacity-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* 관리자 링크 */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-[14px] font-bold opacity-40 hover:opacity-100 active:opacity-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    관리자
                  </Link>
                )}

                {/* 로그인/로그아웃 */}
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-[14px] font-bold text-red-400 hover:opacity-100 active:opacity-100 text-left"
                  >
                    로그아웃
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="text-[14px] font-bold opacity-40 hover:opacity-100 active:opacity-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </Link>
                )}
              </div>

              {/* 로그인된 사용자 정보 */}
              {isLoggedIn && userName && (
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <User size={20} className="opacity-40" />
                    <span className="text-[14px] font-bold opacity-70">{userName}님</span>
                  </div>
                </div>
              )}

              {/* 하단 장식 요소 */}
              <div className="mt-auto pb-10">
                <p className="text-[10px] tracking-[0.3em] opacity-20 uppercase font-black">
                  Premium Investment Simulator
                </p>
              </div>
            </nav>
          </div>
        </header>

        <div className="min-h-screen">
          {children}
        </div>

        <footer className="py-12 px-6 border-t border-white/5 bg-black/60 backdrop-blur-md">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
            {/* 상단: 로고 및 링크 */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] tracking-widest opacity-30 uppercase font-black">
                © 2025 GGEULMUSE. All Rights Reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/privacy"
                  className="text-[11px] tracking-wider opacity-40 hover:opacity-100 transition-opacity"
                >
                  개인정보처리방침
                </Link>
                <span className="opacity-20">|</span>
                <Link
                  href="/terms"
                  className="text-[11px] tracking-wider opacity-40 hover:opacity-100 transition-opacity"
                >
                  이용약관
                </Link>
              </div>
            </div>

            {/* 하단: 면책조항 */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/5">
              <p className="text-[10px] opacity-30">
                RabitNBear
              </p>
              <p className="text-[10px] tracking-widest opacity-30 uppercase text-center md:text-right leading-relaxed max-w-[400px]">
                본 서비스는 투자 권유가 아니며, 모든 투자 판단의 책임은 본인에게 있습니다.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}