'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // API 엔드포인트 설정
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email, // LoginDto의 email 필드
          password: password, // LoginDto의 password 필드
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. 토큰 저장 (JWT 방식)
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // 2. 사용자 정보 저장 (필요 시)
        localStorage.setItem('user', JSON.stringify(data.user));

        alert(`${data.user.name}님, 환영합니다!`);
        router.push('/'); // 로그인 성공 후 메인 페이지 이동
      } else {
        // 백엔드에서 보낸 에러 메시지 처리 (400, 401 등)
        alert(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('서버와 통신 중 오류가 발생했습니다. 서버가 켜져 있는지 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 로그인 핸들러
  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    // 백엔드의 OAuth 엔드포인트로 리다이렉트
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-100">
      <main className="max-w-[450px] mx-auto pt-44 pb-20 px-6">
        <div className="mb-12 text-center">
          <h1 className="text-[56px] font-black leading-tight tracking-tighter uppercase mb-2">Login</h1>
          <p className="text-[13px] font-bold text-gray-300 tracking-[0.2em] uppercase italic">Pioneering your investment</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              className="w-full h-[60px] bg-[#f3f4f6] rounded-xl px-6 font-bold text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              className="w-full h-[60px] bg-[#f3f4f6] rounded-xl px-6 font-bold text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[64px] bg-[#1a1a1a] text-white rounded-xl font-black text-[16px] hover:bg-black transition-all shadow-xl uppercase tracking-widest mt-6 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="flex justify-center gap-8 pt-12 text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">
            <Link href="/findPw" className="text-black hover:opacity-50 transition-colors cursor-pointer">Find PW</Link>
            <Link href="/signup" className="text-black hover:opacity-50 transition-colors cursor-pointer">Signup</Link>
          </div>

          {/* SNS 로그인 섹션 */}
          <div className="mt-[30px] pt-5 border-t border-gray-100 text-center">
            <p className="text-[15px] text-gray-400 mb-[15px] font-medium">SNS 계정으로 간편 로그인</p>
            <div className="flex justify-center gap-[15px]">

              <button
                type="button"
                onClick={() => handleSocialLogin('kakao')}
                className="w-[60px] h-[60px] rounded-full bg-[#FEE500] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.02944 4 3 7.16682 3 11.0833C3 13.5627 4.63938 15.7412 7.12584 17.0254L6.22883 20.4632C6.15906 20.7305 6.46602 20.9414 6.70013 20.7867L10.8049 18.0698C11.1941 18.1222 11.5927 18.1667 12 18.1667C16.9706 18.1667 21 14.9999 21 11.0833C21 7.16682 16.9706 4 12 4Z" fill="#191919"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-[60px] h-[60px] rounded-full bg-white border border-gray-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.1H2.18V16.94C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                  <path d="M5.84 14.1C5.62 13.44 5.49 12.73 5.49 12C5.49 11.27 5.62 10.56 5.84 9.9V7.06H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.94L5.84 14.1Z" fill="#FBBC05"/>
                  <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335"/>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}