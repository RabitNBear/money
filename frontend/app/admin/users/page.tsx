'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, Calendar, UserPlus } from 'lucide-react';
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

interface UserStats {
  totalUsers: number;
  todaySignups: number;
  weekSignups: number;
  monthSignups: number;
  dailySignups: { date: string; count: number }[];
  providerStats: { provider: string; count: number }[];
}

export default function AdminUsersPage() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    todaySignups: 0,
    weekSignups: 0,
    monthSignups: 0,
    dailySignups: [],
    providerStats: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/users/stats`);
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setUserStats({
            totalUsers: data.totalUsers ?? 0,
            todaySignups: data.todaySignups ?? 0,
            weekSignups: data.weekSignups ?? 0,
            monthSignups: data.monthSignups ?? 0,
            dailySignups: Array.isArray(data.dailySignups) ? data.dailySignups : [],
            providerStats: Array.isArray(data.providerStats) ? data.providerStats : [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

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

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'LOCAL':
        return 'bg-gray-100 text-gray-700';
      case 'GOOGLE':
        return 'bg-red-50 text-red-600';
      case 'KAKAO':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statCards = [
    {
      title: '총 회원',
      value: userStats.totalUsers,
      icon: Users,
      color: 'indigo',
    },
    {
      title: '오늘 가입',
      value: userStats.todaySignups,
      icon: UserPlus,
      color: 'green',
    },
    {
      title: '이번 주',
      value: userStats.weekSignups,
      icon: Calendar,
      color: 'blue',
    },
    {
      title: '이번 달',
      value: userStats.monthSignups,
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-[28px] font-black tracking-tighter text-black flex items-center gap-3">
          <Users className="text-indigo-500" />
          회원 관리
        </h1>
        <p className="text-gray-400 text-[14px] mt-1">회원 가입 현황 및 통계를 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl shadow-sm p-4 md:p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] md:text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-[28px] md:text-[36px] font-black text-black mt-1 md:mt-2">
                    {isLoading ? '-' : card.value}
                  </p>
                </div>
                <div
                  className={`p-2 md:p-3 rounded-xl ${
                    card.color === 'indigo'
                      ? 'bg-indigo-50 text-indigo-500'
                      : card.color === 'green'
                        ? 'bg-green-50 text-green-500'
                        : card.color === 'blue'
                          ? 'bg-blue-50 text-blue-500'
                          : 'bg-purple-50 text-purple-500'
                  }`}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 가입 추세 차트 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[18px] font-black tracking-tighter text-black flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" />
              회원 가입 추세
            </h2>
            <p className="text-[12px] text-gray-400 mt-1">최근 30일간 일별 가입자 수</p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-400">로딩 중...</p>
          </div>
        ) : userStats.dailySignups && userStats.dailySignups.length > 0 ? (
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height={300}>
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
                  tickFormatter={(value: string) => {
                    if (!value || typeof value !== 'string') return '';
                    const parts = value.split('-');
                    if (parts.length < 3) return value;
                    return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
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
                  labelFormatter={(value: string) => {
                    if (!value || typeof value !== 'string') return '';
                    const parts = value.split('-');
                    if (parts.length < 3) return value;
                    return `${parts[0]}년 ${parseInt(parts[1])}월 ${parseInt(parts[2])}일`;
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
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-400">데이터가 없습니다</p>
          </div>
        )}
      </div>

      {/* 가입 경로별 통계 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <h2 className="text-[18px] font-black tracking-tighter text-black mb-6">
          가입 경로별 회원 수
        </h2>

        {isLoading ? (
          <p className="text-gray-400">로딩 중...</p>
        ) : userStats.providerStats && userStats.providerStats.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {userStats.providerStats.map((stat) => (
              <div
                key={stat.provider}
                className={`p-6 rounded-xl ${getProviderColor(stat.provider)}`}
              >
                <p className="text-[14px] font-bold mb-2">{getProviderName(stat.provider)}</p>
                <p className="text-[32px] font-black">{stat.count}명</p>
                <p className="text-[12px] opacity-70 mt-1">
                  {userStats.totalUsers > 0
                    ? `${((stat.count / userStats.totalUsers) * 100).toFixed(1)}%`
                    : '0%'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">데이터가 없습니다</p>
        )}
      </div>
    </div>
  );
}
