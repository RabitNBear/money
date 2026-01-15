'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
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
        // 문의 통계
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

        // 공지사항 통계
        const noticeRes = await fetch(`${API_URL}/notice`);
        if (noticeRes.ok) {
          const noticeData = await noticeRes.json();
          setStats((prev) => ({
            ...prev,
            totalNotices: noticeData.pagination?.total || noticeData.notices?.length || 0,
          }));
        }

        // IPO 통계
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
      color: 'green',
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
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-[28px] font-black tracking-tighter text-black">관리자 대시보드</h1>
        <p className="text-gray-400 text-[14px] mt-1">껄무새 서비스 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-[36px] font-black text-black mt-2">
                    {isLoading ? '-' : card.value}
                  </p>
                  <p className="text-[13px] text-gray-400 mt-1">{card.sub}</p>
                </div>
                <div
                  className={`p-3 rounded-xl ${card.color === 'blue'
                      ? 'bg-blue-50 text-blue-500'
                      : card.color === 'green'
                        ? 'bg-green-50 text-green-500'
                        : 'bg-purple-50 text-purple-500'
                    }`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 미답변 문의 목록 */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-black tracking-tighter text-black flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            미답변 문의
          </h2>
          <Link
            href="/admin/inquiry"
            className="text-[12px] font-bold text-gray-400 hover:text-black transition-colors"
          >
            전체 보기 →
          </Link>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-center py-8">로딩 중...</p>
        ) : pendingInquiries.length > 0 ? (
          <div className="space-y-3">
            {pendingInquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href={`/admin/inquiry?id=${inquiry.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-bold text-black text-[14px]">{inquiry.title}</p>
                  <p className="text-[12px] text-gray-400 mt-1">
                    {inquiry.category} · {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                  답변 대기
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">미답변 문의가 없습니다</p>
        )}
      </div>
    </div>
  );
}
