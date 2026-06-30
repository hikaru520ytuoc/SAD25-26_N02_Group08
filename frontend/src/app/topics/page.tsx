'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopicTable } from '@/components/sprint2/topic-table';
import { clearAccessToken } from '@/lib/auth-storage';
import { getMe } from '@/services/auth.service';
import { getPublishedTopics } from '@/services/topics.service';
import type { Topic } from '@/types/sprint2';

export default function StudentTopicsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const me = await getMe();
      if (!me.roles.includes('STUDENT') && !me.roles.includes('ADMIN') && !me.roles.includes('FACULTY_MANAGER')) {
        setError('Bạn không có quyền truy cập màn hình này.');
        return;
      }
      setItems(await getPublishedTopics());
    } catch {
      clearAccessToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Danh sách đề tài đã công bố</h1>
          <p className="mt-2 text-slate-600">Sprint 2 chỉ cho sinh viên xem đề tài. Đăng ký đề tài sẽ triển khai ở Sprint 3.</p>
        </div>
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {loading ? <div className="rounded-3xl bg-white p-8">Đang tải...</div> : <TopicTable topics={items} mode="student" />}
      </div>
    </>
  );
}
