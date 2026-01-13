'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 뒤로가기 기능을 위한 hook 추가

export default function NoticeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter(); // router 인스턴스 생성

  // 실제 환경에서는 params.id로 데이터를 페칭
  const notice = {
    id: 10,
    type: '점검',
    title: '시스템 정기 점검 및 해외 주식 서비스 일시 중단 안내',
    date: '2026.01.07',
    content: `안녕하세요. GGURLMOOSAE입니다.

보다 안정적인 서비스 제공을 위해 시스템 정기 점검이 진행될 예정입니다.
점검 시간 동안 해외 주식 거래 및 시세 조회가 일시 중단되오니 서비스 이용에 참고하시기 바랍니다.

■ 점검 일시: 2026년 1월 10일(토) 00:00 ~ 06:00 (6시간)
■ 작업 내용: 데이터베이스 최적화 및 서버 보안 업데이트
■ 영향 범위: 앱/웹 전 서비스 접속 및 거래 중단

이용에 불편을 드려 죄송합니다. 더 나은 서비스로 보답하겠습니다.
감사합니다.`,
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <main className="max-w-[900px] mx-auto px-8 pt-44 pb-20">
        {/* 브레드크럼 */}

        {/* 헤더 */}
        <header className="border-b-2 border-black pb-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-[#f3f4f6] text-gray-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
              {notice.type}
            </span>
            <span className="text-[14px] font-bold text-gray-300 italic">{notice.date}</span>
          </div>
          <h1 className="text-[32px] font-black leading-tight tracking-tighter">
            {notice.title}
          </h1>
        </header>

        {/* 본문 */}
        <article className="py-16 text-[16px] leading-[1.8] text-gray-700 font-medium whitespace-pre-wrap border-b border-gray-100">
          {notice.content}
        </article>

        {/* 하단 네비게이션 */}
        <div className="mt-12 space-y-1">
          <div className="flex items-center gap-8 py-5 border-b border-gray-50 group cursor-pointer">
            <span className="text-[11px] font-black text-gray-300 uppercase w-16">Next</span>
            <span className="text-[15px] font-bold text-gray-900 group-hover:underline">다음 공지사항이 없습니다.</span>
          </div>
          <div className="flex items-center gap-8 py-5 border-b border-gray-50 group cursor-pointer">
            <span className="text-[11px] font-black text-gray-300 uppercase w-16">Prev</span>
            <span className="text-[15px] font-bold text-gray-900 group-hover:underline">2026년 1분기 주요 배당주 지급 일정 안내</span>
          </div>
        </div>

        {/* LIST와 BACK 버튼 나란히 배치 */}
        <div className="mt-16 flex justify-center gap-4">
          <Link href="/notice">
            <button className="px-12 py-5 bg-[#1a1a1a] text-white text-[14px] font-black rounded-lg hover:bg-black transition-all uppercase tracking-widest">
              List
            </button>
          </Link>
          <button
            onClick={() => router.back()} // 브라우저 이전 페이지로 이동
            className="px-12 py-5 bg-white border border-gray-200 text-gray-400 text-[14px] font-black rounded-lg hover:text-black hover:border-black transition-all uppercase tracking-widest"
          >
            Back
          </button>
        </div>
      </main>
    </div>
  );
}