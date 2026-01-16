'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

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
        // fetch 부분의 URL 수정(캐시 방지)
        // const res = await fetch(`/api/exchange-rate/history?days=${period}`);
        const res = await fetch(`/api/exchange-rate/history?days=${period}&_t=${new Date().getTime()}`);
        if (!res.ok) {
          console.error('환율 API 오류:', res.status);
          return;
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setData(json.data);
          const latest = json.data[json.data.length - 1];
          const first = json.data[0];
          setCurrentRate(latest.rate);
          const changeValue = latest.rate - first.rate;
          const changePercent = ((latest.rate - first.rate) / first.rate) * 100;
          setChange({ value: changeValue, percent: changePercent });
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('환율 데이터 로드 실패:', error.message);
        } else {
          console.error('알 수 없는 환율 데이터 로드 오류');
        }
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

  const isUp = change && change.value >= 0;
  const themeColor = isUp ? '#ff4d4f' : '#3182f6';

  if (loading) {
    return <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl" />;
  }

  return (
    <div className="w-full h-full flex flex-col p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-white/40" />
            <span className="text-[10px] sm:text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">달러 환율 그래프</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] sm:text-[44px] font-black tracking-tighter leading-none text-white">
              {currentRate ? formatNumber(currentRate, 2) : '0.00'}
            </span>
            <span className="text-[12px] font-bold text-white/40 uppercase tracking-widest">KRW</span>
          </div>
          {change && (
            <div className={`flex items-center gap-2 mt-3 text-[13px] sm:text-[14px] font-black ${isUp ? 'text-[#ff4d4f]' : 'text-[#3182f6]'}`}>
              <div className="flex items-center gap-1">
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{formatNumber(Math.abs(change.value), 2)}원</span>
              </div>
              <span>({isUp ? '+' : ''}{change.percent.toFixed(2)}%)</span>
            </div>
          )}
        </div>

        <div className="flex bg-white/10 p-1 rounded-xl border border-white/5">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 sm:px-5 py-1.5 text-[10px] sm:text-[11px] font-black rounded-lg transition-all cursor-pointer ${period === opt.value ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="darkChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: 'rgba(255,255,255,0.3)' }}
              minTickGap={30}
              dy={10}
              tickFormatter={(val) => {
                const date = new Date(val);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              // 도메인 조정 (-10, +10)
              domain={['dataMin - 10', 'dataMax + 10']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: 'rgba(255,255,255,0.3)' }}
              tickFormatter={(val) => formatNumber(val, 0)}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '13px', fontWeight: '900', color: '#fff' }}
              formatter={(value) => [`${formatNumber(value as number, 2)}원`, '환율']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={themeColor}
              strokeWidth={3}
              fill="url(#darkChartGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}