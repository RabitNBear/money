'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid
} from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Search, Heart, Loader2, Globe, Landmark } from 'lucide-react'; // 아이콘 추가
import { fetchWithAuth, tryFetchWithAuth, API_URL } from '@/lib/apiClient';

interface SearchResult {
  symbol: string;
  name: string;
  engName: string;
  market: 'US' | 'KR';
}

interface StockInfo {
  symbol: string;
  name: string;
  market: 'US' | 'KR';
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface HistoryData {
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export default function StockClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [chartPeriod, setChartPeriod] = useState('1년');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [likedStocks, setLikedStocks] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(20);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const userRes = await tryFetchWithAuth(`${API_URL}/auth/me`);
        if (userRes.ok) {
          const res = await tryFetchWithAuth(`${API_URL}/watchlist`);
          if (res.ok) {
            const data = await res.json();
            const watchlistArray = Array.isArray(data) ? data :
              (data.data && Array.isArray(data.data) ? data.data : []);
            setLikedStocks(watchlistArray.map((item: { ticker: string; }) => item.ticker));
          }
        }
      } catch (error) {
        console.error('Failed to check auth or fetch liked stocks:', error);
      }
    };
    checkAuthAndFetchData();
  }, []);

  const fetchExchangeRate = useCallback(async () => {
    try {
      const res = await fetch('/api/exchange-rate');
      if (!res.ok) {
        console.error('Exchange rate API error:', res.status);
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setExchangeRate(data.data.rate);
      }
    } catch (error) {
      console.error('Exchange rate error:', error);
    }
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDropdownOpen) searchStocks(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, isDropdownOpen, searchStocks]);

  const loadStockData = useCallback(async (ticker: string, period: string) => {
    setIsLoadingStock(true);
    setVisibleCount(20);
    try {
      const stockRes = await fetch(`/api/stock/${encodeURIComponent(ticker)}`);
      const stockData = await stockRes.json();
      if (stockData.success) setStockInfo(stockData.data);

      const end = new Date();
      let start = new Date();

      switch (period) {
        case '1일': start.setDate(end.getDate() - 1); break;
        case '1주': start.setDate(end.getDate() - 7); break;
        case '1개월': start.setMonth(end.getMonth() - 1); break;
        case '1년': start.setFullYear(end.getFullYear() - 1); break;
        case '3년': start.setFullYear(end.getFullYear() - 3); break;
        case '5년': start.setFullYear(end.getFullYear() - 5); break;
        case '전체': start = new Date(0); break;
        default: start.setFullYear(end.getFullYear() - 1);
      }

      const priceRes = await fetch(
        `/api/price/${encodeURIComponent(ticker)}?start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`
      );
      if (priceRes.ok) {
        const priceApiData = await priceRes.json();
        if (priceApiData.success && priceApiData.data) {
          setHistoryData(Array.isArray(priceApiData.data.history) ? priceApiData.data.history : []);
        }
      }
    } catch (error) {
      console.error('Load stock data error:', error);
    } finally {
      setIsLoadingStock(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStock) {
      loadStockData(selectedStock.symbol, chartPeriod);
      if (selectedStock.market === 'US') {
        fetchExchangeRate();
      }
    }
  }, [selectedStock, chartPeriod, loadStockData, fetchExchangeRate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && tableData.length > visibleCount) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [historyData, visibleCount]);

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
        if (isLiked) {
          setLikedStocks(prev => prev.filter(t => t !== ticker));
        } else {
          setLikedStocks(prev => [...prev, ticker]);
        }
      } else if (res.status === 401) {
        alert("로그인 후 이용해주세요.");
      } else {
        console.error('Failed to update watchlist');
        alert('관심종목 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  }, [likedStocks]);

  const formatPriceWithKRW = useCallback((price: number, market: 'US' | 'KR') => {
    if (market === 'KR') {
      return formatCurrency(price, 'KRW');
    }
    const usdStr = formatCurrency(price, 'USD');
    if (exchangeRate) {
      const krwValue = Math.round(price * exchangeRate);
      return `${usdStr} (${formatNumber(krwValue)}원)`;
    }
    return usdStr;
  }, [exchangeRate]);

  const chartData = useMemo(() => {
    return historyData.map((item) => ({
      date: item.date,
      price: item.price,
    }));
  }, [historyData]);

  const tableData = useMemo(() => {
    return [...historyData].reverse().map((item, idx, arr) => {
      const prevItem = arr[idx + 1];
      const change = prevItem ? ((item.price - prevItem.price) / prevItem.price) * 100 : 0;
      return {
        date: item.date,
        price: item.price,
        change,
        volume: item.volume || '-',
      };
    });
  }, [historyData]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock: SearchResult) => {
    setSelectedStock(stock);
    setSearchTerm(stock.name);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-black tracking-tight selection:bg-gray-200">
      <div className="max-w-[1200px] mx-auto px-5 lg:px-8 py-10 lg:py-24">

        <div className="mb-10 sm:mb-24">
          <br />
          <h1 className="text-[32px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase"><br />주식 시세</h1>
          <p className="text-[12px] sm:text-[16px] text-gray-400 font-bold italic mt-4 opacity-80 uppercase tracking-widest">국내외 주식 시세를 확인하고 관심 종목으로 저장해보세요.</p>
        </div>

        <div className="max-w-[600px] mb-12 relative" ref={dropdownRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="종목명 또는 티커 검색"
              value={searchTerm}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[56px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-12 sm:px-14 font-black text-[14px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all"
            />
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />

            {isDropdownOpen && (
              <div className="absolute top-[62px] sm:top-[70px] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[400px] overflow-y-auto">
                {isSearching ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-[14px]">검색 결과가 없습니다</div>
                ) : (
                  searchResults.map(stock => (
                    <div key={stock.symbol} onClick={() => handleSelect(stock)} className="p-4 sm:p-5 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-none group">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 opacity-60">
                            {stock.market === 'KR' ? <Globe size={11} /> : <Landmark size={11} />}
                            <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                              {stock.market === 'KR' ? '한국' : '미국'}
                            </span>
                          </div>
                          <p className="text-[13px] sm:text-[14px] font-black">{stock.name}</p>
                        </div>
                        <p className="text-[9px] font-bold text-gray-300 uppercase mt-1">{stock.symbol}</p>
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
            )}
          </div>
        </div>

        {selectedStock ? (
          <div className="space-y-10 sm:space-y-16 animate-fade-in">
            {isLoadingStock && !stockInfo ? (
              <div className="py-24 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-2 border-black pb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        {selectedStock.market === 'KR' ? <Globe size={14} /> : <Landmark size={14} />}
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em]">
                          {selectedStock.market === 'KR' ? '한국' : '미국'}
                        </span>
                      </div>
                      <h2 className="text-[24px] sm:text-[36px] font-black tracking-tighter leading-tight">{selectedStock.name}</h2>
                      <button
                        onClick={(e) => toggleLike(e, selectedStock)}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ml-1 ${likedStocks.includes(selectedStock.symbol)
                          ? 'bg-[#fff5f5] border-[#ffc1c1] text-[#dc3545]'
                          : 'bg-white border-gray-400 text-gray-400'
                          }`}
                      >
                        <Heart size={14} fill={likedStocks.includes(selectedStock.symbol) ? "currentColor" : "none"} strokeWidth={2.5} />
                      </button>
                    </div>
                    <p className="text-[11px] sm:text-[14px] font-bold text-gray-300 tracking-widest uppercase">{selectedStock.symbol}</p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-[28px] sm:text-[42px] font-black leading-none mb-1 tracking-tighter">
                      {stockInfo ? formatNumber(stockInfo.price) : '-'}
                      <span className="text-[14px] sm:text-[16px] ml-1 text-gray-400">{stockInfo?.currency}</span>
                    </p>
                    {stockInfo && selectedStock?.market === 'US' && exchangeRate && (
                      <p className="text-[13px] sm:text-[14px] text-gray-400 mb-2">
                        약 {formatNumber(Math.round(stockInfo.price * exchangeRate))}원
                        <span className="text-[10px] sm:text-[11px] ml-1">(환율 {formatNumber(Math.round(exchangeRate))}원)</span>
                      </p>
                    )}
                    {stockInfo && (
                      <p className={`text-[13px] sm:text-[16px] font-black ${stockInfo.change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                        {stockInfo.change >= 0 ? '▲' : '▼'} {Math.abs(stockInfo.change).toFixed(2)} ({stockInfo.changePercent >= 0 ? '+' : ''}{stockInfo.changePercent.toFixed(2)}%)
                      </p>
                    )}
                  </div>
                </div>

                <section className="space-y-6 sm:space-y-8">
                  <div className="flex flex-wrap bg-[#f3f4f6] p-1 rounded-xl sm:rounded-2xl gap-1 w-fit">
                    {['1일', '1주', '1개월', '1년', '3년', '5년', '전체'].map((p) => (
                      <button key={p} onClick={() => setChartPeriod(p)} className={`px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[12px] font-black transition-all cursor-pointer whitespace-nowrap ${chartPeriod === p ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'}`}>
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="h-[300px] sm:h-[500px] w-full bg-[#fdfdfd] p-1 sm:p-10 rounded-[24px] sm:rounded-[40px] border border-gray-100 shadow-inner overflow-hidden relative">
                    {isLoadingStock && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3182f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3182f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#cbd5e1', fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#cbd5e1', fontWeight: 700 }} tickFormatter={(value) => formatNumber(value)} axisLine={false} tickLine={false} width={40} />
                        <Tooltip
                          contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                          formatter={(value) => [
                            formatPriceWithKRW(Number(value) || 0, selectedStock?.market || 'US'),
                            selectedStock?.name || '주가'
                          ]}
                        />
                        <Area type="monotone" dataKey="price" name="주가" stroke="#3182f6" strokeWidth={2} fill="url(#colorValue)" animationDuration={1000} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="space-y-4 sm:space-y-8">
                  <h3 className="text-[17px] sm:text-[20px] font-black tracking-tighter uppercase border-b-2 border-black pb-2 inline-block text-black">일별 시세</h3>
                  <div className="overflow-hidden">
                    <div className="min-w-full align-middle">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="border-b border-gray-100 text-[9px] sm:text-[11px] font-black text-gray-300 uppercase tracking-widest">
                            <th className="py-3 px-1 w-[28%] sm:w-auto">날짜</th>
                            {/* "값" 헤더 우측 정렬로 변경 */}
                            <th className="py-3 px-1 w-[47%] sm:w-auto text-center">값</th>
                            <th className="py-3 px-1 w-[25%] sm:w-auto text-right">변동</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {tableData.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-gray-400 text-[12px]">데이터가 없습니다</td>
                            </tr>
                          ) : (
                            tableData.slice(0, visibleCount).map((row, idx) => (
                              <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 sm:py-5 px-1 text-[11px] sm:text-[14px] font-bold text-gray-400 group-hover:text-black truncate">{row.date}</td>
                                {/* "값" 데이터 우측 정렬 및 간격 조정 */}
                                <td className="py-3 sm:py-5 px-1 text-[12px] sm:text-[16px] font-black text-center break-all">
                                  {formatPriceWithKRW(row.price, selectedStock?.market || 'US')}
                                </td>
                                <td className={`py-3 sm:py-5 px-1 text-[11px] sm:text-[14px] font-black text-right ${row.change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                  {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}%
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      <div ref={observerRef} className="h-20 flex items-center justify-center">
                        {visibleCount < tableData.length && (
                          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        ) : (
          <div className="py-20 sm:py-32 border-2 border-dashed border-gray-100 rounded-[28px] sm:rounded-[40px] flex flex-col items-center justify-center text-center px-6">
            <p className="text-[14px] sm:text-[18px] font-black text-gray-200 uppercase tracking-widest mb-2">Search Stock to View Details</p>
            <p className="text-[11px] sm:text-[14px] text-gray-300 font-medium italic uppercase tracking-tighter">Real-time charts and analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}