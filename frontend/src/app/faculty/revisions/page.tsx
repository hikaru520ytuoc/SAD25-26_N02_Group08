'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, FileClock, GitCompareArrows } from 'lucide-react';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FileCard } from '@/components/common/file-card';
import { FilterBar } from '@/components/common/filter-bar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { ReasonModal } from '@/components/common/reason-modal';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { approveRevision, getRevisions, requestRevisionChanges } from '@/services/revisions.service';
import type { RevisionRequest } from '@/types/sprint8';

export default function FacultyRevisionsPage() {
  const toast = useToast();
  const [items, setItems] = useState<RevisionRequest[]>([]);
  const [tab, setTab] = useState<'PENDING' | 'PROCESSED'>('PENDING');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<RevisionRequest | null>(null);
  const [approveTarget, setApproveTarget] = useState<RevisionRequest | null>(null);
  const [changesTarget, setChangesTarget] = useState<RevisionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  async function load() { setLoading(true); setError(''); try { setItems(await getRevisions()); } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được dữ liệu'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  const stats = useMemo(() => ({ total: items.length, pending: items.filter((item) => item.status === 'SUBMITTED').length, changes: items.filter((item) => item.status === 'NEEDS_CHANGES').length, approved: items.filter((item) => item.status === 'APPROVED').length }), [items]);
  const visible = items.filter((item) => tab === 'PENDING' ? item.status === 'SUBMITTED' : item.status !== 'SUBMITTED').filter((item) => { const keyword = search.trim().toLocaleLowerCase('vi'); const name = item.student?.user?.fullName ?? item.finalResult?.student?.user?.fullName ?? ''; const code = item.student?.studentCode ?? item.finalResult?.student?.studentCode ?? ''; return !keyword || [name, code, item.title].some((value) => value.toLocaleLowerCase('vi').includes(keyword)); });

  async function approve() { if (!approveTarget) return; setProcessing(true); try { const updated = await approveRevision(approveTarget.id); setItems((current) => current.map((item) => item.id === updated.id ? updated : item)); setSelected((current) => current?.id === updated.id ? updated : current); toast.success('Đã phê duyệt bản chỉnh sửa'); setApproveTarget(null); setTab('PROCESSED'); } catch (err) { toast.error('Không thể phê duyệt', err instanceof Error ? err.message : undefined); } finally { setProcessing(false); } }
  async function requestChanges(feedback: string) { if (!changesTarget) return; setProcessing(true); try { const updated = await requestRevisionChanges(changesTarget.id, { feedback }); setItems((current) => current.map((item) => item.id === updated.id ? updated : item)); setSelected((current) => current?.id === updated.id ? updated : current); toast.success('Đã yêu cầu sửa lại', 'Sinh viên sẽ nhận được phản hồi cụ thể.'); setChangesTarget(null); setTab('PROCESSED'); } catch (err) { toast.error('Không thể yêu cầu sửa lại', err instanceof Error ? err.message : undefined); } finally { setProcessing(false); } }

  return <div className="space-y-6">
    <PageHeader title="Kiểm tra bản chỉnh sửa sau bảo vệ" description="So sánh yêu cầu hội đồng, giải trình và các phiên bản file trước khi phê duyệt hoặc yêu cầu sinh viên sửa lại." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryStatCard label="Tổng yêu cầu" value={stats.total} /><SummaryStatCard label="Chờ duyệt" value={stats.pending} icon={FileClock} tone="amber" /><SummaryStatCard label="Cần sửa lại" value={stats.changes} tone="rose" /><SummaryStatCard label="Đã phê duyệt" value={stats.approved} icon={CheckCircle2} tone="emerald" /></div>
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2"><button type="button" onClick={() => setTab('PENDING')} className={tab === 'PENDING' ? 'tab-button-active' : 'tab-button'}>Chờ xử lý ({stats.pending})</button><button type="button" onClick={() => setTab('PROCESSED')} className={tab === 'PROCESSED' ? 'tab-button-active' : 'tab-button'}>Đã xử lý ({items.length - stats.pending})</button></div>
    <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm sinh viên hoặc yêu cầu chỉnh sửa..." resultCount={visible.length} />
    {error && <ErrorState message={error} onRetry={() => void load()} />}
    {loading ? <LoadingSkeleton rows={5} /> : visible.length === 0 ? <EmptyState title="Không có bản chỉnh sửa phù hợp" /> : <div className="grid gap-4 xl:grid-cols-2">{visible.map((item) => { const studentName = item.student?.user?.fullName ?? item.finalResult?.student?.user?.fullName ?? 'Sinh viên'; const studentCode = item.student?.studentCode ?? item.finalResult?.student?.studentCode ?? ''; const latest = item.submissions?.[0]; return <article key={item.id} className="section-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-slate-950">{studentCode} – {studentName}</h2><p className="mt-1 line-clamp-1 text-sm text-slate-500">{item.title}</p></div><StatusBadge value={item.status} /></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-slate-500">Phiên bản mới nhất:</span> <strong>{latest ? `Phiên bản ${latest.versionNumber}` : 'Chưa nộp'}</strong></p><p><span className="text-slate-500">Số lần nộp:</span> <strong>{item.submissions?.length ?? 0}</strong></p></div><div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelected(item)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button>{item.status === 'SUBMITTED' && <><button type="button" onClick={() => setChangesTarget(item)} className="secondary-button text-amber-700">Yêu cầu sửa lại</button><button type="button" onClick={() => setApproveTarget(item)} className="primary-button">Phê duyệt</button></>}</div></article>; })}</div>}

    <DetailDrawer open={Boolean(selected)} onClose={() => !processing && setSelected(null)} title={selected ? `${selected.student?.studentCode ?? selected.finalResult?.student?.studentCode ?? ''} – ${selected.student?.user?.fullName ?? selected.finalResult?.student?.user?.fullName ?? 'Chi tiết chỉnh sửa'}` : 'Chi tiết chỉnh sửa'} description={selected?.title} footer={selected?.status === 'SUBMITTED' ? <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setChangesTarget(selected)} className="secondary-button">Yêu cầu sửa lại</button><button type="button" onClick={() => setApproveTarget(selected)} className="primary-button">Phê duyệt</button></div> : undefined}>{selected && <div className="space-y-5"><section className="section-card"><div className="flex items-center justify-between"><h3 className="font-bold">Yêu cầu của hội đồng</h3><StatusBadge value={selected.status} /></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selected.description}</p>{selected.dueDate && <p className="mt-3 text-sm font-semibold text-amber-700">Hạn hoàn thành: {new Date(selected.dueDate).toLocaleDateString('vi-VN')}</p>}{selected.feedback && <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"><strong>Phản hồi gần nhất:</strong> {selected.feedback}</div>}</section><section className="section-card"><h3 className="flex items-center gap-2 font-bold"><GitCompareArrows className="h-5 w-5" />So sánh phiên bản</h3><div className="mt-4 grid gap-4 lg:grid-cols-2">{selected.submissions?.slice(0, 2).map((submission, index) => <div key={submission.id} className={`rounded-2xl border p-4 ${index === 0 ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200'}`}><div className="flex items-center justify-between"><p className="font-bold">Phiên bản {submission.versionNumber}</p><span className="text-xs text-slate-500">{index === 0 ? 'Hiện tại' : 'Trước đó'}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{submission.note || 'Không có giải trình.'}</p>{submission.reportFile ? <div className="mt-4"><FileCard file={{ ...submission.reportFile, versionNumber: submission.versionNumber }} /></div> : <p className="mt-3 text-sm text-slate-500">Không có file.</p>}</div>)}{!selected.submissions?.length && <p className="text-sm text-slate-500">Sinh viên chưa nộp bản chỉnh sửa.</p>}</div></section><section className="section-card"><h3 className="font-bold">Lịch sử phiên bản</h3><ol className="mt-4 space-y-3">{selected.submissions?.map((submission) => <li key={submission.id} className="flex gap-3 text-sm"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" /><div><p className="font-semibold">Phiên bản {submission.versionNumber}</p><p className="text-slate-500">{new Date(submission.submittedAt).toLocaleString('vi-VN')}</p></div></li>)}</ol></section></div>}</DetailDrawer>
    <ConfirmActionModal open={Boolean(approveTarget)} onClose={() => !processing && setApproveTarget(null)} onConfirm={approve} loading={processing} title="Phê duyệt bản chỉnh sửa" confirmLabel="Phê duyệt" description={approveTarget ? <>Phiên bản mới nhất của <strong>{approveTarget.student?.user?.fullName ?? approveTarget.finalResult?.student?.user?.fullName}</strong> sẽ được xác nhận và hồ sơ có thể chuyển sang bước lưu trữ.</> : null} />
    <ReasonModal open={Boolean(changesTarget)} onClose={() => !processing && setChangesTarget(null)} onSubmit={requestChanges} loading={processing} title="Yêu cầu sinh viên sửa lại" label="Nội dung chưa đạt" submitLabel="Gửi yêu cầu" />
  </div>;
}
