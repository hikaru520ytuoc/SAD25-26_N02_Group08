'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopicForm } from '@/components/sprint2/topic-form';
import { TopicTable } from '@/components/sprint2/topic-table';
import { clearAccessToken } from '@/lib/auth-storage';
import { getMe } from '@/services/auth.service';
import { createTopic, getMyTopics, submitTopic, type TopicInput } from '@/services/topics.service';
import type { Topic } from '@/types/sprint2';

export default function SupervisorTopicsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const me = await getMe();
      if (!me.roles.includes('SUPERVISOR')) {
        setError('Bạn không có quyền truy cập màn hình này.');
        return;
      }
      setItems(await getMyTopics());
    } catch {
      clearAccessToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(input: TopicInput) {
    setSaving(true);
    try {
      await createTopic(input);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đề tài');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitTopic(id: string) {
    try {
      await submitTopic(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi duyệt đề tài');
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Đề tài của giảng viên hướng dẫn</h1>
          <p className="mt-2 text-slate-600">Supervisor tạo đề tài và gửi Khoa/Trưởng ngành xét duyệt.</p>
        </div>
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        <TopicForm onSubmit={handleCreate} loading={saving} />
        {loading ? <div className="rounded-3xl bg-white p-8">Đang tải...</div> : <TopicTable topics={items} mode="supervisor" onSubmitTopic={handleSubmitTopic} />}
      </div>
    </>
  );
}
