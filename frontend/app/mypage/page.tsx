'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, startOfDay, isSameMonth, isSameDay } from 'date-fns'; // 날짜 포맷팅을 위해 추가
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Globe, Star, Loader2 } from 'lucide-react'; // 아이콘 추가

// [타입 정의]
interface StockPortfolioItem {
  id: number;
  name: string;
  ticker: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  change: number;
}

interface WatchlistItem {
  id: number;
  name: string;
  ticker: string;
  currentPrice: number;
  dayChange: number;
}

interface InquiryItem {
  id: number;
  title: string;
  date: string;
  status: '답변완료' | '답변대기';
  answer: string;
}

interface MySchedule {
  id: number;
  date: string;
  title: string;
}

// 경제 일정 타입
interface EconomicEvent {
  id: string | number;
  date: string; 
  time: string;
  country: string;
  flag: string;
  title: string;
  impact: number;
  forecast: string;
  actual: string;
}

export default function MyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist' | 'calendar' | 'inquiries' | 'account'>('portfolio');
  
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [watchlistPage, setWatchlistPage] = useState(1);
  const [inquiriesPage, setInquiriesPage] = useState(1); // 문의 페이지 상태
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const PORTFOLIO_PER_PAGE = 5;
  const WATCHLIST_PER_PAGE = 8;
  const INQUIRIES_PER_PAGE = 4; // 문의 페이지당 개수

  // 달력 및 일정 상태
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(new Date());
  const [mySchedules, setMySchedules] = useState<MySchedule[]>([
    { id: 1, date: '2026-01-15', title: '애플 분기 실적 발표 확인' },
    { id: 2, date: '2026-01-20', title: '포트폴리오 리밸런싱 진행' },
    { id: 3, date: '2026-01-08', title: 'GGEULMUSE 업데이트 로그 확인' },
  ]);

  // 경제 일정 상태 및 로딩
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // 일정 추가/수정 모달 상태
  const [isSchedModalOpen, setIsSchedModalOpen] = useState(false);
  const [newSchedTitle, setNewSchedTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null); // 수정 중인 일정 ID

  const [myPortfolio, setMyPortfolio] = useState<StockPortfolioItem[]>([
    { id: 1, name: '애플', ticker: 'AAPL', shares: 15, avgPrice: 185.5, currentPrice: 192.4, change: 3.72 },
    { id: 2, name: '엔비디아', ticker: 'NVDA', shares: 8, avgPrice: 420.0, currentPrice: 540.2, change: 28.6 },
    { id: 3, name: '삼성전자', ticker: '005930.KS', shares: 50, avgPrice: 72000, currentPrice: 74500, change: 3.47 },
    { id: 4, name: 'SCHD', ticker: 'SCHD', shares: 100, avgPrice: 74.2, currentPrice: 76.8, change: 3.5 },
    { id: 5, name: '테슬라', ticker: 'TSLA', shares: 12, avgPrice: 245.0, currentPrice: 218.4, change: -10.8 },
    { id: 6, name: '마이크로소프트', ticker: 'MSFT', shares: 10, avgPrice: 400.0, currentPrice: 420.5, change: 5.12 },
  ]);

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `종목 ${i + 1}`,
    ticker: `TICKER${i + 1}`,
    currentPrice: 100 + i * 10,
    dayChange: (i % 2 === 0 ? 1.5 : -1.2)
  })));

const [myInquiries, setMyInquiries] = useState<InquiryItem[]>([
  { 
    id: 1, 
    title: '비밀번호 재설정 이메일이 오지 않습니다.', 
    date: '2026.01.07', 
    status: '답변완료', 
    answer: '안녕하세요. GGEULMUSE입니다. 스팸 메일함을 확인해 주세요. 지속적으로 문제가 발생할 경우 고객센터로 연락 바랍니다.' 
  },
  { 
    id: 2, 
    title: '백테스트 실행 시 차트 데이터 관련 문의', 
    date: '2026.01.05', 
    status: '답변대기', 
    answer: '현재 담당 부서에서 해당 데이터를 검토 중에 있습니다. 조속히 처리해 드리겠습니다.' 
  },
  { 
    id: 3, 
    title: '배당금 계산기 결과와 실제 수령액 차이 문의', 
    date: '2026.01.04', 
    status: '답변완료', 
    answer: '배당 소득세(15.4%) 및 현지 세금이 반영되지 않은 세전 금액으로 계산될 수 있습니다. 설정에서 세후 계산 옵션을 확인해 주세요.' 
  },
  { 
    id: 4, 
    title: '프리미엄 멤버십 결제 승인 지연 건', 
    date: '2026.01.02', 
    status: '답변완료', 
    answer: '결제 승인 과정에서 카드사 네트워크 오류가 확인되어 수동 승인 처리 완료해 드렸습니다. 이용에 불편을 드려 죄송합니다.' 
  },
  { 
    id: 5, 
    title: '특정 해외 종목(티커) 검색이 되지 않습니다.', 
    date: '2025.12.30', 
    status: '답변대기', 
    answer: '신규 상장 종목의 경우 데이터 업데이트에 최대 48시간이 소요될 수 있습니다. 해당 티커를 알려주시면 우선 확인하겠습니다.' 
  },
  { 
    id: 6, 
    title: '관심 종목 리스트의 기기 간 동기화 문제', 
    date: '2025.12.28', 
    status: '답변완료', 
    answer: '최신 버전 업데이트 이후 클라우드 동기화 로직이 강화되었습니다. 로그아웃 후 다시 로그인하여 확인 부탁드립니다.' 
  },
  { 
    id: 7, 
    title: '백테스트 결과 보고서 PDF 다운로드 기능 요청', 
    date: '2025.12.26', 
    status: '답변완료', 
    answer: '좋은 의견 감사합니다. 해당 기능은 다음 달 정기 업데이트(v2.5.0) 스펙에 포함되어 배포될 예정입니다.' 
  },
  { 
    id: 8, 
    title: '경제 캘린더 지표 업데이트 시간 오차', 
    date: '2025.12.24', 
    status: '답변완료', 
    answer: '지표 발표 시간은 실시간 데이터 제공사로부터 수신하며, 네트워크 환경에 따라 약 1~2분 정도 차이가 발생할 수 있습니다.' 
  },
  { 
    id: 9, 
    title: '내 달력 일정 알림 설정 방법 문의', 
    date: '2025.12.20', 
    status: '답변완료', 
    answer: '현재 브라우저 푸시 알림 기능을 준비 중입니다. 현재는 마이페이지 접속 시에만 일정 확인이 가능한 점 양해 부탁드립니다.' 
  },
  { 
    id: 10, 
    title: '회원 탈퇴 시 데이터 파기 절차 확인', 
    date: '2025.12.18', 
    status: '답변완료', 
    answer: '회원 탈퇴 즉시 모든 개인정보 및 포트폴리오 데이터는 복구 불가능한 상태로 영구 삭제됩니다. 자세한 내용은 개인정보 처리방침을 확인해 주세요.' 
  },
]);

  // 경제 일정 API 로드 로직
  useEffect(() => {
    async function fetchEconomicEvents() {
      setLoadingEvents(true);
      try {
        const start = format(startOfMonth(calendarDate), 'yyyy-MM-dd');
        const end = format(endOfMonth(calendarDate), 'yyyy-MM-dd');
        const res = await fetch(`/api/calendar?start=${start}&end=${end}`);
        const json = await res.json();
        if (json.success) setEconomicEvents(json.data);
      } catch (error) {
        console.error("경제 일정 로드 실패:", error);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEconomicEvents();
  }, [calendarDate]);

  // 일정 추가/수정 핸들러 - date-fns format 사용하여 날짜 오류 해결
  const handleAddMySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedTitle.trim()) return;
    
    if (editingId) {
      setMySchedules(prev => prev.map(s => s.id === editingId ? { ...s, title: newSchedTitle } : s));
    } else {
      const newEntry: MySchedule = {
        id: Date.now(),
        date: format(selectedCalendarDay, 'yyyy-MM-dd'),
        title: newSchedTitle
      };
      setMySchedules([...mySchedules, newEntry]);
    }
    
    setNewSchedTitle('');
    setEditingId(null);
    setIsSchedModalOpen(false);
  };

  // 일정 삭제
  const deleteMySchedule = (id: number) => {
    if (confirm('일정을 삭제하시겠습니까?')) {
      setMySchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  // 수정 모달 열기
  const openEditModal = (sched: MySchedule) => {
    setEditingId(sched.id);
    setNewSchedTitle(sched.title);
    setIsSchedModalOpen(true);
  };

  const { calendarDays, monthLabel } = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(1 - firstDay.getDay());
    const days = [];
    const temp = new Date(start);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }
    return { calendarDays: days, monthLabel: firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric' }) };
  }, [calendarDate]);

  useEffect(() => {
    setPortfolioPage(1);
    setWatchlistPage(1);
    setInquiriesPage(1); // 탭 변경 시 문의 페이지 초기화
  }, [searchTerm, activeTab]);

  useEffect(() => {
  // URL에서 ?tab=calendar 파라미터가 있는지 확인
  const params = new URLSearchParams(window.location.search);
  if (params.get('tab') === 'calendar') {
    setActiveTab('calendar');
  }
}, []);

  const deletePortfolioItem = (id: number) => {
    if (confirm('이 종목을 나의 종목에서 삭제하시겠습니까?')) {
      setMyPortfolio(prev => prev.filter(item => item.id !== id));
    }
  };

  const deleteWatchlistItem = (id: number) => {
    if (confirm('이 종목을 관심 종목에서 삭제하시겠습니까?')) {
      setWatchlist(prev => prev.filter(item => item.id !== id));
    }
  };

  const deleteInquiryItem = (id: number) => {
    if (confirm('문의 내역을 삭제하시겠습니까?')) {
      setMyInquiries(prev => prev.filter(item => item.id !== id));
    }
  };

  // 문의 내역 페이지네이션 로직
  const inquiriesTotalPages = Math.ceil(myInquiries.length / INQUIRIES_PER_PAGE);
  const paginatedInquiries = myInquiries.slice((inquiriesPage - 1) * INQUIRIES_PER_PAGE, inquiriesPage * INQUIRIES_PER_PAGE);

  const filteredPortfolio = useMemo(() => myPortfolio.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  ), [searchTerm, myPortfolio]);

  const filteredWatchlist = useMemo(() => watchlist.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  ), [searchTerm, watchlist]);

  const portfolioTotalPages = Math.ceil(filteredPortfolio.length / PORTFOLIO_PER_PAGE);
  const paginatedPortfolio = filteredPortfolio.slice((portfolioPage - 1) * PORTFOLIO_PER_PAGE, portfolioPage * PORTFOLIO_PER_PAGE);

  const watchlistTotalPages = Math.ceil(filteredWatchlist.length / WATCHLIST_PER_PAGE);
  const paginatedWatchlist = filteredWatchlist.slice((watchlistPage - 1) * WATCHLIST_PER_PAGE, watchlistPage * WATCHLIST_PER_PAGE);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-12 sm:py-20">
        
        <div className="mb-12 sm:mb-20 pt-10 sm:pt-0">
          <br></br>
          <h1 className="text-[36px] sm:text-[52px] font-black leading-tight tracking-tighter uppercase">My Assets</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          <div className="lg:col-span-3">
            <div className="flex flex-col space-y-3">
              <div className="px-2 py-4 sm:py-6 mb-2 border-b border-gray-100 lg:border-none">
                <p className="text-[20px] sm:text-[22px] font-black tracking-tighter text-black">김투자 님</p>
                <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium uppercase tracking-tight">Premium Member</p>
              </div>
              <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2">
                <SidebarLink active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} label="나의 종목" />
                <SidebarLink active={activeTab === 'watchlist'} onClick={() => setActiveTab('watchlist')} label="관심 종목" />
                <SidebarLink active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} label="내 달력" />
                <SidebarLink active={activeTab === 'inquiries'} onClick={() => setActiveTab('inquiries')} label="나의 문의" />
                <SidebarLink active={activeTab === 'account'} onClick={() => setActiveTab('account')} label="계정 관리" />
              </div>
              
              <div className="pt-8 sm:pt-10 px-2">
                <button className="flex items-center gap-3 text-[11px] font-black text-gray-400 hover:text-black transition-all uppercase tracking-[0.2em] cursor-pointer group">
                  <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sign Out</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            
            {activeTab === 'portfolio' && (
              <div className="space-y-10 sm:space-y-12 animate-fade-in">
                <div className="flex justify-between items-end border-b-2 border-black pb-6">
                  <h3 className="text-[20px] sm:text-[24px] font-black tracking-tighter uppercase">Portfolio</h3>
                  <span className="text-[11px] sm:text-[13px] font-bold text-gray-400 uppercase">총 {filteredPortfolio.length}종목</span>
                </div>

                <div className="relative">
                  <input type="text" placeholder="종목명 또는 티커 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-[56px] sm:h-[60px] bg-[#f3f4f6] rounded-2xl px-12 sm:px-14 font-bold text-[14px] sm:text-[15px] outline-none focus:ring-1 focus:ring-black transition-all" />
                  <svg className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>

                <div className="space-y-4">
                  {paginatedPortfolio.length > 0 ? paginatedPortfolio.map((item) => {
                    const totalInvested = item.shares * item.avgPrice;
                    const totalMarketValue = item.shares * item.currentPrice;
                    const profitLoss = totalMarketValue - totalInvested;
                    const isProfit = profitLoss >= 0;

                    return (
                    <div key={item.id} className="p-5 sm:p-8 border border-gray-100 rounded-[24px] bg-white shadow-sm transition-all relative">
                      {/* 삭제 버튼: 모바일에서 상단 여백 고려 */}
                      <button 
                        onClick={() => deletePortfolioItem(item.id)}
                        className="absolute top-5 sm:top-8 right-5 sm:right-8 text-[10px] font-black text-gray-300 hover:text-red-500 uppercase tracking-widest cursor-pointer transition-all"
                      >
                        Delete
                      </button>

                      {/* 헤더 영역: 이름, 티커, 주식 수 */}
                      <div className="flex justify-between items-center mb-6 sm:mb-8 pb-4 border-b border-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="text-[18px] sm:text-[20px] font-black text-gray-900">{item.name}</span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-widest">{item.ticker}</span>
                        </div>
                        {/* My Shares: PC에서 2px 키움 (19px) */}
                        <div className="text-right mr-12 sm:mr-20">
                          <span className="hidden sm:inline text-[12px] font-bold text-gray-400 mr-2 uppercase italic tracking-tighter">My Shares</span>
                          <span className="text-[15px] sm:text-[19px] font-black">{item.shares}주</span>
                        </div>
                      </div>

                      {/* 데이터 그리드: 모바일 3열 유지 및 간격/글자크기 최적화 */}
                      <div className="grid grid-cols-3 gap-x-2 sm:gap-x-12 gap-y-6 sm:gap-y-8">
                        {/* 1행 */}
                        <div>
                          <p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">손익금액</p>
                          {/* 모바일 12px(기존 15-3), PC 19px(기존 17+2) */}
                          <p className={`text-[12px] sm:text-[19px] font-black ${isProfit ? 'text-red-500' : 'text-blue-500'}`}>
                            {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">나의 총 금액</p>
                          <p className="text-[12px] sm:text-[19px] font-black text-gray-900">{formatCurrency(totalInvested)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">나의 금액</p>
                          <p className="text-[12px] sm:text-[19px] font-black text-gray-900">{formatCurrency(item.avgPrice)}</p>
                        </div>
                        
                        {/* 2행 */}
                        <div>
                          <p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">손익백분율</p>
                          <p className={`text-[12px] sm:text-[19px] font-black ${isProfit ? 'text-red-500' : 'text-blue-500'}`}>
                            {isProfit ? '+' : ''}{item.change}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">시장 총 금액</p>
                          <p className="text-[12px] sm:text-[19px] font-black text-gray-900">{formatCurrency(totalMarketValue)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">시장 금액</p>
                          <p className="text-[12px] sm:text-[19px] font-black text-gray-900">{formatCurrency(item.currentPrice)}</p>
                        </div>
                      </div>
                    </div>
                    );
                  }) : (
                    <p className="text-center py-20 text-gray-300 font-bold">검색 결과가 없습니다.</p>
                  )}
                </div>

                <Pagination currentPage={portfolioPage} totalPages={portfolioTotalPages} onPageChange={setPortfolioPage} />
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div className="space-y-10 sm:space-y-12 animate-fade-in">
                <div className="flex justify-between items-end border-b-2 border-black pb-6">
                  <h3 className="text-[20px] sm:text-[24px] font-black tracking-tighter uppercase">Watchlist</h3>
                  <span className="text-[11px] sm:text-[13px] font-bold text-gray-400 uppercase">총 {filteredWatchlist.length}종목</span>
                </div>

                <div className="relative">
                  <input type="text" placeholder="관심 종목 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-[56px] sm:h-[60px] bg-[#f3f4f6] rounded-2xl px-12 sm:px-14 font-bold text-[14px] sm:text-[15px] outline-none focus:ring-1 focus:ring-black transition-all" />
                  <svg className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {paginatedWatchlist.length > 0 ? paginatedWatchlist.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-[17px] sm:text-[18px] font-black tracking-tighter">{item.name}</h5>
                          <p className="text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-widest">{item.ticker}</p>
                        </div>
                        <span className={`text-[13px] sm:text-[14px] font-black ${item.dayChange >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                          {item.dayChange >= 0 ? '▲' : '▼'} {Math.abs(item.dayChange)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-[22px] sm:text-[24px] font-black">{formatCurrency(item.currentPrice)}</p>
                        <button onClick={() => deleteWatchlistItem(item.id)} className="text-[10px] sm:text-[11px] font-black text-black hover:text-red-500 transition-colors uppercase tracking-[0.2em] cursor-pointer">delete</button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 text-center text-gray-300 font-bold">검색 결과가 없습니다.</div>
                  )}
                </div>
                <Pagination currentPage={watchlistPage} totalPages={watchlistTotalPages} onPageChange={setWatchlistPage} />
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-10 sm:space-y-12 animate-fade-in">
                <div className="flex justify-between items-end border-b-2 border-black pb-6">
                  <h3 className="text-[20px] sm:text-[24px] font-black tracking-tighter uppercase">My Calendar</h3>
                  <button 
                    onClick={() => { setEditingId(null); setNewSchedTitle(''); setIsSchedModalOpen(true); }}
                    className="bg-black text-white px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-tighter hover:bg-gray-800 transition-all cursor-pointer shadow-lg mb-1"
                  >
                    + Add Schedule
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                  <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[16px] font-black uppercase tracking-tighter">{monthLabel}</span>
                        {loadingEvents && <Loader2 size={16} className="animate-spin text-gray-300" />}
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            const now = new Date();
                            setCalendarDate(now);
                            setSelectedCalendarDay(now);
                          }}
                          className="px-3 h-8 flex items-center justify-center rounded-lg bg-black text-white text-[10px] font-black cursor-pointer hover:bg-gray-800 transition-colors uppercase mr-1 shadow-sm"
                        >
                          Today
                        </button>
                        <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear() - 1, calendarDate.getMonth(), 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f3f4f6] text-[10px] cursor-pointer hover:bg-gray-200 transition-colors font-bold">《</button>
                        <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f3f4f6] text-[10px] cursor-pointer hover:bg-gray-200 transition-colors">〈</button>
                        <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f3f4f6] text-[10px] cursor-pointer hover:bg-gray-200 transition-colors">〉</button>
                        <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear() + 1, calendarDate.getMonth(), 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f3f4f6] text-[10px] cursor-pointer hover:bg-gray-200 transition-colors font-bold">》</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-gray-300 py-1">{d}</div>
                      ))}
                      {calendarDays.map((day, idx) => {
                        const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
                        const isSelected = day.toDateString() === selectedCalendarDay.toDateString();
                        const dayStr = format(day, 'yyyy-MM-dd');
                        
                        const hasMySched = mySchedules.some(s => s.date === dayStr);
                        const hasEcoEvent = economicEvents.some(e => e.date === dayStr);

                        return (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedCalendarDay(new Date(day))}
                            className={`
                              aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all relative
                              ${isCurrentMonth ? 'bg-[#f3f4f6] text-black' : 'bg-white text-gray-200'}
                              ${isSelected ? 'bg-black text-white shadow-lg' : 'hover:bg-gray-200'}
                            `}
                          >
                            <span className="text-[12px] font-black">{day.getDate()}</span>
                            <div className="absolute bottom-1.5 flex gap-0.5">
                              {hasMySched && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />}
                              {hasEcoEvent && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-black'}`} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-black text-white rounded-[24px] shadow-xl">
                      <p className="text-[10px] font-black text-white/40 uppercase mb-1">{format(selectedCalendarDay, 'EEEE')}</p>
                      <p className="text-[18px] font-black tracking-tighter">{format(selectedCalendarDay, 'MMM dd, yyyy')}</p>
                    </div>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {/* 내 일정 */}
                      {mySchedules.filter(s => s.date === format(selectedCalendarDay, 'yyyy-MM-dd')).map(s => (
                        <div key={s.id} className="p-5 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm group flex flex-col justify-between min-h-[100px]">
                          <p className="text-[14px] font-black text-blue-900 leading-tight">{s.title}</p>
                          <div className="flex gap-3 self-end mt-2">
                            <button onClick={() => openEditModal(s)} className="text-[10px] font-black text-blue-400 hover:text-blue-600 uppercase cursor-pointer">Edit</button>
                            <button onClick={() => deleteMySchedule(s.id)} className="text-[10px] font-black text-blue-400 hover:text-red-500 uppercase cursor-pointer">Del</button>
                          </div>
                        </div>
                      ))}

                      {/* 경제 일정 */}
                      {economicEvents.filter(e => e.date === format(selectedCalendarDay, 'yyyy-MM-dd')).map(e => (
                        <div key={e.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{e.flag}</span>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{e.time}</span>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3].map(s => (
                                <Star key={s} size={10} fill={s <= e.impact ? "black" : "none"} className={s <= e.impact ? "text-black" : "text-gray-200"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-[14px] font-black text-gray-900 leading-tight">{e.title}</p>
                          <div className="flex justify-between pt-2 border-t border-gray-50">
                            <span className="text-[10px] font-bold text-gray-300">F: {e.forecast}</span>
                            <span className="text-[10px] font-black text-blue-600">A: {e.actual}</span>
                          </div>
                        </div>
                      ))}

                      {mySchedules.filter(s => s.date === format(selectedCalendarDay, 'yyyy-MM-dd')).length === 0 && 
                       economicEvents.filter(e => e.date === format(selectedCalendarDay, 'yyyy-MM-dd')).length === 0 && (
                        <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-[24px]">
                          <p className="text-[12px] font-bold text-gray-300 italic">No schedules for today</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div className="space-y-12 animate-fade-in">
                <div className="flex justify-between items-end border-b-2 border-black pb-6">
                  <h3 className="text-[20px] sm:text-[24px] font-black tracking-tighter uppercase">My Inquiries</h3>
                  <span className="text-[11px] sm:text-[13px] font-bold text-gray-400 uppercase">총 {myInquiries.length}건</span>
                </div>
                <div className="space-y-6">
                  {paginatedInquiries.length > 0 ? paginatedInquiries.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span className="text-[17px] sm:text-[18px] font-black text-gray-900">{item.title}</span>
                        <div className="flex items-center gap-4 sm:gap-6">
                          <button onClick={() => deleteInquiryItem(item.id)} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest cursor-pointer">Delete</button>
                          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${item.status === '답변완료' ? 'text-blue-500' : 'text-gray-300'}`}>{item.status}</span>
                          <span className="text-[13px] sm:text-[14px] font-bold text-gray-300 italic tracking-tighter">{item.date}</span>
                        </div>
                      </div>
                      <div className="bg-[#f9fafb] p-6 sm:p-8 rounded-xl border border-gray-50">
                        <div className="flex gap-4 sm:gap-5">
                          <span className="text-[18px] sm:text-[20px] font-black text-blue-500">A.</span>
                          <p className="text-[14px] sm:text-[15px] leading-relaxed text-gray-600 font-medium">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center text-gray-300 font-bold">문의 내역이 없습니다.</div>
                  )}
                </div>
                <Pagination currentPage={inquiriesPage} totalPages={inquiriesTotalPages} onPageChange={setInquiriesPage} />
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-12 animate-fade-in">
                <h3 className="text-[20px] sm:text-[24px] font-black border-b-2 border-black pb-6 tracking-tighter uppercase">Settings</h3>
                <div className="space-y-10">
                  <section className="space-y-6">
                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">Security</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <SettingsInput label="Current Password" type="password" placeholder="현재 비밀번호" />
                      <SettingsInput label="New Password" type="password" placeholder="새 비밀번호" />
                      <SettingsInput label="Confirm Password" type="password" placeholder="비밀번호 확인" />
                    </div>
                    <button className="px-8 h-[52px] bg-white border border-gray-200 text-gray-400 font-black text-[13px] rounded-lg hover:text-black hover:border-black transition-all uppercase tracking-widest cursor-pointer">
                      Change Password
                    </button>
                  </section>
                  
                  <section className="space-y-10 pt-10 border-t border-gray-50">
                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">Contact</p>
                    <SettingsInputWithVerify label="Email" defaultValue="investor_ggeul@naver.com" codePlaceholder="이메일 인증코드" />
                    <SettingsInputWithVerify label="Phone" defaultValue="010-1234-5678" codePlaceholder="문자 인증코드" />
                  </section>
                  
                  <div className="flex justify-end pt-10">
                    <button className="w-full sm:w-auto px-12 h-[60px] bg-[#1a1a1a] text-white rounded-xl font-black text-[15px] hover:bg-black transition-all shadow-xl uppercase tracking-[0.1em] cursor-pointer">Save All Changes</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSchedModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSchedModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[450px] rounded-[32px] p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[20px] font-black tracking-tighter uppercase">{editingId ? 'Edit Schedule' : 'New Schedule'}</h2>
              <button onClick={() => setIsSchedModalOpen(false)} className="text-gray-300 hover:text-black transition-colors cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddMySchedule} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Selected Date</label>
                <div className="w-full h-[60px] bg-[#f3f4f6] rounded-2xl px-6 flex items-center font-black text-[15px] text-gray-900">
                  {format(selectedCalendarDay, 'yyyy-MM-dd')}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Schedule Title</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="일정 내용을 입력하세요"
                  value={newSchedTitle}
                  onChange={(e) => setNewSchedTitle(e.target.value)}
                  className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full h-[72px] bg-black text-white rounded-2xl font-black text-[16px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl cursor-pointer">
                  {editingId ? 'Update Schedule' : 'Add to Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 컴포넌트 - 페이지네이션 클릭 시 상단 스크롤
function Pagination({ currentPage, totalPages, onPageChange }: any) {
  if (totalPages <= 1) return null;

  const handlePageClick = (num: number) => {
    onPageChange(num);
    // 윈도우 객체가 존재하는지 확인 후 부드럽게 상단으로 이동
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 pt-10">
      <button 
        onClick={() => handlePageClick(Math.max(1, currentPage - 1))} 
        disabled={currentPage === 1} 
        className="w-10 h-10 flex items-center justify-center rounded-full text-black hover:bg-gray-100 cursor-pointer disabled:opacity-20 transition-all"
      >
        〈
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
        <button 
          key={num} 
          onClick={() => handlePageClick(num)} 
          className={`w-10 h-10 rounded-full text-[13px] font-black transition-all cursor-pointer ${num === currentPage ? 'bg-black text-white shadow-lg' : 'text-black hover:bg-gray-50'}`}
        >
          {num}
        </button>
      ))}
      <button 
        onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))} 
        disabled={currentPage === totalPages} 
        className="w-10 h-10 flex items-center justify-center rounded-full text-black hover:bg-gray-100 cursor-pointer disabled:opacity-20 transition-all"
      >
        〉
      </button>
    </div>
  );
}

function SidebarLink({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`w-full text-left px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-[14px] sm:text-[15px] font-black transition-all shadow-sm cursor-pointer ${active ? 'bg-[#1a1a1a] text-white shadow-xl' : 'bg-[#f3f4f6] text-gray-400 hover:bg-gray-200 hover:text-black'}`}>{label}</button>
  );
}

function SettingsInput({ label, type = "text", placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-gray-300 uppercase tracking-widest pl-1">{label}</label>
      <input type={type} placeholder={placeholder} className="w-full h-[52px] sm:h-[56px] bg-[#f3f4f6] rounded-lg px-5 sm:px-6 font-bold text-[14px] sm:text-[15px] outline-none focus:ring-1 focus:ring-black transition-all" />
    </div>
  );
}

function SettingsInputWithVerify({ label, defaultValue, codePlaceholder }: any) {
  const btnClass = "px-4 sm:px-6 h-[52px] sm:h-[56px] bg-white border border-gray-200 text-gray-400 font-black text-[11px] sm:text-[12px] rounded-lg hover:text-black hover:border-black transition-all uppercase cursor-pointer";
  
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-gray-300 uppercase tracking-widest pl-1">{label}</label>
      <div className="flex gap-2 sm:gap-3">
        <input defaultValue={defaultValue} className="flex-1 h-[52px] sm:h-[56px] bg-[#f3f4f6] rounded-lg px-4 sm:px-6 font-bold text-[14px] sm:text-[15px] outline-none" />
        <button className={btnClass}>Verify</button>
      </div>
      <div className="flex gap-2 sm:gap-3">
        <input placeholder={codePlaceholder} className="flex-1 h-[52px] sm:h-[56px] bg-[#f3f4f6] rounded-lg px-4 sm:px-6 font-bold text-[14px] sm:text-[15px] outline-none" />
        <button className={btnClass}>Confirm</button>
      </div>
    </div>
  );
}