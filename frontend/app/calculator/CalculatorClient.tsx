'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Loader2, Globe, Landmark, Heart, Search, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchWithAuth, tryFetchWithAuth, API_URL } from '@/lib/apiClient';
import type { DividendFrequency } from '@/types';

// 세금 상수
const TAX_RATE_KR = 0.154;
const TAX_RATE_US = 0.15;

interface SearchResult {
  symbol: string;
  name: string;
  engName: string;
  market: 'US' | 'KR';
  hasDividend?: boolean;
}

interface WatchlistAPIItem {
  ticker: string;
}

interface StockData {
  price: number;
  currency: 'USD' | 'KRW';
  market: 'US' | 'KR';
  dividendYield: number;
  dividendRate: number;
  name: string;
  exchangeRate: number;
  dividendFrequency?: DividendFrequency;
  dividendMonths?: number[];
}

interface CalculationResult {
  priceInKRW: number;
  requiredShares: number;
  requiredInvestment: number;
  annualDividendBeforeTax: number;
  annualTax: number;
  annualDividendAfterTax: number;
  monthlyDividendBeforeTax: number;
  monthlyDividendAfterTax: number;
  taxRate: number;
  monthlyDividends: number[];
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 1 0-9 9 9.75 9.75 0 0 0-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
  );
}

export default function CalculatorClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tickerName, setTickerName] = useState('');
  const [targetMonthly, setTargetMonthly] = useState(1000000);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [likedStocks, setLikedStocks] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 관심종목 로드
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const userRes = await tryFetchWithAuth(`${API_URL}/auth/me`);
        if (userRes.ok) {
          const res = await tryFetchWithAuth(`${API_URL}/watchlist`);
          if (res.ok) {
            const data = await res.json();
            const watchlistArray: WatchlistAPIItem[] = Array.isArray(data) ? data : (data.data || []);
            setLikedStocks(watchlistArray.map((item: WatchlistAPIItem) => item.ticker));
          }
        }
      } catch (error) {
        console.error('Failed to fetch liked stocks:', error);
      }
    };
    checkAuthAndFetchData();
  }, []);

  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      try {
        const res = await fetch('/api/search');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSearchResults(data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStocks(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchStocks]);

  const toggleLike = useCallback(async (e: React.MouseEvent, stock: SearchResult) => {
    e.stopPropagation();
    const ticker = stock.symbol;
    const isLiked = likedStocks.includes(ticker);
    const method = isLiked ? 'DELETE' : 'POST';
    const url = isLiked ? `${API_URL}/watchlist/${ticker}` : `${API_URL}/watchlist`;

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: isLiked ? undefined : JSON.stringify({
          ticker,
          name: stock.name,
          market: stock.market,
        }),
      });

      if (res.ok) {
        setLikedStocks(prev => isLiked ? prev.filter(t => t !== ticker) : [...prev, ticker]);
      } else if (res.status === 401) {
        alert("로그인 후 이용해주세요.");
      }
    } catch (error) {
      console.error('Watchlist update error:', error);
    }
  }, [likedStocks]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleFetchData = async (ticker: string) => {
    setLoading(true);
    setIsDropdownOpen(false);
    setSearchTerm(ticker);
    setResult(null);

    try {
      const stockRes = await fetch(`/api/stock/${ticker}`);
      if (!stockRes.ok) throw new Error();
      const stockJson = await stockRes.json();

      if (!stockJson.success) {
        alert(stockJson.error || '주식 정보를 불러올 수 없습니다.');
        return;
      }

      const rateRes = await fetch('/api/exchange-rate');
      const rateJson = rateRes.ok ? await rateRes.json() : { data: null };
      const exchangeRate = rateJson.data?.rate || 1300;

      const stock = stockJson.data;

      if (stock.dividendYield <= 0) {
        alert('이 종목은 배당금이 없습니다.');
        setStockData(null);
        return;
      }

      setStockData({
        ...stock,
        exchangeRate,
        market: stock.market,
        dividendFrequency: stock.dividendFrequency,
        dividendMonths: stock.dividendMonths
      });
      setTickerName(stock.name);
    } catch {
      alert('데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyDividends = (
    annualDividendAfterTax: number,
    frequency?: DividendFrequency,
    dividendMonths?: number[]
  ): number[] => {
    const monthly = Array(12).fill(0);
    if (dividendMonths && dividendMonths.length > 0) {
      const perPayment = annualDividendAfterTax / dividendMonths.length;
      dividendMonths.forEach(month => {
        if (month >= 1 && month <= 12) monthly[month - 1] = perPayment;
      });
    } else {
      const defaultMonths = frequency === 'monthly'
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        : frequency === 'semiannual' ? [6, 12]
          : frequency === 'annual' ? [12] : [3, 6, 9, 12];

      const perPayment = annualDividendAfterTax / defaultMonths.length;
      defaultMonths.forEach(month => { monthly[month - 1] = perPayment; });
    }
    return monthly;
  };

  useEffect(() => {
    if (!stockData) return;
    const annualTarget = targetMonthly * 12;
    const rate = stockData.currency === 'USD' ? stockData.exchangeRate : 1;
    const priceInKRW = stockData.price * rate;
    const dividendPerShareKRW = stockData.dividendRate * rate;
    const requiredShares = Math.ceil(annualTarget / dividendPerShareKRW);
    const requiredInvestment = requiredShares * priceInKRW;
    const annualDividendBeforeTax = requiredShares * dividendPerShareKRW;
    const taxRate = stockData.market === 'KR' ? TAX_RATE_KR : TAX_RATE_US;
    const annualTax = annualDividendBeforeTax * taxRate;
    const annualDividendAfterTax = annualDividendBeforeTax - annualTax;
    const monthlyDividends = calculateMonthlyDividends(annualDividendAfterTax, stockData.dividendFrequency, stockData.dividendMonths);

    setResult({
      priceInKRW, requiredShares, requiredInvestment, annualDividendBeforeTax, annualTax,
      annualDividendAfterTax, monthlyDividendBeforeTax: annualDividendBeforeTax / 12,
      monthlyDividendAfterTax: annualDividendAfterTax / 12, taxRate, monthlyDividends
    });
  }, [stockData, targetMonthly]);

  const handleReset = () => {
    setSearchTerm(''); setTickerName(''); setStockData(null); setResult(null); setTargetMonthly(1000000);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans tracking-tight selection:bg-gray-100">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12 sm:py-24 sm:pt-16 sm:pb-24">
        <div className="mb-12 sm:mb-12">
          <br /><h1 className="text-[36px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase"><br />배당금 계산기</h1>
          <p className="text-[14px] sm:text-[16px] text-gray-400 font-bold italic mt-4 opacity-80">목표 월 배당금을 위한 필요 자산을 시뮬레이션 해보세요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* 1열 : 입력 및 검색 */}
          <div className="space-y-10 lg:pt-[100px]">
            <div className="space-y-6" ref={dropdownRef}>
              <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">종목 검색</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="종목명 또는 티커 검색"
                  value={searchTerm}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-12 font-black text-[15px] sm:text-[17px] outline-none transition-all focus:ring-1 focus:ring-black ${isDropdownOpen ? 'rounded-b-none ring-1 ring-black' : ''}`}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                {isDropdownOpen && (
                  <div className="absolute top-[64px] left-0 w-full bg-white border border-gray-100 rounded-b-2xl z-[100] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                    ) : searchResults.map(stock => {
                      const hasDiv = stock.hasDividend !== false;
                      return (
                        <div key={stock.symbol} onClick={() => hasDiv && handleFetchData(stock.symbol)} className={`p-4 sm:p-5 flex justify-between items-center border-b border-gray-50 last:border-none group transition-colors ${hasDiv ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-40 cursor-not-allowed bg-gray-50/30'}`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 opacity-60">
                                {stock.market === 'KR' ? <Globe size={11} /> : <Landmark size={11} />}
                                <span className="text-[9px] font-black uppercase text-gray-500">{stock.market === 'KR' ? '한국' : '미국'}</span>
                              </div>
                              <p className={`text-[13px] sm:text-[14px] font-black ${!hasDiv ? 'line-through' : ''}`}>{stock.name}</p>
                            </div>
                            <p className="text-[9px] font-bold text-gray-300 uppercase mt-1">{stock.symbol}</p>
                          </div>
                          <button onClick={(e) => toggleLike(e, stock)} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${likedStocks.includes(stock.symbol) ? 'bg-[#fff5f5] border-[#ffc1c1] text-[#dc3545]' : 'bg-white border-gray-400 text-gray-400'}`}>
                            <Heart size={12} fill={likedStocks.includes(stock.symbol) ? "currentColor" : "none"} strokeWidth={2.5} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {tickerName && !isDropdownOpen && (
                  <div className="absolute -bottom-10 left-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <span className="text-[9px] font-black text-white bg-black px-2 py-0.5 rounded tracking-tighter uppercase">선택</span>
                    <span className="text-[12px] font-black">{tickerName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">월 목표 배당금</label>
              <div className="relative">
                <input type="text" inputMode="numeric" value={formatNumber(targetMonthly)} onChange={(e) => setTargetMonthly(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)} className="w-full h-[68px] bg-[#f3f4f6] rounded-2xl px-6 text-right text-[22px] sm:text-[26px] font-black outline-none focus:ring-1 focus:ring-black transition-all" />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400 uppercase border-r border-gray-200 pr-4">KRW</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {[1000000, 500000, 100000].map(amt => <button key={amt} onClick={() => setTargetMonthly(prev => prev + amt)} className="px-3 py-2 bg-white border border-gray-200 text-[10px] font-black text-gray-400 rounded-lg hover:bg-black hover:text-white transition-all uppercase tracking-tighter cursor-pointer">+{amt / 10000}만</button>)}
                <button onClick={() => setTargetMonthly(0)} className="px-3 py-2 bg-white border border-gray-200 text-[10px] font-black text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all uppercase tracking-tighter cursor-pointer">초기화</button>
              </div>
            </div>
          </div>

          {/* 2열 : 계산 결과 1 (핵심 수치) */}
          <div className="space-y-8">
            {stockData && result ? (
              <div className="border border-gray-100 rounded-[32px] p-8 space-y-10 bg-white shadow-sm animate-in fade-in zoom-in-95 duration-500 lg:min-h-[600px]">
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">필요 투자금</span>
                  <div className="text-[28px] sm:text-[38px] font-black tracking-tighter leading-none text-black">
                    {formatNumber(result.requiredInvestment)}<span className="text-[14px] font-bold ml-2 text-gray-300">원</span>
                  </div>
                </div>
                <div className="space-y-5 pt-10 border-t border-gray-100">
                  <DetailRow label="현재 주가 (환산)" value={formatCurrency(result.priceInKRW)} />
                  <DetailRow label="배당 수익률" value={`${stockData.dividendYield.toFixed(2)}%`} isHighlight />
                  <DetailRow label="필요 주식 수" value={`${formatNumber(result.requiredShares)}주`} />
                  <DetailRow label="배당 주기" value={stockData.dividendFrequency === 'monthly' ? '월배당' : stockData.dividendFrequency === 'quarterly' ? '분기배당' : stockData.dividendFrequency === 'semiannual' ? '반기배당' : '연배당'} />
                </div>
                <div className="space-y-4 pt-8 border-t border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">세전 연 배당금</span>
                  <p className="text-[20px] font-black">{formatCurrency(result.annualDividendBeforeTax)}</p>
                </div>
              </div>
            ) : <EmptyState />}
          </div>

          {/* 3열 : 계산 결과 2 (세후 정보 및 차트) */}
          <div className="space-y-8">
            {stockData && result ? (
              <div className="border border-gray-100 rounded-[32px] p-8 space-y-10 bg-white shadow-sm animate-in fade-in zoom-in-95 duration-500 lg:min-h-[600px] flex flex-col">
                <div className="space-y-6 bg-gradient-to-r from-red-50/50 to-transparent -mx-8 px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">세후 배당 정보</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-600">세금 {(result.taxRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="space-y-3">
                    <DetailRow label="연간 배당금" value={formatCurrency(result.annualDividendAfterTax)} />
                    <DetailRow label="월 평균 배당금" value={formatCurrency(result.monthlyDividendAfterTax)} isRed />
                    <DetailRow label="연간 세금" value={`-${formatCurrency(result.annualTax)}`} isGray />
                  </div>
                </div>

                <div className="space-y-4 pt-4 flex-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">월별 배당금 흐름 (세후)</span>
                  <div className="h-[180px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.monthlyDividends.map((v, i) => ({ month: `${i + 1}월`, dividend: Math.round(v) }))}>
                        <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => v > 0 ? `${(v / 10000).toFixed(0)}만` : '0'} tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={35} />
                        <Tooltip formatter={(v) => [`${formatNumber(v as number)}원`, '배당금']} contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
                        <Bar dataKey="dividend" radius={[4, 4, 0, 0]}>
                          {result.monthlyDividends.map((v, i) => <Cell key={i} fill={v > 0 ? '#F04251' : '#e5e7eb'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <button onClick={handleReset} className="w-full h-[60px] bg-white border border-black text-black font-black text-[12px] rounded-2xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-widest mt-auto cursor-pointer">
                  <IconRefresh className="w-4 h-4 " /> 입력 초기화
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isHighlight = false, isRed = false, isGray = false }: { label: string; value: string; isHighlight?: boolean; isRed?: boolean; isGray?: boolean }) {
  return (
    <div className="flex justify-between items-center group gap-4">
      <span className="text-[12px] font-bold text-gray-400 uppercase tracking-tight shrink-0">{label}</span>
      <span className={`text-[15px] sm:text-[18px] font-black text-right ${isHighlight ? 'text-black underline decoration-2 underline-offset-4 decoration-gray-100' : isRed ? 'text-red-500' : isGray ? 'text-gray-400' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-[400px] lg:h-[600px] border border-dashed border-gray-200 rounded-[32px]">
      <div className="text-center space-y-3 p-8">
        <p className="text-[14px] sm:text-[16px] font-bold text-gray-300">배당주를 선택하세요</p>
        <p className="text-[11px] sm:text-[12px] text-gray-400 leading-relaxed">종목을 검색하고 선택하면<br />계산 결과가 여기에 표시됩니다</p>
      </div>
    </div>
  );
}