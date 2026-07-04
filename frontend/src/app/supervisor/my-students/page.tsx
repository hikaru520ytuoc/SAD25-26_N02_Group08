'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, GraduationCap, Layers3 } from 'lucide-react';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { SupervisorAssignmentTable } from '@/components/sprint3/supervisor-assignment-table';
import { getMyStudents } from '@/services/supervisor-assignments.service';
import type { SupervisorAssignment } from '@/types/sprint3';

export default function SupervisorMyStudentsPage() {
  const [items, setItems] = useState<SupervisorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [periodId, setPeriodId] = useState('');
  async function load() { setLoading(true); setError(null); try { setItems(await getMyStudents()); } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được sinh viên hướng dẫn'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  const periods = useMemo(() => Array.from(new Map(items.map((item) => [item.projectPeriod.id, item.projectPeriod])).values()), [items]);
  const visible = periodId ? items.filter((item) => item.projectPeriod.id === periodId) : items;

  return <div className="space-y-6"><PageHeader title="Sinh viên tôi hướng dẫn" description="Danh sách sinh viên đã được Khoa xác nhận GVHD chính thức. Mở chi tiết để xem đề tài, ngành, đợt và thông tin liên hệ." /><div className="grid gap-4 sm:grid-cols-3"><SummaryStatCard label="Tổng sinh viên" value={visible.length} icon={GraduationCap} /><SummaryStatCard label="Đề tài có sẵn" value={visible.filter((item) => Boolean(item.topic)).length} icon={BookOpenCheck} tone="blue" /><SummaryStatCard label="Đề tài đề xuất" value={visible.filter((item) => !item.topic).length} icon={Layers3} tone="violet" /></div><FilterBar><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã, tên sinh viên hoặc đề tài..." className="field-input min-w-[260px] flex-1" /><select value={periodId} onChange={(event) => setPeriodId(event.target.value)} className="field-input min-w-56"><option value="">Tất cả đợt đồ án</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}</select></FilterBar>{error && <ErrorState message={error} onRetry={() => void load()} />}{loading ? <LoadingSkeleton rows={5} /> : <SupervisorAssignmentTable items={visible} mode="supervisor" search={search} />}</div>;
}
