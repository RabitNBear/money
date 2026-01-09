'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
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
import { Calendar, Search, ArrowDownCircle, Coffee, Pizza, Smartphone, CarFront, Building2 } from 'lucide-react';

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
    </svg>
  );
}

export default function BacktestPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('');
  const [tickerName, setTickerName] = useState('');
  const [amount, setAmount] = useState(10000000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const [dateHistory, setDateHistory] = useState<{date: string, rate: number}[]>([]);
  const [dateSearchTerm, setDateSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  
  const stockDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  const availableStocks = [
    { id: 1, name: '애플', ticker: 'AAPL' },
    { id: 2, name: '엔비디아', ticker: 'NVDA' },
    { id: 3, name: '테슬라', ticker: 'TSLA' },
    { id: 4, name: '삼성전자', ticker: '005930.KS' },
    { id: 5, name: '마이크로소프트', ticker: 'MSFT' },
    { id: 6, name: '코카콜라', ticker: 'KO' },
  ];

  const filteredStocks = useMemo(() => 
    availableStocks.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]
  );

  const filteredDates = useMemo(() => 
    dateHistory.filter(d => d.date.includes(dateSearchTerm)),
    [dateHistory, dateSearchTerm]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (stockDropdownRef.current && !stockDropdownRef.current.contains(e.target as Node)) setIsStockDropdownOpen(false);
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) setIsDateDropdownOpen(false);
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

  const handleSelectStock = async (stock: any) => {
    setSelectedTicker(stock.ticker);
    setTickerName(stock.name);
    setSearchTerm(stock.ticker);
    setIsStockDropdownOpen(false);
    setSelectedDate('');
    setDateSearchTerm('');
    
    try {
      const res = await fetch(`/api/history/${stock.ticker}?amount=10000&days=3650`);
      const json = await res.json();
      if (json.success) setDateHistory(json.data.history);
    } catch (err) { console.error("데이터 로드 실패"); }
  };

  const handleReset = () => {
    setSearchTerm(''); setSelectedTicker(''); setTickerName('');
    setSelectedDate(''); setDateSearchTerm(''); setAmount(10000000); setResult(null);
  };

  const handleBacktest = async () => {
    if (!selectedTicker || !selectedDate) return;
    setLoading(true);
    setResult(null);
    try {
      const targetDate = new Date(selectedDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - targetDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const res = await fetch(`/api/history/${selectedTicker}?amount=${amount}&days=${diffDays}`);
      const json = await res.json();
      if (json.success) setResult(json.data);
    } catch (err) { alert('오류가 발생했습니다.'); } finally { setLoading(false); }
  };

  const chartData = result?.history.map((point, i) => ({
    date: point.date,
    value: point.value,
    benchmark: result.benchmarkHistory[i]?.value || 0,
  })) || [];

  const assets = convertToAssets(result ? result.finalValue : amount);

  const getAssetIcon = (label: string) => {
    if (label.includes('커피')) return <Coffee className="w-10 h-10 lg:w-14 lg:h-14 text-amber-900" />;
    if (label.includes('치킨')) return <Pizza className="w-10 h-10 lg:w-14 lg:h-14 text-orange-500" />;
    if (label.includes('아이폰') || label.includes('폰')) return <Smartphone className="w-10 h-10 lg:w-14 lg:h-14 text-gray-800" />;
    if (label.includes('아파트') || label.includes('집')) return <Building2 className="w-10 h-10 lg:w-14 lg:h-14 text-slate-700" />;
    return <CarFront className="w-10 h-10 lg:w-14 lg:h-14 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans tracking-tight selection:bg-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-12 sm:py-24">
        
        {/* 헤더 - 해당 페이지 기능 제목 */}
        <div className="mb-12 sm:mb-1">
          <br />
          <h1 className="text-[36px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase">Backtesting<br/>Simulation</h1>
          <p className="text-[14px] sm:text-[16px] text-gray-400 font-bold italic mt-4 opacity-80 uppercase tracking-widest">Growth Strategy Analysis</p>
        </div>

        {/* 상단 입력 섹션 - 종목, 과거 날짜, 금액 입력 */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-15 lg:gap-3 mb-35 pt-10 lg:pt-[100px]">
          <div className="w-full lg:flex-1 space-y-6 relative" ref={stockDropdownRef}>
            <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Search Asset</label>
            <div className="relative">
              <input
                type="text"
                placeholder="종목 검색 및 선택"
                value={searchTerm}
                onFocus={() => setIsStockDropdownOpen(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full h-[64px] sm:h-[68px] bg-[#f3f4f6] rounded-2xl px-8 font-black text-[16px] sm:text-[18px] outline-none transition-all focus:ring-1 focus:ring-black ${isStockDropdownOpen ? 'rounded-b-none ring-1 ring-black' : ''}`}
              />
              {isStockDropdownOpen && (
                <div className="absolute top-[64px] sm:top-[68px] left-0 w-full bg-white border-x border-b border-gray-200 rounded-b-2xl z-[100] shadow-2xl overflow-hidden">
                  <div className="max-h-[250px] overflow-y-auto">
                    {filteredStocks.map((stock) => (
                      <div key={stock.id} onClick={() => handleSelectStock(stock)} className="flex justify-between items-center p-4 sm:p-5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors">
                        <span className="font-black text-[14px] sm:text-[15px]">{stock.name}</span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-widest">{stock.ticker}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tickerName && !isStockDropdownOpen && (
                <div className="absolute -bottom-10 left-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <span className="text-[9px] font-black text-white bg-black px-2 py-0.5 rounded tracking-tighter">SELECTED</span>
                  <span className="text-[12px] font-black">{tickerName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:flex-1 space-y-6 relative" ref={dateDropdownRef}>
            <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Select Start Date</label>
            <div className="relative">
              <input
                type="text"
                placeholder={selectedTicker ? "시작 날짜 검색 (YYYY-MM)" : "종목을 먼저 선택하세요"}
                value={dateSearchTerm}
                disabled={!selectedTicker}
                onFocus={() => setIsDateDropdownOpen(true)}
                onChange={(e) => setDateSearchTerm(e.target.value)}
                className={`w-full h-[64px] sm:h-[68px] bg-[#f3f4f6] rounded-2xl px-6 sm:px-8 font-black text-[16px] sm:text-[18px] outline-none transition-all focus:ring-1 focus:ring-black ${isDateDropdownOpen ? 'rounded-b-none ring-1 ring-black' : ''}`}
              />
              {isDateDropdownOpen && dateHistory.length > 0 && (
                <div className="absolute top-[64px] sm:top-[68px] left-0 w-full bg-white border-x border-b border-gray-200 rounded-b-2xl z-[100] shadow-2xl overflow-hidden">
                  <div className="max-h-[250px] overflow-y-auto">
                    {filteredDates.map((d, i) => (
                      <div key={i} onClick={() => { setSelectedDate(d.date); setDateSearchTerm(d.date); setIsDateDropdownOpen(false); }} className="flex justify-between items-center p-4 sm:p-5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none">
                        <span className="font-black text-[13px] sm:text-[14px]">{d.date}</span>
                        <span className="text-[11px] sm:text-[12px] font-bold text-blue-500">{formatCurrency(d.rate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
               {selectedDate && !isDateDropdownOpen && (
                <div className="absolute -bottom-10 left-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <span className="text-[9px] font-black text-white bg-blue-500 px-2 py-0.5 rounded tracking-tighter uppercase">Start Point</span>
                  <span className="text-[12px] font-black">{selectedDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:flex-[1.5] space-y-6">
            <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Initial Principal</label>
            <div className="relative">
              <input type="text" inputMode="numeric" value={formatNumber(amount)} onChange={(e) => setAmount(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)} className="w-full h-[64px] sm:h-[68px] bg-[#f3f4f6] rounded-2xl px-6 sm:px-8 text-right text-[18px] sm:text-[20px] lg:text-[24px] font-black outline-none focus:ring-1 focus:ring-black" />
              <span className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 text-[11px] sm:text-[12px] font-black text-gray-400 uppercase border-r border-gray-200 pr-3 sm:pr-4">KRW</span>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <button onClick={handleBacktest} disabled={loading || !selectedDate} className={`w-full lg:w-[120px] h-[64px] sm:h-[68px] rounded-2xl text-[14px] sm:text-[15px] font-black uppercase tracking-widest transition-all ${!selectedDate ? 'bg-white border border-gray-200 text-gray-300' : 'bg-[#1a1a1a] text-white hover:bg-black cursor-pointer shadow-xl'}`}>
              {loading ? '...' : 'Run'}
            </button>
          </div>
        </div>

        {/* 실물 가치 비교 섹션 */}
        <section className="mb-24 animate-in fade-in duration-700">
          <div className="flex items-center gap-3 mb-10 border-b-2 border-black pb-6">
            <h3 className="text-[20px] lg:text-[22px] font-black tracking-tighter uppercase text-black">Real-world Value Comparison</h3>
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
                <h3 className="text-[20px] lg:text-[22px] font-black tracking-tighter uppercase text-gray-900">Analysis Summary</h3>
              </div>
              <div className="lg:col-span-12 p-2 sm:p-4 space-y-10 bg-white">
                <div className="space-y-3">
                  <span className="text-[10px] lg:text-[12px] font-black text-gray-300 uppercase tracking-[0.3em]">Final Asset Value</span>
                  <div className="text-[32px] sm:text-[48px] lg:text-[64px] font-black tracking-tighter leading-none text-black break-all">
                    {formatCurrency(result.finalValue)}
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
                <h3 className="text-[20px] lg:text-[22px] font-black tracking-tighter uppercase">Growth Trajectory</h3>
                <button onClick={handleReset} className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase text-gray-400 hover:text-black transition-colors">
                  <IconRefresh className="w-3 h-3" /> Reset
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
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }} tickFormatter={(value) => value.slice(2, 7)} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }} tickFormatter={(value) => `${formatNumber(value / 10000)}만`} axisLine={false} tickLine={false} width={50} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '12px' }} formatter={(value) => formatCurrency(Number(value) || 0)} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span style={{ color: '#1a1a1a', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>{value}</span>} />
                    <Area type="monotone" dataKey="value" name={tickerName || result.ticker} stroke="#3182f6" strokeWidth={3} fill="url(#colorValue)" />
                    <Line type="monotone" dataKey="benchmark" name={result.benchmarkSymbol} stroke="#8b95a1" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
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

function DetailRow({ label, value, isHighlight = false, isRed = false, isBlue = false }: any) {
  return (
    <div className="flex justify-between items-center gap-4 py-2 sm:py-3">
      <span className="text-[11px] sm:text-[13px] font-bold text-gray-400 uppercase tracking-tight shrink-0">{label}</span>
      <span className={`text-[15px] sm:text-[20px] font-black text-right ${isHighlight ? 'text-black underline decoration-2 underline-offset-4 decoration-blue-100' : 'text-gray-900'} ${isRed ? 'text-red-500' : isBlue ? 'text-blue-500' : ''}`}>
        {value}
      </span>
    </div>
  );
}