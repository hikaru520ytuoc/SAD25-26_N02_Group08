'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { SupervisorDefenseTable } from '@/components/sprint5/supervisor-defense-table';
import { getSupervisorDefenseRegistrations } from '@/services/defense-registrations.service';
import type { DefenseRegistration } from '@/types/sprint5';

export default function SupervisorDefenseRegistrationsPage() {
  const [items, setItems] = useState<DefenseRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setItems(await getSupervisorDefenseRegistrations());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ bảo vệ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">GVHD duyệt điều kiện bảo vệ</h1>
            <p className="mt-2 text-slate-600">Xem hồ sơ, tải báo cáo/slide, nhập điểm hướng dẫn và xác nhận điều kiện bảo vệ.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link>
        </div>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <SupervisorDefenseTable items={items} onChanged={load} />
      </div>
    </AppShell>
  );
}
