'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { formatNumber, formatCurrency } from '@/lib/utils';

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 1 0-9 9 9.75 9.75 0 0 0-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
    </svg>
  );
}

export default function CalculatorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('');
  const [tickerName, setTickerName] = useState('');
  const [targetMonthly, setTargetMonthly] = useState(1000000);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [stockData, setStockData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  // 추천 종목 리스트 - 더미 데이터
  const availableStocks = [
    { id: 1, name: '애플', ticker: 'AAPL' },
    { id: 2, name: '엔비디아', ticker: 'NVDA' },
    { id: 3, name: '리얼티인컴', ticker: 'O' },
    { id: 4, name: '삼성전자', ticker: '005930.KS' },
    { id: 5, name: 'SCHD', ticker: 'SCHD' },
    { id: 6, name: '테슬라', ticker: 'TSLA' },
  ];

  const filteredStocks = useMemo(() => 
    availableStocks.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.ticker.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // 실제 API에서 데이터를 가져오는 함수
  const handleFetchData = async (ticker: string, name: string) => {
    setLoading(true);
    setIsDropdownOpen(false);
    setSearchTerm(ticker);
    setResult(null);

    try {
      // 1. 주식 정보
      const stockRes = await fetch(`/api/stock/${ticker}`);
      const stockJson = await stockRes.json();

      if (!stockJson.success) {
        alert(stockJson.error);
        return;
      }

      // 2. 환율 정보
      const rateRes = await fetch('/api/exchange-rate');
      const rateJson = await rateRes.json();
      const exchangeRate = rateJson.data?.rate || 1300;

      const stock = stockJson.data;

      if (stock.dividendYield <= 0) {
        alert('이 종목은 배당금이 없습니다.');
        setStockData(null);
        return;
      }

      setStockData({ ...stock, exchangeRate });
      setSelectedTicker(ticker);
      setTickerName(stock.name);
    } catch (err) {
      alert('데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 계산 로직
  useEffect(() => {
    if (!stockData) return;
    
    const annualTarget = targetMonthly * 12;
    const rate = stockData.currency === 'USD' ? stockData.exchangeRate : 1;
    
    const priceInKRW = stockData.price * rate;
    const dividendPerShareKRW = stockData.dividendRate * rate;
    
    const requiredShares = Math.ceil(annualTarget / dividendPerShareKRW);
    const requiredInvestment = requiredShares * priceInKRW;
    const annualDividend = requiredShares * dividendPerShareKRW;
    
    setResult({
      priceInKRW,
      requiredShares,
      requiredInvestment,
      annualDividend,
      monthlyDividend: annualDividend / 12
    });
  }, [stockData, targetMonthly]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedTicker('');
    setTickerName('');
    setStockData(null);
    setResult(null);
    setTargetMonthly(1000000);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans tracking-tight selection:bg-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-12 sm:py-24">
        
        {/* 헤더 */}
        <div className="mb-12 sm:mb-24">
          <br />
          <h1 className="text-[36px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase">Dividend<br/>Calculator</h1>
          <p className="text-[14px] sm:text-[16px] text-gray-400 font-bold italic mt-4 opacity-80">목표 월 배당금을 위한 필요 자산을 시뮬레이션하세요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-16 items-start">
          {/* 좌측 : 입력 */}
          <div className="space-y-12 sm:space-y-16 lg:pt-[140px]">
            <div className="space-y-6" ref={dropdownRef}>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Search Ticker</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="종목명 또는 티커 입력 (예: AAPL, 삼성전자)" 
                  value={searchTerm} 
                  onFocus={() => setIsDropdownOpen(true)} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className={`w-full h-[64px] sm:h-[68px] bg-[#f3f4f6] rounded-2xl px-6 sm:px-8 font-black text-[16px] sm:text-[18px] outline-none transition-all focus:ring-1 focus:ring-black ${isDropdownOpen ? 'rounded-b-none ring-1 ring-black' : ''}`} 
                />
                {isDropdownOpen && (
                  <div className="absolute top-[64px] sm:top-[68px] left-0 w-full bg-white border-x border-b border-gray-200 rounded-b-2xl z-[100] shadow-2xl overflow-hidden">
                    <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                      {filteredStocks.length > 0 ? filteredStocks.map((stock) => (
                        <div key={stock.id} onClick={() => handleFetchData(stock.ticker, stock.name)} className="flex justify-between items-center p-4 sm:p-5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors">
                          <span className="font-black text-[14px] sm:text-[15px]">{stock.name}</span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-widest">{stock.ticker}</span>
                        </div>
                      )) : (
                        <div className="p-5 text-center text-gray-400 text-sm font-bold italic">목록에 없는 종목은 티커를 직접 입력 후 엔터를 치세요</div>
                      )}
                    </div>
                  </div>
                )}
                {tickerName && !isDropdownOpen && (
                  <div className="absolute -bottom-10 left-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <span className="text-[9px] font-black text-white bg-black px-2 py-0.5 rounded tracking-tighter">SELECTED</span>
                    <span className="text-[12px] font-black">{tickerName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Target Monthly Income</label>
              <div className="relative">
                <input type="text" inputMode="numeric" value={formatNumber(targetMonthly)} onChange={(e) => setTargetMonthly(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)} className="w-full h-[68px] sm:h-[72px] bg-[#f3f4f6] rounded-2xl px-6 sm:px-8 text-right text-[22px] sm:text-[28px] font-black outline-none focus:ring-1 focus:ring-black transition-all" />
                <span className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 text-[12px] sm:text-[14px] font-black text-gray-400 uppercase border-r border-gray-200 pr-4">KRW</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {[1000000, 500000, 100000].map((amt) => (
                  <button key={amt} onClick={() => setTargetMonthly(prev => prev + amt)} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-200 text-[10px] sm:text-[11px] font-black text-gray-400 rounded-lg hover:bg-black hover:text-white transition-all uppercase tracking-tighter cursor-pointer">+{amt / 10000}만</button>
                ))}
                <button onClick={() => setTargetMonthly(0)} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-200 text-[10px] sm:text-[11px] font-black text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all uppercase tracking-tighter cursor-pointer">Reset</button>
              </div>
            </div>

            <div className="bg-[#f9fafb] p-6 sm:p-8 rounded-[24px] border border-gray-50 text-[12px] sm:text-[13px] text-gray-400 leading-relaxed font-bold">
              <p className="flex gap-2 mb-1"><span className="text-black">•</span> {loading ? '데이터를 불러오는 중입니다...' : '종목을 선택하면 실시간 배당 정보가 로드됩니다.'}</p>
              <p className="flex gap-2"><span className="text-black">•</span> 목표 금액을 수정하면 필요 투자 금액이 즉시 계산됩니다.</p>
            </div>
          </div>

          {/* 우측 : 결과 */}
          <div className="space-y-10">
            <section className="space-y-6 sm:space-y-8">
              <h3 className="text-[20px] sm:text-[22px] font-black tracking-tighter uppercase text-gray-900">Calculation Result</h3>
              <div className="border border-gray-100 rounded-[28px] sm:rounded-[32px] p-8 sm:p-12 space-y-10 sm:space-y-12 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-3">
                  <span className="text-[10px] sm:text-[12px] font-black text-gray-300 uppercase tracking-[0.3em]">Required Investment</span>
                  <div className="text-[28px] sm:text-[42px] lg:text-[52px] font-black tracking-tighter leading-none text-black break-all">
                    {result ? formatNumber(result.requiredInvestment) : '0'}
                    <span className="text-[16px] sm:text-[20px] font-bold ml-2 text-gray-300">KRW</span>
                  </div>
                </div>
                <div className="space-y-5 sm:space-y-6 pt-10 sm:pt-12 border-t border-gray-100">
                  <DetailRow label="현재 주가 (환산)" value={result ? formatCurrency(result.priceInKRW) : '-'} />
                  <DetailRow label="배당 수익률" value={stockData ? `${stockData.dividendYield.toFixed(2)}%` : '-'} isHighlight />
                  <DetailRow label="필요 주식 수" value={result ? `${formatNumber(result.requiredShares)} 주` : '-'} />
                  <DetailRow label="연간 예상 배당" value={result ? formatCurrency(result.annualDividend) : '-'} />
                  <DetailRow label="월 예상 배당" value={result ? formatCurrency(result.monthlyDividend) : '-'} isRed />
                </div>
              </div>
            </section>

            <button onClick={handleReset} className="w-full h-[64px] sm:h-[68px] bg-white border border-black text-black font-black text-[12px] sm:text-[13px] rounded-2xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] cursor-pointer">
              <IconRefresh className="w-4 h-4" /> Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isHighlight = false, isRed = false }: any) {
  return (
    <div className="flex justify-between items-center group gap-4">
      <span className="text-[12px] sm:text-[14px] font-bold text-gray-400 uppercase tracking-tight shrink-0">{label}</span>
      <span className={`text-[16px] sm:text-[20px] font-black text-right ${isHighlight ? 'text-black underline decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-8 decoration-gray-100' : 'text-gray-900'} ${isRed ? 'text-red-500' : ''}`}>
        {value}
      </span>
    </div>
  );
}