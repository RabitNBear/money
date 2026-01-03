'use client';

import { useState } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { formatNumber, formatCurrency, formatPercent, convertToAssets } from '@/lib/utils';
import TickerSearch from '@/components/TickerSearch';
import type { BacktestResult } from '@/types';

export default function BacktestPage() {
  const [ticker, setTicker] = useState('');
  const [tickerName, setTickerName] = useState('');
  const [periodValue, setPeriodValue] = useState(10);
  const [periodUnit, setPeriodUnit] = useState<'year' | 'month'>('year');
  const [amount, setAmount] = useState(10000000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleTickerChange = (newTicker: string, name?: string) => {
    setTicker(newTicker);
    if (name) setTickerName(name);
  };

  // 기간을 일수로 변환
  const getPeriodInDays = () => {
    if (periodUnit === 'year') {
      return periodValue * 365;
    }
    return periodValue * 30; // 월은 30일로 계산
  };

  const handleBacktest = async () => {
    if (!ticker) return;

    setLoading(true);
    setResult(null);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(
        Date.now() - getPeriodInDays() * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const res = await fetch(
        `/api/history/${ticker}?start=${startDate}&end=${endDate}&amount=${amount}`
      );
      const json = await res.json();

      if (!json.success) {
        alert(json.error);
        return;
      }

      setResult(json.data);
    } catch {
      alert('백테스팅 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    result?.history.map((point, i) => ({
      date: point.date,
      value: point.value,
      benchmark: result.benchmarkHistory[i]?.value || 0,
    })) || [];

  const assets = result ? convertToAssets(result.finalValue) : [];

  const yearPresets = [
    { value: 6, unit: 'month' as const, label: '6개월' },
    { value: 1, unit: 'year' as const, label: '1년' },
    { value: 3, unit: 'year' as const, label: '3년' },
    { value: 5, unit: 'year' as const, label: '5년' },
    { value: 10, unit: 'year' as const, label: '10년' },
  ];
  const amountPresets = [
    { value: 10000000, label: '1천만' },
    { value: 50000000, label: '5천만' },
    { value: 100000000, label: '1억' },
  ];

  return (
    <div className="max-w-screen-lg mx-auto px-5 py-6 pb-24 md:pb-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">만약에 투자했다면?</h1>
        <p className="text-[var(--neutral)]">
          과거로 돌아가 투자했다면 지금 얼마가 되었을까요?
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="card shadow-card space-y-6">
        {/* 종목 검색 */}
        <div>
          <label className="label block mb-2">종목 검색</label>
          <TickerSearch
            value={ticker}
            onChange={handleTickerChange}
            placeholder="삼성전자, 애플, NVDA..."
          />
        </div>

        {/* 투자 기간 */}
        <div>
          <label className="label block mb-2">투자 기간</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                value={periodValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  const num = Number(value) || 1;
                  const max = periodUnit === 'year' ? 50 : 600;
                  setPeriodValue(Math.min(Math.max(num, 1), max));
                }}
                className="input text-center"
              />
            </div>
            <div className="flex">
              <button
                onClick={() => {
                  setPeriodUnit('year');
                  if (periodValue > 50) setPeriodValue(50);
                }}
                className={`px-4 py-2 rounded-l-xl border transition-colors ${
                  periodUnit === 'year'
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'bg-[var(--card)] border-[var(--border)] text-[var(--neutral)]'
                }`}
              >
                년
              </button>
              <button
                onClick={() => setPeriodUnit('month')}
                className={`px-4 py-2 rounded-r-xl border-t border-r border-b transition-colors ${
                  periodUnit === 'month'
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'bg-[var(--card)] border-[var(--border)] text-[var(--neutral)]'
                }`}
              >
                개월
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {yearPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setPeriodValue(preset.value);
                  setPeriodUnit(preset.unit);
                }}
                className={`chip ${periodValue === preset.value && periodUnit === preset.unit ? 'active' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 투자금 */}
        <div>
          <label className="label block mb-2">투자금</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={formatNumber(amount)}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setAmount(Number(value) || 0);
              }}
              className="input pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neutral)] font-medium">
              원
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            {amountPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setAmount(preset.value)}
                className={`chip ${amount === preset.value ? 'active' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleBacktest}
          disabled={loading || !ticker}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              분석 중...
            </span>
          ) : (
            '시뮬레이션 시작'
          )}
        </button>
      </div>

      {/* 결과 */}
      {result && (
        <div className="mt-6 space-y-4 animate-slide-up">
          {/* 요약 카드 */}
          <div className="card shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <h2 className="text-lg font-bold">{tickerName || result.ticker} 시뮬레이션 결과</h2>
            </div>

            {/* 메인 결과 */}
            <div className="bg-[var(--primary-light)] rounded-2xl p-6 mb-4">
              <div className="text-center">
                <div className="label mb-1">최종 평가액</div>
                <div className="number-hero text-[var(--primary)]">
                  {formatCurrency(result.finalValue)}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="label">투자금 {formatCurrency(result.initialInvestment)}</span>
                  <span className="text-[var(--neutral)]">→</span>
                  <span className={`font-bold ${result.totalReturn >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {result.totalReturn >= 0 ? '+' : ''}{formatPercent(result.totalReturn)}
                  </span>
                </div>
              </div>
            </div>

            {/* 상세 지표 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center py-3 bg-[var(--card-hover)] rounded-xl">
                <div className="label mb-1">CAGR</div>
                <div className={`number-lg ${result.cagr >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatPercent(result.cagr)}
                </div>
                <div className="label-sm">연평균 수익률</div>
              </div>
              <div className="text-center py-3 bg-[var(--card-hover)] rounded-xl">
                <div className="label mb-1">벤치마크</div>
                <div className={`number-lg ${result.benchmarkReturn >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatPercent(result.benchmarkReturn)}
                </div>
                <div className="label-sm">{result.benchmarkSymbol}</div>
              </div>
            </div>

            {/* 초과 수익률 */}
            <div className="mt-4 p-4 bg-[var(--card-hover)] rounded-xl">
              <div className="flex justify-between items-center">
                <span className="font-medium">벤치마크 대비 초과 수익</span>
                <span className={`number-lg ${
                  result.totalReturn - result.benchmarkReturn >= 0
                    ? 'text-profit'
                    : 'text-loss'
                }`}>
                  {result.totalReturn - result.benchmarkReturn >= 0 ? '+' : ''}
                  {formatPercent(result.totalReturn - result.benchmarkReturn)}
                </span>
              </div>
            </div>
          </div>

          {/* 차트 */}
          <div className="card shadow-card">
            <h3 className="font-bold mb-4">수익률 추이</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3182f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3182f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--neutral)' }}
                    tickFormatter={(value) => value.slice(2, 7)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--neutral)' }}
                    tickFormatter={(value) =>
                      `${formatNumber(value / 10000)}만`
                    }
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value) => formatCurrency(Number(value) || 0)}
                    labelFormatter={(label) => String(label)}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span style={{ color: 'var(--foreground)', fontSize: '13px' }}>{value}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={tickerName || result.ticker}
                    stroke="#3182f6"
                    strokeWidth={2}
                    fill="url(#colorValue)"
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    name={result.benchmarkSymbol}
                    stroke="#8b95a1"
                    strokeWidth={1.5}
                    dot={false}
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 자산 환산 */}
          {assets.length > 0 && (
            <div className="card shadow-card">
              <h3 className="font-bold mb-4">이 돈이면...</h3>
              <div className="grid grid-cols-3 gap-3">
                {assets.map((asset) => (
                  <div
                    key={asset.label}
                    className="text-center p-4 bg-[var(--card-hover)] rounded-xl"
                  >
                    <div className="text-3xl mb-2">{asset.emoji}</div>
                    <div className="font-bold text-lg">{asset.count.toFixed(1)}</div>
                    <div className="label-sm">{asset.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
