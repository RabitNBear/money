'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

// 문의사항 관련 더미 데이터
const INQUIRY_DATA = [
  { id: 8, type: '공지', title: '문의 전 자주 묻는 질문(FAQ)을 확인해 주세요.', date: '2026.01.01', status: '공지', isPinned: true, answer: 'GGEULMUSE 서비스 이용 중 궁금하신 점은 고객센터 1588-0000으로 연락 주시면 더 빠른 안내가 가능합니다.' },
  { id: 7, type: '계정', title: '비밀번호 재설정 이메일이 오지 않습니다.', date: '2026.01.07', status: '답변완료', isPinned: false, answer: '스팸 메일함을 확인해 주시고, 5분 이상 지연될 경우 가입하신 이메일 도메인(Gmail, Naver 등)의 수신 차단 설정을 확인 부탁드립니다.' },
  { id: 6, type: '결제', title: '프리미엄 서비스 결제 수단 변경 방법 문의', date: '2026.01.06', status: '답변완료', isPinned: false, answer: '마이페이지 > 계정 정보 관리 > 결제 수단 관리에서 새로운 카드를 등록하거나 기존 수단을 삭제하실 수 있습니다.' },
  { id: 5, type: '오류', title: '백테스트 실행 시 차트가 깨져서 보입니다.', date: '2026.01.05', status: '답변대기', isPinned: false, answer: '현재 일부 브라우저에서 발생하는 렌더링 오류를 파악 중입니다. 최신 버전의 Chrome 브라우저 사용을 권장드립니다.' },
  { id: 4, type: '제안', title: '다크모드 기능 추가 계획이 있으신가요?', date: '2026.01.04', status: '답변완료', isPinned: false, answer: '다크모드 테마는 현재 개발 로드맵에 포함되어 있으며, 2026년 상반기 내 업데이트를 목표로 하고 있습니다.' },
  { id: 3, type: '계정', title: '회원 탈퇴 시 보유 데이터 처리 관련 문의', date: '2026.01.03', status: '답변대기', isPinned: false, answer: '회원 탈퇴 즉시 개인정보는 파기되나, 관계 법령에 따라 일부 거래 정보는 일정 기간 보관될 수 있습니다.' },
  { id: 2, type: '계산기', title: '배당금 계산기 소수점 단위 오차 관련 문의', date: '2026.01.02', status: '답변완료', isPinned: false, answer: '실제 지급 배당금은 거래소 환율 및 세금 적용 방식에 따라 시뮬레이션 결과와 1-2원 내외의 차이가 발생할 수 있습니다.' },
  { id: 1, type: '공지', title: '1:1 문의 운영 시간 안내 (평일 09:00~18:00)', date: '2025.12.30', status: '공지', isPinned: true, answer: '공휴일 및 주말 문의는 돌아오는 영업일에 순차적으로 답변해 드리고 있습니다.' },
];

export default function InquiryPage() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // 3번 검색어
  const ITEMS_PER_PAGE = 5;

  // 검색 시 페이지 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  // 3번 검색 필터링 로직 구현
  const filteredAndSortedData = useMemo(() => {
    const filtered = INQUIRY_DATA.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.id - a.id;
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE),
      totalCount: sorted.length
    };
  }, [currentPage, searchTerm]);

  const totalPages = Math.ceil(filteredAndSortedData.totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">

      <main className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-32 sm:pt-44 pb-20">
        {/* 헤더  */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 sm:mb-16">
          <div>
            <h1 className="text-[36px] sm:text-[48px] font-black leading-tight tracking-tighter uppercase">Q & A</h1>
            <p className="text-[13px] sm:text-[15px] text-gray-400 font-medium italic opacity-70 mt-2">무엇이든 물어보세요. 질문을 클릭하면 답변을 확인하실 수 있습니다.</p>
          </div>
          <Link href="/qna/write" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 h-[56px] bg-[#1a1a1a] text-white rounded-xl font-black text-[14px] hover:bg-black transition-all uppercase tracking-widest cursor-pointer shadow-lg">
              Write
            </button>
          </Link>
        </div>

        {/* 3번 검색창 */}
        <div className="mb-10 flex gap-2 h-[56px]">
          <div className="flex-1 relative bg-[#f3f4f6] rounded-xl flex items-center group focus-within:ring-1 focus-within:ring-black transition-all">
            <svg className="w-5 h-5 text-gray-400 ml-4 group-focus-within:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="궁금한 내용을 검색해 보세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full bg-transparent px-4 font-bold text-[15px] outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* 아코디언 문의 리스트 */}
        <div className="space-y-3 min-h-[400px]">
          {filteredAndSortedData.items.length > 0 ? (
            filteredAndSortedData.items.map((item) => (
              <div key={item.id} className="border rounded-2xl overflow-hidden transition-all duration-300 border-gray-100">
                <div 
                  onClick={() => toggleAccordion(item.id)}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-7 cursor-pointer transition-colors gap-4
                    ${openId === item.id ? 'bg-gray-50' : 'bg-white hover:bg-gray-50/50'}`}
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                    <span className={`min-w-[85px] h-[30px] flex items-center justify-center rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0
                      ${item.isPinned ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                      {item.isPinned ? 'Notice' : item.type}
                    </span>
                    <span className={`text-[16px] sm:text-[17px] font-bold leading-snug transition-colors ${item.isPinned ? 'text-black' : 'text-gray-700'}`}>
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:pl-0 pl-[101px]">
                    <div className="flex items-center gap-4 shrink-0">
                      {!item.isPinned && (
                        <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${item.status === '답변완료' ? 'text-blue-500' : 'text-gray-300'}`}>
                          {item.status}
                        </span>
                      )}
                      <span className="text-[12px] sm:text-[14px] font-bold text-gray-300 italic tracking-tighter">
                        {item.date}
                      </span>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-300 transition-transform duration-300 shrink-0 ${openId === item.id ? 'rotate-180 text-black' : ''}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className={`transition-all duration-300 ease-in-out bg-[#f9fafb] border-t border-gray-100 overflow-hidden
                  ${openId === item.id ? 'max-h-[500px] p-6 sm:p-8' : 'max-h-0'}`}>
                  <div className="flex gap-4 sm:gap-5">
                    <span className="text-[18px] sm:text-[20px] font-black text-blue-500 mt-[-2px]">A.</span>
                    <p className="text-[14px] sm:text-[15px] leading-relaxed text-gray-600 font-medium whitespace-pre-wrap">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 text-center">
               <p className="text-[18px] font-black text-gray-200 uppercase tracking-widest">No results found</p>
               <p className="text-[14px] text-gray-300 mt-2">검색어와 일치하는 문의 내역이 없습니다.</p>
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
                  ? 'text-gray-100 cursor-default' 
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
                  ? 'text-gray-100 cursor-default' 
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