'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardPenLine, Files } from 'lucide-react';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { ReviewerEvaluationForm } from '@/components/sprint5/reviewer-evaluation-form';
import { getMyReviewerAssignments } from '@/services/reviewers.service';
import type { ReviewerAssignment } from '@/types/sprint5';

export default function ReviewerAssignmentsPage() {
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>([]); const [tab, setTab] = useState<'PENDING' | 'COMPLETED'>('PENDING'); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  async function load() { setLoading(true); setError(''); try { setAssignments(await getMyReviewerAssignments()); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải phân công phản biện'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  const stats = useMemo(() => ({ total: assignments.length, pending: assignments.filter((item) => item.status === 'ASSIGNED').length, completed: assignments.filter((item) => item.status === 'COMPLETED').length }), [assignments]);
  return <div className="space-y-6"><PageHeader title="Hồ sơ phản biện" description="Xem báo cáo, slide và thông tin đề tài; lưu nháp cục bộ trước khi hoàn tất nhận xét, kết luận và điểm phản biện." /><div className="grid gap-4 sm:grid-cols-3"><SummaryStatCard label="Tổng phân công" value={stats.total} icon={Files} /><SummaryStatCard label="Chờ đánh giá" value={stats.pending} icon={ClipboardPenLine} tone="amber" onClick={() => setTab('PENDING')} /><SummaryStatCard label="Đã hoàn tất" value={stats.completed} icon={CheckCircle2} tone="emerald" onClick={() => setTab('COMPLETED')} /></div><div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2"><button type="button" onClick={() => setTab('PENDING')} className={tab === 'PENDING' ? 'tab-button-active' : 'tab-button'}>Chờ đánh giá ({stats.pending})</button><button type="button" onClick={() => setTab('COMPLETED')} className={tab === 'COMPLETED' ? 'tab-button-active' : 'tab-button'}>Đã hoàn tất ({stats.completed})</button></div><FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm sinh viên, đề tài hoặc GVHD..." />{error && <ErrorState message={error} onRetry={() => void load()} />}{loading ? <LoadingSkeleton rows={5} /> : <ReviewerEvaluationForm assignments={assignments} onChanged={load} tab={tab} search={search} />}</div>;
}
