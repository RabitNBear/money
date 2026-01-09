'use client';

import { useState, useEffect } from 'react';
import { Globe, Landmark, Star } from 'lucide-react';

interface EconomicEvent {
  id: string;
  date: string;
  country: 'US' | 'KR';
  event: string;
  importance: 'high' | 'medium' | 'low';
}

export default function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch('/api/calendar');
        const json = await res.json();
        if (json.success) setEvents(json.data);
      } catch {
        console.error('데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, []);

  // 날짜 포맷팅 로직
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return { month, day, weekday };
  };

  // D-Day 계산 및 텍스트 리턴
  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return '오늘';
    if (diff === 1) return '내일';
    return `D-${diff}`;
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-black/5 rounded-[24px]" />
        ))}
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <div className="w-full">
      <div className="space-y-3">
        {events.slice(0, 5).map((event) => {
          const { month, day, weekday } = formatDate(event.date);
          const daysUntil = getDaysUntil(event.date);
          
          // D-2까지 긴급 상태로 간주
          const isUrgent = daysUntil === '오늘' || daysUntil === '내일' || daysUntil === 'D-2';
          
          // 중요도 별점 로직
          const importance = event.importance || 'low';
          const starCount = importance === 'high' ? 3 : importance === 'medium' ? 2 : 1;

          return (
            <div
              key={event.id}
              className="flex items-center gap-5 p-5 rounded-[28px] bg-white border border-gray-100 hover:border-black transition-all group"
            >
              {/* 날짜 영역 */}
              <div className="w-14 h-14 rounded-2xl bg-[#f3f4f6] flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[12px] font-black text-gray-400 uppercase leading-none mb-1">{month}월</span>
                <span className="text-[21px] font-black leading-none text-black">{day}</span>
                {/*<span className="text-[9px] font-black text-gray-400 uppercase leading-none mt-1">{weekday}</span>*/}
              </div>

              {/* 정보 영역 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 opacity-60">
                      {event.country === 'KR' ? <Globe size={11} /> : <Landmark size={11} />}
                      <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                        {event.country === 'KR' ? 'KOREA' : 'U.S.A'}
                      </span>
                    </div>
                    {/* D-Day 태그 */}
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      isUrgent ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {daysUntil}
                    </span>
                  </div>
                  
                  {/* 중요도 별점 */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star 
                        key={s} 
                        size={10} 
                        fill={s <= starCount ? "#000" : "none"} 
                        className={s <= starCount ? "text-black" : "text-gray-200"} 
                      />
                    ))}
                  </div>
                </div>
                
                {/* 이벤트 타이틀 */}
                <p className="font-bold text-[15px] text-gray-800 truncate leading-tight group-hover:text-black transition-colors">
                  {event.event}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}