'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  // 이메일, 전화번호, 약관 동의
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('naver.com');
  const [phone1, setPhone1] = useState('010');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [isAgreed, setIsAgreed] = useState(false); // 약관 동의

  // 회원가입 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 체크박스 미체크 시 alert
    if (!isAgreed) {
      alert('이용약관 및 개인정보 처리방침에 동의해주세요.');
      return;
    }

    alert('환영합니다. \n회원가입이 정상적으로 되었습니다.');
    router.push('/login');
  };

  // 공통 서브 버튼 스타일 (Check, Verify, Confirm)
  const subButtonStyle = "h-[64px] px-4 bg-white border border-gray-200 text-gray-400 font-black text-[11px] rounded-2xl hover:text-black hover:border-black transition-all cursor-pointer uppercase whitespace-nowrap";

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-100">
      <main className="max-w-[1200px] mx-auto pt-24 sm:pt-44 pb-20 px-6 sm:px-8">
        
        {/* 상단 헤더 */}
        <div className="mb-16 sm:mb-20">
          <Link href="/login" className="text-[12px] font-black text-black flex items-center gap-1 mb-8 hover:opacity-50 transition-opacity uppercase tracking-widest cursor-pointer">
            <span className="text-[16px] leading-none">〈</span> Back to Login
          </Link>
          <h1 className="text-[40px] sm:text-[52px] font-black leading-tight tracking-tighter uppercase text-black">Sign Up</h1>
          <p className="text-[14px] sm:text-[15px] text-gray-400 font-medium italic mt-2 uppercase tracking-tighter">Create your premium account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-16 items-start">
            
            {/* 좌측 - 기본 정보 */}
            <div className="space-y-10">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Full Name</label>
                <input type="text" placeholder="실명을 입력하세요" className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300" required />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Identification</label>
                <div className="grid grid-cols-[1fr_100px] gap-3">
                  <input type="text" placeholder="6-12자 영문/숫자" className="h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" required />
                  <button type="button" className={subButtonStyle}>Check</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Password</label>
                <input type="password" placeholder="비밀번호 입력" className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" required />
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Confirm Password</label>
                <input type="password" placeholder="비밀번호 재입력" className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" required />
              </div>
            </div>

            {/* 우측 - 상세 인증 및 약관 */}
            <div className="space-y-10">
              
              {/* 이메일 */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Email Verification</label>
                <div className="grid grid-cols-[1.2fr_20px_1fr_80px] sm:grid-cols-[1.2fr_30px_1fr_90px] items-center gap-1 sm:gap-2">
                  <input type="text" placeholder="ID" value={emailId} onChange={(e) => setEmailId(e.target.value)} className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-3 sm:px-5 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" required />
                  <span className="font-black text-gray-300 text-center text-[16px]">@</span>
                  <div className="relative group w-full">
                    <select value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl pl-4 pr-8 font-black text-[14px] outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer">
                      <option value="naver.com">naver.com</option>
                      <option value="gmail.com">gmail.com</option>
                      <option value="daum.net">daum.net</option>
                      <option value="kakao.com">kakao.com</option>
                    </select>
                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                  <button type="button" className={subButtonStyle}>Verify</button>
                </div>
                <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_90px] gap-2 mt-2">
                  <input type="text" placeholder="인증코드 입력" className="h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300" required />
                  <button type="button" className={subButtonStyle}>Confirm</button>
                </div>
              </div>

              {/* 전화번호 */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Phone Number</label>
                <div className="grid grid-cols-[65px_15px_1fr_15px_1fr_80px] sm:grid-cols-[80px_20px_1fr_20px_1fr_90px] items-center gap-1">
                  <div className="relative group">
                    <select value={phone1} onChange={(e) => setPhone1(e.target.value)} className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl pl-2 sm:pl-3 pr-5 sm:pr-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer text-center">
                      <option value="010">010</option>
                      <option value="011">011</option>
                    </select>
                    <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                  <span className="text-gray-300 font-bold text-center">-</span>
                  <input type="text" maxLength={4} value={phone2} onChange={(e) => setPhone2(e.target.value.replace(/[^0-9]/g, ''))} className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl font-black text-[16px] outline-none focus:ring-1 focus:ring-black text-center" required />
                  <span className="text-gray-300 font-bold text-center">-</span>
                  <input type="text" maxLength={4} value={phone3} onChange={(e) => setPhone3(e.target.value.replace(/[^0-9]/g, ''))} className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl font-black text-[16px] outline-none focus:ring-1 focus:ring-black text-center" required />
                  <button type="button" className={subButtonStyle}>Verify</button>
                </div>
                <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_90px] gap-2 mt-2">
                  <input type="text" placeholder="인증코드 입력" className="h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300" required/>
                  <button type="button" className={subButtonStyle}>Confirm</button>
                </div>
              </div>

              {/* 하단 약관 및 버튼 영역 */}
              <div className="pt-10 flex flex-col gap-8">
                <label className="flex items-center gap-5 cursor-pointer group w-fit">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer hidden" 
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                    />
                    <div className="w-7 h-7 border-2 border-gray-200 rounded-lg bg-white peer-checked:bg-black peer-checked:border-black transition-all flex items-center justify-center shadow-sm">
                      <svg width="14" height="12" viewBox="0 0 12 10" fill="none" className="text-white scale-0 peer-checked:scale-100 transition-transform duration-200">
                        <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-[14px] font-black text-gray-400 group-hover:text-black transition-colors uppercase tracking-tight">
                       이용약관 및 개인정보 처리방침에 동의합니다.
                  </span>
                </label>

                <button type="submit" className="w-full h-[72px] bg-[#1a1a1a] text-white rounded-2xl font-black text-[18px] hover:bg-black transition-all uppercase tracking-[0.2em] cursor-pointer shadow-2xl">
                  Create Account
                </button>
              </div>

            </div>
          </div>
        </form>
      </main>
    </div>
  );
}