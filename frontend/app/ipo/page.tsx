'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Building2, Info, Loader2 } from 'lucide-react';
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

  useEffect(() => {
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
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8 sm:py-24">

        {/* 헤더 */}
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
            {/* 필터 순서 수정: 전체보기, 예정, 청약중, 청약완료, 상장완료 */}
            {(['ALL', 'UPCOMING', 'SUBSCRIPTION', 'COMPLETED', 'LISTED'] as const).map((filter) => (
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
          <div className="bg-white md:rounded-[32px] md:border-2 md:border-gray-50 md:shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="hidden md:table-header-group bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">기업명</th>
                    <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">청약기간</th>
                    <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">공모가</th>
                    <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">상장일</th>
                    <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">상태</th>
                  </tr>
                </thead>
                <tbody className="block md:table-row-group divide-y divide-gray-100 md:divide-gray-50">
                  {filteredIPOs.map((ipo) => (
                    <tr key={ipo.id} className="block md:table-row group hover:bg-gray-50/80 transition-colors p-5 md:p-0">
                      {/* 기업명 셀 */}
                      <td className="block md:table-cell md:px-8 md:py-7 mb-4 md:mb-0">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between md:justify-start gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[17px] md:text-[18px] font-black text-black tracking-tighter group-hover:text-blue-600 transition-colors">
                                {ipo.companyName}
                              </span>
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">{ipo.ticker}</span>
                            </div>
                            {/* 모바일 전용 상태 표시 */}
                            <span className={`md:hidden px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusLabels[ipo.status].bgColor} ${statusLabels[ipo.status].color}`}>
                              {statusLabels[ipo.status].label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[12px]">
                            <Building2 size={12} className="opacity-50" />
                            {ipo.leadUnderwriter || '주간사 미정'}
                          </div>
                        </div>
                      </td>

                      {/* 청약기간 셀 */}
                      <td className="block md:table-cell md:px-8 md:py-7 mb-3 md:mb-0">
                        <div className="flex items-center justify-between md:justify-start">
                          <span className="md:hidden text-[11px] font-black text-gray-300 uppercase tracking-widest">청약기간</span>
                          <div className="flex items-center gap-2 text-[14px] font-black text-gray-700">
                            <span>{formatDate(ipo.subscriptionStart)}</span>
                            <span className="text-gray-200">—</span>
                            <span>{formatDate(ipo.subscriptionEnd)}</span>
                          </div>
                        </div>
                      </td>

                      {/* 공모가 셀 */}
                      <td className="block md:table-cell md:px-8 md:py-7 mb-3 md:mb-0">
                        <div className="flex items-center justify-between md:justify-start">
                          <span className="md:hidden text-[11px] font-black text-gray-300 uppercase tracking-widest">공모가</span>
                          <p className={`text-[15px] font-black ${ipo.finalPrice ? 'text-blue-600' : 'text-gray-900'}`}>
                            {ipo.finalPrice ? formatPrice(ipo.finalPrice) : (
                              <span className="text-gray-400 font-bold text-[13px]">
                                {ipo.priceRangeLow ? `${ipo.priceRangeLow.toLocaleString()}~` : '미정'}
                              </span>
                            )}
                          </p>
                        </div>
                      </td>

                      {/* 상장일 셀 */}
                      <td className="block md:table-cell md:px-8 md:py-7 mb-3 md:mb-0">
                        <div className="flex items-center justify-between md:justify-start">
                          <span className="md:hidden text-[11px] font-black text-gray-300 uppercase tracking-widest">상장일</span>
                          <span className="text-[14px] font-black text-gray-700">{formatDate(ipo.listingDate)}</span>
                        </div>
                      </td>

                      {/* 데스크톱 상태 셀 */}
                      <td className="hidden md:table-cell md:px-8 md:py-7 text-right">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusLabels[ipo.status].bgColor} ${statusLabels[ipo.status].color}`}>
                          {statusLabels[ipo.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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