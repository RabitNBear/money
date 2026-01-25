'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import type { BacktestResult } from '@/types';
// Search 아이콘 임포트 추가
import { Coffee, Pizza, Smartphone, CarFront, Building2, Loader2, Globe, Landmark, Heart, Search } from 'lucide-react';
import { fetchWithAuth, tryFetchWithAuth, API_URL } from '@/lib/apiClient';

interface SearchResult {
  symbol: string;
  name: string;
  engName: string;
  market: 'US' | 'KR';
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
    </svg>
  );
}

export default function BacktestClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [likedStocks, setLikedStocks] = useState<string[]>([]);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [tickerName, setTickerName] = useState('');
  const [amount, setAmount] = useState(0); // 기본값 0원으로 수정
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null); // 환율 상태 추가

  const stockDropdownRef = useRef<HTMLDivElement>(null);

  // 환율 정보 가져오기
  const fetchExchangeRate = useCallback(async () => {
    try {
      const res = await fetch('/api/exchange-rate');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) setExchangeRate(data.data.rate);
      }
    } catch (error) {
      console.error('Exchange rate error:', error);
    }
  }, []);

  // 미국 주식 여부 판별
  const isUSStock = useMemo(() => {
    return selectedTicker && !selectedTicker.includes('.KS') && !selectedTicker.includes('.KQ');
  }, [selectedTicker]);

  // 가격 표시 포맷 함수 (달러/원화 병기)
  const formatSummaryPrice = useCallback((price: number) => {
    if (!isUSStock) return formatCurrency(price);
    const usdStr = `$${formatNumber(price)}`;
    if (exchangeRate) {
      const krwValue = Math.round(price * exchangeRate);
      return `${usdStr} (${formatNumber(krwValue)}원)`;
    }
    return usdStr;
  }, [isUSStock, exchangeRate]);

  // 로그인 여부 확인 및 관심종목 로드
  useEffect(() => {
    fetchExchangeRate(); // 환율 로드
    const checkAuthAndFetchData = async () => {
      try {
        const userRes = await tryFetchWithAuth(`${API_URL}/auth/me`);
        if (userRes.ok) {
          const res = await tryFetchWithAuth(`${API_URL}/watchlist`);
          if (res.ok) {
            const data = await res.json();
            const watchlistArray = Array.isArray(data) ? data : (data.data || []);
            // any 타입을 { ticker: string }으로 구체화하여 오류 해결
            setLikedStocks(watchlistArray.map((item: { ticker: string }) => item.ticker));
          }
        }
      } catch (error) {
        console.error('Failed to fetch liked stocks:', error);
      }
    };
    checkAuthAndFetchData();
  }, [fetchExchangeRate]);

  // 종목 검색 API 호출
  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      try {
        const res = await fetch('/api/search');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSearchResults(data.data);
        }
      } catch (error) {
        console.error('Search error:', error);
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
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 관심종목 토글 기능
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

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isStockDropdownOpen) searchStocks(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, isStockDropdownOpen, searchStocks]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (stockDropdownRef.current && !stockDropdownRef.current.contains(e.target as Node)) setIsStockDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 결과 나타나면 스크롤 아래로 500px 이동
  useEffect(() => {
    if (result) {
      window.scrollBy({ top: 500, behavior: 'smooth' });
    }
  }, [result]);

  const handleSelectStock = (stock: SearchResult) => {
    setSelectedTicker(stock.symbol);
    setTickerName(stock.name);
    setSearchTerm(stock.name);
    setIsStockDropdownOpen(false);
    setSelectedDate('');
  };

  const handleReset = () => {
    setSearchTerm(''); setSelectedTicker(''); setTickerName('');
    setSelectedDate(''); setAmount(10000000); setResult(null);
  };

  const handleBacktest = async () => {
    if (!selectedTicker || !selectedDate) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/history/${selectedTicker}?amount=${amount}&start=${encodeURIComponent(selectedDate)}`);
      if (!res.ok) {
        alert('API 오류가 발생했습니다.');
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.success && json.data) setResult(json.data);
      else alert(json.error || '데이터를 불러올 수 없습니다.');
    } catch { alert('오류가 발생했습니다.'); } finally { setLoading(false); }
  };

  const chartData = result?.history.map((point, i) => ({
    date: point.date,
    value: point.value,
    benchmark: result.benchmarkHistory[i]?.value || 0,
  })) || [];

  const profit = result ? result.finalValue - amount : 0;

  // 미국 주식이라면 환율을 곱한 원화 수익금을 계산 (없으면 그대로 profit 사용)
  const profitInKrw = (isUSStock && exchangeRate)
    ? profit * exchangeRate
    : profit;

  // 변환된 원화 수익금을 기반으로 실물 자산 계산
  const assets = convertToAssets(profitInKrw > 0 ? profitInKrw : 0);

  const getAssetIcon = (label: string) => {
    if (label.includes('커피')) return <Coffee className="w-10 h-10 lg:w-14 lg:h-14 text-amber-900" />;
    if (label.includes('치킨')) return <Pizza className="w-10 h-10 lg:w-14 lg:h-14 text-orange-500" />;
    if (label.includes('아이폰') || label.includes('폰')) return <Smartphone className="w-10 h-10 lg:w-14 lg:h-14 text-gray-800" />;
    if (label.includes('아파트') || label.includes('집')) return <Building2 className="w-10 h-10 lg:w-14 lg:h-14 text-slate-700" />;
    return <CarFront className="w-10 h-10 lg:w-14 lg:h-14 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-white text-black tracking-tight">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-12 sm:py-24">

        {/* 헤더 */}
        <div className="mb-12 sm:mb-1">
          <br />
          <h1 className="text-[32px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase"><br />그때 살 껄.. 껄무새</h1>
          <p className="text-[14px] sm:text-[16px] text-gray-400 font-bold italic mt-4 opacity-80 uppercase tracking-widest">과거에 이 종목을 샀다면 현재 얼마만큼 얻었을지 시뮬레이션 해보세요.</p>
        </div>

        {/* 상단 입력 섹션 */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-15 lg:gap-3 mb-35 pt-10 lg:pt-[100px]">
          <div className="w-full lg:flex-[2] space-y-6 relative" ref={stockDropdownRef}>
            <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">종목 검색</label>
            <div className="relative">
              <input
                type="text"
                placeholder="종목 검색 및 선택"
                value={searchTerm}
                onFocus={() => setIsStockDropdownOpen(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full h-[64px] sm:h-[68px] bg-[#f3f4f6] rounded-2xl px-12 sm:px-14 font-black text-[15px] sm:text-[18px] outline-none transition-all focus:ring-1 focus:ring-black ${isStockDropdownOpen ? 'rounded-b-none ring-1 ring-black' : ''}`}
              />
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />

              {isStockDropdownOpen && (
                <div className="absolute top-[64px] sm:top-[68px] left-0 w-full bg-white border-x border-b border-gray-200 rounded-b-2xl z-[100] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-[300px] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-8 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-[14px]">검색 결과가 없습니다</div>
                    ) : (
                      searchResults.map((stock) => (
                        <div key={stock.symbol} onClick={() => handleSelectStock(stock)} className="flex justify-between items-center p-4 sm:p-5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none group transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 opacity-60">
                                {stock.market === 'KR' ? <Globe size={11} /> : <Landmark size={11} />}
                                <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                                  {stock.market === 'KR' ? '한국' : '미국'}
                                </span>
                              </div>
                              <span className="font-black text-[14px] sm:text-[15px]">{stock.name}</span>
                            </div>
                            <p className="text-[9px] font-bold text-gray-300 uppercase mt-1 tracking-widest">{stock.symbol}</p>
                          </div>
                          <button
                            onClick={(e) => toggleLike(e, stock)}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${likedStocks.includes(stock.symbol)
                              ? 'bg-[#fff5f5] border-[#ffc1c1] text-[#dc3545]'
                              : 'bg-white border-gray-400 text-gray-400'
                              }`}
                          >
                            <Heart size={12} fill={likedStocks.includes(stock.symbol) ? "currentColor" : "none"} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              {tickerName && !isStockDropdownOpen && (
                <div className="mt-3 lg:mt-0 lg:absolute lg:top-[calc(100%+8px)] lg:left-1 flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-left-2 px-1 whitespace-nowrap z-10">
                  <span className="text-[8px] sm:text-[9px] font-black text-white bg-black px-2 py-0.5 rounded tracking-tighter shrink-0">선택</span>
                  <span className="text-[11px] sm:text-[12px] font-black truncate max-w-[120px]">{tickerName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:flex-1 space-y-6 relative">
            <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">매수 시작일</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                disabled={!selectedTicker}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min="2010-01-01"
                className="w-full h-[64px] sm:h-[68px] bg-[#f3f4f6] rounded-2xl px-6 sm:px-8 font-black text-[16px] sm:text-[18px] text-black outline-none transition-all focus:ring-1 focus:ring-black disabled:text-gray-400 disabled:cursor-not-allowed"
              />
              {selectedDate && (
                <div className="mt-3 lg:mt-0 lg:absolute lg:top-[calc(100%+8px)] lg:left-1 flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-left-2 px-1 whitespace-nowrap z-10">
                  <span className="text-[8px] sm:text-[9px] font-black text-white bg-blue-500 px-2 py-0.5 rounded tracking-tighter uppercase shrink-0">시작일</span>
                  <span className="text-[11px] sm:text-[12px] font-black cursor-pointer">{selectedDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:flex-[1.5] space-y-6">
            <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">
              당시 예상 투자금
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatNumber(amount)}
                onChange={(e) => setAmount(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                className="w-full h-[64px] sm:h-[68px] bg-[#f3f4f6] rounded-2xl px-6 sm:px-8 text-right text-[18px] sm:text-[20px] lg:text-[24px] font-black outline-none focus:ring-1 focus:ring-black"
              />
              {/* KRW 부분을 아래와 같이 수정합니다 */}
              <span className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 text-[11px] sm:text-[12px] font-black text-gray-400 uppercase border-r border-gray-200 pr-3 sm:pr-4">
                {isUSStock ? 'USD' : 'KRW'}
              </span>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <button onClick={handleBacktest} disabled={loading || !selectedDate} className={`w-full lg:w-[120px] h-[64px] sm:h-[68px] rounded-2xl text-[14px] sm:text-[15px] font-black uppercase tracking-widest transition-all ${!selectedDate ? 'bg-white border border-gray-200 text-gray-300' : 'bg-[#1a1a1a] text-white hover:bg-black cursor-pointer shadow-xl'}`}>
              {loading ? '...' : '실행'}
            </button>
          </div>
        </div>

        {/* 실물 가치 비교 섹션 */}
        <section className="mb-24 animate-in fade-in duration-700">
          <div className="flex items-center gap-3 mb-10 border-b-2 border-black pb-6">
            <h3 className="text-[20px] lg:text-[22px] font-black tracking-tighter uppercase text-black">실물 가치 비교</h3>
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded italic uppercase tracking-tighter">
              {result ? 'Based on Final Value' : 'Based on Initial Principal'}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {assets.map((asset) => (
              <div key={asset.label} className="bg-white border border-gray-100 p-6 sm:p-10 rounded-[28px] lg:rounded-[32px] flex flex-col items-center text-center transition-all duration-300 hover:shadow-md">
                <div className="mb-6 lg:mb-8">{getAssetIcon(asset.label)}</div>
                <div className="text-[24px] lg:text-[32px] font-black mb-1 tracking-tighter text-black">{asset.count.toFixed(1)}</div>
                <div className="text-[14px] lg:text-[16px] font-black text-black uppercase tracking-tight">{asset.label}</div>
              </div>
            ))}
          </div>
        </section>

        {result && (
          <div className="space-y-24 animate-in slide-in-from-bottom-10 duration-1000">
            {/* 가격 및 분석 요약 */}
            <section className="space-y-10">
              <div className="border-b-2 border-black pb-6">
                <h3 className="text-[20px] lg:text-[22px] font-black tracking-tighter uppercase text-gray-900">가격 및 분석 요약</h3>
              </div>
              <div className="lg:col-span-12 p-2 sm:p-4 space-y-10 bg-white">
                <div className="space-y-3">
                  <span className="text-[10px] lg:text-[12px] font-black text-gray-300 uppercase tracking-[0.3em]">최종 자산 가치</span>
                  <div className="text-[32px] sm:text-[48px] lg:text-[64px] font-black tracking-tighter leading-none text-black break-all">
                    {formatSummaryPrice(result.finalValue)}
                  </div>
                </div>
                <div className="space-y-6 pt-12 border-t border-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-6">
                    <DetailRow label="총 수익률" value={formatPercent(result.totalReturn)} isHighlight isRed={result.totalReturn >= 0} isBlue={result.totalReturn < 0} />
                    <DetailRow label="연평균 수익률" value={formatPercent(result.cagr)} />
                    <DetailRow label="벤치마크 수익률" value={formatPercent(result.benchmarkReturn)} />
                    <DetailRow label="시장 대비 초과 수익" value={formatPercent(result.totalReturn - result.benchmarkReturn)} isHighlight />
                  </div>
                </div>
              </div>
            </section>

            {/* 차트 */}
            <section>
              <div className="flex justify-between items-end mb-12 border-b-2 border-black pb-6">
                <h3 className="text-[20px] lg:text-[22px] font-black tracking-tighter uppercase">그날부터 현재까지의 차트</h3>
                <button onClick={handleReset} className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase text-gray-400 hover:text-black transition-colors">
                  <IconRefresh className="w-3 h-3" /> 초기화
                </button>
              </div>
              <div className="h-[400px] lg:h-[600px] w-full bg-[#fcfcfc] p-4 lg:p-10 rounded-[32px] lg:rounded-[40px] border border-gray-100 shadow-inner overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3182f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3182f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }} tickFormatter={(value: string) => value.slice(2, 7)} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }} tickFormatter={(value) => `${formatNumber(value / 10000)}만`} axisLine={false} tickLine={false} width={50} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '12px' }} formatter={(value) => formatSummaryPrice(Number(value) || 0)} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span style={{ color: '#1a1a1a', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>{value}</span>} />
                    <Area type="monotone" dataKey="value" name={tickerName || result.ticker} stroke="#3182f6" strokeWidth={3} fill="url(#colorValue)" />
                    <Line type="monotone" dataKey="benchmark" name={result.benchmarkHistory && result.benchmarkSymbol ? result.benchmarkSymbol : "BENCHMARK"} stroke="#8b95a1" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  isHighlight?: boolean;
  isRed?: boolean;
  isBlue?: boolean;
}

function DetailRow({ label, value, isHighlight = false, isRed = false, isBlue = false }: DetailRowProps) {
  return (
    <div className="flex justify-between items-center gap-4 py-2 sm:py-3">
      <span className="text-[11px] sm:text-[13px] font-bold text-gray-400 uppercase tracking-tight shrink-0">{label}</span>
      <span className={`text-[15px] sm:text-[20px] font-black text-right ${isHighlight ? 'text-black underline decoration-2 underline-offset-4 decoration-blue-100' : 'text-gray-900'} ${isRed ? 'text-red-500' : isBlue ? 'text-blue-500' : ''}`}>
        {value}
      </span>
    </div>
  );
}