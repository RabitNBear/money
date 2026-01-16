'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface IPO {
  id: number;
  companyName: string;
  ticker: string;
  market: string;
  offeringPrice: number;
  expectedDate: string;
  lockupPeriod: number;
  underwriter: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function IPODetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [ipo, setIpo] = useState<IPO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIPO = async () => {
      try {
        const res = await fetch(`${API_URL}/ipo/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setIpo(data);
        } else {
          alert('IPO 정보를 찾을 수 없습니다.');
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch IPO:', error);
        alert('IPO 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIPO();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!ipo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <main className="max-w-[900px] mx-auto px-8 pt-44 pb-20">
        {/* 헤더 */}
        <header className="border-b-2 border-black pb-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-[#f3f4f6] text-gray-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
              {ipo.market}
            </span>
            <span className="text-[14px] font-bold text-gray-300 italic">
              {new Date(ipo.expectedDate).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <h1 className="text-[32px] font-black leading-tight tracking-tighter">
            {ipo.companyName} ({ipo.ticker})
          </h1>
        </header>

        {/* 본문 */}
        <article className="py-16 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#f3f4f6] rounded-2xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">공모가</p>
              <p className="text-[24px] font-black">
                {ipo.offeringPrice.toLocaleString()}원
              </p>
            </div>
            <div className="p-6 bg-[#f3f4f6] rounded-2xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">예정일</p>
              <p className="text-[24px] font-black">
                {new Date(ipo.expectedDate).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div className="p-6 bg-[#f3f4f6] rounded-2xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">의무보유기간</p>
              <p className="text-[24px] font-black">
                {ipo.lockupPeriod}일
              </p>
            </div>
            <div className="p-6 bg-[#f3f4f6] rounded-2xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">주간사</p>
              <p className="text-[24px] font-black">
                {ipo.underwriter}
              </p>
            </div>
          </div>

          {ipo.description && (
            <div className="pt-8 border-t border-gray-100">
              <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-4">설명</p>
              <p className="text-[16px] leading-[1.8] text-gray-700 font-medium whitespace-pre-wrap">
                {ipo.description}
              </p>
            </div>
          )}
        </article>

        {/* 버튼 */}
        <div className="mt-16 flex justify-center gap-4">
          <Link href="/">
            <button className="px-12 py-5 bg-[#1a1a1a] text-white text-[14px] font-black rounded-lg hover:bg-black transition-all uppercase tracking-widest">
              홈으로
            </button>
          </Link>
          <button
            onClick={() => router.back()}
            className="px-12 py-5 bg-white border border-gray-200 text-gray-400 text-[14px] font-black rounded-lg hover:text-black hover:border-black transition-all uppercase tracking-widest"
          >
            뒤로가기
          </button>
        </div>
      </main>
    </div>
  );
}
