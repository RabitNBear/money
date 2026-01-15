'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import AdminGuard from './components/AdminGuard';

const sidebarLinks = [
  { name: '대시보드', href: '/admin', icon: LayoutDashboard },
  { name: 'IPO 관리', href: '/admin/ipo', icon: TrendingUp },
  { name: '공지사항', href: '/admin/notice', icon: FileText },
  { name: '문의 답변', href: '/admin/inquiry', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0a0a0b] text-white pt-20">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 사이드바 */}
            <div className="lg:col-span-3">
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-[20px] font-black tracking-tighter mb-6 text-white">
                  Admin Panel
                </h2>
                <nav className="space-y-2">
                  {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all ${isActive
                          ? 'bg-white text-black'
                          : 'text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        <Icon size={18} />
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <Link
                    href="/"
                    className="text-[12px] font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    ← 사이트로 돌아가기
                  </Link>
                </div>
              </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="lg:col-span-9">{children}</div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
