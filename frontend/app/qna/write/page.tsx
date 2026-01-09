'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function InquiryWritePage() {
  const [category, setCategory] = useState('계정');

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

        {/* 작성 */}
        <div className="space-y-8 sm:space-y-10">
          
          {/* 카테고리 선택 : flex-wrap으로 모바일에서 자동 줄바꿈 */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {['계정', '결제', '오류', '제안', '기타'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-[12px] sm:text-[13px] font-black transition-all border cursor-pointer
                    ${category === cat 
                      ? 'bg-black text-white border-black shadow-lg' 
                      : 'bg-[#f3f4f6] text-gray-400 border-transparent hover:bg-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 입력 */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Title</label>
            <input 
              type="text" 
              placeholder="제목을 입력하세요"
              className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-xl px-6 font-bold text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
            />
          </div>

          {/* 내용 입력 */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Message</label>
            <textarea 
              rows={10}
              placeholder="문의하실 내용을 입력해 주세요. (최대 2000자)"
              className="w-full bg-[#f3f4f6] rounded-2xl p-6 sm:p-8 font-medium text-[15px] sm:text-[16px] leading-relaxed outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300 resize-none min-h-[300px]"
            ></textarea>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="pt-6 sm:pt-10 flex gap-3 sm:gap-4">
            <button className="flex-[2] h-[60px] sm:h-[64px] bg-[#1a1a1a] text-white rounded-xl font-black text-[14px] sm:text-[15px] hover:bg-black transition-all shadow-xl uppercase tracking-widest cursor-pointer">
              Submit
            </button>
            <Link href="/qna" className="flex-1">
              <button className="w-full h-[60px] sm:h-[64px] bg-white border border-gray-200 text-gray-400 rounded-xl font-black text-[14px] sm:text-[15px] hover:text-black hover:border-black transition-all uppercase tracking-widest cursor-pointer">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}