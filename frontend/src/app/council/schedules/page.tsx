'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { DefenseScheduleTable } from '@/components/sprint6/defense-schedule-table';
import { getCouncilDefenseSchedules } from '@/services/defense-schedules.service';
import type { DefenseSchedule } from '@/types/sprint6';

export default function CouncilSchedulesPage() {
  const [items, setItems] = useState<DefenseSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try { setItems(await getCouncilDefenseSchedules()); }
      catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải lịch hội đồng'); }
      finally { setLoading(false); }
    }
    void load();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-slate-950">Lịch bảo vệ của hội đồng</h1><p className="mt-2 text-slate-600">Thành viên hội đồng xem lịch và hồ sơ sinh viên được phân công.</p></div><Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link></div>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <DefenseScheduleTable schedules={items} />
      </div>
    </AppShell>
  );
}
