'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FindIdPage() {
  const [foundId, setFoundId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // 상태 관리
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('naver.com');
  const [phone1, setPhone1] = useState('010');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');

  const handleFindId = (e: React.FormEvent) => {
    e.preventDefault();
    setFoundId("ggeulmuse_investor");
    setIsCopied(false);
  };

  const handleCopy = async () => {
    if (!foundId) return;
    try {
      await navigator.clipboard.writeText(foundId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <main className="max-w-[500px] mx-auto pt-24 sm:pt-44 pb-20 px-6">
        
        {/* 헤더 */}
        <div className="mb-12 sm:mb-16 text-center">
          <h1 className="text-[40px] sm:text-[52px] font-black leading-tight tracking-tighter uppercase mb-4">Find ID</h1>
          <p className="text-[12px] sm:text-[13px] font-bold text-gray-400 uppercase tracking-[0.2em] italic">Account Recovery</p>
        </div>

        <form onSubmit={handleFindId} className="space-y-6 sm:space-y-8">
          
          {/* 1. 이름 */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Name</label>
            <input 
              type="text" 
              placeholder="이름을 입력하세요" 
              className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300" 
              required 
            />
          </div>

          {/* 2. 이메일 */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Email Verification</label>
            <div className="grid grid-cols-[1fr_20px_1fr_80px] sm:grid-cols-[1.2fr_30px_1fr_90px] items-center gap-1 sm:gap-2">
              <input 
                type="text" 
                placeholder="ID"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-3 sm:px-5 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" 
                required 
              />
              <span className="font-black text-gray-300 text-center text-[16px] sm:text-[18px]">@</span>
              <div className="relative group w-full">
                <select 
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl pl-3 sm:pl-4 pr-7 sm:pr-8 font-black text-[13px] sm:text-[14px] outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer"
                >
                  <option value="naver.com">naver.com</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="daum.net">daum.net</option>
                  <option value="kakao.com">kakao.com</option>
                </select>
                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
              <button type="button" className="h-[60px] sm:h-[64px] w-full bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase hover:text-black hover:border-black transition-all cursor-pointer">
                Verify
              </button>
            </div>
            {/* 이메일 인증코드 */}
            <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_90px] gap-2 mt-2">
              <input 
                type="text" 
                placeholder="이메일 인증코드 6자리" 
                className="h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
              />
              <button type="button" className="h-[60px] sm:h-[64px] w-full bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase hover:text-black hover:border-black transition-all cursor-pointer">
                Confirm
              </button>
            </div>
          </div>

          {/* 3. 전화번호 */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Phone Number</label>
            <div className="grid grid-cols-[65px_15px_1fr_15px_1fr_80px] sm:grid-cols-[80px_20px_1fr_20px_1fr_90px] items-center gap-1">
              <div className="relative group">
                <select 
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl pl-2 sm:pl-3 pr-5 sm:pr-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer text-center"
                >
                  <option value="010">010</option>
                  <option value="011">011</option>
                </select>
                <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
              <span className="text-gray-300 font-bold text-center">-</span>
              <input 
                type="text" 
                maxLength={4}
                value={phone2}
                onChange={(e) => setPhone2(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black text-center" 
                required 
              />
              <span className="text-gray-300 font-bold text-center">-</span>
              <input 
                type="text" 
                maxLength={4}
                value={phone3}
                onChange={(e) => setPhone3(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black text-center" 
                required 
              />
              <button type="button" className="h-[60px] sm:h-[64px] w-full bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase hover:text-black hover:border-black transition-all cursor-pointer">
                Verify
              </button>
            </div>
            {/* 전화번호 인증코드 */}
            <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_90px] gap-2 mt-2">
              <input 
                type="text" 
                placeholder="문자 인증코드 6자리" 
                className="h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
              />
              <button type="button" className="h-[60px] sm:h-[64px] w-full bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase hover:text-black hover:border-black transition-all cursor-pointer">
                Confirm
              </button>
            </div>
          </div>

          {/* 메인 버튼 */}
          <button type="submit" className="w-full h-[68px] sm:h-[72px] bg-[#1a1a1a] text-white rounded-2xl font-black text-[16px] sm:text-[17px] hover:bg-black transition-all uppercase tracking-[0.2em] shadow-2xl mt-6 cursor-pointer">
            Find My Identity
          </button>

          {/* 결과 표시 */}
          {foundId && (
            <div className="mt-12 p-6 sm:p-10 bg-[#f9fafb] rounded-[32px] border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-700">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 text-center">Your Identity Found</p>
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-50 gap-4">
                <span className="text-[20px] sm:text-[22px] font-black tracking-tighter">{foundId}</span>
                <button type="button" onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all group w-full sm:w-auto justify-center">
                  <span className={`text-[11px] font-black uppercase tracking-tighter ${isCopied ? 'text-blue-500' : 'text-gray-300 group-hover:text-black'}`}>{isCopied ? 'Copied' : 'Copy'}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isCopied ? "#3b82f6" : "currentColor"} strokeWidth="2.5" className={isCopied ? "" : "text-gray-200 group-hover:text-black"}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
              <div className="mt-10 text-center">
                <Link href="/login" className="text-[12px] sm:text-[13px] font-black border-b-2 border-black pb-1 hover:text-gray-400 hover:border-gray-400 transition-all uppercase tracking-widest cursor-pointer">Back to Login</Link>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-6 sm:gap-8 pt-8 sm:pt-12 text-[10px] sm:text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">
            <Link href="/login" className="text-black hover:opacity-50 transition-colors cursor-pointer">Login</Link>
            <Link href="/findPw" className="text-black hover:opacity-50 transition-colors cursor-pointer">Find PW</Link>
            <Link href="/signup" className="text-black hover:opacity-50 transition-colors cursor-pointer">Signup</Link>
          </div>
        </form>
      </main>
    </div>
  );
}