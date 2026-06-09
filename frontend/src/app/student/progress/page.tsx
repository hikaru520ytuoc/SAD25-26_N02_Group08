'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { StudentProgressForm } from '@/components/sprint4/student-progress-form';
import { StudentProgressList } from '@/components/sprint4/student-progress-list';
import { createProgress, getMyProgress } from '@/services/project-progress.service';
import type { ProgressFormValues } from '@/schemas/sprint4.schema';
import type { ProjectProgress } from '@/types/sprint4';

export default function StudentProgressPage() {
  const [progresses, setProgresses] = useState<ProjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setProgresses(await getMyProgress());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải tiến độ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(payload: ProgressFormValues) {
    await createProgress(payload);
    await load();
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Tiến độ đồ án</h1>
            <p className="mt-2 text-slate-600">Chỉ cập nhật tiến độ sau khi đề cương được GVHD duyệt.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link>
        </div>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <StudentProgressForm onSubmit={submit} />
        <StudentProgressList progresses={progresses} />
      </div>
    </AppShell>
  );
}
