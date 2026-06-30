'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopicTable } from '@/components/sprint2/topic-table';
import { clearAccessToken } from '@/lib/auth-storage';
import { getMe } from '@/services/auth.service';
import { approveTopic, getTopics, publishTopic, rejectTopic } from '@/services/topics.service';
import type { Topic, TopicStatus } from '@/types/sprint2';

export default function FacultyTopicsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Topic[]>([]);
  const [status, setStatus] = useState<TopicStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(nextStatus = status) {
    try {
      setError(null);
      const me = await getMe();
      if (!me.roles.includes('FACULTY_MANAGER') && !me.roles.includes('ADMIN')) {
        setError('Bạn không có quyền truy cập màn hình này.');
        return;
      }
      setItems(await getTopics(nextStatus || undefined));
    } catch {
      clearAccessToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id: string) { await approveTopic(id); await load(); }
  async function handlePublish(id: string) { await publishTopic(id); await load(); }
  async function handleReject(id: string) {
    const reason = window.prompt('Nhập lý do từ chối đề tài');
    if (!reason) return;
    await rejectTopic(id, reason);
    await load();
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Duyệt và công bố đề tài</h1>
          <p className="mt-2 text-slate-600">Faculty Manager duyệt, từ chối hoặc công bố đề tài.</p>
        </div>
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <label className="text-sm font-semibold text-slate-700">
            Lọc trạng thái
            <select
              value={status}
              onChange={(event) => {
                const value = event.target.value as TopicStatus | '';
                setStatus(value);
                load(value);
              }}
              className="ml-3 rounded-xl border px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </label>
        </div>
        {loading ? <div className="rounded-3xl bg-white p-8">Đang tải...</div> : <TopicTable topics={items} mode="faculty" onApprove={handleApprove} onReject={handleReject} onPublish={handlePublish} />}
      </div>
    </>
  );
}
