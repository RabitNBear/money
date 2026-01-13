'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Search, Heart, Loader2 } from 'lucide-react';

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

interface BenchmarkData {
  date: string;
  price: number;
}

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [chartPeriod, setChartPeriod] = useState('1년');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [likedStocks, setLikedStocks] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 좋아요 목록 로드
  useEffect(() => {
    const saved = localStorage.getItem('likedStocks');
    if (saved) setLikedStocks(JSON.parse(saved));
  }, []);

  // 종목 검색 API 호출
  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      // 검색어 없으면 인기 종목 표시
      try {
        const res = await fetch('/api/search');
        const data = await res.json();
        if (data.success) setSearchResults(data.data);
      } catch (error) {
        console.error('Search error:', error);
      }
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) setSearchResults(data.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDropdownOpen) searchStocks(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, isDropdownOpen, searchStocks]);

  // 주식 상세 정보 로드
  const loadStockData = useCallback(async (ticker: string, period: string) => {
    setIsLoadingStock(true);
    try {
      // 현재가 조회
      const stockRes = await fetch(`/api/stock/${encodeURIComponent(ticker)}`);
      const stockData = await stockRes.json();
      if (stockData.success) setStockInfo(stockData.data);

      // 기간에 따른 날짜 계산
      const end = new Date();
      const start = new Date();
      switch (period) {
        case '1일': start.setDate(end.getDate() - 1); break;
        case '1주': start.setDate(end.getDate() - 7); break;
        case '1개월': start.setMonth(end.getMonth() - 1); break;
        case '1년': start.setFullYear(end.getFullYear() - 1); break;
        case '3년': start.setFullYear(end.getFullYear() - 3); break;
        case '5년': start.setFullYear(end.getFullYear() - 5); break;
        default: start.setFullYear(end.getFullYear() - 1);
      }

      // 순수 주가 히스토리 조회 (STOCK 페이지용)
      const priceRes = await fetch(
        `/api/price/${encodeURIComponent(ticker)}?start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`
      );
      const priceApiData = await priceRes.json();
      if (priceApiData.success) {
        setHistoryData(priceApiData.data.history || []);
        setBenchmarkData(priceApiData.data.benchmarkHistory || []);
      }
    } catch (error) {
      console.error('Load stock data error:', error);
    } finally {
      setIsLoadingStock(false);
    }
  }, []);

  // 기간 변경 시 데이터 재로드
  useEffect(() => {
    if (selectedStock) {
      loadStockData(selectedStock.symbol, chartPeriod);
    }
  }, [selectedStock, chartPeriod, loadStockData]);

  const toggleLike = (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation();
    const updated = likedStocks.includes(ticker)
      ? likedStocks.filter(t => t !== ticker)
      : [...likedStocks, ticker];
    setLikedStocks(updated);
    localStorage.setItem('likedStocks', JSON.stringify(updated));
  };

  // 차트 데이터 병합 (순수 주가)
  const chartData = useMemo(() => {
    return historyData.map((item, idx) => ({
      date: item.date,
      price: item.price,
      benchmark: benchmarkData[idx]?.price || 0,
    }));
  }, [historyData, benchmarkData]);

  // 테이블용 일별 데이터 (최신순 정렬)
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
    <div className="min-h-screen bg-white text-black font-sans tracking-tight selection:bg-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-12 lg:py-24">
        
        <div className="mb-12 sm:mb-24">
          <br />
          <h1 className="text-[36px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase">Market View</h1>
          <p className="text-[14px] sm:text-[16px] text-gray-400 font-bold italic mt-4 opacity-80 uppercase tracking-widest">Real-time Stock Insights</p>
        </div>

        <div className="max-w-[600px] mb-16 relative" ref={dropdownRef}>
          <div className="relative">
            <input 
              type="text" 
              placeholder="종목명 또는 티커 검색" 
              value={searchTerm}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-12 sm:px-14 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" 
            />
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            
            {isDropdownOpen && (
              <div className="absolute top-[68px] sm:top-[70px] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[400px] overflow-y-auto">
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
                          <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[9px] font-bold">{stock.market}</span>
                          <p className="text-[14px] font-black">{stock.name}</p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-300 uppercase mt-1">{stock.symbol}</p>
                      </div>
                      <button
                        onClick={(e) => toggleLike(e, stock.symbol)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                          likedStocks.includes(stock.symbol)
                            ? 'bg-[#fff5f5] border-[#ffc1c1] text-[#dc3545] hover:cursor-pointer'
                            : 'bg-white border-gray-400 text-gray-400 hover:cursor-pointer'
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
          <div className="space-y-12 sm:space-y-16 animate-fade-in">
            {isLoadingStock && !stockInfo ? (
              <div className="py-24 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-2 border-black pb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-black text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter shrink-0">{selectedStock.market}</span>
                  <h2 className="text-[28px] sm:text-[36px] font-black tracking-tighter leading-tight">{selectedStock.name}</h2>
                  <button
                    onClick={(e) => toggleLike(e, selectedStock.symbol)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ml-1 ${
                      likedStocks.includes(selectedStock.symbol)
                        ? 'bg-[#fff5f5] border-[#ffc1c1] text-[#dc3545] hover:cursor-pointer'
                        : 'bg-white border-gray-400 text-gray-400 hover:cursor-pointer'
                    }`}
                  >
                    <Heart size={16} fill={likedStocks.includes(selectedStock.symbol) ? "currentColor" : "none"} strokeWidth={2.5} />
                  </button>
                </div>
                <p className="text-[12px] sm:text-[14px] font-bold text-gray-300 tracking-widest uppercase">{selectedStock.symbol}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[32px] sm:text-[42px] font-black leading-none mb-2 tracking-tighter">
                  {stockInfo ? formatNumber(stockInfo.price) : '-'}
                  <span className="text-[16px] ml-1 text-gray-400">{stockInfo?.currency}</span>
                </p>
                {stockInfo && (
                  <p className={`text-[14px] sm:text-[16px] font-black ${stockInfo.change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                    {stockInfo.change >= 0 ? '▲' : '▼'} {Math.abs(stockInfo.change).toFixed(2)} ({stockInfo.changePercent >= 0 ? '+' : ''}{stockInfo.changePercent.toFixed(2)}%)
                  </p>
                )}
              </div>
            </div>

            <section className="space-y-6 sm:space-y-8">
              <div className="flex flex-wrap bg-[#f3f4f6] p-1.5 rounded-2xl gap-1 w-fit">
                {['1일', '1주', '1개월', '1년', '3년', '5년'].map((p) => (
                  <button key={p} onClick={() => setChartPeriod(p)} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-black transition-all cursor-pointer whitespace-nowrap ${chartPeriod === p ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}>
                    {p}
                  </button>
                ))}
              </div>

              <div className="h-[350px] sm:h-[500px] w-full bg-[#fdfdfd] p-2 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-gray-100 shadow-inner overflow-hidden relative">
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
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }} tickFormatter={(value) => formatNumber(value)} axisLine={false} tickLine={false} width={80} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                      formatter={(value: number, name: string) => [
                        `${formatCurrency(Number(value) || 0)}`,
                        name === '주가' ? selectedStock?.name : (selectedStock?.market === 'KR' ? 'KOSPI' : 'S&P500')
                      ]}
                      labelFormatter={(label) => String(label)}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span style={{ color: '#1a1a1a', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>{value}</span>} />
                    <Area type="monotone" dataKey="price" name="주가" stroke="#3182f6" strokeWidth={3} fill="url(#colorValue)" animationDuration={1500} />
                    <Line type="monotone" dataKey="benchmark" name="시장지수" stroke="#8b95a1" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="space-y-6 sm:space-y-8">
              <h3 className="text-[18px] sm:text-[20px] font-black tracking-tighter uppercase border-b-2 border-black pb-3 inline-block text-black">Monthly Price</h3>
              <div className="overflow-x-auto -mx-2">
                <div className="inline-block min-w-full align-middle px-2">
                  <table className="min-w-[500px] w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] sm:text-[11px] font-black text-gray-300 uppercase tracking-widest">
                        <th className="py-4 px-2">Date</th>
                        <th className="py-4 px-2">Value</th>
                        <th className="py-4 px-2">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tableData.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-gray-400">데이터가 없습니다</td>
                        </tr>
                      ) : (
                        tableData.slice(0, 12).map((row, idx) => (
                          <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 sm:py-5 px-2 text-[13px] sm:text-[14px] font-bold text-gray-400 group-hover:text-black">{row.date}</td>
                            <td className="py-4 sm:py-5 px-2 text-[15px] sm:text-[16px] font-black">{formatCurrency(row.price)}</td>
                            <td className={`py-4 sm:py-5 px-2 text-[13px] sm:text-[14px] font-black ${row.change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                              {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
              </>
            )}
          </div>
        ) : (
          <div className="py-24 sm:py-32 border-2 border-dashed border-gray-100 rounded-[32px] sm:rounded-[40px] flex flex-col items-center justify-center text-center px-6">
            <p className="text-[16px] sm:text-[18px] font-black text-gray-200 uppercase tracking-widest mb-2">Search Stock to View Details</p>
            <p className="text-[13px] sm:text-[14px] text-gray-300 font-medium italic uppercase">Real-time charts and analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}