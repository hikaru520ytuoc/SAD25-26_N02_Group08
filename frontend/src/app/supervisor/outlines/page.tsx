'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SupervisorOutlineTable } from '@/components/sprint4/supervisor-outline-table';
import { getSupervisorOutlines } from '@/services/outlines.service';
import type { Outline } from '@/types/sprint4';

export default function SupervisorOutlinesPage() {
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setOutlines(await getSupervisorOutlines(status));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đề cương');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [status]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Duyệt đề cương</h1>
            <p className="mt-2 text-slate-600">GVHD xem, duyệt hoặc yêu cầu sinh viên chỉnh sửa đề cương.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">Tất cả trạng thái</option>
          <option value="SUBMITTED">Đã nộp</option>
          <option value="NEEDS_REVISION">Cần chỉnh sửa</option>
          <option value="APPROVED">Đã duyệt</option>
        </select>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <SupervisorOutlineTable outlines={outlines} onChanged={load} />
      </div>
    </>
  );
}
