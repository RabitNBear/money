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
import { Globe, Landmark, Star, Loader2, ArrowRight, Calendar } from 'lucide-react'; // Landmark, Calendar 추가

interface EconomicEvent {
  id: string;
  date: string;
  country: string;
  event: string;
  importance: string;
}

export default function CalendarClient() {
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

  // 5개 카테고리 세분화 및 파스텔톤 색상 설정
  const getCategoryIcon = (event: EconomicEvent) => {
    const isSubscription = event.event.includes('청약');
    const isIPO = event.event.includes('공모');
    const isListing = event.event.includes('상장');

    // 1. 청약 (파스텔 그린)
    if (isSubscription) return { icon: <Calendar size={12} />, color: 'bg-lime-200 text-black', label: '청약' };
    // 2. 공모 (파스텔 오렌지)
    if (isIPO) return { icon: <Calendar size={12} />, color: 'bg-orange-200 text-black', label: '공모' };
    // 3. 상장 (파스텔 퍼플)
    if (isListing) return { icon: <Calendar size={12} />, color: 'bg-indigo-200 text-black', label: '상장' };
    // 4. 한국 (파스텔 블루)
    if (event.country === 'KR') return { icon: <Globe size={12} />, color: 'bg-sky-200 text-black', label: '한국' };
    // 5. 미국 (파스텔 핑크/레드)
    return { icon: <Landmark size={12} />, color: 'bg-rose-200 text-black', label: '미국' };
  };

  return (
    <div className="min-h-screen bg-white text-black tracking-tight selection:bg-gray-100">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8 sm:py-24">

        {/* 헤더 */}
        <div className="mb-8 sm:mb-24 pt-12 sm:pt-0">
          <br />
          <h1 className="text-[32px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase text-black">
            <br />주식 달력
          </h1>
          <p className="text-[13px] sm:text-[16px] text-gray-400 font-bold italic mt-2 sm:mt-4 opacity-80">
            글로벌 경제 지표와 주요 일정을 실시간으로 확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* 좌측 : 캘린더 영역 */}
          <div className="lg:col-span-8 space-y-8 sm:space-y-12">
            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-4">
                <h2 className="text-[18px] sm:text-[22px] font-black tracking-tighter uppercase flex items-center gap-3 text-black">
                  {format(currentMonth, 'MMMM yyyy')}
                  {loading && <Loader2 className="animate-spin text-gray-200" size={18} />}
                </h2>

                {/* 이동 버튼 : Today, 1년 전/후, 1개월 전/후 */}
                <div className="flex gap-1 items-center w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => {
                      const now = new Date();
                      setCurrentMonth(now);
                      setSelectedDate(startOfDay(now));
                    }}
                    className="px-3 h-9 sm:h-10 flex items-center justify-center rounded-xl bg-black text-white text-[9px] sm:text-[10px] font-black cursor-pointer hover:bg-gray-800 transition-colors uppercase mr-1"
                  >
                    오늘
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 12))} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[10px] sm:text-[12px] cursor-pointer hover:bg-gray-200 font-bold text-black transition-all">《</button>
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[10px] sm:text-[12px] cursor-pointer hover:bg-gray-200 transition-all text-black">〈</button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[10px] sm:text-[12px] cursor-pointer hover:bg-gray-200 transition-all text-black">〉</button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 12))} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#f3f4f6] text-[10px] sm:text-[12px] cursor-pointer hover:bg-gray-200 font-bold transition-all text-black">》</button>
                  </div>
                </div>
              </div>

              {/* 캘린더 그리드 - 일정 표시 기능 및 반응형 높이 수정 */}
              <div className="grid grid-cols-7 border-t border-l border-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                  <div key={d} className="text-center text-[9px] sm:text-[10px] font-black text-gray-300 py-2 sm:py-3 bg-[#fafafa] border-r border-b border-gray-100 uppercase tracking-widest">{d}</div>
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
                      className={`min-h-[70px] sm:min-h-[150px] p-1 sm:p-2 flex flex-col border-r border-b border-gray-100 transition-all cursor-pointer relative group
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-20 pointer-events-none'}
                        ${isSelected ? 'bg-zinc-50' : 'hover:bg-gray-50'}
                      `}
                    >
                      <span className={`text-[12px] sm:text-[15px] font-black mb-1 sm:mb-2 flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full transition-colors
                        ${isSelected ? 'bg-black text-white shadow-md' : 'text-gray-400 group-hover:text-black'}
                      `}>
                        {format(day, 'd')}
                      </span>

                      <div className="flex flex-wrap gap-1 overflow-hidden">
                        {dayEvents.map((event) => {
                          const cat = getCategoryIcon(event);
                          return (
                            <div key={event.id} className="flex items-center">
                              {/* 모바일: 작은 도트(국기 대신 아이콘 컬러) */}
                              <div className={`sm:hidden w-2 h-2 rounded-full ${cat.color.split(' ')[0]}`} />

                              {/* 데스크탑: 아이콘과 텍스트 - 파스텔 배경 및 글자 크기 조정 */}
                              <div className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-transparent group-hover:bg-white group-hover:border-gray-100 transition-all ${cat.color}`}>
                                <span>{cat.icon}</span>
                                <span className="text-[10px] sm:text-[11px] font-bold truncate tracking-tighter">
                                  {event.event}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <p className="hidden sm:block text-[8px] font-black text-gray-300 pl-1 uppercase tracking-tighter">+ {dayEvents.length - 3} more</p>
                        )}
                      </div>

                      {isSelected && <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-black" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full mt-4 sm:mt-8">
              {/* 뒤로가기 버튼 (Secondary) */}
              <button
                onClick={() => router.back()}
                className="flex-1 h-[54px] sm:h-[64px] bg-white border border-gray-200 text-gray-400 font-black text-[11px] sm:text-[13px] rounded-xl sm:rounded-[20px] hover:text-black hover:border-black transition-all uppercase tracking-widest cursor-pointer shadow-sm"
              >
                뒤로가기
              </button>

              {/* 일정 추가 버튼 (Primary) */}
              <button
                onClick={() => router.push('/mypage?tab=calendar')}
                className="flex-[2] h-[54px] sm:h-[64px] bg-white border-2 border-black text-black font-black text-[11px] sm:text-[13px] rounded-xl sm:rounded-[20px] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-tighter sm:tracking-[0.2em] cursor-pointer shadow-sm"
              >
                일정 추가하기 <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* 우측 : 상세 리스트 영역 */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-10 mt-4 lg:mt-0">
            <section>
              <div className="bg-black text-white rounded-2xl sm:rounded-[32px] p-6 sm:p-12 shadow-none animate-in fade-in zoom-in-95 duration-500">
                <p className="text-[9px] sm:text-[12px] font-black text-white/40 uppercase tracking-[0.3em] mb-1 sm:mb-2">{format(selectedDate, 'EEEE')}</p>
                <h3 className="text-[24px] sm:text-[48px] font-black tracking-tighter leading-none">{format(selectedDate, 'MMM dd, yyyy')}</h3>
              </div>
            </section>

            <div className="space-y-3 sm:space-y-4 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredEconomic.length > 0 ? (
                filteredEconomic.map(event => {
                  const cat = getCategoryIcon(event);
                  return (
                    <div key={event.id} className="bg-[#f3f4f6] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-transparent hover:border-black transition-all group animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-start mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className={`p-1.5 rounded-lg ${cat.color}`}>{cat.icon}</span>
                          <span className="text-[11px] sm:text-[12px] font-black text-gray-900 uppercase tracking-tight">{cat.label} 시장</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(s => {
                            const impact = getImpactLevel(event.importance);
                            return <Star key={s} size={10} fill={s <= impact ? "black" : "none"} className={s <= impact ? "text-black" : "text-gray-300"} />;
                          })}
                        </div>
                      </div>
                      <h4 className="text-[16px] sm:text-[20px] font-black text-black leading-snug mb-3 sm:mb-4">{event.event}</h4>
                      <div className="inline-flex items-center px-2.5 py-1 bg-white rounded-full border border-gray-100 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {event.importance} Impact
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 border-2 border-dashed border-gray-100 rounded-2xl sm:rounded-[32px] flex flex-col items-center justify-center text-center px-6">
                  <Globe className="text-gray-200 mb-3 sm:mb-4" size={28} />
                  <p className="text-[12px] sm:text-[13px] font-bold text-gray-400 italic">해당일에는 일정이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}