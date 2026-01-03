'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatNumber, formatCurrency, formatPercent, convertToAssets } from '@/lib/utils';
import type { BacktestResult } from '@/types';

export default function BacktestPage() {
  const [ticker, setTicker] = useState('');
  const [years, setYears] = useState(10);
  const [amount, setAmount] = useState(10000000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleBacktest = async () => {
    if (!ticker) return;

    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(
        Date.now() - years * 365 * 24 * 60 * 60 * 1000
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
    } catch (error) {
      alert('백테스팅 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 차트 데이터 합치기
  const chartData =
    result?.history.map((point, i) => ({
      date: point.date,
      value: point.value,
      benchmark: result.benchmarkHistory[i]?.value || 0,
    })) || [];

  const assets = result ? convertToAssets(result.finalValue) : [];

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">백테스팅</h1>

      {/* 입력 폼 */}
      <div className="card space-y-4">
        <div>
          <label className="label block mb-1">종목 티커</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="예: AAPL, NVDA, 005930.KS"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label block mb-1">투자 기간</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((y) => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    years === y
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {y}년
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label block mb-1">투자금</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                원
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleBacktest}
          disabled={loading || !ticker}
          className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '분석 중...' : '백테스팅 시작'}
        </button>
      </div>

      {/* 결과 */}
      {result && (
        <div className="mt-6 space-y-6">
          {/* 요약 카드 */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">{result.ticker} 백테스팅 결과</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="label">투자금</div>
                <div className="font-semibold">
                  {formatCurrency(result.initialInvestment)}
                </div>
              </div>
              <div className="text-center">
                <div className="label">최종 평가액</div>
                <div className="number-lg text-profit">
                  {formatCurrency(result.finalValue)}
                </div>
              </div>
              <div className="text-center">
                <div className="label">총 수익률</div>
                <div
                  className={`font-bold text-xl ${
                    result.totalReturn >= 0 ? 'text-profit' : 'text-loss'
                  }`}
                >
                  {formatPercent(result.totalReturn)}
                </div>
              </div>
              <div className="text-center">
                <div className="label">연평균 수익률 (CAGR)</div>
                <div
                  className={`font-bold text-xl ${
                    result.cagr >= 0 ? 'text-profit' : 'text-loss'
                  }`}
                >
                  {formatPercent(result.cagr)}
                </div>
              </div>
            </div>

            {/* 벤치마크 비교 */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="label">
                  벤치마크 ({result.benchmarkSymbol}) 수익률
                </span>
                <span
                  className={`font-semibold ${
                    result.benchmarkReturn >= 0 ? 'text-profit' : 'text-loss'
                  }`}
                >
                  {formatPercent(result.benchmarkReturn)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="label">초과 수익률</span>
                <span
                  className={`font-bold ${
                    result.totalReturn - result.benchmarkReturn >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {formatPercent(result.totalReturn - result.benchmarkReturn)}
                </span>
              </div>
            </div>
          </div>

          {/* 차트 */}
          <div className="card">
            <h3 className="font-bold mb-4">수익률 추이</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.slice(2, 7)}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      `${formatNumber(value / 10000)}만`
                    }
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value) || 0)}
                    labelFormatter={(label) => String(label)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={result.ticker}
                    stroke="#f04251"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    name={result.benchmarkSymbol}
                    stroke="#888888"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 자산 환산 */}
          {assets.length > 0 && (
            <div className="card">
              <h3 className="font-bold mb-4">이 돈이면...</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.label}
                    className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="text-3xl mb-2">{asset.emoji}</div>
                    <div className="font-bold text-xl">
                      {asset.label} {asset.count.toFixed(1)}대
                    </div>
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
