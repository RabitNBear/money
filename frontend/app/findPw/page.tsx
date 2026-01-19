'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FindPwPage() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const [step, setStep] = useState<'verify' | 'reset'>('verify');

  // 입력값 상태 관리
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('naver.com');
  const [isCustomDomain, setIsCustomDomain] = useState(false); // 직접입력을 위해 추가
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 열림 상태 추가
  const [verificationCode, setVerificationCode] = useState('');

  // 비밀번호 상태 관리
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 로딩 상태
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 이메일 조합
  const fullEmail = `${emailId}@${emailDomain}`;

  // 인증 코드 발송
  const handleSendCode = async () => {
    if (!emailId) {
      alert('이메일을 입력해주세요.');
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail, type: 'PASSWORD' }),
      });

      const data = await response.json();

      if (response.ok) {
        setCodeSent(true);
        alert(data.message);
        if (data.code) {
          console.log('[DEV] 인증 코드:', data.code);
        }
      } else {
        alert(data.message || '인증 코드 발송 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Send code error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
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
        body: JSON.stringify({ email: fullEmail, code: verificationCode, type: 'PASSWORD' }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setIsEmailVerified(true);
        setStep('reset');
        alert('인증이 완료되었습니다. 새 비밀번호를 설정해주세요.');
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

  // 본인 확인 완료 핸들러
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }
    setStep('reset');
  };

  // 비밀번호 변경 완료 핸들러
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 규칙 검사
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert('비밀번호는 8자 이상, 대소문자/숫자/특수문자(@$!%*?&)를 포함해야 합니다.');
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fullEmail,
          code: verificationCode,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        router.push('/login');
      } else {
        alert(data.message || '비밀번호 변경 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsResetting(false);
    }
  };

  const subButtonStyle = "h-[60px] sm:h-[64px] w-full bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase hover:text-black hover:border-black transition-all cursor-pointer disabled:opacity-50";

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <main className="max-w-[500px] mx-auto pt-24 sm:pt-44 pb-20 px-6">

        {/* 헤더 */}
        <div className="mb-12 sm:mb-16 text-center animate-in fade-in duration-500">
          <h1 className="text-[40px] sm:text-[52px] font-black leading-tight tracking-tighter uppercase mb-4">
            {step === 'verify' ? '비밀번호 찾기' : '새 비밀번호 설정'}
          </h1>
          <p className="text-[12px] sm:text-[13px] font-bold text-gray-400 uppercase tracking-[0.2em] italic">
            {step === 'verify' ? '계정을 찾아주세요.' : '새 비밀번호를 설정해주세요.'}
          </p>
        </div>

        <div className="transition-all duration-500">
          {step === 'verify' ? (
            /* 1. 본인 확인 */
            <form onSubmit={handleVerifySubmit} className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500">

              {/* 이메일 입력 */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">이메일 인증</label>
                <div className="grid grid-cols-[1fr_20px_1fr_80px] sm:grid-cols-[1.2fr_30px_1fr_90px] items-center gap-1 sm:gap-2">
                  <input
                    type="text"
                    placeholder="ID"
                    value={emailId}
                    onChange={(e) => {
                      setEmailId(e.target.value);
                      setCodeSent(false);
                      setIsEmailVerified(false);
                    }}
                    disabled={isEmailVerified}
                    className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-3 sm:px-5 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all disabled:opacity-50"
                    required
                  />
                  <span className="font-black text-gray-300 text-center text-[16px] sm:text-[18px]">@</span>
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
                          className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl pl-3 sm:pl-4 pr-7 sm:pr-8 font-black text-[13px] sm:text-[14px] outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer disabled:opacity-50"
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
                          placeholder="도메인 입력"
                          value={emailDomain}
                          onChange={(e) => {
                            setEmailDomain(e.target.value);
                            setCodeSent(false);
                            setIsEmailVerified(false);
                          }}
                          disabled={isEmailVerified}
                          className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-3 sm:px-4 pr-10 font-black text-[13px] sm:text-[14px] outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
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
                                className="px-4 py-3 font-black text-[13px] sm:text-[14px] hover:bg-gray-200 cursor-pointer transition-colors"
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
                    onClick={handleSendCode}
                    disabled={isSendingCode || isEmailVerified || !emailId}
                    className={subButtonStyle}
                  >
                    {isSendingCode ? '...' : isEmailVerified ? '완료' : '인증코드'}
                  </button>
                </div>

                {/* 이메일 인증코드 */}
                {codeSent && !isEmailVerified && (
                  <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_90px] gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="인증코드 6자리 입력"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      maxLength={6}
                      className="h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
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

              <button
                type="submit"
                disabled={!isEmailVerified}
                className="w-full h-[68px] sm:h-[72px] bg-[#1a1a1a] text-white rounded-2xl font-black text-[16px] sm:text-[17px] hover:bg-black transition-all uppercase tracking-[0.2em] shadow-2xl mt-6 cursor-pointer disabled:bg-gray-400"
              >
                계정 확인
              </button>
            </form>
          ) : (
            /* 2. 비밀번호 재설정 */
            <form onSubmit={handleResetSubmit} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">새 비밀번호</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  autoComplete="new-password"
                  placeholder="8자 이상, 대소문자/숫자/특수문자 포함"
                  className="w-full h-[60px] sm:h-[64px] bg-[#f3f4f6] rounded-2xl px-6 font-black text-[15px] sm:text-[16px] outline-none focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">비밀번호 확인</label>
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

              <button
                type="submit"
                disabled={isResetting}
                className="w-full h-[68px] sm:h-[72px] bg-[#1a1a1a] text-white rounded-2xl font-black text-[16px] sm:text-[17px] hover:bg-black transition-all uppercase tracking-[0.2em] shadow-2xl mt-6 cursor-pointer disabled:bg-gray-400"
              >
                {isResetting ? '갱신 중...' : '비밀번호 변경'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('verify'); setNewPassword(''); setConfirmPassword(''); }}
                className="w-full text-[11px] font-black text-gray-300 hover:text-black transition-colors uppercase tracking-widest pt-4 cursor-pointer"
              >
                이메일 인증으로 돌아가기
              </button>
            </form>
          )}
        </div>

        {/* 하단 네비게이션 링크 */}
        <div className="flex justify-center gap-6 sm:gap-8 pt-8 sm:pt-12 text-[10px] sm:text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">
          <Link href="/login" className="text-black hover:opacity-50 transition-colors cursor-pointer">로그인</Link>
          <Link href="/signup" className="text-black hover:opacity-50 transition-colors cursor-pointer">회원가입</Link>
        </div>
      </main>
    </div>
  );
}
