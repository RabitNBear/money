'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FindPwPage() {
  const router = useRouter();
  const [step, setStep] = useState<'verify' | 'reset'>('verify');

  // 입력값 상태 관리
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('naver.com');
  const [phone1, setPhone1] = useState('010');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');

  // 비밀번호 상태 관리
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 본인 확인 완료 핸들러
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('reset');
  };

  // 비밀번호 변경 완료 핸들러
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    alert('비밀번호가 성공적으로 변경되었습니다.');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <main className="max-w-[500px] mx-auto pt-24 sm:pt-44 pb-20 px-6">
        
        {/* 헤더 */}
        <div className="mb-12 sm:mb-16 text-center animate-in fade-in duration-500">
          <h1 className="text-[40px] sm:text-[52px] font-black leading-tight tracking-tighter uppercase mb-4">
            {step === 'verify' ? 'Find PW' : 'New PW'}
          </h1>
          <p className="text-[12px] sm:text-[13px] font-bold text-gray-400 uppercase tracking-[0.2em] italic">
            {step === 'verify' ? 'Account Verification' : 'Set New Password'}
          </p>
        </div>

        <div className="transition-all duration-500">
          {step === 'verify' ? (
            /* 1. 본인 확인 */
            <form onSubmit={handleVerifySubmit} className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* 아이디 입력 */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">User ID</label>
                <input 
                  type="text" 
                  placeholder="아이디를 입력하세요" 
                  className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" 
                  required 
                />
              </div>

              {/* 이름 입력 */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Name</label>
                <input 
                  type="text" 
                  placeholder="이름을 입력하세요" 
                  className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" 
                  required 
                />
              </div>

              {/* 이메일 입력 */}
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
                    <select value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl pl-3 sm:pl-4 pr-7 sm:pr-8 font-black text-[13px] sm:text-[14px] outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer">
                      <option value="naver.com">naver.com</option>
                      <option value="gmail.com">gmail.com</option>
                      <option value="daum.net">daum.net</option>
                      <option value="kakao.com">kakao.com</option>
                    </select>
                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black">
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
                    placeholder="인증코드 입력" 
                    className="h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
                  />
                  <button type="button" className="h-[60px] sm:h-[64px] w-full bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase hover:text-black hover:border-black transition-all cursor-pointer">
                    Confirm
                  </button>
                </div>
              </div>

              {/* 전화번호 입력 */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Phone Number</label>
                <div className="grid grid-cols-[65px_15px_1fr_15px_1fr_80px] sm:grid-cols-[80px_20px_1fr_20px_1fr_90px] items-center gap-1">
                  <div className="relative group">
                    <select value={phone1} onChange={(e) => setPhone1(e.target.value)} className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl pl-2 sm:pl-3 pr-5 sm:pr-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer text-center">
                      <option value="010">010</option>
                      <option value="011">011</option>
                    </select>
                    <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                  <span className="text-gray-300 font-bold text-center">-</span>
                  <input type="text" maxLength={4} value={phone2} onChange={(e) => setPhone2(e.target.value.replace(/[^0-9]/g, ''))} className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black text-center" required />
                  <span className="text-gray-300 font-bold text-center">-</span>
                  <input type="text" maxLength={4} value={phone3} onChange={(e) => setPhone3(e.target.value.replace(/[^0-9]/g, ''))} className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black text-center" required />
                  <button type="button" className="h-[60px] sm:h-[64px] w-full bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase hover:text-black hover:border-black transition-all cursor-pointer">
                    Verify
                  </button>
                </div>
                {/* 전화번호 인증코드 */}
                <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_90px] gap-2 mt-2">
                  <input 
                    type="text" 
                    placeholder="인증코드 입력" 
                    className="h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
                  />
                  <button type="button" className="h-[60px] sm:h-[64px] w-full bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase hover:text-black hover:border-black transition-all cursor-pointer">
                    Confirm
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full h-[68px] sm:h-[72px] bg-[#1a1a1a] text-white rounded-2xl font-black text-[16px] sm:text-[17px] hover:bg-black transition-all uppercase tracking-[0.2em] shadow-2xl mt-6 cursor-pointer">
                Verify Account
              </button>
            </form>
          ) : (
            /* 2. 비밀번호 재설정 */
            <form onSubmit={handleResetSubmit} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  autoComplete="new-password"
                  placeholder="새 비밀번호를 입력하세요" 
                  className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  autoComplete="new-password"
                  placeholder="비밀번호를 한번 더 입력하세요" 
                  className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all" 
                  required 
                />
              </div>

              <button type="submit" className="w-full h-[68px] sm:h-[72px] bg-[#1a1a1a] text-white rounded-2xl font-black text-[16px] sm:text-[17px] hover:bg-black transition-all uppercase tracking-[0.2em] shadow-2xl mt-6 cursor-pointer">
                Update Password
              </button>
              
              <button 
                type="button" 
                onClick={() => { setStep('verify'); setNewPassword(''); setConfirmPassword(''); }}
                className="w-full text-[11px] font-black text-gray-300 hover:text-black transition-colors uppercase tracking-widest pt-4 cursor-pointer"
              >
                Back to Verify
              </button>
            </form>
          )}
        </div>

        {/* 하단 네비게이션 링크 */}
        <div className="flex justify-center gap-6 sm:gap-8 pt-8 sm:pt-12 text-[10px] sm:text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">
          <Link href="/login" className="text-black hover:opacity-50 transition-colors cursor-pointer">Login</Link>
          <Link href="/findId" className="text-black hover:opacity-50 transition-colors cursor-pointer">Find ID</Link>
          <Link href="/signup" className="text-black hover:opacity-50 transition-colors cursor-pointer">Signup</Link>
        </div>
      </main>
    </div>
  );
}