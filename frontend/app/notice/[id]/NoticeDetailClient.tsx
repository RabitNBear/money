'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
}

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'NOTICE': return '공지';
    case 'UPDATE': return '업데이트';
    case 'EVENT': return '이벤트';
    case 'MAINTENANCE': return '점검';
    default: return '공지';
  }
};

export default function NoticeDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(`${API_URL}/notice/${id}`);
        if (res.ok) {
          const response = await res.json();
          const data = response.data || response;
          setNotice(data);
        } else if (res.status === 404) {
          setError('공지사항을 찾을 수 없습니다.');
        } else {
          setError('공지사항을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Failed to fetch notice:', err);
        setError('서버와 연결할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 font-bold">로딩 중...</p>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-white text-black font-sans">
        <main className="max-w-[900px] mx-auto px-8 pt-44 pb-20 text-center">
          <p className="text-gray-500 text-lg mb-8">{error || '공지사항을 찾을 수 없습니다.'}</p>
          <Link href="/notice">
            <button className="px-12 py-5 bg-[#1a1a1a] text-white text-[14px] font-black rounded-lg hover:bg-black transition-all uppercase tracking-widest cursor-pointer">
              목록으로
            </button>
          </Link>
        </main>
      </div>
    );
  }

  const formattedDate = new Date(notice.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '.').slice(0, -1);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <main className="max-w-[900px] mx-auto px-8 pt-44 pb-20">
        {/* 헤더 */}
        <header className="border-b-2 border-black pb-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-[#f3f4f6] text-gray-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
              {getCategoryLabel(notice.category)}
            </span>
            <span className="text-[14px] font-bold text-gray-300 italic">{formattedDate}</span>
          </div>
          <h1 className="text-[32px] font-black leading-tight tracking-tighter">
            {notice.title}
          </h1>
        </header>

        {/* 본문 */}
        <article className="py-16 text-[16px] leading-[1.8] text-gray-700 font-medium whitespace-pre-wrap border-b border-gray-100">
          {notice.content}
        </article>

        {/* LIST와 BACK 버튼 나란히 배치 */}
        <div className="mt-16 flex justify-center gap-4">
          <Link href="/notice">
            <button className="px-12 py-5 bg-[#1a1a1a] text-white text-[14px] font-black rounded-lg hover:bg-black transition-all uppercase tracking-widest cursor-pointer">
              목록으로
            </button>
          </Link>
          <button
            onClick={() => router.back()}
            className="px-12 py-5 bg-white border border-gray-200 text-gray-400 text-[14px] font-black rounded-lg hover:text-black hover:border-black transition-all uppercase tracking-widest cursor-pointer"
          >
            뒤로가기
          </button>
        </div>
      </main>
    </div>
  );
}
