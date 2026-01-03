'use client';

import { useState, useEffect, useRef } from 'react';

interface StockResult {
  symbol: string;
  name: string;
  engName: string;
  market: 'US' | 'KR';
}

interface TickerSearchProps {
  value: string;
  onChange: (ticker: string, name?: string) => void;
  placeholder?: string;
}

export default function TickerSearch({
  value,
  onChange,
  placeholder = '종목명 또는 티커 검색',
}: TickerSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<StockResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState<string>('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 검색 API 호출
  useEffect(() => {
    const searchStocks = async () => {
      if (!query.trim()) {
        // 빈 검색어면 인기 종목
        try {
          const res = await fetch('/api/search');
          const json = await res.json();
          if (json.success) {
            setResults(json.data);
          }
        } catch {
          setResults([]);
        }
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchStocks, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  // 종목 선택
  const handleSelect = (stock: StockResult) => {
    setQuery(stock.name);
    setSelectedName(stock.name);
    onChange(stock.symbol, stock.name);
    setIsOpen(false);
  };

  // 입력 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedName('');
    setIsOpen(true);

    // 직접 티커 입력 지원 (대문자로 변환)
    if (newValue.match(/^[A-Z0-9.\-^]+$/i)) {
      onChange(newValue.toUpperCase());
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="input pr-10"
        />
        {/* 검색 아이콘 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-[var(--neutral)]" viewBox="0 0 24 24">
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-[var(--neutral)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* 선택된 종목 표시 */}
      {selectedName && value && (
        <div className="mt-2 flex items-center gap-2">
          <span className="badge badge-neutral">{value}</span>
          <span className="text-sm text-[var(--neutral)]">{selectedName}</span>
        </div>
      )}

      {/* 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-elevated overflow-hidden">
          <div className="py-2">
            {!query.trim() && (
              <div className="px-4 py-2 text-xs text-[var(--neutral)] font-medium">
                인기 종목
              </div>
            )}
            {results.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelect(stock)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--card-hover)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      stock.market === 'KR'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}
                  >
                    {stock.market}
                  </span>
                  <div>
                    <div className="font-medium">{stock.name}</div>
                    <div className="text-xs text-[var(--neutral)]">
                      {stock.symbol}
                    </div>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 text-[var(--neutral)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 검색 결과 없음 */}
      {isOpen && query.trim() && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-elevated p-4 text-center">
          <p className="text-[var(--neutral)]">검색 결과가 없습니다</p>
          <p className="text-xs text-[var(--neutral)] mt-1">
            티커를 직접 입력하세요 (예: AAPL, 005930.KS)
          </p>
        </div>
      )}
    </div>
  );
}
