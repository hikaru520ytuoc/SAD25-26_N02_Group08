'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, MessageSquareText, UsersRound } from 'lucide-react';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FileCard } from '@/components/common/file-card';
import { FilterBar } from '@/components/common/filter-bar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { addProgressComment, getSupervisorProgress } from '@/services/project-progress.service';
import type { ProjectProgress } from '@/types/sprint4';

type StudentGroup = { studentId: string; student: ProjectProgress['student']; items: ProjectProgress[]; latest: ProjectProgress };

export default function SupervisorProgressPage() {
  const toast = useToast();
  const [progresses, setProgresses] = useState<ProjectProgress[]>([]);
  const [selected, setSelected] = useState<StudentGroup | null>(null);
  const [comment, setComment] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'PENDING' | 'REVIEWED'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function load() { setLoading(true); setError(''); try { setProgresses(await getSupervisorProgress()); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải tiến độ'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);

  const groups = useMemo<StudentGroup[]>(() => {
    const map = new Map<string, ProjectProgress[]>();
    progresses.forEach((item) => map.set(item.student.id, [...(map.get(item.student.id) ?? []), item]));
    return Array.from(map.entries()).map(([studentId, items]) => {
      const sorted = [...items].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      return { studentId, student: sorted[0].student, items: sorted, latest: sorted[0] };
    });
  }, [progresses]);
  const pending = groups.filter((group) => group.latest.status === 'SUBMITTED').length;
  const filtered = groups.filter((group) => group.latest.status === (tab === 'PENDING' ? 'SUBMITTED' : 'REVIEWED')).filter((group) => [group.student.studentCode, group.student.user.fullName, group.latest.title].some((value) => value.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'))));

  async function submitComment() {
    if (!selected) return;
    const normalized = comment.trim();
    if (!normalized) { toast.error('Chưa có nội dung phản hồi', 'Vui lòng nhập góp ý cụ thể trước khi gửi.'); return; }
    setSubmitting(true);
    try {
      await addProgressComment(selected.latest.id, { comment: normalized });
      toast.success('Đã gửi phản hồi tiến độ', `${selected.student.studentCode} – ${selected.student.user.fullName}`);
      setComment('');
      await load();
      setSelected(null);
      setTab('REVIEWED');
    } catch (err) { toast.error('Không thể gửi phản hồi', err instanceof Error ? err.message : undefined); }
    finally { setSubmitting(false); }
  }

  return <div className="space-y-6">
    <PageHeader title="Theo dõi tiến độ" description="Theo dõi báo cáo gần nhất của từng sinh viên, xem toàn bộ timeline và gửi phản hồi trực tiếp cho lần cập nhật đang chờ." />
    <div className="grid gap-4 sm:grid-cols-3"><SummaryStatCard label="Tổng sinh viên" value={groups.length} icon={UsersRound} /><SummaryStatCard label="Chờ phản hồi" value={pending} icon={MessageSquareText} tone="amber" onClick={() => setTab('PENDING')} /><SummaryStatCard label="Đã phản hồi" value={groups.length - pending} tone="emerald" onClick={() => setTab('REVIEWED')} /></div>
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2"><button type="button" onClick={() => setTab('PENDING')} className={tab === 'PENDING' ? 'tab-button-active' : 'tab-button'}>Chờ phản hồi ({pending})</button><button type="button" onClick={() => setTab('REVIEWED')} className={tab === 'REVIEWED' ? 'tab-button-active' : 'tab-button'}>Đã phản hồi ({groups.length - pending})</button></div>
    <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm sinh viên hoặc tiêu đề cập nhật..." resultCount={filtered.length} />
    {error && <ErrorState message={error} onRetry={() => void load()} />}
    {loading ? <LoadingSkeleton rows={5} /> : filtered.length === 0 ? <EmptyState title="Chưa có cập nhật phù hợp" description="Các báo cáo tiến độ của sinh viên sẽ hiển thị tại đây." /> : <div className="grid gap-4 xl:grid-cols-2">{filtered.map((group) => <article key={group.studentId} className="section-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-slate-950">{group.student.studentCode} – {group.student.user.fullName}</h2><p className="mt-1 text-sm text-slate-500">Cập nhật gần nhất: {group.latest.title}</p></div><StatusBadge value={group.latest.status} /></div><div className="mt-4"><div className="mb-2 flex items-center justify-between text-sm"><span className="text-slate-500">Tiến độ gần nhất</span><strong>{group.latest.progressPercent ?? 0}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, group.latest.progressPercent ?? 0))}%` }} /></div></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-sm text-slate-500">{group.items.length} lần cập nhật</span><button type="button" onClick={() => { setSelected(group); setComment(''); }} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button></div></article>)}</div>}

    <DetailDrawer open={Boolean(selected)} onClose={() => !submitting && setSelected(null)} title={selected ? `${selected.student.studentCode} – ${selected.student.user.fullName}` : 'Chi tiết tiến độ'} description="Timeline cập nhật và phản hồi của GVHD." footer={selected?.latest.status === 'SUBMITTED' ? <div className="space-y-3"><label className="block text-sm font-semibold text-slate-800">Phản hồi cho cập nhật gần nhất<textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder="Nêu nhận xét, vấn đề cần khắc phục và công việc tiếp theo..." className="mt-2 field-input w-full resize-y" /></label><div className="flex justify-end"><button type="button" disabled={submitting} onClick={submitComment} className="primary-button disabled:opacity-50">{submitting ? 'Đang gửi...' : 'Gửi phản hồi'}</button></div></div> : undefined}>
      {selected && <div className="space-y-4">{selected.items.map((item, index) => <section key={item.id} className="section-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">Báo cáo tiến độ lần {selected.items.length - index}</h3><p className="mt-1 text-sm text-slate-500">{new Date(item.submittedAt).toLocaleString('vi-VN')}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{item.progressPercent ?? 0}%</span><StatusBadge value={item.status} /></div></div><h4 className="mt-4 font-semibold text-slate-900">{item.title}</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.content}</p>{item.fileDocument && <div className="mt-4"><FileCard file={item.fileDocument} /></div>}{item.comments.length > 0 && <div className="mt-4 space-y-2 border-t border-slate-100 pt-4"><p className="text-sm font-semibold">Phản hồi</p>{item.comments.map((entry) => <div key={entry.id} className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900"><p>{entry.comment}</p><p className="mt-1 text-xs text-emerald-700">{entry.commenter.fullName} · {new Date(entry.createdAt).toLocaleString('vi-VN')}</p></div>)}</div>}</section>)}</div>}
    </DetailDrawer>
  </div>;
}
