'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Trash2, Edit, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/lib/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface IPO {
  id: string;
  companyName: string;
  ticker?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  listingDate?: string;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  finalPrice?: number;
  leadUnderwriter?: string;
  status: 'UPCOMING' | 'SUBSCRIPTION' | 'COMPLETED' | 'LISTED';
}

const statusLabels: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: '예정', color: 'bg-gray-100 text-gray-600' },
  SUBSCRIPTION: { label: '청약중', color: 'bg-blue-100 text-blue-600' },
  COMPLETED: { label: '청약완료', color: 'bg-yellow-100 text-yellow-600' },
  LISTED: { label: '상장', color: 'bg-green-100 text-green-600' },
};

export default function AdminIPOPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIPO, setEditingIPO] = useState<IPO | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    ticker: '',
    subscriptionStart: '',
    subscriptionEnd: '',
    listingDate: '',
    priceRangeLow: '',
    priceRangeHigh: '',
    finalPrice: '',
    leadUnderwriter: '',
    status: 'UPCOMING',
  });

  const fetchIPOs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/ipo?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setIpos(data.data?.ipos || []);
      }
    } catch (error) {
      console.error('Failed to fetch IPOs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIPOs();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetchWithAuth(`${API_URL}/ipo/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(`동기화 완료: ${data.added}개 추가, ${data.updated}개 업데이트`);
        fetchIPOs();
      } else {
        setSyncResult(`동기화 실패: ${data.message || '오류 발생'}`);
      }
    } catch (error) {
      setSyncResult('동기화 중 오류가 발생했습니다');
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/ipo/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIpos((prev) => prev.filter((ipo) => ipo.id !== id));
      } else {
        alert('삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const openCreateModal = () => {
    setEditingIPO(null);
    setFormData({
      companyName: '',
      ticker: '',
      subscriptionStart: '',
      subscriptionEnd: '',
      listingDate: '',
      priceRangeLow: '',
      priceRangeHigh: '',
      finalPrice: '',
      leadUnderwriter: '',
      status: 'UPCOMING',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ipo: IPO) => {
    setEditingIPO(ipo);
    setFormData({
      companyName: ipo.companyName,
      ticker: ipo.ticker || '',
      subscriptionStart: ipo.subscriptionStart?.split('T')[0] || '',
      subscriptionEnd: ipo.subscriptionEnd?.split('T')[0] || '',
      listingDate: ipo.listingDate?.split('T')[0] || '',
      priceRangeLow: ipo.priceRangeLow?.toString() || '',
      priceRangeHigh: ipo.priceRangeHigh?.toString() || '',
      finalPrice: ipo.finalPrice?.toString() || '',
      leadUnderwriter: ipo.leadUnderwriter || '',
      status: ipo.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      companyName: formData.companyName,
      ticker: formData.ticker || undefined,
      subscriptionStart: formData.subscriptionStart || undefined,
      subscriptionEnd: formData.subscriptionEnd || undefined,
      listingDate: formData.listingDate || undefined,
      priceRangeLow: formData.priceRangeLow ? parseInt(formData.priceRangeLow) : undefined,
      priceRangeHigh: formData.priceRangeHigh ? parseInt(formData.priceRangeHigh) : undefined,
      finalPrice: formData.finalPrice ? parseInt(formData.finalPrice) : undefined,
      leadUnderwriter: formData.leadUnderwriter || undefined,
      status: formData.status,
    };

    try {
      const url = editingIPO ? `${API_URL}/ipo/${editingIPO.id}` : `${API_URL}/ipo`;
      const method = editingIPO ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchIPOs();
      } else {
        const data = await res.json();
        alert(`저장 실패: ${data.message || '오류 발생'}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('저장 중 오류가 발생했습니다');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return price.toLocaleString() + '원';
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-black tracking-tighter text-black">IPO 관리</h1>
            <p className="text-gray-400 text-[14px] mt-1">공모주 일정을 관리합니다</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-xl font-bold text-[13px] hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSyncing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              데이터 동기화
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl font-bold text-[13px] hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              IPO 추가
            </button>
          </div>
        </div>

        {syncResult && (
          <div
            className={`mt-4 p-4 rounded-xl text-[13px] font-medium ${
              syncResult.includes('완료') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {syncResult}
          </div>
        )}
      </div>

      {/* IPO 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto" />
          </div>
        ) : ipos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            등록된 IPO가 없습니다. 데이터 동기화 버튼을 눌러 자동으로 가져오세요.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  기업명
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  청약기간
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  공모가
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  상장일
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ipos.map((ipo) => (
                <tr key={ipo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-black text-[14px]">{ipo.companyName}</p>
                    {ipo.leadUnderwriter && (
                      <p className="text-[12px] text-gray-400">{ipo.leadUnderwriter}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-600">
                    {formatDate(ipo.subscriptionStart)} ~ {formatDate(ipo.subscriptionEnd)}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-600">
                    {ipo.finalPrice
                      ? formatPrice(ipo.finalPrice)
                      : ipo.priceRangeLow && ipo.priceRangeHigh
                        ? `${formatPrice(ipo.priceRangeLow)} ~ ${formatPrice(ipo.priceRangeHigh)}`
                        : '-'}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-600">
                    {formatDate(ipo.listingDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${statusLabels[ipo.status]?.color}`}
                    >
                      {statusLabels[ipo.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(ipo)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ipo.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[600px] rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-[20px] font-black mb-6">
              {editingIPO ? 'IPO 수정' : 'IPO 추가'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                  기업명 *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                    청약 시작일
                  </label>
                  <input
                    type="date"
                    value={formData.subscriptionStart}
                    onChange={(e) => setFormData({ ...formData, subscriptionStart: e.target.value })}
                    className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                    청약 종료일
                  </label>
                  <input
                    type="date"
                    value={formData.subscriptionEnd}
                    onChange={(e) => setFormData({ ...formData, subscriptionEnd: e.target.value })}
                    className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                  상장일
                </label>
                <input
                  type="date"
                  value={formData.listingDate}
                  onChange={(e) => setFormData({ ...formData, listingDate: e.target.value })}
                  className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                    공모가 하단
                  </label>
                  <input
                    type="number"
                    value={formData.priceRangeLow}
                    onChange={(e) => setFormData({ ...formData, priceRangeLow: e.target.value })}
                    className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                    공모가 상단
                  </label>
                  <input
                    type="number"
                    value={formData.priceRangeHigh}
                    onChange={(e) => setFormData({ ...formData, priceRangeHigh: e.target.value })}
                    className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                    확정 공모가
                  </label>
                  <input
                    type="number"
                    value={formData.finalPrice}
                    onChange={(e) => setFormData({ ...formData, finalPrice: e.target.value })}
                    className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                    대표 주간사
                  </label>
                  <input
                    type="text"
                    value={formData.leadUnderwriter}
                    onChange={(e) => setFormData({ ...formData, leadUnderwriter: e.target.value })}
                    className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                    상태
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="UPCOMING">예정</option>
                    <option value="SUBSCRIPTION">청약중</option>
                    <option value="COMPLETED">청약완료</option>
                    <option value="LISTED">상장</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-[52px] border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  {editingIPO ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
