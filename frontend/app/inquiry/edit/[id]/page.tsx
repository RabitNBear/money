'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth, API_URL } from '@/lib/apiClient';

export default function InquiryEditPage() {
  const inquiryCategories = [
    { label: '계정', value: 'ACCOUNT' },
    { label: '일반', value: 'GENERAL' },
    { label: '오류', value: 'BUG' },
    { label: '제안', value: 'FEATURE' },
    { label: '기타', value: 'OTHER' },
  ];

  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/inquiry/${id}`);
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setCategory(data.category || 'GENERAL');
          setContent(data.content || '');
          setIsPrivate(data.isPrivate || false);
        } else {
          alert('문의를 불러올 수 없습니다.');
          router.push('/inquiry');
        }
      } catch (error) {
        console.error('Error fetching inquiry:', error);
        alert('문의를 불러오는 중 오류가 발생했습니다.');
        router.push('/inquiry');
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchInquiry();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    const autoTitle = content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : '');

    const inquiryData = {
      category,
      title: autoTitle,
      content: content,
      isPrivate,
    };

    try {
      const response = await fetchWithAuth(`${API_URL}/inquiry/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryData),
      });

      if (response.ok) {
        alert('문의가 성공적으로 수정되었습니다.');
        router.push('/inquiry');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '문의 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Inquiry update error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 font-bold">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <main className="max-w-[800px] mx-auto px-6 sm:px-8 pt-32 sm:pt-44 pb-20">

        <div className="mb-12 sm:mb-16">
          <h1 className="text-[36px] sm:text-[48px] font-black leading-tight tracking-tighter uppercase">문의 수정</h1>
          <p className="text-[14px] sm:text-[15px] text-gray-400 font-medium italic mt-2 opacity-70">
            문의 내용을 수정하실 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">

          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">카테고리</label>
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

          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="관리자에게 전달하실 내용을 입력하세요"
              rows={5}
              className="w-full bg-[#f3f4f6] rounded-xl px-6 py-4 font-bold text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300 resize-none"
              required
            />
          </div>

          <div className="space-y-4">
            <label
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setIsPrivate(!isPrivate)}
            >
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isPrivate
                    ? 'bg-black border-black'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
              >
                {isPrivate && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-[14px] sm:text-[15px] font-bold text-gray-600">
                비공개 문의 (관리자만 내용 확인 가능)
              </span>
            </label>
          </div>

          <div className="pt-6 sm:pt-10 flex gap-3 sm:gap-4">
            <button type="submit" disabled={isLoading} className="flex-[2] h-[60px] sm:h-[64px] bg-[#1a1a1a] text-white rounded-xl font-black text-[14px] sm:text-[15px] hover:bg-black transition-all shadow-xl uppercase tracking-widest cursor-pointer disabled:bg-gray-400">
              {isLoading ? '수정 중...' : '수정'}
            </button>
            <Link href="/inquiry" className="flex-1">
              <button type="button" className="w-full h-[60px] sm:h-[64px] bg-white border border-gray-200 text-gray-400 rounded-xl font-black text-[14px] sm:text-[15px] hover:text-black hover:border-black transition-all uppercase tracking-widest cursor-pointer">
                취소
              </button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
