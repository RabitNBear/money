'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Globe, Landmark, Star, Loader2, Calendar, User } from 'lucide-react'; // User 아이콘 유지
import { fetchWithAuth, logout, API_URL } from '@/lib/apiClient';

// 타입 정의
interface StockPortfolioItem {
  id: string;
  name: string;
  ticker: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  change: number;
}

interface WatchlistItem {
  id: string;
  name: string;
  ticker: string;
  currentPrice: number;
  market: 'US' | 'KR';
  dayChange: number;
}

interface InquiryItem {
  id: string;
  title: string;
  date: string;
  status: '답변완료' | '답변대기';
  answer: string;
}

interface MySchedule {
  id: string;
  date: string;
  title: string;
}

interface EconomicEvent {
  id: string;
  date: string;
  country: string;
  event: string;
  importance: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface SidebarLinkProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

interface SettingsInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SettingsInputWithVerifyProps {
  label: string;
  defaultValue: string;
  codePlaceholder: string;
}

interface PortfolioAPIItem {
  id: string;
  ticker: string;
  quantity: number;
  avgPrice: number;
}

interface WatchlistAPIItem {
  id: string;
  ticker: string;
}

interface StockData {
  name: string;
  price: number;
  changePercent: number;
  market: 'US' | 'KR';
}

interface StockAPIResponse {
  success: boolean;
  data: StockData;
}

export default function MyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist' | 'calendar' | 'inquiries' | 'account'>('portfolio');

  const [portfolioPage, setPortfolioPage] = useState(1);
  const [watchlistPage, setWatchlistPage] = useState(1);
  const [inquiriesPage, setInquiriesPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const PORTFOLIO_PER_PAGE = 5;
  const WATCHLIST_PER_PAGE = 8;
  const INQUIRIES_PER_PAGE = 4;

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(new Date());
  const [mySchedules, setMySchedules] = useState<MySchedule[]>([]);

  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string; provider: 'LOCAL' | 'GOOGLE' | 'KAKAO' } | null>(null);

  const [isSchedModalOpen, setIsSchedModalOpen] = useState(false);
  const [newSchedTitle, setNewSchedTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [myPortfolio, setMyPortfolio] = useState<StockPortfolioItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [myInquiries, setMyInquiries] = useState<InquiryItem[]>([]);
  const authCheckRef = useRef(false);

  useEffect(() => {
    if (authCheckRef.current) return;
    authCheckRef.current = true;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const [userRes, portfolioRes, watchlistRes, schedulesRes, inquiriesRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/auth/me`),
          fetchWithAuth(`${API_URL}/portfolio`),
          fetchWithAuth(`${API_URL}/watchlist`),
          fetchWithAuth(`${API_URL}/schedule`),
          fetchWithAuth(`${API_URL}/inquiry`),
        ]);

        if (userRes.ok) {
          const response = await userRes.json();
          const userData = response.data || response;
          setUser(userData);
          setEmail(userData.email || '');
        } else {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          router.push('/login');
          return;
        }

        if (portfolioRes.ok) {
          const portfolioResponse = await portfolioRes.json();
          const portfolioData: PortfolioAPIItem[] = Array.isArray(portfolioResponse)
            ? portfolioResponse
            : (portfolioResponse.data && Array.isArray(portfolioResponse.data) ? portfolioResponse.data : []);
          const portfolioWithMarketData = await Promise.all(
            portfolioData.map(async (item): Promise<StockPortfolioItem> => {
              const stockRes = await fetch(`/api/stock/${item.ticker}`);
              if (stockRes.ok) {
                const stockData: StockAPIResponse = await stockRes.json();
                return {
                  id: item.id,
                  name: stockData.data.name,
                  ticker: item.ticker,
                  shares: item.quantity,
                  avgPrice: item.avgPrice,
                  currentPrice: stockData.data.price,
                  change: stockData.data.changePercent,
                };
              }
              return {
                id: item.id, name: item.ticker, ticker: item.ticker, shares: item.quantity,
                avgPrice: item.avgPrice, currentPrice: item.avgPrice, change: 0,
              };
            })
          );
          setMyPortfolio(portfolioWithMarketData);
        }

        if (watchlistRes.ok) {
          const watchlistResponse = await watchlistRes.json();
          const watchlistData: WatchlistAPIItem[] = Array.isArray(watchlistResponse)
            ? watchlistResponse
            : (watchlistResponse.data && Array.isArray(watchlistResponse.data) ? watchlistResponse.data : []);
          const watchlistWithMarketData = await Promise.all(
            watchlistData.map(async (item): Promise<WatchlistItem> => {
              const stockRes = await fetch(`/api/stock/${item.ticker}`);
              if (stockRes.ok) {
                const stockData: StockAPIResponse = await stockRes.json();
                return {
                  id: item.id,
                  name: stockData.data.name,
                  ticker: item.ticker,
                  currentPrice: stockData.data.price,
                  market: stockData.data.market,
                  dayChange: stockData.data.changePercent,
                };
              }
              return {
                id: item.id, name: item.ticker, ticker: item.ticker,
                currentPrice: 0, dayChange: 0,
                market: item.ticker.endsWith('.KS') ? 'KR' : 'US',
              };
            })
          );
          setWatchlist(watchlistWithMarketData);
        }

        if (schedulesRes.ok) {
          const schedulesResponse = await schedulesRes.json();
          const schedulesData = schedulesResponse.data || schedulesResponse;
          const formattedSchedules = (Array.isArray(schedulesData) ? schedulesData : []).map((item: { id: string; date: string; title: string }) => ({
            ...item,
            date: item.date ? item.date.split('T')[0] : item.date,
          }));
          setMySchedules(formattedSchedules);
        }
        if (inquiriesRes.ok) {
          const inquiriesResponse = await inquiriesRes.json();
          const inquiriesData = inquiriesResponse.data || inquiriesResponse;
          const formattedInquiries = (Array.isArray(inquiriesData) ? inquiriesData : []).map((item: {
            id: string;
            title: string;
            category: string;
            status: string;
            answer: string | null;
            createdAt: string;
            answeredAt: string | null;
          }) => ({
            id: item.id,
            title: item.title,
            date: new Date(item.createdAt).toLocaleDateString('ko-KR'),
            status: (item.status === 'RESOLVED' ? '답변완료' : '답변대기') as '답변완료' | '답변대기',
            answer: item.answer || '답변 대기 중입니다.',
          }));
          setMyInquiries(formattedInquiries as InquiryItem[]);
        }

      } catch (error) {
        console.error("Failed to fetch mypage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const portfolioSummary = useMemo(() => {
    const totalInvested = myPortfolio.reduce((acc, item) => acc + (item.shares * item.avgPrice), 0);
    const totalMarketValue = myPortfolio.reduce((acc, item) => acc + (item.shares * item.currentPrice), 0);
    const totalPL = totalMarketValue - totalInvested;
    const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;
    return { totalInvested, totalMarketValue, totalPL, totalPLPercent };
  }, [myPortfolio]);

  useEffect(() => {
    async function fetchEconomicEvents() {
      setLoadingEvents(true);
      try {
        const start = format(startOfMonth(calendarDate), 'yyyy-MM-dd');
        const end = format(endOfMonth(calendarDate), 'yyyy-MM-dd');
        const res = await fetch(`/api/calendar?start=${start}&end=${end}`);
        const json = await res.json();
        if (json.success) {
          setEconomicEvents(json.data);
        }
      } catch (error) {
        if (error instanceof Error) console.error("경제 일정 로드 실패:", error.message);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEconomicEvents();
  }, [calendarDate]);

  const handleAddMySchedule = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedTitle.trim()) return;

    const startDateStr = format(selectedCalendarDay, 'yyyy-MM-dd');

    const scheduleData = {
      title: newSchedTitle,
      date: startDateStr,
    };

    const url = editingId ? `${API_URL}/schedule/${editingId}` : `${API_URL}/schedule`;
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      if (res.ok) {
        const responseJson = await res.json();
        const savedItem = responseJson.data || responseJson;

        const formattedSchedule = {
          ...savedItem,
          date: savedItem.date ? savedItem.date.split('T')[0] : savedItem.date,
        };

        if (editingId) {
          setMySchedules(prev => prev.map(s => s.id === editingId ? formattedSchedule : s));
        } else {
          setMySchedules(prev => [...prev, formattedSchedule]);
        }
        setNewSchedTitle('');
        setEditingId(null);
        setIsSchedModalOpen(false);
      } else {
        alert('일정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save schedule', error);
      alert('일정 저장 중 오류가 발생했습니다.');
    }
  }, [newSchedTitle, selectedCalendarDay, editingId]);

  const deleteMySchedule = async (id: string) => {
    if (confirm('일정을 삭제하시겠습니까?')) {
      const res = await fetchWithAuth(`${API_URL}/schedule/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMySchedules(prev => prev.filter(s => s.id !== id));
      } else {
        alert('일정 삭제에 실패했습니다.');
      }
    }
  };

  const openEditModal = (sched: MySchedule) => {
    setEditingId(sched.id);
    setNewSchedTitle(sched.title);
    setSelectedCalendarDay(new Date(sched.date));
    setIsSchedModalOpen(true);
  };

  const { calendarDays, monthLabel } = useMemo(() => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });
    return { calendarDays: days, monthLabel: format(monthStart, 'MMMM yyyy') };
  }, [calendarDate]);

  useEffect(() => {
    setPortfolioPage(1); setWatchlistPage(1); setInquiriesPage(1);
  }, [searchTerm, activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'calendar') setActiveTab('calendar');
  }, []);

  const deletePortfolioItem = async (id: string) => {
    if (confirm('이 종목을 삭제하시겠습니까?')) {
      const res = await fetchWithAuth(`${API_URL}/portfolio/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMyPortfolio(prev => prev.filter(item => item.id !== id));
      } else {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const deleteWatchlistItem = async (id: string) => {
    if (confirm('이 종목을 삭제하시겠습니까?')) {
      const itemToDelete = watchlist.find(item => item.id === id);
      if (!itemToDelete) return;
      const res = await fetchWithAuth(`${API_URL}/watchlist/${itemToDelete.ticker}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWatchlist(prev => prev.filter(item => item.id !== id));
      } else {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const deleteInquiryItem = async (id: string) => {
    if (confirm('문의 내역을 삭제하시겠습니까?')) {
      const res = await fetchWithAuth(`${API_URL}/inquiry/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMyInquiries(prev => prev.filter(item => item.id !== id));
      } else {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleProfileUpdate = async () => {
    if (user?.provider !== 'LOCAL') {
      alert('소셜 로그인 계정은 프로필을 변경할 수 없습니다.');
      return;
    }

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
      }

      if (!currentPassword) {
        alert('비밀번호를 변경하려면 현재 비밀번호를 입력해야 합니다.');
        return;
      }

      try {
        const res = await fetchWithAuth(`${API_URL}/users/password`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (res.ok) {
          alert('비밀번호가 성공적으로 변경되었습니다.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          const errorData = await res.json();
          alert(`비밀번호 변경 실패: ${errorData.message || '알 수 없는 오류'}`);
        }
      } catch (error) {
        console.error('Password change failed', error);
        alert('비밀번호 변경 중 오류가 발생했습니다.');
      }
    } else {
      alert('변경된 내용이 없습니다.');
    }
  };

  const inquiriesTotalPages = Math.ceil(myInquiries.length / INQUIRIES_PER_PAGE);
  const paginatedInquiries = inquiriesPage > 0 ? myInquiries.slice((inquiriesPage - 1) * INQUIRIES_PER_PAGE, inquiriesPage * INQUIRIES_PER_PAGE) : [];

  const filteredPortfolio = useMemo(() => myPortfolio.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.ticker.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, myPortfolio]);
  const filteredWatchlist = useMemo(() => watchlist.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.ticker.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, watchlist]);

  const portfolioTotalPages = Math.ceil(filteredPortfolio.length / PORTFOLIO_PER_PAGE);
  const paginatedPortfolio = portfolioPage > 0 ? filteredPortfolio.slice((portfolioPage - 1) * PORTFOLIO_PER_PAGE, portfolioPage * PORTFOLIO_PER_PAGE) : [];

  const watchlistTotalPages = Math.ceil(filteredWatchlist.length / WATCHLIST_PER_PAGE);
  const paginatedWatchlist = watchlistPage > 0 ? filteredWatchlist.slice((watchlistPage - 1) * WATCHLIST_PER_PAGE, watchlistPage * WATCHLIST_PER_PAGE) : [];

  const getEventStyle = (event: EconomicEvent) => {
    const isSubscription = event.event.includes('청약');
    const isIPO = event.event.includes('공모');
    const isListing = event.event.includes('상장');

    if (isSubscription) return { icon: <Calendar size={12} />, color: 'bg-lime-200 text-black', label: '청약' };
    if (isIPO) return { icon: <Calendar size={12} />, color: 'bg-orange-200 text-black', label: '공모' };
    if (isListing) return { icon: <Calendar size={12} />, color: 'bg-indigo-200 text-black', label: '상장' };
    if (event.country === 'KR') return { icon: <Globe size={12} />, color: 'bg-sky-200 text-black', label: '한국' };
    return { icon: <Landmark size={12} />, color: 'bg-rose-200 text-black', label: '미국' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-12 sm:py-20">

        <div className="mb-12 sm:mb-20 pt-10 sm:pt-0">
          <br></br>
          <h1 className="text-[28px] sm:text-[52px] font-black leading-tight tracking-tighter uppercase"><br />마이페이지</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* 사이드바 */}
          <div className="lg:col-span-3">
            <div className="flex flex-col space-y-3">
              <div className="px-2 py-4 sm:py-6 mb-2 border-b border-gray-100 lg:border-none">
                <p className="text-[18px] sm:text-[22px] font-black tracking-tighter text-black">{user?.name || '사용자'} 님</p>
                <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium uppercase tracking-tight">Member</p>
              </div>
              <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2">
                <SidebarLink active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} label="나의 종목" />
                <SidebarLink active={activeTab === 'watchlist'} onClick={() => setActiveTab('watchlist')} label="관심 종목" />
                <SidebarLink active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} label="내 달력" />
                <SidebarLink active={activeTab === 'inquiries'} onClick={() => setActiveTab('inquiries')} label="나의 문의" />
                <SidebarLink active={activeTab === 'account'} onClick={() => setActiveTab('account')} label="계정 관리" />
              </div>
              <div className="pt-8 sm:pt-10 px-2">
                <button onClick={handleLogout} className="flex items-center gap-3 text-[10px] sm:text-[11px] font-black text-gray-400 hover:text-black transition-all uppercase tracking-[0.2em] cursor-pointer group">
                  <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;로그아웃</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            {activeTab === 'portfolio' && (
              <div className="space-y-10 sm:space-y-12 animate-fade-in">
                <div className="flex justify-between items-end border-b-2 border-black pb-6">
                  <h3 className="text-[18px] sm:text-[24px] font-black tracking-tighter uppercase">나의 종목</h3>
                  <span className="text-[10px] sm:text-[13px] font-bold text-gray-400 uppercase">총 {filteredPortfolio.length}종목</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 bg-[#f3f4f6] rounded-3xl">
                    <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest pl-1">나의 총 금액</p>
                    <p className="text-[13px] sm:text-[20px] font-black">{formatCurrency(portfolioSummary.totalInvested)}</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-[#f3f4f6] rounded-3xl">
                    <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest pl-1">시장 총 금액</p>
                    <p className="text-[13px] sm:text-[20px] font-black text-black">{formatCurrency(portfolioSummary.totalMarketValue)}</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-[#f3f4f6] rounded-3xl">
                    <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest pl-1">총 손익금액</p>
                    <p className={`text-[13px] sm:text-[20px] font-black ${portfolioSummary.totalPL >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      {portfolioSummary.totalPL >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.totalPL)}
                    </p>
                  </div>
                  <div className="p-4 sm:p-6 bg-[#f3f4f6] rounded-3xl">
                    <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest pl-1">총 백분율</p>
                    <p className={`text-[13px] sm:text-[20px] font-black ${portfolioSummary.totalPL >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      {portfolioSummary.totalPL >= 0 ? '+' : ''}{portfolioSummary.totalPLPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <input type="text" placeholder="종목명 또는 티커 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-[52px] sm:h-[60px] bg-[#f3f4f6] rounded-2xl px-12 sm:px-14 font-bold text-[13px] sm:text-[15px] outline-none focus:ring-1 focus:ring-black transition-all" />
                  <svg className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>
                <div className="space-y-4">
                  {paginatedPortfolio.map((item) => {
                    const totalInvested = item.shares * item.avgPrice;
                    const totalMarketValue = item.shares * item.currentPrice;
                    const profitLoss = totalMarketValue - totalInvested;
                    const isProfit = profitLoss >= 0;
                    return (
                      <div key={item.id} className="p-5 sm:p-8 border border-gray-100 rounded-[24px] bg-white shadow-sm transition-all relative">
                        <button onClick={() => deletePortfolioItem(item.id)} className="absolute top-5 sm:top-8 right-5 sm:right-8 text-[9px] sm:text-[10px] font-black text-gray-300 hover:text-red-500 uppercase tracking-widest cursor-pointer transition-all">삭제</button>
                        <div className="flex justify-between items-center mb-6 sm:mb-8 pb-4 border-b border-gray-50">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <span className="text-[16px] sm:text-[20px] font-black text-gray-900">{item.name}</span>
                            <span className="text-[9px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-widest">{item.ticker}</span>
                          </div>
                          <div className="text-right mr-12 sm:mr-20">
                            <span className="hidden sm:inline text-[12px] font-bold text-gray-400 mr-2 uppercase italic tracking-tighter">My Shares</span>
                            <span className="text-[14px] sm:text-[19px] font-black">{item.shares}주</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-x-1 sm:gap-x-12 gap-y-6 sm:gap-y-8">
                          <div><p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">손익금액</p><p className={`text-[11px] sm:text-[19px] font-black ${isProfit ? 'text-red-500' : 'text-blue-500'}`}>{isProfit ? '+' : ''}{formatCurrency(profitLoss)}</p></div>
                          <div><p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">나의 총 금액</p><p className="text-[11px] sm:text-[19px] font-black text-gray-900">{formatCurrency(totalInvested)}</p></div>
                          <div className="text-right"><p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">나의 금액</p><p className="text-[11px] sm:text-[19px] font-black text-gray-900">{formatCurrency(item.avgPrice)}</p></div>
                          <div><p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">손익백분율</p><p className={`text-[11px] sm:text-[19px] font-black ${isProfit ? 'text-red-500' : 'text-blue-500'}`}>{isProfit ? '+' : ''}{item.change}%</p></div>
                          <div><p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">시장 총 금액</p><p className="text-[11px] sm:text-[19px] font-black text-gray-900">{formatCurrency(totalMarketValue)}</p></div>
                          <div className="text-right"><p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase mb-1">시장 금액</p><p className="text-[11px] sm:text-[19px] font-black text-gray-900">{formatCurrency(item.currentPrice)}</p></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Pagination currentPage={portfolioPage} totalPages={portfolioTotalPages} onPageChange={setPortfolioPage} />
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-10 sm:space-y-12 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-black pb-6 gap-4">
                  <h3 className="text-[18px] sm:text-[24px] font-black tracking-tighter uppercase">내 달력</h3>
                  <button
                    onClick={() => { setEditingId(null); setNewSchedTitle(''); setSelectedCalendarDay(new Date()); setIsSchedModalOpen(true); }}
                    className="bg-black text-white px-5 py-2.5 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-tighter hover:bg-gray-800 transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    + 일정 추가
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[16px] sm:text-[18px] font-black uppercase tracking-tighter">{monthLabel}</span>
                        {loadingEvents && <Loader2 size={16} className="animate-spin text-gray-200" />}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setCalendarDate(subMonths(calendarDate, 12))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f3f4f6] text-[10px] cursor-pointer hover:bg-gray-200 font-bold transition-all">《</button>
                        <button onClick={() => setCalendarDate(subMonths(calendarDate, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f3f4f6] text-[10px] cursor-pointer hover:bg-gray-200 transition-all">〈</button>
                        <button onClick={() => setCalendarDate(addMonths(calendarDate, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f3f4f6] text-[10px] cursor-pointer hover:bg-gray-200 transition-all">〉</button>
                        <button onClick={() => setCalendarDate(addMonths(calendarDate, 12))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f3f4f6] text-[10px] cursor-pointer hover:bg-gray-200 font-bold transition-all">》</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 border-t border-l border-gray-100 rounded-3xl overflow-hidden shadow-sm bg-white">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                        <div key={d} className="text-center text-[9px] sm:text-[10px] font-black text-gray-300 py-3 bg-[#fafafa] border-r border-b border-gray-100 uppercase">{d}</div>
                      ))}
                      {calendarDays.map((day, idx) => {
                        const isCurrMonth = isSameMonth(day, calendarDate);
                        const isSelected = isSameDay(day, selectedCalendarDay);
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const dayMyScheds = mySchedules.filter(s => s.date === dayStr);
                        const dayEcoEvents = economicEvents.filter(e => e.date === dayStr);

                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedCalendarDay(new Date(day))}
                            className={`min-h-[80px] sm:min-h-[110px] p-1.5 flex flex-col border-r border-b border-gray-100 cursor-pointer transition-all relative group ${isCurrMonth ? 'bg-white' : 'bg-[#fafafa] opacity-30 pointer-events-none'} ${isSelected ? 'bg-zinc-50' : 'hover:bg-gray-50'}`}
                          >
                            <span className={`text-[10px] sm:text-[13px] font-black mb-1 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${isSelected ? 'bg-black text-white shadow-md' : 'text-gray-300 group-hover:text-black'}`}>{day.getDate()}</span>

                            <div className="flex flex-wrap gap-1 mt-0.5 overflow-hidden">
                              {/* 모바일: 도트 표시 (주식 달력 스타일) */}
                              <div className="sm:hidden flex flex-wrap gap-1">
                                {dayMyScheds.map(s => <div key={s.id} className="w-1.5 h-1.5 rounded-full bg-yellow-400" />)}
                                {dayEcoEvents.map(e => {
                                  const cat = getEventStyle(e);
                                  return <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${cat.color.split(' ')[0]}`} />;
                                })}
                              </div>

                              {/* 데스크탑: 라벨 표시 */}
                              <div className="hidden sm:block space-y-0.5 w-full">
                                {dayMyScheds.slice(0, 1).map(s => (
                                  <div key={s.id} className="px-1 py-0.5 bg-yellow-200 rounded text-[9px] sm:text-[10px] font-bold text-black truncate flex items-center gap-1">
                                    <User size={8} strokeWidth={3} className="shrink-0" />
                                    <span className="truncate">{s.title}</span>
                                  </div>
                                ))}
                                {dayEcoEvents.slice(0, 1).map(e => {
                                  const style = getEventStyle(e);
                                  return (
                                    <div key={e.id} className={`px-1 py-0.5 ${style.color.split(' ')[0]} rounded text-[9px] sm:text-[10px] font-bold text-black truncate flex items-center gap-1`}>
                                      <span className="shrink-0">{e.country === 'KR' ? '🇰🇷' : '🇺🇸'}</span>
                                      <span className="truncate">{e.event}</span>
                                    </div>
                                  );
                                })}
                                {(dayMyScheds.length + dayEcoEvents.length) > 2 && (<div className="text-[10px] font-black text-gray-300 pl-1">+{(dayMyScheds.length + dayEcoEvents.length) - 2}</div>)}
                              </div>
                            </div>
                            {isSelected && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div className="p-5 sm:p-6 bg-black text-white rounded-[24px] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                      <p className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase mb-1 tracking-widest">{format(selectedCalendarDay, 'EEEE')}</p>
                      <p className="text-[18px] sm:text-[20px] font-black tracking-tighter">{format(selectedCalendarDay, 'MMM dd, yyyy')}</p>
                    </div>

                    <div className="space-y-3 max-h-[450px] lg:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {mySchedules.filter(s => s.date === format(selectedCalendarDay, 'yyyy-MM-dd')).map(s => (
                        <div key={s.id} className="p-4 sm:p-5 bg-yellow-100 border border-yellow-200 rounded-2xl shadow-sm group flex flex-col justify-between min-h-[100px] animate-in slide-in-from-right-2">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-black p-1 bg-black/10 rounded-md">
                                <User size={12} strokeWidth={2.5} />
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-black/60">My Schedule</span>
                            </div>
                          </div>
                          <p className="text-[13px] sm:text-[14px] font-black text-black leading-tight flex-1">{s.title}</p>
                          <div className="flex gap-3 self-end mt-2">
                            <button onClick={() => openEditModal(s)} className="text-[9px] sm:text-[10px] font-black text-black/40 hover:text-black uppercase transition-colors">Edit</button>
                            <button onClick={() => deleteMySchedule(s.id)} className="text-[9px] sm:text-[10px] font-black text-black/40 hover:text-red-500 uppercase transition-colors">Del</button>
                          </div>
                        </div>
                      ))}
                      {economicEvents.filter(e => e.date === format(selectedCalendarDay, 'yyyy-MM-dd')).map(e => {
                        const style = getEventStyle(e);
                        return (
                          <div key={e.id} className={`p-4 sm:p-5 ${style.color} rounded-2xl shadow-sm space-y-3 animate-in slide-in-from-right-2`}>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <span className="text-white p-1 bg-black/10 rounded-md">{style.icon}</span>
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter">{style.label} 시장</span>
                              </div>
                              <div className="flex gap-0.5">{[1, 2, 3].map(s => (<Star key={s} size={10} fill={s <= (e.importance === 'high' ? 3 : 2) ? "black" : "none"} className={s <= (e.importance === 'high' ? 3 : 2) ? "text-black" : "text-black/20"} />))}</div>
                            </div>
                            <p className="text-[13px] sm:text-[14px] font-black leading-tight">{e.event}</p>
                            <div className="inline-block px-3 py-1 bg-black/5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{e.importance} Impact</div>
                          </div>
                        );
                      })}
                      {mySchedules.filter(s => s.date === format(selectedCalendarDay, 'yyyy-MM-dd')).length === 0 && economicEvents.filter(e => e.date === format(selectedCalendarDay, 'yyyy-MM-dd')).length === 0 && (
                        <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-[24px]"><Globe size={24} className="mx-auto mb-3 text-gray-100" /><p className="text-[11px] sm:text-[12px] font-bold text-gray-300 italic uppercase">No schedules</p></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div className="space-y-10 sm:space-y-12 animate-fade-in">
                <div className="flex justify-between items-end border-b-2 border-black pb-6">
                  <h3 className="text-[18px] sm:text-[24px] font-black tracking-tighter uppercase">관심 종목</h3>
                  <span className="text-[10px] sm:text-[13px] font-bold text-gray-400 uppercase">총 {filteredWatchlist.length}종목</span>
                </div>
                <div className="relative">
                  <input type="text" placeholder="관심 종목 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-[52px] sm:h-[60px] bg-[#f3f4f6] rounded-2xl px-12 sm:px-14 font-bold text-[13px] sm:text-[15px] outline-none focus:ring-1 focus:ring-black transition-all" />
                  <svg className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {paginatedWatchlist.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-2xl p-5 sm:p-8 space-y-6 sm:space-y-8 bg-white shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div><h5 className="text-[15px] sm:text-[18px] font-black tracking-tighter">{item.name}</h5><p className="text-[9px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-widest">{item.ticker}</p></div>
                        <span className={`text-[12px] sm:text-[14px] font-black ${item.dayChange >= 0 ? 'text-red-500' : 'text-blue-500'}`}>{item.dayChange >= 0 ? '▲' : '▼'} {Math.abs(item.dayChange)}%</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-[19px] sm:text-[24px] font-black">{formatCurrency(item.currentPrice)}</p>
                        <button onClick={() => deleteWatchlistItem(item.id)} className="text-[9px] sm:text-[11px] font-black text-black hover:text-red-500 transition-colors uppercase tracking-[0.2em] cursor-pointer">삭제</button>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination currentPage={watchlistPage} totalPages={watchlistTotalPages} onPageChange={setWatchlistPage} />
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div className="space-y-12 animate-fade-in">
                <div className="flex justify-between items-end border-b-2 border-black pb-6">
                  <h3 className="text-[18px] sm:text-[24px] font-black tracking-tighter uppercase">나의 문의</h3>
                  <span className="text-[10px] sm:text-[13px] font-bold text-gray-400 uppercase">총 {myInquiries.length}건</span>
                </div>
                <div className="space-y-6">
                  {paginatedInquiries.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white p-5 sm:p-8 space-y-5 sm:space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-[14px] sm:text-[18px] font-black text-gray-900">{item.title}</span>
                        <div className="flex items-center gap-4 sm:gap-6"><button onClick={() => deleteInquiryItem(item.id)} className="text-[9px] sm:text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest cursor-pointer">삭제</button><span className={`text-[9px] sm:text-[11px] font-black uppercase tracking-widest ${item.status === '답변완료' ? 'text-blue-500' : 'text-gray-300'}`}>{item.status}</span><span className="text-[11px] sm:text-[14px] font-bold text-gray-300 italic tracking-tighter">{item.date}</span></div>
                      </div>
                      <div className="bg-[#f9fafb] p-5 sm:p-8 rounded-xl border border-gray-50"><div className="flex gap-4 sm:gap-5"><span className="text-[13px] sm:text-[20px] font-black text-blue-500">A.</span><p className="text-[10px] sm:text-[15px] leading-relaxed text-gray-600 font-medium">{item.answer}</p></div></div>
                    </div>
                  ))}
                </div>
                <Pagination currentPage={inquiriesPage} totalPages={inquiriesTotalPages} onPageChange={setInquiriesPage} />
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-12 animate-fade-in">
                <h3 className="text-[18px] sm:text-[24px] font-black border-b-2 border-black pb-6 tracking-tighter uppercase">계정 관리</h3>
                <div className="space-y-10">
                  {user?.provider === 'LOCAL' && (
                    <section className="space-y-6">
                      <p className="text-[10px] sm:text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">Security</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <SettingsInput label="Current Password" type="password" placeholder="현재 비밀번호" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        <SettingsInput label="New Password" type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <SettingsInput label="Confirm Password" type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </div>
                    </section>
                  )}

                  {user?.provider === 'LOCAL' && (
                    <>
                      <section className="space-y-10 pt-10 border-t border-gray-50">
                        <p className="text-[10px] sm:text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">Contact</p>
                        <SettingsInputWithVerify label="Email" defaultValue={email} codePlaceholder="이메일 인증코드" />
                      </section>
                      <div className="flex justify-end pt-10">
                        <button onClick={handleProfileUpdate} className="w-full sm:w-auto px-12 h-[56px] sm:h-[60px] bg-[#1a1a1a] text-white rounded-xl font-black text-[14px] sm:text-[15px] hover:bg-black transition-all shadow-xl uppercase tracking-[0.1em] cursor-pointer">Save All Changes</button>
                      </div>
                    </>
                  )}

                  <section className="pt-10 border-t border-gray-100 space-y-6">
                    <p className="text-[10px] sm:text-[11px] font-black text-red-500 uppercase tracking-[0.2em]">주의 구역</p>
                    <div className="p-5 sm:p-8 border border-red-100 rounded-3xl bg-red-50/30 space-y-8">
                      <div className="text-center sm:text-left">
                        <p className="text-[15px] sm:text-[16px] font-black text-gray-900">회원 탈퇴</p>
                        <p className="text-[11px] sm:text-[12px] font-medium text-gray-400 mt-1">탈퇴 시 모든 자산 데이터 및 설정이 즉시 파기되며 복구가 불가능합니다.</p>
                      </div>

                      <div className={`grid grid-cols-1 ${user?.provider === 'LOCAL' ? 'sm:grid-cols-2' : ''} gap-4`}>
                        <div className="space-y-2">
                          <label className="text-[9px] sm:text-[10px] font-black text-red-400 uppercase tracking-widest pl-1">&apos;탈퇴하겠습니다.&apos;를 입력하세요</label>
                          <input
                            type="text"
                            placeholder="탈퇴하겠습니다."
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full h-[52px] bg-white border border-red-200 rounded-xl px-5 font-bold text-[13px] sm:text-[14px] outline-none focus:ring-1 focus:ring-red-500 transition-all"
                          />
                        </div>
                        {user?.provider === 'LOCAL' && (
                          <div className="space-y-2">
                            <label className="text-[9px] sm:text-[10px] font-black text-red-400 uppercase tracking-widest pl-1">비밀번호를 입력하세요</label>
                            <input
                              type="password"
                              placeholder="Password"
                              value={deletePassword}
                              onChange={(e) => setDeletePassword(e.target.value)}
                              className="w-full h-[52px] bg-white border border-red-200 rounded-xl px-5 font-bold text-[13px] sm:text-[14px] outline-none focus:ring-1 focus:ring-red-500 transition-all"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={async () => {
                            if (deleteConfirmText !== '탈퇴하겠습니다.') return alert("'탈퇴하겠습니다.'를 정확히 입력해주세요.");
                            if (user?.provider === 'LOCAL' && !deletePassword) return alert("비밀번호를 입력해주세요.");
                            if (confirm('정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) {
                              const res = await fetchWithAuth(`${API_URL}/users/account`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ password: deletePassword }),
                              });
                              if (res.ok) {
                                alert('탈퇴 성공 및 초기화되었습니다.');
                                await logout();
                                router.push('/');
                              } else {
                                const err = await res.json();
                                alert(`탈퇴에 실패했습니다: ${err.message || '알 수 없는 오류'}`);
                              }
                            }
                          }}
                          disabled={deleteConfirmText !== '탈퇴하겠습니다.' || (user?.provider === 'LOCAL' && !deletePassword)}
                          className={`w-full sm:w-auto px-10 h-[52px] sm:h-[56px] rounded-xl font-black text-[12px] sm:text-[13px] uppercase tracking-widest transition-all ${deleteConfirmText === '탈퇴하겠습니다.' && (user?.provider !== 'LOCAL' || deletePassword) ? 'bg-red-500 text-white shadow-xl cursor-pointer' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                        >
                          회원 탈퇴
                        </button>
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSchedModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSchedModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[450px] rounded-[32px] p-7 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[18px] sm:text-[20px] font-black tracking-tighter uppercase">{editingId ? 'Edit Schedule' : 'New Schedule'}</h2>
              <button onClick={() => setIsSchedModalOpen(false)} className="text-gray-300 hover:text-black transition-colors cursor-pointer"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <form onSubmit={handleAddMySchedule} className="space-y-6 sm:space-y-7">
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Date</label>
                <input
                  type="date"
                  value={format(selectedCalendarDay, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedCalendarDay(new Date(e.target.value))}
                  className="w-full h-[52px] sm:h-[56px] bg-[#f3f4f6] rounded-xl px-4 font-black text-[13px] sm:text-[14px] outline-none focus:ring-1 focus:ring-black transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Schedule Title</label>
                <input autoFocus type="text" placeholder="일정 내용을 입력하세요" value={newSchedTitle} onChange={(e) => setNewSchedTitle(e.target.value)} className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[14px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div className="pt-4"><button type="submit" className="w-full h-[68px] sm:h-[72px] bg-black text-white rounded-2xl font-black text-[14px] sm:text-[16px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl cursor-pointer">{editingId ? 'Update Schedule' : 'Add to Calendar'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const handlePageClick = (num: number) => { onPageChange(num); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <div className="flex justify-center items-center gap-2 pt-10">
      <button onClick={() => handlePageClick(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-black hover:bg-gray-100 cursor-pointer disabled:opacity-20 transition-all">〈</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
        <button key={num} onClick={() => handlePageClick(num)} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-[12px] sm:text-[13px] font-black transition-all cursor-pointer ${num === currentPage ? 'bg-black text-white shadow-lg' : 'text-black hover:bg-gray-50'}`}>{num}</button>
      ))}
      <button onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-black hover:bg-gray-100 cursor-pointer disabled:opacity-20 transition-all">〉</button>
    </div>
  );
}

function SidebarLink({ active, onClick, label }: SidebarLinkProps) {
  return (
    <button onClick={onClick} className={`w-full text-left px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-[13px] sm:text-[15px] font-black transition-all shadow-sm cursor-pointer ${active ? 'bg-[#1a1a1a] text-white shadow-xl' : 'bg-[#f3f4f6] text-gray-400 hover:bg-gray-200 hover:text-black'}`}>{label}</button>
  );
}

function SettingsInput({ label, type = "text", placeholder, value, onChange }: SettingsInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] sm:text-[11px] font-black text-gray-300 uppercase tracking-widest pl-1">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} className="w-full h-[50px] sm:h-[56px] bg-[#f3f4f6] rounded-lg px-5 sm:px-6 font-bold text-[13px] sm:text-[15px] outline-none focus:ring-1 focus:ring-black transition-all" />
    </div>
  );
}

function SettingsInputWithVerify({ label, defaultValue, codePlaceholder }: SettingsInputWithVerifyProps) {
  const btnClass = "px-4 sm:px-6 h-[50px] sm:h-[56px] bg-white border border-gray-200 text-gray-400 font-black text-[10px] sm:text-[12px] rounded-lg hover:text-black hover:border-black transition-all uppercase cursor-pointer";
  return (
    <div className="space-y-3">
      <label className="text-[10px] sm:text-[11px] font-black text-gray-300 uppercase tracking-widest pl-1">{label}</label>
      <div className="flex gap-2 sm:gap-3"><input value={defaultValue} readOnly className="flex-1 h-[50px] sm:h-[56px] bg-[#f3f4f6] rounded-lg px-4 sm:px-6 font-bold text-[13px] sm:text-[15px] outline-none" /><button className={btnClass}>Verify</button></div>
      <div className="flex gap-2 sm:gap-3"><input placeholder={codePlaceholder} className="flex-1 h-[50px] sm:h-[56px] bg-[#f3f4f6] rounded-lg px-4 sm:px-6 font-bold text-[13px] sm:text-[15px] outline-none" /><button className={btnClass}>Confirm</button></div>
    </div>
  );
}