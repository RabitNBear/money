'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth, API_URL } from '@/lib/apiClient';

interface InquiryItem {
  id: string;
  type: string;
  title: string;
  date: string;
  status: '공지' | '답변완료' | '답변대기';
  isPinned: boolean;
  answer: string;
  authorId?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

export default function InquiryPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // 3번 검색어
  const ITEMS_PER_PAGE = 5;
  const router = useRouter();

  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  // 3번 검색 필터링 로직 구현
  const filteredAndSortedData = useMemo(() => {
    const filtered = inquiries.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.id.localeCompare(a.id);
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE),
      totalCount: sorted.length
    };
  }, [currentPage, searchTerm, inquiries]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // 공개 문의 목록 조회 (전체)
        const inquiryRes = await fetch(`${API_URL}/inquiry/public`);
        if (inquiryRes.ok) {
          const response = await inquiryRes.json();
          const data = response.data || response;
          // 백엔드 응답을 프론트엔드 형식으로 변환
          const formattedData = (Array.isArray(data) ? data : []).map((item: {
            id: string;
            title: string;
            content: string;
            category: string;
            status: string;
            answer: string | null;
            createdAt: string;
            answeredAt: string | null;
          }) => ({
            id: item.id,
            type: item.category,
            title: item.title,
            date: new Date(item.createdAt).toLocaleDateString('ko-KR'),
            status: item.status === 'RESOLVED' ? '답변완료' : '답변대기' as const,
            isPinned: false,
            answer: item.answer || '답변 대기 중입니다.',
            authorId: undefined, // 공개 문의에서는 작성자 정보 숨김
          }));
          setInquiries(formattedData);
        } else {
          console.error("Failed to fetch inquiries");
        }

        // 로그인 여부 확인 (쿠키 기반)
        const userRes = await fetchWithAuth(`${API_URL}/auth/me`);
        if (userRes.ok) {
          const response = await userRes.json();
          setCurrentUser(response.data || response);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPages = Math.ceil(filteredAndSortedData.totalCount / ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
      }

      const res = await fetchWithAuth(`${API_URL}/inquiry/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setInquiries(prev => prev.filter(item => item.id !== id));
      } else {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">

      <main className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-32 sm:pt-44 pb-20">
        {/* 헤더  */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 sm:mb-16">
          <div>
            <h1 className="text-[36px] sm:text-[48px] font-black leading-tight tracking-tighter uppercase">Q & A</h1>
            <p className="text-[13px] sm:text-[15px] text-gray-400 font-medium italic opacity-70 mt-2">무엇이든 물어보세요. 질문을 클릭하면 답변을 확인하실 수 있습니다.</p>
          </div>
          <Link href="/inquiry/write" className="w-full sm:w-auto">
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
              onChange={handleSearchChange}
              className="w-full h-full bg-transparent px-4 font-bold text-[15px] outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* 아코디언 문의 리스트 */}
        <div className="space-y-3 min-h-[400px]">
          {isLoading ? (
            <div className="py-32 text-center">
              <p className="text-[18px] font-black text-gray-200 uppercase tracking-widest">Loading...</p>
            </div>
          ) : filteredAndSortedData.items.length > 0 ? (
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
                      {isLoggedIn && currentUser?.id === item.authorId && !item.isPinned && (
                        <div className="flex items-center gap-3 mr-2 border-r border-gray-100 pr-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/inquiry/edit/${item.id}`); }}
                            className="text-[10px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}

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
              onClick={() => setCurrentPage((prev: number) => prev - 1)}
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
              onClick={() => setCurrentPage((prev: number) => prev + 1)}
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