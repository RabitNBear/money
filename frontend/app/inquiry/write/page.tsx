'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth, API_URL } from '@/lib/apiClient';

export default function InquiryWritePage() {
  const inquiryCategories = [
    { label: '계정', value: 'ACCOUNT' },
    { label: '결제', value: 'GENERAL' },
    { label: '오류', value: 'BUG' },
    { label: '제안', value: 'FEATURE' },
    { label: '기타', value: 'OTHER' },
  ];

  const [category, setCategory] = useState(inquiryCategories[0].value);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    // 로그인 여부 확인 (쿠키 기반)
    const checkAuth = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/auth/me`);
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (!isLoggedIn) {
      if (!confirm("비회원 문의는 수정 및 삭제가 불가능합니다. 문의하시겠습니까?")) {
        return;
      }
    }

    setIsLoading(true);

    const inquiryData = {
      category,
      title,
      content: message,
    };

    try {
      let response;
      if (isLoggedIn) {
        response = await fetchWithAuth(`${API_URL}/inquiry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inquiryData),
        });
      } else {
        response = await fetch(`${API_URL}/inquiry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inquiryData),
        });
      }

      if (response.ok) {
        alert('문의가 성공적으로 등록되었습니다.');
        router.push('/inquiry');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '문의 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Inquiry submission error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      {/* 반응형
        - max-w-[800px] 유지
        - 모바일에서는 패딩 감소 (pt-24 sm:pt-44)
      */}
      <main className="max-w-[800px] mx-auto px-6 sm:px-8 pt-32 sm:pt-44 pb-20">

        {/* 헤더 : 모바일에서 폰트 크기 축소 (text-[36px] sm:text-[48px]) */}
        <div className="mb-12 sm:mb-16">
          <h1 className="text-[36px] sm:text-[48px] font-black leading-tight tracking-tighter uppercase">Write Inquiry</h1>
          <p className="text-[14px] sm:text-[15px] text-gray-400 font-medium italic mt-2 opacity-70">
            문의하실 내용을 상세히 적어주시면 빠른 시일 내에 답변드리겠습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">

          {/* 카테고리 선택 : flex-wrap으로 모바일에서 자동 줄바꿈 */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {inquiryCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-[12px] sm:text-[13px] font-black transition-all border cursor-pointer
                    ${category === cat.value
                      ? 'bg-black text-white border-black shadow-lg'
                      : 'bg-[#f3f4f6] text-gray-400 border-transparent hover:bg-gray-200'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 입력 */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-xl px-6 font-bold text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
              required
            />
          </div>

          {/* 내용 입력 */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Message</label>
            <textarea
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="문의하실 내용을 입력해 주세요. (최대 2000자)"
              className="w-full bg-[#f3f4f6] rounded-2xl p-6 sm:p-8 font-medium text-[15px] sm:text-[16px] leading-relaxed outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300 resize-none min-h-[300px]"
              required
            ></textarea>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="pt-6 sm:pt-10 flex gap-3 sm:gap-4">
            <button type="submit" disabled={isLoading} className="flex-[2] h-[60px] sm:h-[64px] bg-[#1a1a1a] text-white rounded-xl font-black text-[14px] sm:text-[15px] hover:bg-black transition-all shadow-xl uppercase tracking-widest cursor-pointer disabled:bg-gray-400">
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
            <Link href="/inquiry" className="flex-1">
              <button className="w-full h-[60px] sm:h-[64px] bg-white border border-gray-200 text-gray-400 rounded-xl font-black text-[14px] sm:text-[15px] hover:text-black hover:border-black transition-all uppercase tracking-widest cursor-pointer">
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}