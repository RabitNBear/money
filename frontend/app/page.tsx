'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
      } catch {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-screen-lg mx-auto px-5 py-6 pb-24 md:pb-6">
        {/* 환율 스켈레톤 */}
        <div className="flex justify-center mb-6">
          <div className="skeleton w-32 h-8 rounded-full" />
        </div>

        {/* 카드 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card shadow-card">
            <div className="skeleton w-24 h-6 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="skeleton w-20 h-5" />
                  <div className="skeleton w-24 h-6" />
                </div>
              ))}
            </div>
          </div>
          <div className="card shadow-card">
            <div className="skeleton w-24 h-6 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="skeleton w-20 h-5" />
                  <div className="skeleton w-24 h-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-lg mx-auto px-5 py-6 pb-24 md:pb-6">
        <div className="card shadow-card text-center py-12">
          <div className="text-4xl mb-4">😢</div>
          <p className="text-[var(--neutral)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-5 py-6 pb-24 md:pb-6 animate-fade-in">
      {/* 환율 배지 */}
      {data?.exchangeRate && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] shadow-card">
            <span className="text-sm text-[var(--neutral)]">USD/KRW</span>
            <span className="text-lg font-bold">
              {formatNumber(data.exchangeRate, 0)}
              <span className="text-sm font-normal text-[var(--neutral)]">원</span>
            </span>
          </div>
        </div>
      )}

      {/* 시장 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 한국 시장 */}
        <div className="card shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇰🇷</span>
              <h2 className="text-lg font-bold">한국 시장</h2>
            </div>
            {data?.fearGreedKR && <FearGreedBadge fearGreed={data.fearGreedKR} />}
          </div>

          <div className="space-y-1">
            {data?.kr.map((index) => (
              <IndexRow key={index.symbol} index={index} />
            ))}
          </div>
        </div>

        {/* 미국 시장 */}
        <div className="card shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇺🇸</span>
              <h2 className="text-lg font-bold">미국 시장</h2>
            </div>
            {data?.fearGreedUS && <FearGreedBadge fearGreed={data.fearGreedUS} />}
          </div>

          <div className="space-y-1">
            {data?.us.map((index) => (
              <IndexRow key={index.symbol} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="mt-6">
        <h3 className="section-title px-1">빠른 시작</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/calculator" className="card card-interactive shadow-card">
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-3">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="font-bold mb-1">배당금 계산기</h4>
              <p className="text-sm text-[var(--neutral)]">
                월 배당 목표 설정하기
              </p>
            </div>
          </Link>

          <Link href="/backtest" className="card card-interactive shadow-card">
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-3">
                <span className="text-2xl">📈</span>
              </div>
              <h4 className="font-bold mb-1">백테스팅</h4>
              <p className="text-sm text-[var(--neutral)]">
                과거 수익률 시뮬레이션
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 업데이트 시간 */}
      {data?.updatedAt && (
        <div className="mt-8 text-center">
          <span className="label-sm">
            {new Date(data.updatedAt).toLocaleString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            기준
          </span>
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

  const isPositive = index.changePercent >= 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-b-0">
      <div>
        <div className="font-semibold">
          {indexNames[index.symbol] || index.name}
        </div>
        <div className="label-sm">{index.symbol}</div>
      </div>
      <div className="text-right">
        <div className="number-lg">{formatNumber(index.price, 2)}</div>
        <div className={`change-indicator ${getProfitColor(index.changePercent)}`}>
          {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(index.changePercent))}
        </div>
      </div>
    </div>
  );
}

// 공포/탐욕 배지 컴포넌트
function FearGreedBadge({ fearGreed }: { fearGreed: FearGreedIndex }) {
  const levelClasses: Record<string, string> = {
    greed: 'badge-greed',
    neutral: 'badge-neutral',
    fear: 'badge-fear',
    extreme_fear: 'badge-extreme-fear',
  };

  return (
    <div className={`badge ${levelClasses[fearGreed.level]}`}>
      {fearGreed.message}
    </div>
  );
}
