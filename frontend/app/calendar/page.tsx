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
import { Globe, Star, Loader2, ArrowRight } from 'lucide-react';

interface EconomicEvent {
  id: string | number;
  date: string;
  country: string;
  event: string;
  importance: string;
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
        if (!res.ok) {
          console.error('Calendar API error:', res.status);
          return;
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        }
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

  const getEventsForDay = (dayStr: string) => {
    return events.filter(e => e.date === dayStr);
  };

  const getImpactLevel = (importance: string) => {
    return importance === 'high' ? 3 : importance === 'medium' ? 2 : 1;
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans tracking-tight selection:bg-gray-100">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12 sm:py-24">

        {/* 헤더 */}
        <div className="mb-12 sm:mb-24">
          <br />
          <h1 className="text-[36px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase text-black">
            주식 달력
          </h1>
          <p className="text-[14px] sm:text-[16px] text-gray-400 font-bold italic mt-4 opacity-80">
            글로벌 경제 지표와 주요 일정을 실시간으로 확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* 좌측 : 캘린더 영역 */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-8">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-[20px] sm:text-[22px] font-black tracking-tighter uppercase flex items-center gap-4 text-black">
                  {format(currentMonth, 'MMMM yyyy')}
                  {loading && <Loader2 className="animate-spin text-gray-200" size={20} />}
                </h2>

                {/* 이동 버튼 : Today, 1년 전/후, 1개월 전/후 */}
                <div className="flex gap-1 items-center">
                  <button
                    onClick={() => {
                      const now = new Date();
                      setCurrentMonth(now);
                      setSelectedDate(startOfDay(now));
                    }}
                    className="px-3 h-10 flex items-center justify-center rounded-xl bg-black text-white text-[10px] font-black cursor-pointer hover:bg-gray-800 transition-colors uppercase mr-1"
                  >
                    오늘
                  </button>
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 12))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[12px] cursor-pointer hover:bg-gray-200 font-bold text-black transition-colors">《</button>
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[12px] cursor-pointer hover:bg-gray-200 text-black transition-colors">〈</button>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[12px] cursor-pointer hover:bg-gray-200 text-black transition-colors">〉</button>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 12))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[12px] cursor-pointer hover:bg-gray-200 font-bold text-black transition-colors">》</button>
                </div>
              </div>

              {/* 캘린더 그리드 - 일정 표시 기능 */}
              <div className="grid grid-cols-7 border-t border-l border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-gray-300 py-3 bg-[#fafafa] border-r border-b border-gray-100 uppercase tracking-widest">{d}</div>
                ))}
                {days.map((day, idx) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const dayEvents = getEventsForDay(dayStr);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(startOfDay(day))}
                      className={`min-h-[110px] sm:min-h-[150px] p-2 flex flex-col border-r border-b border-gray-100 transition-all cursor-pointer relative group
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-20 pointer-events-none'}
                        ${isSelected ? 'bg-zinc-50' : 'hover:bg-gray-50'}
                      `}
                    >
                      <span className={`text-[12px] sm:text-[14px] font-black mb-2 flex items-center justify-center w-7 h-7 rounded-full transition-colors
                        ${isSelected ? 'bg-black text-white' : 'text-gray-400 group-hover:text-black'}
                      `}>
                        {format(day, 'd')}
                      </span>

                      <div className="space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f3f4f6] border border-transparent group-hover:bg-white group-hover:border-gray-100 transition-all">
                            <span className="text-[10px] shrink-0">{event.country === 'KR' ? '🇰🇷' : '🇺🇸'}</span>
                            <span className={`text-[9px] font-bold truncate tracking-tighter ${event.importance === 'high' ? 'text-red-500' : 'text-gray-600'}`}>
                              {event.event}
                            </span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-[8px] font-black text-gray-300 pl-1 uppercase tracking-tighter">+ {dayEvents.length - 3} more</p>
                        )}
                      </div>

                      {isSelected && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => router.push('/mypage?tab=calendar')}
              className="w-full h-[64px] sm:h-[68px] bg-white border border-black text-black font-black text-[12px] sm:text-[13px] rounded-2xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] cursor-pointer shadow-sm"
            >
              내 일정 추가하러 가기 <ArrowRight size={16} />
            </button>
          </div>

          {/* 우측 : 상세 리스트 영역 */}
          <div className="lg:col-span-4 space-y-10">
            <section className="space-y-6 sm:space-y-8">
              <div className="bg-black text-white rounded-[28px] sm:rounded-[32px] p-8 sm:p-12 shadow-none animate-in fade-in zoom-in-95 duration-500">
                <p className="text-[10px] sm:text-[12px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">{format(selectedDate, 'EEEE')}</p>
                <h3 className="text-[32px] sm:text-[48px] font-black tracking-tighter leading-none">{format(selectedDate, 'MMM dd, yyyy')}</h3>
              </div>
            </section>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredEconomic.length > 0 ? (
                filteredEconomic.map(event => (
                  <div key={event.id} className="bg-[#f3f4f6] rounded-3xl p-6 sm:p-8 border border-transparent hover:border-black transition-all group animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{event.country === 'KR' ? '🇰🇷' : '🇺🇸'}</span>
                        <span className="text-[12px] font-black text-gray-900 uppercase tracking-tight">{event.country} 시장</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(s => {
                          const impact = getImpactLevel(event.importance);
                          return <Star key={s} size={12} fill={s <= impact ? "black" : "none"} className={s <= impact ? "text-black" : "text-gray-300"} />;
                        })}
                      </div>
                    </div>
                    <h4 className="text-[18px] sm:text-[20px] font-black text-black leading-tight mb-4">{event.event}</h4>
                    <div className="inline-flex items-center px-3 py-1 bg-white rounded-full border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {event.importance} Impact
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-center px-6">
                  <Globe className="text-gray-200 mb-4" size={32} />
                  <p className="text-[13px] font-bold text-gray-400 italic">해당일에는 일정이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}