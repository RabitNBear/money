'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const API_BASE_URL = 'http://localhost:3001/api';

  // 상태 관리
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('naver.com');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 이메일 조합 함수
  const fullEmail = `${emailId}@${emailDomain}`;

  // 회원가입 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 유효성 검사
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!isAgreed) {
      alert('이용약관 및 개인정보 처리방침에 동의해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: fullEmail,
          password: password,
          name: name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 성공 시 토큰 저장 (필요한 경우)
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        alert('환영합니다! 회원가입이 완료되었습니다.');
        router.push('/login');
      } else {
        // 백엔드 에러 메시지 (중복 이메일 등) 처리
        alert(data.message || '회원가입 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 공통 서브 버튼 스타일
  const subButtonStyle = "h-[64px] px-4 bg-white border border-gray-200 text-gray-400 font-black text-[11px] rounded-2xl hover:text-black hover:border-black transition-all cursor-pointer uppercase whitespace-nowrap disabled:opacity-50";

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-100">
      <main className="max-w-[1200px] mx-auto pt-24 sm:pt-44 pb-20 px-6 sm:px-8">

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
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="실명을 입력하세요"
                  className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
                  required
                />
              </div>

              {/* 이메일 인증 */}
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
                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 9l6 6 6-6" /></svg>
                    </div>
                  </div>
                  <button type="button" className={subButtonStyle}>Verify</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Identification (Email Preview)</label>
                <div className="grid grid-cols-[1fr_100px] gap-3">
                  <input type="text" readOnly value={fullEmail} className="h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] text-gray-400 outline-none" />
                  <button type="button" className={subButtonStyle}>Check</button>
                </div>
              </div>
            </div>

            {/* 우측 - 상세 인증 및 약관 */}
            <div className="space-y-10">

              {/* 비밀번호 입력 및 확인 */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상, 대소문자/숫자/특수문자 포함"
                  className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[16px] outline-none focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>

              <div className="pt-10 flex flex-col gap-8">
                <label className="flex items-center gap-5 cursor-pointer group w-fit">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer hidden"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                    />
                    <div className="w-7 h-7 border-2 border-gray-200 rounded-lg bg-white peer-checked:bg-black peer-checked:border-black transition-all flex items-center justify-center">
                      <svg width="14" height="12" viewBox="0 0 12 10" fill="none" className="text-white scale-0 peer-checked:scale-100 transition-transform">
                        <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[14px] font-black text-gray-400 group-hover:text-black transition-colors uppercase tracking-tight">
                    이용약관 및 개인정보 처리방침에 동의합니다.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[72px] bg-[#1a1a1a] text-white rounded-2xl font-black text-[18px] hover:bg-black transition-all uppercase tracking-[0.2em] cursor-pointer shadow-2xl disabled:bg-gray-400"
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}