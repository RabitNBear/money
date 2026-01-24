'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth, tryFetchWithAuth, API_URL } from '@/lib/apiClient';
import { Lock } from 'lucide-react';

interface InquiryItem {
  id: string;
  type: string;
  title: string;
  date: string;
  status: '공지' | '답변완료' | '답변대기';
  isPinned: boolean;
  answer: string | null;
  authorId?: string;
  isPrivate: boolean;
  content: string | null;
}

interface User {
  id: string;
  email: string;
  name: string;
}

// 카테고리 한글 매핑 추가 (ADMIN 페이지 기준)
const categoryLabels: Record<string, string> = {
  GENERAL: '일반',
  BUG: '오류',
  FEATURE: '제안',
  ACCOUNT: '계정',
  OTHER: '기타',
};

export default function InquiryPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 5;
  const router = useRouter();

  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

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
        const inquiryRes = await fetch(`${API_URL}/inquiry/public`);
        if (inquiryRes.ok) {
          const response = await inquiryRes.json();
          const data = response.data || response;
          const formattedData: InquiryItem[] = (Array.isArray(data) ? data : []).map((item: {
            id: string;
            title: string;
            content: string | null;
            category: string;
            status: string;
            answer: string | null;
            createdAt: string;
            answeredAt: string | null;
            isPrivate: boolean;
            userId: string;
          }) => ({
            id: item.id,
            type: item.category,
            title: item.title,
            date: new Date(item.createdAt).toLocaleDateString('ko-KR'),
            status: (item.status === 'RESOLVED' ? '답변완료' : '답변대기') as '답변완료' | '답변대기',
            isPinned: false,
            answer: item.answer,
            authorId: item.userId,
            isPrivate: item.isPrivate,
            content: item.content,
          }));
          setInquiries(formattedData);
        }

        const userRes = await tryFetchWithAuth(`${API_URL}/auth/me`);
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
    // font-sans 삭제
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-32 sm:pt-44 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 sm:mb-16">
          <div>
            <h1 className="text-[36px] sm:text-[48px] font-black leading-tight tracking-tighter uppercase">고객센터</h1>
            <p className="text-[13px] sm:text-[15px] text-gray-400 font-medium italic opacity-70 mt-2">무엇이든 말씀해주세요. 질문을 클릭하면 답변을 확인하실 수 있습니다.</p>
          </div>
          <Link href="/inquiry/write" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 h-[56px] bg-[#1a1a1a] text-white rounded-xl font-black text-[14px] hover:bg-black transition-all uppercase tracking-widest cursor-pointer shadow-lg">
              작성
            </button>
          </Link>
        </div>

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
              className="w-full h-full bg-transparent px-4 font-bold text-[14px] outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="space-y-3 min-h-[400px]">
          {isLoading ? (
            <div className="py-32 text-center">
              <p className="text-[18px] font-black text-gray-200 uppercase tracking-widest">로딩 중...</p>
            </div>
          ) : filteredAndSortedData.items.length > 0 ? (
            filteredAndSortedData.items.map((item) => (
              <div key={item.id} className="border rounded-2xl overflow-hidden transition-all duration-300 border-gray-100 shadow-sm">
                <div
                  onClick={() => toggleAccordion(item.id)}
                  className={`flex flex-col p-5 sm:p-7 cursor-pointer transition-colors gap-2 sm:gap-4
                    ${openId === item.id ? 'bg-gray-50' : 'bg-white hover:bg-gray-50/50'}`}
                >
                  {/* 모바일 1열: 카테고리, 답변여부, 날짜 */}
                  <div className="flex items-center justify-between w-full sm:hidden mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 h-[20px] flex items-center justify-center rounded-full text-[9px] font-black uppercase tracking-tighter shrink-0
                        ${item.isPinned ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                        {item.isPinned ? 'Notice' : (categoryLabels[item.type] || item.type)}
                      </span>
                      {!item.isPinned && (
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === '답변완료' ? 'text-blue-500' : 'text-gray-300'}`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 italic tracking-tighter">
                      {item.date}
                    </span>
                  </div>

                  {/* 모바일 2열: 문의내용 + 화살표 (검정) */}
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center flex-1 min-w-0 gap-4">
                      {/* 데스크톱 전용 배지 */}
                      <span className={`hidden sm:flex min-w-[85px] h-[30px] items-center justify-center rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0
                        ${item.isPinned ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                        {item.isPinned ? 'Notice' : (categoryLabels[item.type] || item.type)}
                      </span>

                      <div className="flex items-center flex-1 min-w-0 gap-2">
                        {item.isPrivate && (
                          <Lock size={14} className="shrink-0 text-gray-400" />
                        )}
                        <h3 className="text-[14px] sm:text-[17px] font-bold text-black mb-1 antialiased tracking-tight">
                          {item.isPrivate && currentUser?.id !== item.authorId
                            ? '비공개 문의입니다'
                            : item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* 데스크톱 전용 정보 */}
                      <div className="hidden sm:flex items-center gap-4">
                        {isLoggedIn && currentUser?.id === item.authorId && !item.isPinned && (
                          <div className="flex items-center gap-3 border-r border-gray-100 pr-4">
                            <button onClick={(e) => { e.stopPropagation(); router.push(`/inquiry/edit/${item.id}`); }} className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest cursor-pointer">수정</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest cursor-pointer">삭제</button>
                          </div>
                        )}
                        {!item.isPinned && (
                          <span className={`text-[11px] font-black uppercase tracking-widest ${item.status === '답변완료' ? 'text-blue-500' : 'text-gray-300'}`}>
                            {item.status}
                          </span>
                        )}
                        <span className="text-[14px] font-bold text-gray-300 italic tracking-tighter">{item.date}</span>
                      </div>

                      {/* 화살표: 검정색 유지 */}
                      <svg
                        className={`w-5 h-5 text-black transition-transform duration-300 shrink-0 ${openId === item.id ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* 모바일 전용 수정/삭제 버튼 */}
                  {isLoggedIn && currentUser?.id === item.authorId && !item.isPinned && (
                    <div className="flex items-center gap-4 mt-1 sm:hidden">
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/inquiry/edit/${item.id}`); }} className="text-[9px] font-black text-gray-400 uppercase tracking-widest">수정</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="text-[9px] font-black text-gray-400 uppercase tracking-widest">삭제</button>
                    </div>
                  )}
                </div>

                <div className={`transition-all duration-300 ease-in-out bg-[#f9fafb] border-t border-gray-100 overflow-hidden
                  ${openId === item.id ? 'max-h-[500px] p-5 sm:p-8' : 'max-h-0'}`}>
                  {item.isPrivate && (item.content === null || item.content === '') ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-10 gap-3">
                      <Lock size={20} className="text-gray-300 opacity-60" />
                      <p className="text-[13px] sm:text-[14px] text-gray-400 font-medium text-center leading-relaxed">
                        비공개 문의입니다.<br className="sm:hidden" /> 작성자만 내용을 확인할 수 있습니다.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {item.answer ? (
                        <p className="text-[13px] sm:text-[15px] leading-relaxed text-gray-600 font-medium whitespace-pre-wrap">
                          {item.answer}
                        </p>
                      ) : (
                        <p className="text-[13px] sm:text-[15px] leading-relaxed text-gray-300 font-medium italic">
                          아직 답변이 등록되지 않았습니다.
                        </p>
                      )}
                    </div>
                  )}
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

        {totalPages > 0 && (
          <div className="mt-20 flex justify-center items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev: number) => prev - 1)}
              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all 
                ${currentPage === 1
                  ? 'text-gray-100 cursor-default'
                  : 'text-black hover:bg-gray-100 cursor-pointer'}`}
            >
              <span className="text-[16px] sm:text-[18px]">〈</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-[12px] sm:text-[13px] font-black transition-all cursor-pointer
                  ${num === currentPage
                    ? 'bg-black text-white shadow-xl scale-110'
                    : 'text-black hover:bg-gray-100'}`}
              >
                {num}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev: number) => prev - 1)}
              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all 
                ${currentPage === totalPages
                  ? 'text-gray-100 cursor-default'
                  : 'text-black hover:bg-gray-100 cursor-pointer'}`}
            >
              <span className="text-[16px] sm:text-[18px]">〉</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}