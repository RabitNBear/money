'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

// 주식 서비스 관련 공지사항 데이터
const NOTICE_DATA = [
  { id: 10, type: '점검', title: '시스템 정기 점검 및 해외 주식 서비스 일시 중단 안내', date: '2026.01.07', isNew: true, isImportant: true },
  { id: 9, type: '배당', title: '2026년 1분기 주요 배당주 지급 일정 안내 (AAPL, MSFT 등)', date: '2026.01.05', isNew: true, isImportant: false },
  { id: 8, type: '업데이트', title: '모바일 앱 버전 2.4.0 업데이트 안내 (백테스트 기능 강화)', date: '2026.01.02', isNew: false, isImportant: false },
  { id: 7, type: '공지', title: '개인정보처리방침 변경 및 이용약관 개정 안내', date: '2025.12.30', isNew: false, isImportant: false },
  { id: 6, type: '이벤트', title: '신년 맞이 수수료 제로 이벤트 당첨자 발표', date: '2025.12.28', isNew: false, isImportant: true },
  { id: 5, type: '시장', title: '미국 증시 휴장일 안내 (Martin Luther King Jr. Day)', date: '2025.12.24', isNew: false, isImportant: true },
  { id: 4, type: '점검', title: '서버 증설 작업에 따른 로그인 지연 현상 사과문', date: '2025.12.20', isNew: false, isImportant: false },
  { id: 3, type: '업데이트', title: 'PC 웹 버전 다크모드 테마 정식 출시', date: '2025.12.15', isNew: false, isImportant: false },
  { id: 2, type: '교육', title: '초보 투자자를 위한 배당금 계산기 사용법 가이드', date: '2025.12.10', isNew: false, isImportant: false },
  { id: 1, type: '공지', title: 'GGEULMUSE 서비스 런칭 안내', date: '2025.12.01', isNew: false, isImportant: false },
];

export default function NoticePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); 
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredAndSortedData = useMemo(() => {
    const filtered = NOTICE_DATA.filter((notice) =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (a.isImportant !== b.isImportant) {
        return a.isImportant ? -1 : 1;
      }
      return b.id - a.id;
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE),
      totalCount: sorted.length,
    };
  }, [currentPage, searchTerm]);

  const totalPages = Math.ceil(filteredAndSortedData.totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">

      <main className="max-w-[1100px] mx-auto px-8 pt-44 pb-20">
        <div className="mb-16">
          <h1 className="text-[48px] font-black leading-tight tracking-tighter">공지사항</h1>
          <p className="text-[15px] text-gray-400 font-medium italic opacity-70">GGEULMUSE의 새로운 소식과 시장 정보를 전해드립니다.</p>
        </div>

        <div className="mb-12 flex gap-3 h-[56px]">
          <div className="flex-1 relative bg-[#f3f4f6] rounded-lg border-none px-2 flex items-center">
            <svg className="w-5 h-5 text-gray-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="검색어를 입력해 주세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full bg-transparent px-4 font-bold text-[15px] outline-none placeholder:text-gray-300"
            />
          </div>
          <button className="px-10 bg-[#1a1a1a] text-white rounded-lg font-black text-[14px] hover:bg-black transition-all cursor-pointer">
            검색
          </button>
        </div>

        <div className="space-y-3 min-h-[460px]">
          {filteredAndSortedData.items.length > 0 ? (
            filteredAndSortedData.items.map((item) => (
              <Link href={`/notice/${item.id}`} key={item.id} className="block group">
                <div className={`flex items-center justify-between p-7 border rounded-xl transition-all
                  ${item.isImportant 
                    ? 'bg-gray-50 border-gray-200 shadow-sm' 
                    : 'bg-white border-gray-100 hover:shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:border-gray-200'}`}>
                  <div className="flex items-center gap-6">
                    <span className={`w-[85px] h-[30px] flex items-center justify-center rounded-full text-[10px] font-black uppercase tracking-tighter
                      ${item.isImportant ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                      {item.isImportant ? 'Important' : item.type}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      <span className={`text-[17px] font-bold group-hover:text-black transition-colors ${item.isImportant ? 'text-black' : 'text-gray-700'}`}>
                        {item.title}
                      </span>
                      {item.isNew && (
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-gray-300 italic tracking-tighter">
                    {item.date}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-gray-300">
              <p className="text-[18px] font-bold uppercase tracking-widest">No results found</p>
              <p className="text-[14px] mt-2 font-medium">검색어와 일치하는 공지사항이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="mt-20 flex justify-center items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all 
                ${currentPage === 1 
                  ? 'text-gray-200 cursor-default' 
                  : 'text-black hover:bg-gray-100 cursor-pointer'}`}
            >
              <span className="text-[18px]">〈</span>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button 
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-[13px] font-black transition-all cursor-pointer
                  ${num === currentPage 
                    ? 'bg-black text-white shadow-xl scale-110' 
                    : 'text-black hover:bg-gray-100'}`}
              >
                {num}
              </button>
            ))}

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all 
                ${currentPage === totalPages 
                  ? 'text-gray-200 cursor-default' 
                  : 'text-black hover:bg-gray-100 cursor-pointer'}`}
            >
              <span className="text-[18px]">〉</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}