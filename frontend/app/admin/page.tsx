'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, TrendingUp, AlertCircle, Users } from 'lucide-react';
import { fetchWithAuth, API_URL } from '@/lib/apiClient';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  totalInquiries: number;
  pendingInquiries: number;
  totalNotices: number;
  totalIPOs: number;
  upcomingIPOs: number;
}

interface UserStats {
  totalUsers: number;
  todaySignups: number;
  weekSignups: number;
  monthSignups: number;
  dailySignups: { date: string; count: number }[];
  providerStats: { provider: string; count: number }[];
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
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    todaySignups: 0,
    weekSignups: 0,
    monthSignups: 0,
    dailySignups: [],
    providerStats: [],
  });
  const [pendingInquiries, setPendingInquiries] = useState<PendingInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 회원 통계
        const userStatsRes = await fetchWithAuth(`${API_URL}/users/stats`);
        if (userStatsRes.ok) {
          const userStatsData = await userStatsRes.json();
          setUserStats(userStatsData);
        }

        // 총 문의 통계 (전체)
        const totalInquiryRes = await fetchWithAuth(`${API_URL}/inquiry/admin/all?limit=1`);
        if (totalInquiryRes.ok) {
          const totalInquiryData = await totalInquiryRes.json();
          const inquiryResult = totalInquiryData.data || totalInquiryData;
          setStats((prev) => ({
            ...prev,
            totalInquiries: inquiryResult.pagination?.total || 0,
          }));
        }

        // 미답변 문의 통계 (PENDING만)
        const pendingInquiryRes = await fetchWithAuth(`${API_URL}/inquiry/admin/all?limit=5&status=PENDING`);
        if (pendingInquiryRes.ok) {
          const pendingInquiryData = await pendingInquiryRes.json();
          const pendingResult = pendingInquiryData.data || pendingInquiryData;
          setStats((prev) => ({
            ...prev,
            pendingInquiries: pendingResult.pagination?.total || 0,
          }));
          setPendingInquiries(pendingResult.inquiries || []);
        }

        // 공지사항 통계
        const noticeRes = await fetch(`${API_URL}/notice`);
        if (noticeRes.ok) {
          const noticeData = await noticeRes.json();
          const noticeResult = noticeData.data || noticeData;
          setStats((prev) => ({
            ...prev,
            totalNotices: noticeResult.pagination?.total || noticeResult.notices?.length || 0,
          }));
        }

        // IPO 통계
        const ipoRes = await fetch(`${API_URL}/ipo`);
        if (ipoRes.ok) {
          const ipoData = await ipoRes.json();
          const ipoResult = ipoData.data || ipoData;
          setStats((prev) => ({
            ...prev,
            totalIPOs: ipoResult.pagination?.total || 0,
          }));
        }

        const upcomingRes = await fetch(`${API_URL}/ipo/upcoming`);
        if (upcomingRes.ok) {
          const upcomingData = await upcomingRes.json();
          const upcomingResult = upcomingData.data || upcomingData;
          setStats((prev) => ({
            ...prev,
            upcomingIPOs: Array.isArray(upcomingResult) ? upcomingResult.length : 0,
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
      title: '총 회원',
      value: userStats.totalUsers,
      sub: `오늘 +${userStats.todaySignups}`,
      icon: Users,
      color: 'indigo',
      href: '#users',
    },
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

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'LOCAL':
        return '이메일';
      case 'GOOGLE':
        return '구글';
      case 'KAKAO':
        return '카카오';
      default:
        return provider;
    }
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-[28px] font-black tracking-tighter text-black">관리자 대시보드</h1>
        <p className="text-gray-400 text-[14px] mt-1">껄무새 서비스 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isLink = card.href !== '#users';
          const CardWrapper = isLink ? Link : 'div';
          return (
            <CardWrapper
              key={card.title}
              href={card.href}
              className="bg-white rounded-2xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] md:text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-[28px] md:text-[36px] font-black text-black mt-1 md:mt-2">
                    {isLoading ? '-' : card.value}
                  </p>
                  <p className="text-[11px] md:text-[13px] text-gray-400 mt-1">{card.sub}</p>
                </div>
                <div
                  className={`p-2 md:p-3 rounded-xl ${card.color === 'indigo'
                      ? 'bg-indigo-50 text-indigo-500'
                      : card.color === 'blue'
                        ? 'bg-blue-50 text-blue-500'
                        : card.color === 'green'
                          ? 'bg-green-50 text-green-500'
                          : 'bg-purple-50 text-purple-500'
                    }`}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* 회원 가입 추세 차트 */}
      <div id="users" className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[18px] font-black tracking-tighter text-black flex items-center gap-2">
              <Users size={20} className="text-indigo-500" />
              회원 가입 추세
            </h2>
            <p className="text-[12px] text-gray-400 mt-1">최근 30일간 일별 가입자 수</p>
          </div>
          <div className="flex gap-4 text-[12px]">
            <div className="bg-gray-50 px-4 py-2 rounded-xl">
              <span className="text-gray-400">이번 주</span>
              <span className="font-black text-black ml-2">{userStats.weekSignups}명</span>
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-xl">
              <span className="text-gray-400">이번 달</span>
              <span className="font-black text-black ml-2">{userStats.monthSignups}명</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-gray-400">로딩 중...</p>
          </div>
        ) : userStats.dailySignups.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={userStats.dailySignups}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSignup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                  }}
                  formatter={(value) => [`${value}명`, '가입자']}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSignup)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-gray-400">데이터가 없습니다</p>
          </div>
        )}

        {/* 가입 경로 통계 */}
        {userStats.providerStats.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-[14px] font-bold text-gray-600 mb-4">가입 경로별 회원 수</h3>
            <div className="flex flex-wrap gap-3">
              {userStats.providerStats.map((stat) => (
                <div
                  key={stat.provider}
                  className={`px-4 py-2 rounded-xl text-[13px] font-medium ${
                    stat.provider === 'LOCAL'
                      ? 'bg-gray-100 text-gray-700'
                      : stat.provider === 'GOOGLE'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {getProviderName(stat.provider)}: {stat.count}명
                </div>
              ))}
            </div>
          </div>
        )}
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
