'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface IPO {
  id: string;
  companyName: string;
  ticker?: string;
  demandForecastStart?: string;
  demandForecastEnd?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  refundDate?: string;
  listingDate?: string;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  finalPrice?: number;
  totalShares?: number;
  leadUnderwriter?: string;
  status: 'UPCOMING' | 'SUBSCRIPTION' | 'COMPLETED' | 'LISTED';
}

const STATUS_LABELS = {
  UPCOMING: '청약 예정',
  SUBSCRIPTION: '청약 중',
  COMPLETED: '청약 완료',
  LISTED: '상장 완료',
};

const STATUS_COLORS = {
  UPCOMING: 'bg-blue-50 text-blue-500',
  SUBSCRIPTION: 'bg-red-50 text-red-500',
  COMPLETED: 'bg-gray-50 text-gray-400',
  LISTED: 'bg-green-50 text-green-600',
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '.').slice(0, -1);
}

function formatPrice(price?: number) {
  if (!price) return '-';
  return price.toLocaleString('ko-KR') + '원';
}

export default function IpoDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [ipo, setIpo] = useState<IPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIpo = async () => {
      try {
        const res = await fetch(`${API_URL}/ipo/${id}`);
        if (res.ok) {
          const response = await res.json();
          setIpo(response.data || response);
        } else if (res.status === 404) {
          setError('공모주 정보를 찾을 수 없습니다.');
        } else {
          setError('공모주 정보를 불러오는데 실패했습니다.');
        }
      } catch {
        setError('서버와 연결할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchIpo();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 font-bold">로딩 중...</p>
      </div>
    );
  }

  if (error || !ipo) {
    return (
      <div className="min-h-screen bg-white text-black">
        <main className="max-w-[900px] mx-auto px-8 pt-32 sm:pt-44 pb-20 text-center">
          <p className="text-gray-500 text-lg mb-8">{error || '공모주 정보를 찾을 수 없습니다.'}</p>
          <Link href="/calendar">
            <button className="px-10 py-4 sm:px-12 sm:py-5 bg-[#1a1a1a] text-white text-[13px] sm:text-[14px] font-black rounded-lg hover:bg-black transition-all uppercase tracking-widest cursor-pointer">
              캘린더로
            </button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black tracking-tight">
      <main className="max-w-[900px] mx-auto px-6 sm:px-8 pt-28 sm:pt-44 pb-20">
        <header className="border-b-2 border-black pb-8 sm:pb-10">
          <div className="flex items-center gap-4 mb-4 sm:mb-6">
            <span className={`text-[9px] sm:text-[10px] font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full uppercase tracking-widest ${STATUS_COLORS[ipo.status]}`}>
              {STATUS_LABELS[ipo.status]}
            </span>
            {ipo.ticker && (
              <span className="text-[12px] sm:text-[14px] font-bold text-gray-300 italic">{ipo.ticker}</span>
            )}
          </div>
          <h1 className="text-[24px] sm:text-[32px] font-black leading-tight tracking-tighter">
            {ipo.companyName} 공모주
          </h1>
        </header>

        <section className="py-10 sm:py-16 space-y-4 sm:space-y-6 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-[#f3f4f6] rounded-2xl p-5 sm:p-6">
              <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">수요예측</p>
              <p className="text-[13px] sm:text-[15px] font-black">
                {formatDate(ipo.demandForecastStart)} ~ {formatDate(ipo.demandForecastEnd)}
              </p>
            </div>
            <div className="bg-[#f3f4f6] rounded-2xl p-5 sm:p-6">
              <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">청약기간</p>
              <p className="text-[13px] sm:text-[15px] font-black">
                {formatDate(ipo.subscriptionStart)} ~ {formatDate(ipo.subscriptionEnd)}
              </p>
            </div>
            <div className="bg-[#f3f4f6] rounded-2xl p-5 sm:p-6">
              <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">환불일</p>
              <p className="text-[13px] sm:text-[15px] font-black">{formatDate(ipo.refundDate)}</p>
            </div>
            <div className="bg-[#f3f4f6] rounded-2xl p-5 sm:p-6">
              <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">상장일</p>
              <p className="text-[13px] sm:text-[15px] font-black">{formatDate(ipo.listingDate)}</p>
            </div>
          </div>

          <div className="bg-[#f3f4f6] rounded-2xl p-5 sm:p-6">
            <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">공모가</p>
            {ipo.finalPrice ? (
              <p className="text-[20px] sm:text-[28px] font-black">{formatPrice(ipo.finalPrice)}</p>
            ) : (
              <p className="text-[13px] sm:text-[15px] font-black text-gray-400">
                희망 공모가: {formatPrice(ipo.priceRangeLow)} ~ {formatPrice(ipo.priceRangeHigh)}
              </p>
            )}
          </div>

          {ipo.leadUnderwriter && (
            <div className="bg-[#f3f4f6] rounded-2xl p-5 sm:p-6">
              <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">주관사</p>
              <p className="text-[13px] sm:text-[15px] font-black">{ipo.leadUnderwriter}</p>
            </div>
          )}
        </section>

        <div className="mt-12 sm:mt-16 flex justify-center gap-3 sm:gap-4">
          <Link href="/calendar">
            <button className="px-8 py-4 sm:px-12 sm:py-5 bg-[#1a1a1a] text-white text-[13px] sm:text-[14px] font-black rounded-lg hover:bg-black transition-all uppercase tracking-widest cursor-pointer">
              캘린더로
            </button>
          </Link>
          <button
            onClick={() => router.back()}
            className="px-8 py-4 sm:px-12 sm:py-5 bg-white border border-gray-200 text-gray-400 text-[13px] sm:text-[14px] font-black rounded-lg hover:text-black hover:border-black transition-all uppercase tracking-widest cursor-pointer"
          >
            뒤로가기
          </button>
        </div>
      </main>
    </div>
  );
}
