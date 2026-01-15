'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Loader2, Pin } from 'lucide-react';
import { fetchWithAuth, API_URL } from '@/lib/apiClient';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  NOTICE: '공지',
  UPDATE: '업데이트',
  EVENT: '이벤트',
  MAINTENANCE: '점검',
};

export default function AdminNoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'NOTICE',
    isPinned: false,
    isPublished: true,
  });

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/notice?limit=100`);
      if (res.ok) {
        const response = await res.json();
        const data = response.data || response;
        setNotices(Array.isArray(data) ? data : (data.notices || []));
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/notice/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotices((prev) => prev.filter((notice) => notice.id !== id));
      } else {
        alert('삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const openCreateModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      category: 'NOTICE',
      isPinned: false,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      isPinned: notice.isPinned,
      isPublished: notice.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingNotice ? `${API_URL}/notice/${editingNotice.id}` : `${API_URL}/notice`;
      const method = editingNotice ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchNotices();
      } else {
        const data = await res.json();
        alert(`저장 실패: ${data.message || '오류 발생'}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('저장 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-black tracking-tighter text-black">공지사항 관리</h1>
            <p className="text-gray-400 text-[14px] mt-1">공지사항을 작성하고 관리합니다</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl font-bold text-[13px] hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            공지 작성
          </button>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto" />
          </div>
        ) : notices.length === 0 ? (
          <div className="p-12 text-center text-gray-400">등록된 공지사항이 없습니다</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {notice.isPinned && <Pin size={14} className="text-red-500" />}
                      <p className="font-bold text-black text-[14px]">{notice.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-medium text-gray-600">
                      {categoryLabels[notice.category] || notice.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                        notice.isPublished
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {notice.isPublished ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-500">
                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(notice)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
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
              {editingNotice ? '공지사항 수정' : '공지사항 작성'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium text-black outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                  내용 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full h-[200px] bg-gray-100 rounded-xl p-4 font-medium text-black outline-none focus:ring-2 focus:ring-black resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                    카테고리
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-[48px] bg-gray-100 rounded-xl px-4 font-medium text-black outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="NOTICE">공지</option>
                    <option value="UPDATE">업데이트</option>
                    <option value="EVENT">이벤트</option>
                    <option value="MAINTENANCE">점검</option>
                  </select>
                </div>
                <div className="space-y-3 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-[13px] font-medium">상단 고정</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-[13px] font-medium">공개</span>
                  </label>
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
                  {editingNotice ? '수정' : '작성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
