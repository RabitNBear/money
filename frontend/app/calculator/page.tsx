'use client';

import { useState } from 'react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import TickerSearch from '@/components/TickerSearch';

export default function CalculatorPage() {
  const [ticker, setTicker] = useState('');
  const [tickerName, setTickerName] = useState('');
  const [targetMonthly, setTargetMonthly] = useState(1000000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    symbol: string;
    name: string;
    price: number;
    dividendYield: number;
    requiredShares: number;
    requiredInvestment: number;
    annualDividend: number;
  } | null>(null);

  const handleTickerChange = (newTicker: string, name?: string) => {
    setTicker(newTicker);
    if (name) setTickerName(name);
  };

  const handleCalculate = async () => {
    if (!ticker) return;

    setLoading(true);
    setResult(null);
    try {
      const stockRes = await fetch(`/api/stock/${ticker}`);
      const stockJson = await stockRes.json();

      if (!stockJson.success) {
        alert(stockJson.error);
        return;
      }

      const rateRes = await fetch('/api/exchange-rate');
      const rateJson = await rateRes.json();
      const exchangeRate = rateJson.data?.rate || 1300;

      const stock = stockJson.data;
      const dividendYield = stock.dividendYield / 100;

      if (dividendYield <= 0) {
        alert('이 종목은 배당금이 없습니다.');
        return;
      }

      const annualTarget = targetMonthly * 12;
      const priceInKRW =
        stock.currency === 'USD' ? stock.price * exchangeRate : stock.price;
      const dividendPerShareKRW =
        stock.currency === 'USD'
          ? stock.dividendRate * exchangeRate
          : stock.dividendRate;

      const requiredShares = Math.ceil(annualTarget / dividendPerShareKRW);
      const requiredInvestment = requiredShares * priceInKRW;
      const annualDividend = requiredShares * dividendPerShareKRW;

      setResult({
        symbol: stock.symbol,
        name: stock.name,
        price: priceInKRW,
        dividendYield: stock.dividendYield,
        requiredShares,
        requiredInvestment,
        annualDividend,
      });
    } catch {
      alert('계산 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [
    { value: 500000, label: '50만' },
    { value: 1000000, label: '100만' },
    { value: 2000000, label: '200만' },
    { value: 3000000, label: '300만' },
  ];

  return (
    <div className="max-w-screen-md mx-auto px-5 py-6 pb-24 md:pb-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">배당금 계산기</h1>
        <p className="text-[var(--neutral)]">
          목표 월 배당금을 받으려면 얼마가 필요할까요?
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
            placeholder="삼성전자, 애플, SCHD..."
          />
        </div>

        {/* 목표 월 배당금 */}
        <div>
          <label className="label block mb-2">목표 월 배당금</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={formatNumber(targetMonthly)}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setTargetMonthly(Number(value) || 0);
              }}
              className="input pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neutral)] font-medium">
              원
            </span>
          </div>

          {/* 프리셋 버튼 */}
          <div className="flex gap-2 mt-3">
            {presetAmounts.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setTargetMonthly(preset.value)}
                className={`chip ${targetMonthly === preset.value ? 'active' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 계산 버튼 */}
        <button
          onClick={handleCalculate}
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
              계산 중...
            </span>
          ) : (
            '계산하기'
          )}
        </button>
      </div>

      {/* 결과 */}
      {result && (
        <div className="mt-6 space-y-4 animate-slide-up">
          {/* 종목 정보 카드 */}
          <div className="card shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{result.name}</h2>
                <span className="label">{result.symbol}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-[var(--neutral)]">배당률</div>
                <div className="text-xl font-bold text-profit">
                  {result.dividendYield.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="divider" />

            <div className="flex justify-between items-center">
              <span className="label">현재가 (원화 기준)</span>
              <span className="font-semibold">{formatCurrency(result.price)}</span>
            </div>
          </div>

          {/* 계산 결과 카드 */}
          <div className="card shadow-card bg-[var(--primary-light)]">
            <div className="text-center py-4">
              <div className="label mb-2">필요 투자금</div>
              <div className="number-hero text-[var(--primary)]">
                {formatCurrency(result.requiredInvestment)}
              </div>
              <div className="mt-4 text-lg font-semibold">
                {formatNumber(result.requiredShares)}주 필요
              </div>
            </div>
          </div>

          {/* 예상 배당금 */}
          <div className="card shadow-card">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center py-3">
                <div className="label mb-1">예상 연간 배당</div>
                <div className="number-lg">
                  {formatCurrency(result.annualDividend)}
                </div>
              </div>
              <div className="text-center py-3">
                <div className="label mb-1">예상 월 배당</div>
                <div className="number-lg text-profit">
                  {formatCurrency(result.annualDividend / 12)}
                </div>
              </div>
            </div>
          </div>

          {/* 면책조항 */}
          <div className="text-center">
            <p className="label-sm">
              * 배당금은 변동될 수 있으며, 세전 기준입니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
