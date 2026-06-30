'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { CouncilForm } from '@/components/sprint6/council-form';
import { CouncilMemberForm } from '@/components/sprint6/council-member-form';
import { CouncilMemberTable } from '@/components/sprint6/council-member-table';
import { addCouncilMember, createCouncil, getCouncils } from '@/services/councils.service';
import { getDefenseSchedules } from '@/services/defense-schedules.service';
import type { CouncilMemberValues, CouncilValues } from '@/schemas/sprint6.schema';
import type { DefenseCouncil, DefenseSchedule } from '@/types/sprint6';

function councilTopicWarning(count: number) {
  if (count < 4) return { text: `Chưa đủ 4 đề tài/sinh viên (${count}/4)`, className: 'bg-amber-50 text-amber-700 ring-amber-200', icon: AlertTriangle };
  if (count > 6) return { text: `Vượt quá 6 đề tài/sinh viên (${count}/6)`, className: 'bg-rose-50 text-rose-700 ring-rose-200', icon: AlertTriangle };
  return { text: `Hợp lệ ${count}/6 đề tài/sinh viên`, className: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 };
}

export default function FacultyCouncilsPage() {
  const [items, setItems] = useState<DefenseCouncil[]>([]);
  const [schedules, setSchedules] = useState<DefenseSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const [councils, defenseSchedules] = await Promise.all([getCouncils(), getDefenseSchedules()]);
      setItems(councils);
      setSchedules(defenseSchedules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải hội đồng');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const scheduleCountByCouncil = useMemo(() => {
    return schedules.reduce<Record<string, number>>((acc, schedule) => {
      acc[schedule.councilId] = (acc[schedule.councilId] ?? 0) + 1;
      return acc;
    }, {});
  }, [schedules]);

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
        <PageHeader title="Quản lý hội đồng bảo vệ" description="Một hội đồng nên có 4–6 đề tài/sinh viên. Số lượng này được tính từ các lịch bảo vệ gắn với hội đồng." />
        <CouncilForm onSubmit={submit} />
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        <div className="space-y-4">
          {items.map((council) => {
            const assignedCount = scheduleCountByCouncil[council.id] ?? 0;
            const warning = councilTopicWarning(assignedCount);
            const Icon = warning.icon;
            return (
              <div key={council.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">{council.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">Đợt: {council.projectPeriod?.name ?? council.projectPeriodId}</p>
                    <p className="mt-1 text-sm text-slate-500">Thành viên: {council.members?.length ?? 0}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={council.status} />
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${warning.className}`}><Icon className="h-3.5 w-3.5" /> {warning.text}</span>
                  </div>
                </div>
                <CouncilMemberTable members={council.members} />
                <CouncilMemberForm councilId={council.id} onSubmit={submitMember} />
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
