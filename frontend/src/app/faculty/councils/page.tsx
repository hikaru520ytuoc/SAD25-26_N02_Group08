'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { CouncilForm } from '@/components/sprint6/council-form';
import { CouncilMemberForm } from '@/components/sprint6/council-member-form';
import { CouncilMemberTable } from '@/components/sprint6/council-member-table';
import { addCouncilMember, createCouncil, getCouncils } from '@/services/councils.service';
import type { CouncilMemberValues, CouncilValues } from '@/schemas/sprint6.schema';
import type { DefenseCouncil } from '@/types/sprint6';

export default function FacultyCouncilsPage() {
  const [items, setItems] = useState<DefenseCouncil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setItems(await getCouncils());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải hội đồng');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(values: CouncilValues) {
    await createCouncil(values);
    await load();
  }

  async function submitMember(councilId: string, values: CouncilMemberValues) {
    await addCouncilMember(councilId, values);
    await load();
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-slate-950">Quản lý hội đồng bảo vệ</h1><p className="mt-2 text-slate-600">Tạo hội đồng, thêm chủ tịch, thư ký và thành viên.</p></div>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link>
        </div>
        <CouncilForm onSubmit={submit} />
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <div className="space-y-4">
          {items.map((council) => (
            <div key={council.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-xl font-bold">{council.name}</h2><p className="mt-1 text-sm text-slate-500">ID: {council.id}</p><p className="mt-1 text-sm text-slate-500">Period: {council.projectPeriod?.name ?? council.projectPeriodId}</p></div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{council.status}</span>
              </div>
              <CouncilMemberTable members={council.members} />
              <CouncilMemberForm councilId={council.id} onSubmit={submitMember} />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
