'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SupervisorProgressTable } from '@/components/sprint4/supervisor-progress-table';
import { getSupervisorProgress } from '@/services/project-progress.service';
import type { ProjectProgress } from '@/types/sprint4';

export default function SupervisorProgressPage() {
  const [progresses, setProgresses] = useState<ProjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setProgresses(await getSupervisorProgress());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải tiến độ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Theo dõi tiến độ</h1>
            <p className="mt-2 text-slate-600">GVHD xem và góp ý tiến độ của sinh viên mình hướng dẫn.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link>
        </div>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <SupervisorProgressTable progresses={progresses} onChanged={load} />
      </div>
    </>
  );
}
