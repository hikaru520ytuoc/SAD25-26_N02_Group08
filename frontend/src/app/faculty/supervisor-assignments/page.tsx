'use client';

import { useEffect, useMemo, useState } from 'react';
import { GraduationCap, UserCheck, UsersRound } from 'lucide-react';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { SupervisorAssignmentTable } from '@/components/sprint3/supervisor-assignment-table';
import { getSupervisorAssignments } from '@/services/supervisor-assignments.service';
import type { SupervisorAssignment } from '@/types/sprint3';

export default function FacultySupervisorAssignmentsPage() {
  const [items, setItems] = useState<SupervisorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [periodId, setPeriodId] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSupervisorAssignments();
      setItems(data);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Không tải được phân công GVHD');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const validItems = useMemo(
    () => items.filter((item) => item?.id && item.student?.id && item.supervisor?.id && item.projectPeriod?.id),
    [items],
  );
  const periods = useMemo(
    () => Array.from(new Map(validItems.map((item) => [item.projectPeriod.id, item.projectPeriod])).values()),
    [validItems],
  );
  const visible = periodId
    ? validItems.filter((item) => item.projectPeriod.id === periodId)
    : validItems;
  const supervisors = new Set(visible.map((item) => item.supervisor.id)).size;

  return <div className="space-y-6">
    <PageHeader title="Danh sách phân công GVHD" description="Theo dõi các phân công GVHD đã được Khoa xác nhận chính thức, kèm đề tài, đợt đồ án và thông tin sinh viên." />
    <div className="grid gap-4 sm:grid-cols-3"><SummaryStatCard label="Tổng phân công" value={visible.length} icon={GraduationCap} /><SummaryStatCard label="Sinh viên đang hướng dẫn" value={new Set(visible.map((item) => item.student.id)).size} icon={UserCheck} tone="blue" /><SummaryStatCard label="GVHD tham gia" value={supervisors} icon={UsersRound} tone="emerald" /></div>
    <FilterBar><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm sinh viên, GVHD, đề tài..." className="field-input min-w-[260px] flex-1" /><select value={periodId} onChange={(event) => setPeriodId(event.target.value)} className="field-input min-w-56"><option value="">Tất cả đợt đồ án</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}</select></FilterBar>
    {error && <ErrorState message={error} onRetry={() => void load()} />}
    {loading ? <LoadingSkeleton rows={5} /> : <SupervisorAssignmentTable items={visible} search={search} />}
  </div>;
}
