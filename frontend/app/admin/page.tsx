'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, TrendingUp, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { fetchWithAuth, API_URL } from '@/lib/apiClient';

interface Stats {
  totalInquiries: number;
  pendingInquiries: number;
  totalNotices: number;
  totalIPOs: number;
  upcomingIPOs: number;
}

interface PendingInquiry {
  id: string;
  title: string;
  createdAt: string;
  category: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalInquiries: 0,
    pendingInquiries: 0,
    totalNotices: 0,
    totalIPOs: 0,
    upcomingIPOs: 0,
  });
  const [pendingInquiries, setPendingInquiries] = useState<PendingInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const inquiryRes = await fetchWithAuth(`${API_URL}/inquiry/admin/all?limit=5&status=PENDING`);
        if (inquiryRes.ok) {
          const inquiryData = await inquiryRes.json();
          setStats((prev) => ({
            ...prev,
            totalInquiries: inquiryData.pagination?.total || 0,
            pendingInquiries: inquiryData.pagination?.total || 0,
          }));
          setPendingInquiries(inquiryData.inquiries || []);
        }

        const noticeRes = await fetch(`${API_URL}/notice`);
        if (noticeRes.ok) {
          const noticeData = await noticeRes.json();
          setStats((prev) => ({
            ...prev,
            totalNotices: noticeData.pagination?.total || noticeData.notices?.length || 0,
          }));
        }

        const ipoRes = await fetch(`${API_URL}/ipo`);
        if (ipoRes.ok) {
          const ipoData = await ipoRes.json();
          setStats((prev) => ({
            ...prev,
            totalIPOs: ipoData.data?.pagination?.total || 0,
          }));
        }

        const upcomingRes = await fetch(`${API_URL}/ipo/upcoming`);
        if (upcomingRes.ok) {
          const upcomingData = await upcomingRes.json();
          setStats((prev) => ({
            ...prev,
            upcomingIPOs: upcomingData.length || 0,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: '총 문의',
      value: stats.totalInquiries,
      sub: `미답변 ${stats.pendingInquiries}건`,
      icon: MessageSquare,
      color: 'blue',
      href: '/admin/inquiry',
    },
    {
      title: '공지사항',
      value: stats.totalNotices,
      sub: '게시된 공지',
      icon: FileText,
      color: 'black',
      href: '/admin/notice',
    },
    {
      title: 'IPO',
      value: stats.totalIPOs,
      sub: `예정 ${stats.upcomingIPOs}건`,
      icon: TrendingUp,
      color: 'purple',
      href: '/admin/ipo',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* 헤더 섹션 - 메인 페이지 스타일 반영 */}
      <div className="mb-12">
        <h1 className="text-[32px] sm:text-[40px] font-black tracking-tighter text-black uppercase leading-none">
          Admin<br />Dashboard
        </h1>
        <div className="flex items-center gap-3 mt-4">
          <div className="h-[1px] w-8 bg-black/20" />
          <p className="text-gray-400 text-[12px] font-bold uppercase tracking-[0.2em]">껄무새 서비스 관리 현황</p>
        </div>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white border-2 border-gray-50 rounded-[32px] p-8 transition-all hover:border-black hover:shadow-xl cursor-pointer"
            >
              <div className="flex flex-col h-full justify-between gap-8">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl ${card.color === 'blue' ? 'bg-blue-50 text-blue-500' :
                      card.color === 'black' ? 'bg-gray-100 text-black' :
                        'bg-purple-50 text-purple-500'
                    }`}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                  <ChevronRight size={20} className="text-gray-200 group-hover:text-black transition-colors" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest mb-1">{card.title}</p>
                  <p className="text-[42px] font-black text-black leading-none tracking-tighter">
                    {isLoading ? <Loader2 className="animate-spin text-gray-200" /> : card.value}
                  </p>
                  <p className="text-[13px] font-bold text-gray-400 mt-2 italic">{card.sub}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 미답변 문의 섹션 */}
      <div className="bg-white border-2 border-gray-50 rounded-[40px] p-8 sm:p-10 shadow-sm">
        <div className="flex items-center justify-between mb-10 border-b-2 border-black pb-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} className="text-red-500" strokeWidth={2.5} />
            <h2 className="text-[20px] font-black tracking-tighter text-black uppercase">Pending Inquiries</h2>
          </div>
          <Link
            href="/admin/inquiry"
            className="text-[11px] font-black text-gray-300 hover:text-black transition-colors uppercase tracking-widest cursor-pointer"
          >
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-200" size={40} />
          </div>
        ) : pendingInquiries.length > 0 ? (
          <div className="space-y-4">
            {pendingInquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href={`/admin/inquiry?id=${inquiry.id}`}
                className="flex items-center justify-between p-6 bg-gray-50 rounded-[24px] hover:bg-black hover:text-white transition-all group cursor-pointer"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] font-black px-2 py-0.5 bg-white text-gray-400 rounded uppercase tracking-tighter group-hover:bg-white/10 group-hover:text-white">
                      {inquiry.category}
                    </span>
                    <p className="text-[11px] font-bold text-gray-300 italic group-hover:text-white/40">
                      {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <p className="font-black text-[16px] tracking-tight truncate">{inquiry.title}</p>
                </div>
                <div className="shrink-0 flex items-center gap-4">
                  <span className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-full group-hover:bg-red-500 group-hover:text-white transition-colors uppercase tracking-widest">
                    Waiting
                  </span>
                  <ChevronRight size={18} className="text-gray-200 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
            <p className="text-gray-300 font-bold italic tracking-tight">모든 문의에 답변이 완료되었습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}