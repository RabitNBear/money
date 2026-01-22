'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth, tryFetchWithAuth, API_URL } from '@/lib/apiClient';

interface NoticeItem {
  id: string;
  type: string;
  title: string;
  date: string;
  isPinned: boolean;
  content: string;
  category: string;
}

interface NoticeAPIItem {
  id: string;
  category: string;
  title: string;
  createdAt: string;
  isPinned: boolean;
  content: string;
}

export default function NoticeClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 10;

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'NOTICE',
    isPinned: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 정보 가져오기
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await tryFetchWithAuth(`${API_URL}/auth/me`);
        if (res.ok) {
          const response = await res.json();
          const userData = response.data || response;
          setIsAdmin(userData.role === 'ADMIN');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    checkUser();
  }, []);

  const filteredAndSortedData = useMemo(() => {
    const filtered = notices.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE),
      totalCount: sorted.length
    };
  }, [currentPage, searchTerm, notices]);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/notice`);
      if (res.ok) {
        const response = await res.json();
        const data = response.data || response;
        const noticesArray = Array.isArray(data) ? data : (data.notices || []);
        const formattedData = noticesArray.map((item: NoticeAPIItem) => ({
          id: item.id,
          type: getCategoryLabel(item.category),
          title: item.title,
          date: new Date(item.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').slice(0, -1),
          isPinned: item.isPinned || false,
          content: item.content,
          category: item.category,
        }));
        setNotices(formattedData);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'NOTICE': return '공지';
      case 'UPDATE': return '업데이트';
      case 'EVENT': return '이벤트';
      case 'MAINTENANCE': return '점검';
      default: return '공지';
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ title: '', content: '', category: 'NOTICE', isPinned: false });
    setEditingNotice(null);
    setShowModal(true);
  };

  const openEditModal = (notice: NoticeItem) => {
    setModalMode('edit');
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      isPinned: notice.isPinned,
    });
    setEditingNotice(notice);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = modalMode === 'create'
        ? `${API_URL}/notice`
        : `${API_URL}/notice/${editingNotice?.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PATCH';

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(modalMode === 'create' ? '공지사항이 등록되었습니다.' : '공지사항이 수정되었습니다.');
        setShowModal(false);
        fetchNotices();
      } else {
        const data = await res.json();
        alert(data.message || '오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/notice/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('공지사항이 삭제되었습니다.');
        fetchNotices();
      } else {
        const data = await res.json();
        alert(data.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const totalPages = Math.ceil(filteredAndSortedData.totalCount / ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <main className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-32 sm:pt-44 pb-20">
        <div className="mb-12 sm:mb-16">
          <h1 className="text-[36px] sm:text-[48px] font-black leading-tight tracking-tighter uppercase">공지사항</h1>
          <p className="text-[13px] sm:text-[15px] text-gray-400 font-medium italic opacity-70 mt-2">서비스 관련 주요 소식을 확인하세요.</p>
        </div>

        <div className="mb-10 flex gap-2 h-[56px]">
          <div className="flex-1 relative bg-[#f3f4f6] rounded-xl flex items-center group focus-within:ring-1 focus-within:ring-black transition-all">
            <svg className="w-5 h-5 text-gray-400 ml-4 group-focus-within:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="공지사항 제목을 검색해 보세요"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full h-full bg-transparent px-4 font-bold text-[14px] outline-none placeholder:text-gray-300"
            />
          </div>
          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="px-6 bg-black text-white rounded-xl font-black text-[13px] uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              작성
            </button>
          )}
        </div>

        <div className="space-y-3 min-h-[400px]">
          {isLoading ? (
            <div className="py-32 text-center">
              <p className="text-[18px] font-black text-gray-200 uppercase tracking-widest">로딩 중...</p>
            </div>
          ) : filteredAndSortedData.items.length > 0 ? (
            filteredAndSortedData.items.map((item) => (
              <div key={item.id} className="border rounded-2xl overflow-hidden transition-all duration-300 border-gray-100 shadow-sm">
                <div className="flex flex-col p-5 sm:p-7 bg-white hover:bg-gray-50/50 transition-colors gap-2 sm:gap-0">

                  {/* [모바일 전용 상단] 카테고리, 날짜, 화살표 */}
                  <div className="flex items-center justify-between w-full sm:hidden mb-1">
                    <span className={`px-2.5 h-[20px] flex items-center justify-center rounded-full text-[9px] font-black uppercase tracking-tighter shrink-0 ${item.isPinned ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                      {item.isPinned ? '고정' : item.type}
                    </span>
                    <Link href={`/notice/${item.id}`} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-300 italic tracking-tighter">{item.date}</span>
                      <svg className="w-5 h-5 text-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {/* [메인 영역] 제목(모바일) / 전체(데스크톱) */}
                  <div className="flex items-center justify-between w-full gap-4">
                    <Link href={`/notice/${item.id}`} className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto flex-1 cursor-pointer min-w-0">
                      <span className={`hidden sm:flex min-w-[85px] h-[30px] items-center justify-center rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0 ${item.isPinned ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                        {item.isPinned ? 'Notice' : item.type}
                      </span>
                      <span className={`text-[14px] sm:text-[17px] font-bold leading-snug transition-colors truncate ${item.isPinned ? 'text-black' : 'text-gray-700'}`}>
                        {item.title}
                      </span>
                    </Link>

                    {/* 데스크톱 전용 정보 & 관리자 버튼 */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      {isAdmin && (
                        <div className="flex items-center gap-2 mr-2 border-r border-gray-100 pr-4">
                          <button onClick={() => openEditModal(item)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[11px] font-bold hover:bg-gray-200 transition-colors">수정</button>
                          <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-colors">삭제</button>
                        </div>
                      )}
                      <span className="text-[14px] font-bold text-gray-300 italic tracking-tighter">{item.date}</span>
                      <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* 모바일 전용 관리자 버튼 */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 mt-2 sm:hidden">
                      <button onClick={() => openEditModal(item)} className="text-[9px] font-black text-gray-400 uppercase tracking-widest">수정</button>
                      <button onClick={() => handleDelete(item.id)} className="text-[9px] font-black text-gray-400 uppercase tracking-widest">삭제</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 text-center">
              <p className="text-[18px] font-black text-gray-200 uppercase tracking-widest">No results found</p>
              <p className="text-[14px] text-gray-300 mt-2">등록된 공지사항이 없습니다.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-20 flex justify-center items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${currentPage === 1 ? 'text-gray-100 cursor-default' : 'text-black hover:bg-gray-100 cursor-pointer'}`}>
              <span className="text-[18px]">〈</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button key={num} onClick={() => setCurrentPage(num)} className={`w-10 h-10 flex items-center justify-center rounded-full text-[13px] font-black transition-all cursor-pointer ${num === currentPage ? 'bg-black text-white shadow-xl scale-110' : 'text-black hover:bg-gray-100'}`}>
                {num}
              </button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${currentPage === totalPages ? 'text-gray-100 cursor-default' : 'text-black hover:bg-gray-100 cursor-pointer'}`}>
              <span className="text-[18px]">〉</span>
            </button>
          </div>
        )}

        {/* 관리자 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-[20px] font-black uppercase tracking-tight">
                  {modalMode === 'create' ? '공지사항 작성' : '공지사항 수정'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">제목</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full h-[56px] bg-[#f3f4f6] rounded-xl px-5 font-bold text-[15px] outline-none focus:ring-1 focus:ring-black transition-all"
                    placeholder="공지사항 제목을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-[56px] bg-[#f3f4f6] rounded-xl px-5 font-bold text-[15px] outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer"
                  >
                    <option value="NOTICE">공지</option>
                    <option value="UPDATE">업데이트</option>
                    <option value="EVENT">이벤트</option>
                    <option value="MAINTENANCE">점검</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">내용</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={8}
                    className="w-full bg-[#f3f4f6] rounded-xl p-5 font-medium text-[15px] outline-none focus:ring-1 focus:ring-black transition-all resize-none"
                    placeholder="공지사항 내용을 입력하세요"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <label htmlFor="isPinned" className="text-[14px] font-bold text-gray-600">
                    상단 고정
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-[56px] bg-gray-100 text-gray-600 rounded-xl font-black text-[14px] hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-[56px] bg-black text-white rounded-xl font-black text-[14px] hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                  >
                    {isSubmitting ? '저장 중...' : (modalMode === 'create' ? '등록' : '수정')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}