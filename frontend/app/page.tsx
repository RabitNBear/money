'use client';

import { useEffect, useState } from 'react';
import { formatNumber, formatPercent, getProfitColor } from '@/lib/utils';
import type { MarketIndex, FearGreedIndex } from '@/types';

interface MarketData {
  us: MarketIndex[];
  kr: MarketIndex[];
  fearGreedUS: FearGreedIndex | null;
  fearGreedKR: FearGreedIndex | null;
  exchangeRate: number | null;
  updatedAt: string;
}

export default function Home() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const res = await fetch('/api/market');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* 환율 */}
      {data?.exchangeRate && (
        <div className="mb-6 text-center">
          <span className="label">USD/KRW</span>
          <span className="ml-2 text-lg font-semibold">
            {formatNumber(data.exchangeRate, 2)}원
          </span>
        </div>
      )}

      {/* 한국/미국 시장 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 한국 시장 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">한국 시장</h2>
            {data?.fearGreedKR && (
              <FearGreedBadge fearGreed={data.fearGreedKR} />
            )}
          </div>

          <div className="space-y-3">
            {data?.kr.map((index) => (
              <IndexRow key={index.symbol} index={index} />
            ))}
          </div>
        </div>

        {/* 미국 시장 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">미국 시장</h2>
            {data?.fearGreedUS && (
              <FearGreedBadge fearGreed={data.fearGreedUS} />
            )}
          </div>

          <div className="space-y-3">
            {data?.us.map((index) => (
              <IndexRow key={index.symbol} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <a
          href="/calculator"
          className="card hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center"
        >
          <div className="text-3xl mb-2">💰</div>
          <div className="font-semibold">배당금 계산기</div>
          <div className="text-sm text-gray-500">
            월 배당금 목표를 설정하세요
          </div>
        </a>

        <a
          href="/backtest"
          className="card hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center"
        >
          <div className="text-3xl mb-2">⏰</div>
          <div className="font-semibold">백테스팅</div>
          <div className="text-sm text-gray-500">
            과거로 돌아가 투자해보세요
          </div>
        </a>
      </div>

      {/* 업데이트 시간 */}
      {data?.updatedAt && (
        <div className="mt-6 text-center text-xs text-gray-400">
          마지막 업데이트: {new Date(data.updatedAt).toLocaleString('ko-KR')}
        </div>
      )}
    </div>
  );
}

// 지수 행 컴포넌트
function IndexRow({ index }: { index: MarketIndex }) {
  const indexNames: Record<string, string> = {
    '^GSPC': 'S&P 500',
    '^IXIC': '나스닥',
    '^DJI': '다우존스',
    '^KS11': 'KOSPI',
    '^KQ11': 'KOSDAQ',
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">
          {indexNames[index.symbol] || index.name}
        </div>
        <div className="text-xs text-gray-500">{index.symbol}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{formatNumber(index.price, 2)}</div>
        <div className={`text-sm ${getProfitColor(index.changePercent)}`}>
          {formatPercent(index.changePercent)}
        </div>
      </div>
    </div>
  );
}

// 공포/탐욕 배지 컴포넌트
function FearGreedBadge({ fearGreed }: { fearGreed: FearGreedIndex }) {
  const levelColors: Record<string, string> = {
    greed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    fear: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    extreme_fear: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[fearGreed.level]}`}
    >
      {fearGreed.message}
    </div>
  );
}
