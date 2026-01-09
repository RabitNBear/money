'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
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
import { Search, Heart } from 'lucide-react';

const STOCKS = [
  { id: 1, name: '애플', ticker: 'AAPL', market: 'US' },
  { id: 2, name: '엔비디아', ticker: 'NVDA', market: 'US' },
  { id: 3, name: '테슬라', ticker: 'TSLA', market: 'US' },
  { id: 4, name: '삼성전자', ticker: '005930.KS', market: 'KR' },
  { id: 5, name: '마이크로소프트', ticker: 'MSFT', market: 'US' },
];

const generateData = (period: string) => {
  return Array.from({ length: 20 }, (_, i) => ({
    date: `2026.01.${String(i + 1).padStart(2, '0')}`,
    price: 150 + Math.random() * 50,
    benchmark: 145 + Math.random() * 40,
    change: (Math.random() - 0.5) * 5,
    volume: '1.2M'
  }));
};

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [chartPeriod, setChartPeriod] = useState('일');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [likedStocks, setLikedStocks] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('likedStocks');
    if (saved) setLikedStocks(JSON.parse(saved));
  }, []);

  const toggleLike = (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation();
    const updated = likedStocks.includes(ticker)
      ? likedStocks.filter(t => t !== ticker)
      : [...likedStocks, ticker];
    setLikedStocks(updated);
    localStorage.setItem('likedStocks', JSON.stringify(updated));
  };

  const filteredStocks = useMemo(() => 
    STOCKS.filter(s => s.name.includes(searchTerm) || s.ticker.includes(searchTerm.toUpperCase())),
    [searchTerm]
  );

  const marketData = useMemo(() => generateData(chartPeriod), [selectedStock, chartPeriod]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock: any) => {
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
              <div className="absolute top-[68px] sm:top-[70px] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {filteredStocks.map(stock => (
                  <div key={stock.id} onClick={() => handleSelect(stock)} className="p-4 sm:p-5 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-none group">
                    <div>
                      <p className="text-[14px] font-black">{stock.name}</p>
                      <p className="text-[10px] font-bold text-gray-300 uppercase">{stock.ticker}</p>
                    </div>
                    {/* 좋아요 모양 */}
                    <button 
                      onClick={(e) => toggleLike(e, stock.ticker)} 
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        likedStocks.includes(stock.ticker) 
                          ? 'bg-[#fff5f5] border-[#ffc1c1] text-[#dc3545] hover:cursor-pointer' 
                          : 'bg-white border-gray-400 text-gray-400 hover:cursor-pointer'
                      }`}
                    >
                      <Heart size={12} fill={likedStocks.includes(stock.ticker) ? "currentColor" : "none"} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedStock ? (
          <div className="space-y-12 sm:space-y-16 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-2 border-black pb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-black text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter shrink-0">{selectedStock.market}</span>
                  <h2 className="text-[28px] sm:text-[36px] font-black tracking-tighter leading-tight">{selectedStock.name}</h2>
                  {/* 좋아요 모양 - 상세 페이지 상단 원형 버튼 */}
                  <button 
                    onClick={(e) => toggleLike(e, selectedStock.ticker)} 
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ml-1 ${
                      likedStocks.includes(selectedStock.ticker) 
                        ? 'bg-[#fff5f5] border-[#ffc1c1] text-[#dc3545] hover:cursor-pointer' 
                        : 'bg-white border-gray-400 text-gray-400 hover:cursor-pointer'
                    }`}
                  >
                    <Heart size={16} fill={likedStocks.includes(selectedStock.ticker) ? "currentColor" : "none"} strokeWidth={2.5} />
                  </button>
                </div>
                <p className="text-[12px] sm:text-[14px] font-bold text-gray-300 tracking-widest uppercase">{selectedStock.ticker}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[32px] sm:text-[42px] font-black leading-none mb-2 tracking-tighter">192.42</p>
                <p className="text-[14px] sm:text-[16px] font-black text-red-500">▲ 1.25 (0.65%)</p>
              </div>
            </div>

            <section className="space-y-6 sm:space-y-8">
              <div className="flex flex-wrap bg-[#f3f4f6] p-1.5 rounded-2xl gap-1 w-fit">
                {['1분', '일', '주', '월', '년'].map((p) => (
                  <button key={p} onClick={() => setChartPeriod(p)} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-black transition-all cursor-pointer whitespace-nowrap ${chartPeriod === p ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}>
                    {p}
                  </button>
                ))}
              </div>
              
              <div className="h-[350px] sm:h-[500px] w-full bg-[#fdfdfd] p-2 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-gray-100 shadow-inner overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={marketData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3182f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3182f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }} tickFormatter={(value) => value.slice(2, 10)} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }} tickFormatter={(value) => `${formatNumber(value / 10000)}만`} axisLine={false} tickLine={false} width={50} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(Number(value) || 0)} labelFormatter={(label) => String(label)} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span style={{ color: '#1a1a1a', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>{value}</span>} />
                    <Area type="monotone" dataKey="price" name="현재가" stroke="#3182f6" strokeWidth={3} fill="url(#colorValue)" animationDuration={1500} />
                    <Line type="monotone" dataKey="benchmark" name="시장 평균" stroke="#8b95a1" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="space-y-6 sm:space-y-8">
              <h3 className="text-[18px] sm:text-[20px] font-black tracking-tighter uppercase border-b-2 border-black pb-3 inline-block text-black">Daily Price</h3>
              <div className="overflow-x-auto -mx-2">
                <div className="inline-block min-w-full align-middle px-2">
                  <table className="min-w-[500px] w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] sm:text-[11px] font-black text-gray-300 uppercase tracking-widest">
                        <th className="py-4 px-2">Date</th>
                        <th className="py-4 px-2">Price</th>
                        <th className="py-4 px-2">Change</th>
                        <th className="py-4 px-2 text-right">Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {marketData.map((row, idx) => (
                        <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 sm:py-5 px-2 text-[13px] sm:text-[14px] font-bold text-gray-400 group-hover:text-black">{row.date}</td>
                          <td className="py-4 sm:py-5 px-2 text-[15px] sm:text-[16px] font-black">{formatNumber(row.price)}</td>
                          <td className={`py-4 sm:py-5 px-2 text-[13px] sm:text-[14px] font-black ${row.change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                            {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}%
                          </td>
                          <td className="py-4 sm:py-5 px-2 text-[13px] sm:text-[14px] font-bold text-gray-400 text-right">{row.volume}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
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