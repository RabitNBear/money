'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (error) {
      alert(`로그인 실패: ${error}`);
      router.push('/login');
      return;
    }

    if (success === 'true' && accessToken && refreshToken) {
      // iOS Safari ITP 대응: 프론트엔드에서 직접 쿠키 설정
      const isProduction = window.location.hostname !== 'localhost';
      const cookieOptions = isProduction
        ? 'path=/; secure; samesite=strict'
        : 'path=/; samesite=lax';

      // Access Token: 15분 (900초)
      document.cookie = `accessToken=${accessToken}; max-age=900; ${cookieOptions}`;
      // Refresh Token: 7일 (604800초)
      document.cookie = `refreshToken=${refreshToken}; max-age=604800; ${cookieOptions}`;

      // 헤더에 로그인 상태 알림
      window.dispatchEvent(new Event('authChange'));

      // 메인 페이지로 이동
      router.push('/');
    } else if (success === 'true') {
      // 토큰 없이 success만 온 경우 (기존 방식 호환)
      window.dispatchEvent(new Event('authChange'));
      router.push('/');
    } else {
      alert('로그인 정보를 받지 못했습니다.');
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black dark:border-t-white rounded-full animate-spin"></div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
