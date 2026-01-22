'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { formatNumber } from '@/lib/utils';
import { ChevronDown, Search, Loader2, Globe, Landmark, Heart } from 'lucide-react';
import { fetchWithAuth, tryFetchWithAuth, API_URL } from '@/lib/apiClient';

// 타입 정의
interface SearchResult {
  symbol: string;
  name: string;
  engName: string;
  market: 'US' | 'KR';
}

interface Stock {
  id: string;
  name: string;
  ticker: string;
  currentPrice: number;
}

interface PortfolioItem extends Stock {
  instanceId: string;
  quantity: number;
  avgPrice: number;
}

// 컴포넌트 Props 타입 정의
interface DetailBlockProps {
  label: string;
  value: string | number;
  isColor?: boolean;
  isProfit?: boolean;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface PortfolioAPIItem {
  id: string;
  ticker: string;
  quantity: number;
  avgPrice: number;
}

// [추가] 관심종목 API 응답 타입 정의
interface WatchlistAPIItem {
  ticker: string;
  name?: string;
  market?: 'US' | 'KR';
}

export default function AssetManagementPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [shares, setShares] = useState<string>('');
  const [avgPrice, setAvgPrice] = useState<string>('');

  const [stockSearchTerm, setStockSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [portfolioSearchTerm, setPortfolioSearchTerm] = useState('');
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [openAssetId, setOpenAssetId] = useState<string | null>(null);
  const PORTFOLIO_PER_PAGE = 5;

  // API 검색 결과 및 좋아요 상태
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [likedStocks, setLikedStocks] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 여부 확인 및 관심종목 로드
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await tryFetchWithAuth(`${API_URL}/auth/me`);
        setIsLoggedIn(res.ok);
        if (res.ok) {
          const watchlistRes = await tryFetchWithAuth(`${API_URL}/watchlist`);
          if (watchlistRes.ok) {
            const data = await watchlistRes.json();
            const watchlistArray: WatchlistAPIItem[] = Array.isArray(data) ? data : (data.data || []);
            // [해결] any 대신 WatchlistAPIItem 타입을 사용하여 맵핑
            setLikedStocks(watchlistArray.map((item: WatchlistAPIItem) => item.ticker));
          }
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      try {
        const res = await fetch('/api/search');
        const data = await res.json();
        if (data.success) {
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
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 초기 로드 시 포트폴리오 가져오기
  useEffect(() => {
    searchStocks('');
    if (!isLoggedIn) {
      setIsLoadingPortfolio(false);
      return;
    }

    const fetchPortfolio = async () => {
      setIsLoadingPortfolio(true);
      try {
        const res = await fetchWithAuth(`${API_URL}/portfolio`);
        if (res.ok) {
          const portfolioResponse = await res.json();
          const portfolioData: PortfolioAPIItem[] = Array.isArray(portfolioResponse)
            ? portfolioResponse
            : (portfolioResponse.data && Array.isArray(portfolioResponse.data) ? portfolioResponse.data : []);
          const portfolioWithMarketData = await Promise.all(
            portfolioData.map(async (item: PortfolioAPIItem) => {
              const stockRes = await fetch(`/api/stock/${item.ticker}`);
              if (stockRes.ok) {
                const stockData = await stockRes.json();
                return { ...item, name: stockData.data.name, currentPrice: stockData.data.price, instanceId: item.id };
              }
              return { ...item, name: item.ticker, currentPrice: item.avgPrice, instanceId: item.id };
            })
          );
          setPortfolio(portfolioWithMarketData);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setIsLoadingPortfolio(false);
      }
    };
    fetchPortfolio();
  }, [searchStocks, isLoggedIn]);

  // 검색어 변경 시 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStocks(stockSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [stockSearchTerm, searchStocks]);

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

  const handleSelectStock = async (stock: SearchResult) => {
    setIsDropdownOpen(false);
    setStockSearchTerm(stock.name);
    setIsLoadingPrice(true);

    try {
      const res = await fetch(`/api/stock/${stock.symbol}`);
      const data = await res.json();

      if (data.success) {
        setSelectedStock({
          id: String(Date.now()),
          name: stock.name,
          ticker: stock.symbol,
          currentPrice: data.data.price
        });
      } else {
        alert('주식 정보를 불러올 수 없습니다.');
        setSelectedStock(null);
      }
    } catch (err) {
      console.error('Stock fetch error:', err);
      alert('주식 정보를 불러오는 중 오류가 발생했습니다.');
      setSelectedStock(null);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const filteredPortfolio = useMemo(() => {
    const filtered = portfolio.filter(item =>
      item.name.toLowerCase().includes(portfolioSearchTerm.toLowerCase()) ||
      item.ticker.toLowerCase().includes(portfolioSearchTerm.toLowerCase())
    );
    const startIndex = (portfolioPage - 1) * PORTFOLIO_PER_PAGE;
    return {
      items: filtered.slice(startIndex, startIndex + PORTFOLIO_PER_PAGE),
      total: filtered.length
    };
  }, [portfolio, portfolioSearchTerm, portfolioPage]);

  const portfolioTotalPages = Math.ceil(filteredPortfolio.total / PORTFOLIO_PER_PAGE);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addToPortfolio = async () => {
    if (!selectedStock || !shares || !avgPrice) return alert("정보를 모두 입력해주세요.");

    if (isLoggedIn) {
      const newAsset = {
        ticker: selectedStock.ticker,
        name: selectedStock.name,
        market: selectedStock.ticker.includes('.KS') ? 'KR' : 'US',
        quantity: Number(shares),
        avgPrice: Number(avgPrice),
      };

      try {
        const res = await fetchWithAuth(`${API_URL}/portfolio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAsset),
        });

        if (res.ok) {
          const addedAsset: PortfolioAPIItem = await res.json();
          const newPortfolioItem: PortfolioItem = {
            id: addedAsset.id,
            instanceId: addedAsset.id,
            name: selectedStock.name,
            ticker: selectedStock.ticker,
            currentPrice: selectedStock.currentPrice,
            quantity: Number(shares),
            avgPrice: Number(avgPrice),
          };
          setPortfolio(prev => [newPortfolioItem, ...prev]);
          setShares(''); setAvgPrice(''); setSelectedStock(null);
          setPortfolioPage(1);
          setStockSearchTerm('');
        } else {
          alert('포트폴리오 추가에 실패했습니다.');
        }
      } catch (error) {
        console.error('Failed to add to portfolio:', error);
      }
    } else {
      const tempId = String(Date.now());
      const newPortfolioItem: PortfolioItem = {
        id: tempId,
        instanceId: tempId,
        name: selectedStock.name,
        ticker: selectedStock.ticker,
        currentPrice: selectedStock.currentPrice,
        quantity: Number(shares),
        avgPrice: Number(avgPrice),
      };
      setPortfolio(prev => [newPortfolioItem, ...prev]);
      setShares(''); setAvgPrice(''); setSelectedStock(null);
      setPortfolioPage(1);
      setStockSearchTerm('');
      alert("로그인 후 저장하시면 마이페이지와 해당 페이지에서 상시로 확인하실 수 있습니다.");
    }
  };

  const toggleAsset = (instanceId: string) => {
    setOpenAssetId(openAssetId === instanceId ? null : instanceId);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans tracking-tight selection:bg-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-12 sm:py-24">

        <div className="mb-12 sm:mb-1">
          <br />
          <h1 className="text-[32px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase"><br />나의 종목</h1>
          <p className="text-[13px] sm:text-[16px] text-gray-400 font-bold italic mt-4 opacity-80 uppercase tracking-widest">나의 보유 주식을 저장해서 편리하게 확인해보세요.</p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-6 mb-24 pt-10 lg:pt-[100px]">

          <div className="w-full lg:flex-[2] space-y-6 relative" ref={dropdownRef}>
            <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">종목 검색</label>
            <div className="relative">
              <input
                type="text"
                placeholder="종목명 또는 티커 검색"
                value={stockSearchTerm}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => setStockSearchTerm(e.target.value)}
                className={`w-full h-[64px] sm:h-[68px] bg-[#f3f4f6] rounded-2xl px-12 sm:px-14 font-black text-[15px] sm:text-[18px] outline-none transition-all focus:ring-1 focus:ring-black ${isDropdownOpen ? 'rounded-b-none ring-1 ring-black' : ''}`}
              />
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />

              {isDropdownOpen && (
                <div className="absolute top-[64px] sm:top-[68px] left-0 w-full bg-white border border-gray-100 rounded-b-2xl z-[100] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-[300px] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-8 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-[14px]">검색 결과가 없습니다</div>
                    ) : (
                      searchResults.map(stock => (
                        <div key={stock.symbol} onClick={() => handleSelectStock(stock)} className="p-4 sm:p-5 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-none group transition-colors">
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
                </div>
              )}

              {(selectedStock || isLoadingPrice) && !isDropdownOpen && (
                <div className="absolute -bottom-10 left-1 flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                  {isLoadingPrice ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-[11px] sm:text-[12px] font-bold text-gray-400">가격 조회 중...</span>
                    </>
                  ) : selectedStock && (
                    <>
                      <span className="text-[8px] sm:text-[9px] font-black text-white bg-black px-2 py-0.5 rounded tracking-tighter shrink-0">SELECTED</span>
                      <span className="text-[11px] sm:text-[12px] font-black truncate max-w-[120px]">{selectedStock.name}</span>
                      <span className="text-[11px] sm:text-[12px] font-bold text-red-500 ml-1 shrink-0">현재가: {formatNumber(selectedStock.currentPrice)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:flex-1 space-y-6">
            <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">주</label>
            <div className="relative">
              <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} placeholder="0" className="w-full h-[64px] sm:h-[68px] bg-[#f3f4f6] rounded-2xl px-6 sm:px-8 text-right text-[18px] sm:text-[22px] font-black outline-none focus:ring-1 focus:ring-black transition-all" />
              <span className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[10px] sm:text-[12px] font-black text-gray-400 uppercase border-r border-gray-200 pr-3 sm:pr-4">Shares</span>
            </div>
          </div>

          <div className="w-full lg:flex-1 space-y-6">
            <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">평균 단가</label>
            <div className="relative">
              <input type="number" value={avgPrice} onChange={(e) => setAvgPrice(e.target.value)} placeholder="0.00" className="w-full h-[64px] sm:h-[68px] bg-[#f3f4f6] rounded-2xl px-6 sm:px-8 text-right text-[18px] sm:text-[22px] font-black outline-none focus:ring-1 focus:ring-black transition-all" />
              <span className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[10px] sm:text-[12px] font-black text-gray-400 uppercase border-r border-gray-200 pr-3 sm:pr-4">KRW</span>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <button onClick={addToPortfolio} className="w-full lg:w-[200px] h-[64px] sm:h-[68px] bg-[#1a1a1a] text-white rounded-2xl font-black text-[14px] sm:text-[15px] hover:bg-black transition-all shadow-xl uppercase tracking-widest cursor-pointer whitespace-nowrap">종목 저장</button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-black pb-4 gap-4">
            <h3 className="text-[18px] sm:text-[20px] font-black tracking-tighter uppercase">종목 자세히 열어보기</h3>
            {portfolio.length > 0 && (
              <div className="relative w-full max-w-[300px]">
                <input type="text" placeholder="보유 자산 내역 검색" value={portfolioSearchTerm} onChange={(e) => { setPortfolioSearchTerm(e.target.value); setPortfolioPage(1); }} className="w-full h-[40px] sm:h-[44px] bg-white border border-gray-100 rounded-xl px-10 font-bold text-[12px] sm:text-[13px] outline-none focus:border-black shadow-sm" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoadingPortfolio ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
              </div>
            ) : filteredPortfolio.items.length > 0 ? (
              filteredPortfolio.items.map((item) => {
                const totalInvested = item.quantity * item.avgPrice;
                const totalMarketValue = item.quantity * item.currentPrice;
                const profitLoss = totalMarketValue - totalInvested;
                const pnlPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
                const isProfit = profitLoss >= 0;
                const isOpen = openAssetId === item.instanceId;

                return (
                  <div key={item.instanceId} className="border border-gray-50 rounded-[24px] overflow-hidden bg-white shadow-sm transition-all duration-300 hover:border-gray-200">
                    <div onClick={() => toggleAsset(item.instanceId)} className={`p-5 sm:p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50/50 transition-colors ${isOpen ? 'bg-gray-50/30' : ''}`}>
                      <div className="flex gap-4 sm:gap-6 items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-xl flex items-center justify-center text-white font-black text-[11px] sm:text-[12px] uppercase">
                          {item.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[14px] sm:text-[16px] font-black text-gray-900">{item.name}</p>
                          <p className="text-[9px] sm:text-[10px] font-bold text-gray-300 uppercase tracking-widest">{item.ticker}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-10 text-right">
                        <div className="block">
                          <p className="text-[10px] font-black text-gray-300 uppercase mb-1 hidden md:block">Shares</p>
                          <p className="text-[19px] font-black">{item.quantity}주</p>
                        </div>
                        <div>
                          <p className={`text-[14px] sm:text-[19px] font-black ${isProfit ? 'text-red-500' : 'text-blue-500'}`}>
                            {isProfit ? '+' : ''}{formatNumber(profitLoss)}원
                          </p>
                          <p className={`text-[11px] sm:text-[15px] font-black ${isProfit ? 'text-red-500' : 'text-blue-500'}`}>
                            {isProfit ? '+' : ''}{pnlPercentage.toFixed(2)}%
                          </p>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : ''}`} />
                      </div>
                    </div>

                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-6 sm:p-10 border-t border-gray-50 bg-[#fafafa]">
                        <div className="grid grid-cols-3 gap-y-10 gap-x-2 sm:gap-x-80 justify-items-center items-start max-w-[1000px] mx-auto">
                          <div className="space-y-8 text-center sm:text-left w-full flex flex-col items-center sm:items-start">
                            <DetailBlock label="손익금액" value={`${isProfit ? '+' : ''}${formatNumber(profitLoss)}원`} isColor isProfit={isProfit} />
                            <DetailBlock label="손익백분율" value={`${isProfit ? '+' : ''}${pnlPercentage.toFixed(2)}%`} isColor isProfit={isProfit} />
                          </div>
                          <div className="space-y-8 text-center sm:text-left w-full flex flex-col items-center sm:items-start">
                            <DetailBlock label="나의 총 금액" value={`${formatNumber(totalInvested)}원`} />
                            <DetailBlock label="시장 총 금액" value={`${formatNumber(totalMarketValue)}원`} />
                          </div>
                          <div className="space-y-8 text-center sm:text-left w-full flex flex-col items-center sm:items-start">
                            <DetailBlock label="나의 금액 (평단)" value={`${formatNumber(item.avgPrice)}원`} />
                            <DetailBlock label="시장 금액 (현재가)" value={`${formatNumber(item.currentPrice)}원`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })) : (
              <div className="h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[32px] text-gray-300 font-bold italic text-center px-4">
                저장된 종목이 없습니다.
              </div>
            )}
          </div>
          <Pagination currentPage={portfolioPage} totalPages={portfolioTotalPages} onPageChange={setPortfolioPage} />
        </div>
      </div>
    </div>
  );
}

// 상세 정보 블록 컴포넌트
function DetailBlock({ label, value, isColor = false, isProfit = false }: DetailBlockProps) {
  return (
    <div>
      <p className="text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase mb-1.5">{label}</p>
      <p className={`text-[13px] sm:text-[17px] font-black leading-tight ${isColor ? (isProfit ? 'text-red-500' : 'text-blue-500') : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-3 pt-8">
      <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-full text-black hover:bg-gray-100 cursor-pointer disabled:opacity-20 transition-all">〈</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
        <button key={num} onClick={() => onPageChange(num)} className={`w-9 h-9 rounded-full text-[11px] font-black transition-all cursor-pointer ${num === currentPage ? 'bg-black text-white shadow-lg' : 'text-black hover:bg-gray-50'}`}>{num}</button>
      ))}
      <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-full text-black hover:bg-gray-100 cursor-pointer disabled:opacity-20 transition-all">〉</button>
    </div>
  );
}