'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StudentOutlineForm } from '@/components/sprint4/student-outline-form';
import { StudentOutlineStatusCard } from '@/components/sprint4/student-outline-status-card';
import { createOutline, getMyOutline, resubmitOutline } from '@/services/outlines.service';
import type { Outline } from '@/types/sprint4';
import type { OutlineFormValues } from '@/schemas/sprint4.schema';

export default function StudentOutlinePage() {
  const [outline, setOutline] = useState<Outline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setOutline(await getMyOutline());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải đề cương');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(payload: OutlineFormValues) {
    if (outline?.status === 'NEEDS_REVISION') {
      await resubmitOutline(outline.id, payload);
    } else {
      await createOutline(payload);
    }
    await load();
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Nộp đề cương</h1>
            <p className="mt-2 text-slate-600">Chỉ sinh viên đã có GVHD chính thức mới nộp được đề cương.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link>
        </div>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <StudentOutlineStatusCard outline={outline} />
        <StudentOutlineForm outline={outline} onSubmit={submit} />
      </div>
    </>
  );
}
