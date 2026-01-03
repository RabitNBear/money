'use client';

import { useState, useEffect } from 'react';

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
        if (json.success) {
          setEvents(json.data);
        }
      } catch {
        console.error('Failed to fetch calendar');
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return { month, day, weekday };
  };

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
      <div className="card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📅</span>
          <h3 className="font-bold">경제 캘린더</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-12 h-12 rounded-xl" />
              <div className="flex-1">
                <div className="skeleton w-24 h-4 mb-2" />
                <div className="skeleton w-32 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="card shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📅</span>
        <h3 className="font-bold">경제 캘린더</h3>
      </div>

      <div className="space-y-3">
        {events.slice(0, 5).map((event) => {
          const { month, day, weekday } = formatDate(event.date);
          const daysUntil = getDaysUntil(event.date);
          const isUrgent = daysUntil === '오늘' || daysUntil === '내일' || daysUntil === 'D-2';

          return (
            <div
              key={event.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card-hover)]"
            >
              {/* 날짜 박스 */}
              <div className="w-12 h-12 rounded-xl bg-[var(--card)] flex flex-col items-center justify-center text-center">
                <span className="text-xs text-[var(--neutral)]">{month}월</span>
                <span className="text-lg font-bold leading-none">{day}</span>
              </div>

              {/* 이벤트 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      event.country === 'KR'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}
                  >
                    {event.country === 'KR' ? '🇰🇷 한국' : '🇺🇸 미국'}
                  </span>
                  <span className="text-xs text-[var(--neutral)]">({weekday})</span>
                </div>
                <p className="font-medium text-sm mt-1 truncate">{event.event}</p>
              </div>

              {/* D-Day */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isUrgent
                    ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                    : 'bg-[var(--card)] text-[var(--neutral)]'
                }`}
              >
                {daysUntil}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
