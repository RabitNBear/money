'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatNumber } from '@/lib/utils';

interface ExchangeRateData {
  date: string;
  rate: number;
}

export default function ExchangeRateChart() {
  const [data, setData] = useState<ExchangeRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [change, setChange] = useState<{ value: number; percent: number } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/exchange-rate/history?days=${period}`);
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setData(json.data);

          // 현재 환율과 변화량 계산
          const latest = json.data[json.data.length - 1];
          const first = json.data[0];
          setCurrentRate(latest.rate);

          const changeValue = latest.rate - first.rate;
          const changePercent = ((latest.rate - first.rate) / first.rate) * 100;
          setChange({ value: changeValue, percent: changePercent });
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period]);

  const periodOptions = [
    { value: 7, label: '1주' },
    { value: 30, label: '1개월' },
    { value: 90, label: '3개월' },
  ];

  // 차트 색상 결정 (상승=빨강, 하락=파랑 - 한국식)
  const isUp = change && change.value >= 0;
  const chartColor = isUp ? '#F04251' : '#2B83F6';

  if (loading) {
    return (
      <div className="card shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton w-32 h-6" />
          <div className="skeleton w-24 h-8" />
        </div>
        <div className="skeleton w-full h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="card shadow-card">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💵</span>
          <h3 className="font-bold">USD/KRW 환율</h3>
        </div>

        {/* 기간 선택 */}
        <div className="flex gap-1">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                period === opt.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card-hover)] text-[var(--neutral)] hover:bg-[var(--border)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 현재 환율 */}
      {currentRate && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="number-lg">{formatNumber(currentRate, 2)}</span>
            <span className="text-[var(--neutral)]">원</span>
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-sm ${isUp ? 'text-profit' : 'text-loss'}`}>
              <span>{isUp ? '▲' : '▼'}</span>
              <span>{formatNumber(Math.abs(change.value), 2)}원</span>
              <span>({isUp ? '+' : ''}{change.percent.toFixed(2)}%)</span>
              <span className="text-[var(--neutral)] ml-1">vs {period}일 전</span>
            </div>
          )}
        </div>
      )}

      {/* 차트 */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="exchangeRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--neutral)' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['dataMin - 10', 'dataMax + 10']}
              tick={{ fontSize: 10, fill: 'var(--neutral)' }}
              tickFormatter={(value) => formatNumber(value, 0)}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                padding: '12px',
              }}
              formatter={(value: number) => [`${formatNumber(value, 2)}원`, 'USD/KRW']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={chartColor}
              strokeWidth={2}
              fill="url(#exchangeRateGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
