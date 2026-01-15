'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      if (!token) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const user = await res.json();
          if (user.role === 'ADMIN') {
            setIsAdmin(true);
          } else {
            alert('관리자 권한이 필요합니다.');
            router.push('/');
          }
        } else {
          alert('로그인이 필요합니다.');
          router.push('/login');
        }
      } catch {
        alert('인증 확인 중 오류가 발생했습니다.');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
}
