'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { DefenseScheduleForm } from '@/components/sprint6/defense-schedule-form';
import { DefenseScheduleTable } from '@/components/sprint6/defense-schedule-table';
import { createDefenseSchedule, getDefenseSchedules } from '@/services/defense-schedules.service';
import type { DefenseScheduleValues } from '@/schemas/sprint6.schema';
import type { DefenseSchedule } from '@/types/sprint6';

export default function FacultyDefenseSchedulesPage() {
  const [items, setItems] = useState<DefenseSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setItems(await getDefenseSchedules());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch bảo vệ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(values: DefenseScheduleValues) {
    await createDefenseSchedule(values);
    await load();
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-slate-950">Lập lịch bảo vệ</h1><p className="mt-2 text-slate-600">Chỉ xếp lịch cho hồ sơ đã READY_FOR_COUNCIL hoặc APPROVED_BY_REVIEWER.</p></div><Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link></div>
        <DefenseScheduleForm onSubmit={submit} />
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <DefenseScheduleTable schedules={items} />
      </div>
    </AppShell>
  );
}
