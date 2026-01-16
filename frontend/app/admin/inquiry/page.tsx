'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { fetchWithAuth, API_URL } from '@/lib/apiClient';

interface Inquiry {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  answer?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: '답변대기', color: 'bg-red-100 text-red-600' },
  IN_PROGRESS: { label: '처리중', color: 'bg-yellow-100 text-yellow-600' },
  RESOLVED: { label: '답변완료', color: 'bg-green-100 text-green-600' },
};

const categoryLabels: Record<string, string> = {
  GENERAL: '일반',
  BUG: '버그신고',
  FEATURE: '기능요청',
  ACCOUNT: '계정',
  OTHER: '기타',
};

export default function AdminInquiryPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '100');
      if (filter) params.append('status', filter);

      const res = await fetchWithAuth(`${API_URL}/inquiry/admin/all?${params.toString()}`);
      if (res.ok) {
        const response = await res.json();
        const data = response.data || response;
        // 응답이 배열인지 확인 (에러 객체일 수 있음)
        const inquiriesArray = Array.isArray(data.inquiries) ? data.inquiries :
                               (Array.isArray(data) ? data : []);
        setInquiries(inquiriesArray);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  const openAnswerModal = async (inquiry: Inquiry) => {
    // 상세 조회
    try {
      const res = await fetchWithAuth(`${API_URL}/inquiry/admin/${inquiry.id}`);
      if (res.ok) {
        const response = await res.json();
        const data = response.data || response;
        setSelectedInquiry(data);
        setAnswer(data.answer || '');
      } else {
        // API 실패 시 기존 inquiry 데이터 사용
        setSelectedInquiry(inquiry);
        setAnswer(inquiry.answer || '');
      }
    } catch (error) {
      console.error('Failed to fetch inquiry detail:', error);
      setSelectedInquiry(inquiry);
      setAnswer(inquiry.answer || '');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !answer.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/inquiry/${selectedInquiry.id}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });

      if (res.ok) {
        setSelectedInquiry(null);
        setAnswer('');
        fetchInquiries();
      } else {
        const data = await res.json();
        alert(`답변 등록 실패: ${data.message || '오류 발생'}`);
      }
    } catch (error) {
      console.error('Answer failed:', error);
      alert('답변 등록 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filters = [
    { label: '전체', value: '' },
    { label: '답변대기', value: 'PENDING' },
    { label: '처리중', value: 'IN_PROGRESS' },
    { label: '답변완료', value: 'RESOLVED' },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-[24px] font-black tracking-tighter text-black">문의 답변 관리</h1>
        <p className="text-gray-400 text-[14px] mt-1">고객 문의에 답변합니다</p>

        {/* 필터 */}
        <div className="flex gap-2 mt-6">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-colors ${
                filter === f.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 문의 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            {filter ? '해당 상태의 문의가 없습니다' : '등록된 문의가 없습니다'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openAnswerModal(inquiry)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${statusLabels[inquiry.status]?.color}`}
                      >
                        {statusLabels[inquiry.status]?.label}
                      </span>
                      <span className="text-[12px] text-gray-400">
                        {categoryLabels[inquiry.category] || inquiry.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-black text-[15px] mb-1">{inquiry.title}</h3>
                    <p className="text-[13px] text-gray-500 line-clamp-2">{inquiry.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-[12px] text-gray-400">
                      <span>{inquiry.user?.name || '익명'}</span>
                      <span>{new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                  <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                    <MessageSquare size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 답변 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedInquiry(null)}
          />
          <div className="relative bg-white w-full max-w-[700px] rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-black">문의 답변</h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${statusLabels[selectedInquiry.status]?.color}`}
              >
                {statusLabels[selectedInquiry.status]?.label}
              </span>
            </div>

            {/* 문의 내용 */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[12px] font-bold text-gray-400">
                  {categoryLabels[selectedInquiry.category] || selectedInquiry.category}
                </span>
                <span className="text-[12px] text-gray-400">
                  {new Date(selectedInquiry.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <h3 className="font-bold text-black text-[16px] mb-3">{selectedInquiry.title}</h3>
              <p className="text-[14px] text-gray-600 whitespace-pre-wrap">
                {selectedInquiry.content}
              </p>
              {selectedInquiry.user && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-[12px] text-gray-400">
                    작성자: {selectedInquiry.user.name} ({selectedInquiry.user.email})
                  </p>
                </div>
              )}
            </div>

            {/* 기존 답변 */}
            {selectedInquiry.answer && selectedInquiry.status === 'RESOLVED' && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <p className="text-[12px] font-bold text-blue-500 mb-2">등록된 답변</p>
                <p className="text-[14px] text-gray-700 whitespace-pre-wrap">
                  {selectedInquiry.answer}
                </p>
              </div>
            )}

            {/* 답변 입력 */}
            <form onSubmit={handleSubmitAnswer}>
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                  답변 작성
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="답변 내용을 입력하세요"
                  className="w-full h-[150px] bg-gray-100 rounded-xl p-4 font-medium text-black placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="flex-1 h-[52px] border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !answer.trim()}
                  className="flex-1 h-[52px] bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  답변 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
