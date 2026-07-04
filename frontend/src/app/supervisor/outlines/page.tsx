'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileClock, Files } from 'lucide-react';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { SupervisorOutlineTable } from '@/components/sprint4/supervisor-outline-table';
import { getSupervisorOutlines } from '@/services/outlines.service';
import type { Outline } from '@/types/sprint4';

export default function SupervisorOutlinesPage() {
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [tab, setTab] = useState<'PENDING' | 'PROCESSED'>('PENDING');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() { setLoading(true); setError(''); try { setOutlines(await getSupervisorOutlines()); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải danh sách đề cương'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  const stats = useMemo(() => ({ total: outlines.length, pending: outlines.filter((item) => item.status === 'SUBMITTED').length, revision: outlines.filter((item) => item.status === 'NEEDS_REVISION').length, approved: outlines.filter((item) => item.status === 'APPROVED').length }), [outlines]);
  const visible = outlines.filter((item) => (tab === 'PENDING' ? item.status === 'SUBMITTED' : item.status !== 'SUBMITTED') && (!status || item.status === status));

  return <div className="space-y-6"><PageHeader title="Duyệt đề cương" description="Xem đầy đủ nội dung, file và lịch sử phiên bản trước khi phê duyệt hoặc yêu cầu sinh viên chỉnh sửa." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryStatCard label="Tổng đề cương" value={stats.total} icon={Files} /><SummaryStatCard label="Chờ duyệt" value={stats.pending} icon={FileClock} tone="amber" onClick={() => { setTab('PENDING'); setStatus(''); }} /><SummaryStatCard label="Cần chỉnh sửa" value={stats.revision} tone="rose" onClick={() => { setTab('PROCESSED'); setStatus('NEEDS_REVISION'); }} /><SummaryStatCard label="Đã duyệt" value={stats.approved} icon={CheckCircle2} tone="emerald" onClick={() => { setTab('PROCESSED'); setStatus('APPROVED'); }} /></div><div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2"><button type="button" onClick={() => setTab('PENDING')} className={tab === 'PENDING' ? 'tab-button-active' : 'tab-button'}>Chờ xử lý ({stats.pending})</button><button type="button" onClick={() => setTab('PROCESSED')} className={tab === 'PROCESSED' ? 'tab-button-active' : 'tab-button'}>Đã xử lý ({stats.revision + stats.approved})</button></div><FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm sinh viên hoặc tiêu đề đề cương..." resultCount={visible.length}><select value={status} onChange={(event) => setStatus(event.target.value)} className="field-input"><option value="">Tất cả trạng thái trong tab</option>{tab === 'PENDING' ? <option value="SUBMITTED">Chờ duyệt</option> : <><option value="NEEDS_REVISION">Cần chỉnh sửa</option><option value="APPROVED">Đã duyệt</option></>}</select></FilterBar>{error && <ErrorState message={error} onRetry={() => void load()} />}{loading ? <LoadingSkeleton rows={5} /> : <SupervisorOutlineTable outlines={visible} onChanged={load} search={search} />}</div>;
}
