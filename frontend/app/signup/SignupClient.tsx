'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupClient() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // 상태 관리
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('naver.com');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 이메일 인증 관련 상태
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const [isCustomDomain, setIsCustomDomain] = useState(false); // 직접입력을 위해 추가
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 열림 상태 추가

  // 이메일 조합 함수
  const fullEmail = `${emailId}@${emailDomain}`;

  // 인증 코드 발송
  const handleSendVerification = async () => {
    if (!emailId) {
      alert('이메일 ID를 입력해주세요.');
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail, type: 'SIGNUP' }),
      });

      const result = await response.json();
      const data = result.data || result;

      if (response.ok) {
        setCodeSent(true);
        alert(data.message || '인증 코드가 발송되었습니다.');
        // 개발 환경에서는 코드가 응답에 포함됨
        if (data.code) {
          console.log('[DEV] 인증 코드:', data.code);
        }
      } else {
        // 409 Conflict - 이미 가입된 이메일
        if (response.status === 409) {
          alert('이미 가입된 이메일입니다. 로그인을 이용해주세요.');
        } else {
          alert(data.message || '인증 코드 발송 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('Send verification error:', error);
      alert('서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 인증 코드 확인
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      alert('인증 코드를 입력해주세요.');
      return;
    }

    setIsVerifyingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail, code: verificationCode, type: 'SIGNUP' }),
      });

      const result = await response.json();
      const data = result.data || result;

      if (response.ok && data.verified) {
        setIsEmailVerified(true);
        alert('이메일 인증이 완료되었습니다!');
      } else {
        alert(data.message || '인증 코드가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('Verify code error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // 회원가입 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 유효성 검사
    if (!isEmailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }

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
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({
          email: fullEmail,
          password: password,
          name: name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 쿠키 기반 인증 - 토큰은 httpOnly 쿠키에 자동 저장됨
        // 헤더에 로그인 상태 알림
        window.dispatchEvent(new Event('authChange'));

        alert('환영합니다! 회원가입이 완료되었습니다.');
        router.push('/');
      } else {
        const errorMessage = data.data?.message || data.message || '회원가입 중 오류가 발생했습니다.';
        alert(errorMessage);
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
  const verifiedButtonStyle = "h-[64px] px-4 bg-green-500 border border-green-500 text-white font-black text-[11px] rounded-2xl uppercase whitespace-nowrap cursor-default";

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-[1200px] mx-auto pt-24 sm:pt-44 pb-20 px-6 sm:px-8">

        <div className="mb-16 sm:mb-20">
          <Link href="/login" className="text-[12px] font-black text-black flex items-center gap-1 mb-8 hover:opacity-50 transition-opacity uppercase tracking-widest cursor-pointer">
            <span className="text-[16px] leading-none">〈</span> 로그인
          </Link>
          <h1 className="text-[40px] sm:text-[52px] font-black leading-tight tracking-tighter uppercase text-black">회원가입</h1>
          <p className="text-[14px] sm:text-[15px] text-gray-400 font-medium italic mt-2 uppercase tracking-tighter">계정을 생성해 편리하게 사용해보세요.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-16 items-start">

            {/* 좌측 - 기본 정보 */}
            <div className="space-y-10">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="실명을 입력하세요"
                  className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[14px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
                  required
                />
              </div>

              {/* 이메일 인증 */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">이메일</label>
                <div className="grid grid-cols-[1.2fr_20px_1fr_80px] sm:grid-cols-[1.2fr_30px_1fr_90px] items-center gap-1 sm:gap-2">
                  <input
                    type="text"
                    placeholder="ID"
                    value={emailId}
                    onChange={(e) => {
                      setEmailId(e.target.value);
                      setIsEmailVerified(false);
                      setCodeSent(false);
                    }}
                    disabled={isEmailVerified}
                    className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-3 sm:px-5 font-black text-[13px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all disabled:opacity-50"
                    required
                  />
                  <span className="font-black text-gray-300 text-center text-[16px]">@</span>
                  <div className="relative group w-full">
                    {!isCustomDomain ? (
                      /* 1. 도메인 선택 Select 박스 */
                      <>
                        <select
                          value={emailDomain}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'custom') {
                              setIsCustomDomain(true);
                              setEmailDomain(''); // 값 초기화
                            } else {
                              setEmailDomain(value);
                            }
                            setCodeSent(false);
                            setIsEmailVerified(false);
                          }}
                          disabled={isEmailVerified}
                          className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl pl-3 sm:pl-4 pr-7 sm:pr-8 font-black text-[11px] sm:text-[14px] outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="naver.com">naver.com</option>
                          <option value="gmail.com">gmail.com</option>
                          <option value="daum.net">daum.net</option>
                          <option value="hanmail.net">hanmail.net</option>
                          <option value="custom">직접 입력</option> {/* 옵션 추가 */}
                        </select>
                        {/* 화살표 아이콘은 select일 때만 표시 */}
                        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                        </div>
                      </>
                    ) : (
                      /* 2. 직접 입력 Input 박스 */
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder="직접 입력"
                          value={emailDomain}
                          onChange={(e) => {
                            setEmailDomain(e.target.value);
                            setCodeSent(false);
                            setIsEmailVerified(false);
                          }}
                          disabled={isEmailVerified}
                          className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-3 sm:px-4 pr-10 font-black text-[11px] sm:text-[14px] outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
                          autoFocus
                        />

                        {/* 드롭다운 토글 버튼 */}
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <path d={isDropdownOpen ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
                          </svg>
                        </button>

                        {/* 클릭 시 나타나는 실제 도메인 선택 목록 */}
                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-2 bg-[#f3f4f6] border border-gray-200 rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                            {['naver.com', 'gmail.com', 'daum.net', 'hanmail.net'].map((domain) => (
                              <div
                                key={domain}
                                className="px-4 py-3 font-black text-[11px] sm:text-[14px] hover:bg-gray-200 cursor-pointer transition-colors"
                                onClick={() => {
                                  setEmailDomain(domain);
                                  setIsCustomDomain(false); // 다시 선택 모드로 전환
                                  setIsDropdownOpen(false); // 드롭다운 닫기
                                  setCodeSent(false);
                                  setIsEmailVerified(false);
                                }}
                              >
                                {domain}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={isSendingCode || isEmailVerified || !emailId}
                    className={isEmailVerified ? verifiedButtonStyle : subButtonStyle}
                  >
                    {isEmailVerified ? '완료' : isSendingCode ? '...' : '인증코드'}
                  </button>
                </div>

                {/* 인증 코드 입력 */}
                {codeSent && !isEmailVerified && (
                  <div className="grid grid-cols-[1fr_90px] gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="인증코드 6자리 입력"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      maxLength={6}
                      className="h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[14px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={isVerifyingCode || verificationCode.length !== 6}
                      className={subButtonStyle}
                    >
                      {isVerifyingCode ? '...' : '확인'}
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* 우측 - 상세 인증 및 약관 */}
            <div className="space-y-10">

              {/* 비밀번호 입력 및 확인 */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상, 대소문자/숫자/특수문자 포함"
                  className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[13px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 tracking-[0.2em] pl-1">비밀번호 확인</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[13px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all"
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
                  <span className="text-[13px] sm:text-[14px] font-black text-gray-400 group-hover:text-black transition-colors uppercase tracking-tight">
                    이용약관 및 개인정보 처리방침에 동의합니다.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading || !isEmailVerified}
                  className="w-full h-[72px] bg-[#1a1a1a] text-white rounded-2xl font-black text-[18px] hover:bg-black transition-all uppercase tracking-[0.2em] cursor-pointer shadow-2xl disabled:bg-gray-400"
                >
                  {isLoading ? '계정 생성 중...' : '계정 만들기'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
