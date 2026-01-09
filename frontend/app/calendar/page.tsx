'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Globe, Star, Loader2, ArrowRight } from 'lucide-react';

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

export default function EconomicCalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // API 데이터 로드
  useEffect(() => {
    async function fetchCalendarData() {
      setLoading(true);
      try {
        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        const res = await fetch(`/api/calendar?start=${start}&end=${end}`);
        const json = await res.json();
        if (json.success) setEvents(json.data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCalendarData();
  }, [currentMonth]);

  const selectedStr = format(selectedDate, 'yyyy-MM-dd');
  const filteredEconomic = events.filter(e => e.date === selectedStr);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    return eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-white text-black font-sans tracking-tight selection:bg-gray-100">
      {/* 창 크기 및 여백 설정 */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-12 sm:py-24">
        
        {/* 헤더 */}
        <div className="mb-12 sm:mb-24">
          <br />
          <h1 className="text-[36px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase text-black">
            Economic<br />Calendar
          </h1>
          <p className="text-[14px] sm:text-[16px] text-gray-400 font-bold italic mt-4 opacity-80">
            글로벌 경제 지표와 주요 일정을 실시간으로 확인하세요.
          </p>
        </div>

        {/* 그리드 구조 모든 페이지 동일하게 1:1 비율 (lg:grid-cols-2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-16 items-start">
          
          {/* 좌측 : 캘린더 영역 */}
          <div className="space-y-12 sm:space-y-16">
            <div className="space-y-8">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-[20px] sm:text-[22px] font-black tracking-tighter uppercase flex items-center gap-4 text-black">
                  {format(currentMonth, 'MMMM yyyy')}
                  {loading && <Loader2 className="animate-spin text-gray-200" size={20} />}
                </h2>
                
                <div className="flex gap-1 items-center">
                  <button 
                    onClick={() => {
                      const now = new Date();
                      setCurrentMonth(now);
                      setSelectedDate(startOfDay(now));
                    }}
                    className="px-3 h-10 flex items-center justify-center rounded-xl bg-black text-white text-[10px] font-black cursor-pointer hover:bg-gray-800 transition-colors uppercase mr-1"
                  >
                    Today
                  </button>
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 12))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[12px] cursor-pointer hover:bg-gray-200 font-bold text-black transition-colors">《</button>
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[12px] cursor-pointer hover:bg-gray-200 text-black transition-colors">〈</button>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[12px] cursor-pointer hover:bg-gray-200 text-black transition-colors">〉</button>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 12))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[12px] cursor-pointer hover:bg-gray-200 font-bold text-black transition-colors">》</button>
                </div>
              </div>

              {/* 캘린더 그리드 */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-gray-300 py-2">{d}</div>
                ))}
                {days.map((day, idx) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const hasEconomic = events.some(e => e.date === dayStr);

                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedDate(startOfDay(day))}
                      className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer relative group
                        ${isCurrentMonth ? 'bg-[#f3f4f6]' : 'bg-white opacity-20 pointer-events-none'}
                        ${isSelected ? 'bg-black text-white shadow-lg scale-[1.05] z-10' : 'hover:bg-gray-200'}
                      `}
                    >
                      <span className={`text-[13px] sm:text-[15px] font-black ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-black'}`}>
                        {format(day, 'd')}
                      </span>
                      <div className="absolute bottom-2">
                        {hasEconomic && isCurrentMonth && (
                          <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-black'}`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 내 일정 추가 버튼 */}
            <button 
              onClick={() => router.push('/mypage?tab=calendar')}
              className="w-full h-[64px] sm:h-[68px] bg-white border border-black text-black font-black text-[12px] sm:text-[13px] rounded-2xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] cursor-pointer shadow-sm"
            >
              내 일정 추가하러 가기 <ArrowRight size={16} />
            </button>
          </div>

          {/* 우측 : 결과/상세 리스트 영역 */}
          <div className="space-y-10">
            <section className="space-y-6 sm:space-y-8">
              <h3 className="text-[20px] sm:text-[22px] font-black tracking-tighter uppercase text-gray-900">Selected Date</h3>
              
              {/* 선택된 날짜 상자 */}
              <div className="bg-black text-white rounded-[28px] sm:rounded-[32px] p-8 sm:p-12 shadow-none animate-in fade-in zoom-in-95 duration-500">
                <p className="text-[10px] sm:text-[12px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">{format(selectedDate, 'EEEE')}</p>
                <h3 className="text-[32px] sm:text-[48px] font-black tracking-tighter leading-none">{format(selectedDate, 'MMM dd, yyyy')}</h3>
              </div>
            </section>

            {/* 스크롤 적용 */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredEconomic.length > 0 ? (
                filteredEconomic.map(event => (
                  <div key={event.id} className="bg-[#f3f4f6] rounded-3xl p-6 sm:p-8 border border-transparent hover:border-black transition-all group animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{event.flag}</span>
                        <span className="text-[12px] font-black text-gray-900 uppercase tracking-tight">{event.time}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(s => (
                          <Star key={s} size={12} fill={s <= event.impact ? "black" : "none"} className={s <= event.impact ? "text-black" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <h4 className="text-[18px] sm:text-[20px] font-black text-black leading-tight mb-8">{event.title}</h4>
                    <div className="grid grid-cols-2 gap-8 border-t border-gray-200 pt-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Forecast</p>
                        <p className="text-[15px] font-bold text-gray-900">{event.forecast || '-'}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actual</p>
                        <p className="text-[16px] font-black text-blue-600">{event.actual || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-center px-6">
                  <Globe className="text-gray-200 mb-4" size={32} />
                  <p className="text-[13px] font-bold text-gray-400 italic">No major indicators for this date.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}