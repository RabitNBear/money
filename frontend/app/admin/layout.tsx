'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, MessageSquare, TrendingUp, ArrowLeft } from 'lucide-react';
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
      <div className="min-h-screen bg-white pt-24 pb-20 selection:bg-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* 사이드바 - 프리미엄 다크 스타일 */}
            <div className="lg:col-span-3">
              <div className="bg-white border-2 border-gray-50 rounded-[32px] p-8 sticky top-32 shadow-sm">
                <div className="mb-10">
                  <h2 className="text-[22px] font-black tracking-tighter text-black uppercase leading-none">
                    Admin<br />Panel
                  </h2>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-2">Ggeul-mu-sae System</p>
                </div>

                <nav className="space-y-2">
                  {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-4 px-5 py-4 rounded-[18px] font-black text-[14px] transition-all uppercase tracking-tight cursor-pointer ${isActive
                            ? 'bg-black text-white shadow-xl scale-[1.02]'
                            : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                          }`}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-12 pt-8 border-t border-gray-100">
                  <Link
                    href="/"
                    className="group flex items-center gap-2 text-[12px] font-black text-gray-300 hover:text-black transition-all uppercase tracking-widest cursor-pointer"
                  >
                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                    Exit Admin
                  </Link>
                </div>
              </div>
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div className="lg:col-span-9 animate-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}