'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, FileWarning } from 'lucide-react';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { SupervisorDefenseTable } from '@/components/sprint5/supervisor-defense-table';
import { getSupervisorDefenseRegistrations } from '@/services/defense-registrations.service';
import type { DefenseRegistration } from '@/types/sprint5';

export default function SupervisorDefenseRegistrationsPage() {
  const [items, setItems] = useState<DefenseRegistration[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [search, setSearch] = useState(''); const [tab, setTab] = useState<'PENDING' | 'PROCESSED'>('PENDING');
  async function load() { setLoading(true); setError(''); try { setItems(await getSupervisorDefenseRegistrations()); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ bảo vệ'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  const stats = useMemo(() => ({ total: items.length, pending: items.filter((item) => ['SUBMITTED', 'NEEDS_REVISION'].includes(item.status)).length, approved: items.filter((item) => ['APPROVED_BY_SUPERVISOR', 'SENT_TO_REVIEWER', 'APPROVED_BY_REVIEWER', 'READY_FOR_COUNCIL'].includes(item.status)).length, revision: items.filter((item) => ['NEEDS_REVISION', 'REJECTED_BY_SUPERVISOR'].includes(item.status)).length }), [items]);
  const visible = items.filter((item) => tab === 'PENDING' ? ['SUBMITTED', 'NEEDS_REVISION'].includes(item.status) : !['SUBMITTED', 'NEEDS_REVISION'].includes(item.status));
  return <div className="space-y-6"><PageHeader title="Xác nhận hồ sơ bảo vệ" description="Kiểm tra báo cáo, slide và các tài liệu liên quan; nhập điểm GVHD trong bước xác nhận hoặc yêu cầu sinh viên bổ sung với lý do cụ thể." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryStatCard label="Tổng hồ sơ" value={stats.total} icon={ClipboardCheck} /><SummaryStatCard label="Chờ kiểm tra" value={stats.pending} tone="amber" /><SummaryStatCard label="Đã xác nhận" value={stats.approved} icon={CheckCircle2} tone="emerald" /><SummaryStatCard label="Cần bổ sung" value={stats.revision} icon={FileWarning} tone="rose" /></div><div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2"><button type="button" onClick={() => setTab('PENDING')} className={tab === 'PENDING' ? 'tab-button-active' : 'tab-button'}>Chờ xử lý ({stats.pending})</button><button type="button" onClick={() => setTab('PROCESSED')} className={tab === 'PROCESSED' ? 'tab-button-active' : 'tab-button'}>Đã xử lý ({stats.total - stats.pending})</button></div><FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm sinh viên hoặc tên đồ án..." resultCount={visible.length} />{error && <ErrorState message={error} onRetry={() => void load()} />}{loading ? <LoadingSkeleton rows={5} /> : <SupervisorDefenseTable items={visible} onChanged={load} search={search} />}</div>;
}
