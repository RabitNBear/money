'use client';

import { useState } from 'react';
import { formatNumber, formatCurrency } from '@/lib/utils';

export default function CalculatorPage() {
  const [ticker, setTicker] = useState('');
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

  const handleCalculate = async () => {
    if (!ticker) return;

    setLoading(true);
    try {
      // 주식 정보 조회
      const stockRes = await fetch(`/api/stock/${ticker}`);
      const stockJson = await stockRes.json();

      if (!stockJson.success) {
        alert(stockJson.error);
        return;
      }

      // 환율 조회
      const rateRes = await fetch('/api/exchange-rate');
      const rateJson = await rateRes.json();
      const exchangeRate = rateJson.data?.rate || 1300;

      const stock = stockJson.data;
      const dividendYield = stock.dividendYield / 100;

      if (dividendYield <= 0) {
        alert('이 종목은 배당금이 없습니다.');
        return;
      }

      // 계산
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
    } catch (error) {
      alert('계산 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">배당금 계산기</h1>

      {/* 입력 폼 */}
      <div className="card space-y-4">
        <div>
          <label className="label block mb-1">종목 티커</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="예: SCHD, AAPL, 005930.KS"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="label block mb-1">목표 월 배당금</label>
          <div className="relative">
            <input
              type="number"
              value={targetMonthly}
              onChange={(e) => setTargetMonthly(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              원
            </span>
          </div>
          <div className="mt-2 flex gap-2">
            {[500000, 1000000, 2000000, 3000000].map((amount) => (
              <button
                key={amount}
                onClick={() => setTargetMonthly(amount)}
                className={`px-3 py-1 rounded-full text-sm ${
                  targetMonthly === amount
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {formatNumber(amount / 10000)}만
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading || !ticker}
          className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '계산 중...' : '계산하기'}
        </button>
      </div>

      {/* 결과 */}
      {result && (
        <div className="mt-6 card">
          <h2 className="text-lg font-bold mb-4">
            {result.name} ({result.symbol})
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="label">현재가</span>
              <span className="font-semibold">
                {formatCurrency(result.price)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="label">배당률</span>
              <span className="font-semibold text-profit">
                {result.dividendYield.toFixed(2)}%
              </span>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="flex justify-between items-center">
              <span className="label">필요 주수</span>
              <span className="text-xl font-bold">
                {formatNumber(result.requiredShares)}주
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="label">필요 투자금</span>
              <span className="number-lg text-profit">
                {formatCurrency(result.requiredInvestment)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="label">예상 연간 배당금</span>
              <span className="font-semibold">
                {formatCurrency(result.annualDividend)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="label">예상 월 배당금</span>
              <span className="font-semibold">
                {formatCurrency(result.annualDividend / 12)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
