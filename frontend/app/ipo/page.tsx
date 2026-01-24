'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Calendar, Landmark, Info, Loader2, Filter, ChevronRight } from 'lucide-react';
import { API_URL } from '@/lib/apiClient';

interface IPO {
  id: string;
  companyName: string;
  ticker?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  listingDate?: string;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  finalPrice?: number;
  leadUnderwriter?: string;
  status: 'UPCOMING' | 'SUBSCRIPTION' | 'COMPLETED' | 'LISTED';
}

const statusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  UPCOMING: { label: '예정', color: 'text-gray-400', bgColor: 'bg-gray-100' },
  SUBSCRIPTION: { label: '청약중', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  COMPLETED: { label: '청약완료', color: 'text-orange-500', bgColor: 'bg-orange-50' },
  LISTED: { label: '상장완료', color: 'text-black', bgColor: 'bg-zinc-100' },
};

export default function IPOPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | IPO['status']>('ALL');

  useEffect(() => {
    const fetchIPOs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/ipo?limit=100`);
        if (res.ok) {
          const response = await res.json();
          const data = response.data || response;
          setIpos(Array.isArray(data) ? data : (data.ipos || []));
        }
      } catch (error) {
        console.error('Failed to fetch IPOs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIPOs();
  }, []);

  const filteredIPOs = useMemo(() => {
    return ipos.filter((ipo) => {
      const matchesSearch = ipo.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'ALL' || ipo.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [ipos, searchTerm, activeFilter]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '미정';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return price.toLocaleString() + '원';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-gray-200" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black tracking-tight selection:bg-gray-100">
      {/* 캘린더 페이지와 동일한 max-w 및 px, py 설정 */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8 sm:py-24">

        {/* 헤더: 캘린더 페이지와 동일한 간격 및 텍스트 스타일 적용 */}
        <div className="mb-8 sm:mb-24 pt-12 sm:pt-0">
          <br />
          <h1 className="text-[32px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase text-black">
            <br />공모주 전체 일정
          </h1>
          <p className="text-[13px] sm:text-[16px] text-gray-400 font-bold italic mt-2 sm:mt-4 opacity-80">
            따끈따끈한 IPO 일정을 확인하고 투자 기회를 찾아보세요.
          </p>
        </div>

        {/* 필터 및 검색바 */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 sm:mb-16 items-stretch">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
            <input
              type="text"
              placeholder="기업명을 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[64px] bg-[#f3f4f6] border-none rounded-2xl pl-14 pr-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          <div className="flex bg-[#f3f4f6] p-1.5 rounded-2xl overflow-x-auto no-scrollbar gap-1">
            {(['ALL', 'SUBSCRIPTION', 'UPCOMING', 'LISTED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-xl text-[12px] font-black whitespace-nowrap transition-all cursor-pointer ${activeFilter === filter
                  ? 'bg-black text-white shadow-xl scale-[1.02]'
                  : 'text-gray-400 hover:text-black'
                  }`}
              >
                {filter === 'ALL' ? '전체보기' : statusLabels[filter].label}
              </button>
            ))}
          </div>
        </div>

        {/* 목록 영역 */}
        {filteredIPOs.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
            <Info className="mx-auto mb-6 text-gray-100" size={48} />
            <p className="text-gray-300 font-black text-[18px] uppercase tracking-widest">No Events Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {filteredIPOs.map((ipo) => (
              <div
                key={ipo.id}
                className="group bg-white border-2 border-gray-50 rounded-[32px] p-8 transition-all hover:border-black hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusLabels[ipo.status].bgColor} ${statusLabels[ipo.status].color}`}>
                      {statusLabels[ipo.status].label}
                    </span>
                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest italic group-hover:text-gray-400 transition-colors">
                      {ipo.ticker || 'TBD'}
                    </span>
                  </div>

                  <h3 className="text-[24px] font-black text-black mb-2 tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                    {ipo.companyName}
                  </h3>

                  <div className="flex items-center gap-2 mb-10">
                    <Landmark size={14} className="text-gray-200" />
                    <span className="text-[13px] font-bold text-gray-400">{ipo.leadUnderwriter || '주간사 미정'}</span>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#fafafa] rounded-2xl p-5 border border-transparent group-hover:border-gray-100 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-gray-300" />
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Subscription Period</span>
                      </div>
                      <p className="text-[15px] font-black text-gray-800">
                        {formatDate(ipo.subscriptionStart)} <span className="mx-1 text-gray-300">—</span> {formatDate(ipo.subscriptionEnd)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-1">
                      <div>
                        <span className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Offer Price</span>
                        <p className={`text-[17px] font-black ${ipo.finalPrice ? 'text-blue-600' : 'text-gray-900'}`}>
                          {ipo.finalPrice ? formatPrice(ipo.finalPrice) : (
                            <span className="text-gray-400 text-[14px]">
                              {ipo.priceRangeLow ? `${ipo.priceRangeLow.toLocaleString()}~` : '미정'}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="border-l border-gray-100 pl-4">
                        <span className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Listing Date</span>
                        <p className="text-[17px] font-black text-gray-900">{formatDate(ipo.listingDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    className={`w-full h-[60px] rounded-2xl font-black text-[13px] uppercase tracking-[0.1em] transition-all cursor-pointer ${ipo.status === 'SUBSCRIPTION'
                      ? 'bg-black text-white shadow-xl hover:scale-[1.02] active:scale-95'
                      : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                      }`}
                  >
                    {ipo.status === 'SUBSCRIPTION' ? 'Check Details' : 'Details Hidden'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-24 pt-12 border-t border-gray-50 text-center">
          <p className="text-[11px] sm:text-[12px] text-gray-300 font-bold uppercase tracking-[0.2em] leading-relaxed">
            ※ 본 정보는 투자 참고용이며 실제 공시 내용과 차이가 있을 수 있습니다.<br />
            © 2026 GGURLMOOSAE. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}