'use client';

import { CheckCircle2, Clock3, ListChecks, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { ReasonModal } from '@/components/common/reason-modal';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { TopicRegistrationCard } from '@/components/sprint3/topic-registration-card';
import { TopicRegistrationDetail } from '@/components/sprint3/topic-registration-detail';
import { getSupervisorRequests, supervisorAcceptRegistration, supervisorRejectRegistration } from '@/services/topic-registrations.service';
import type { TopicRegistration } from '@/types/sprint3';

type ActionState = { type: 'accept' | 'reject'; item: TopicRegistration } | null;

export default function SupervisorRegistrationRequestsPage() {
  const toast = useToast();
  const [items, setItems] = useState<TopicRegistration[]>([]);
  const [selected, setSelected] = useState<TopicRegistration | null>(null);
  const [action, setAction] = useState<ActionState>(null);
  const [tab, setTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      setItems(await getSupervisorRequests());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được yêu cầu hướng dẫn.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter((item) => item.supervisorResponseStatus === 'PENDING').length,
    accepted: items.filter((item) => item.supervisorResponseStatus === 'ACCEPTED').length,
    rejected: items.filter((item) => item.supervisorResponseStatus === 'REJECTED').length,
  }), [items]);

  const visible = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    const expected = tab === 'pending' ? 'PENDING' : tab === 'accepted' ? 'ACCEPTED' : 'REJECTED';
    return items.filter((item) => {
      if (item.supervisorResponseStatus !== expected) return false;
      if (!keyword) return true;
      return [item.student.studentCode, item.student.user.fullName, item.proposedTitle, item.topic?.title]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase('vi').includes(keyword));
    });
  }, [items, search, tab]);

  async function accept() {
    if (!action || action.type !== 'accept' || processingId) return;
    setProcessingId(action.item.id);
    try {
      const updated = await supervisorAcceptRegistration(action.item.id);
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setAction(null);
      setTab('accepted');
      toast.success('Đã đồng ý hướng dẫn', 'Hồ sơ đã chuyển sang Khoa để xác nhận chính thức.');
      await loadData(false);
    } catch (err) {
      toast.error('Không thể đồng ý hướng dẫn', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
    }
  }

  async function reject(reason: string) {
    if (!action || action.type !== 'reject' || processingId) return;
    setProcessingId(action.item.id);
    try {
      const updated = await supervisorRejectRegistration(action.item.id, reason);
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setAction(null);
      setTab('rejected');
      toast.success('Đã từ chối hướng dẫn', 'Sinh viên đã được thông báo kèm lý do.');
      await loadData(false);
    } catch (err) {
      toast.error('Không thể từ chối hướng dẫn', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Yêu cầu hướng dẫn" description="Xem nội dung đề xuất và phản hồi yêu cầu hướng dẫn của sinh viên." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard label="Tổng yêu cầu" value={stats.total} icon={ListChecks} />
        <SummaryStatCard label="Chờ phản hồi" value={stats.pending} icon={Clock3} tone="amber" onClick={() => setTab('pending')} />
        <SummaryStatCard label="Đã đồng ý" value={stats.accepted} icon={CheckCircle2} tone="emerald" onClick={() => setTab('accepted')} />
        <SummaryStatCard label="Đã từ chối" value={stats.rejected} icon={XCircle} tone="rose" onClick={() => setTab('rejected')} />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
        {([['pending', `Chờ phản hồi (${stats.pending})`], ['accepted', `Đã đồng ý (${stats.accepted})`], ['rejected', `Đã từ chối (${stats.rejected})`]] as const).map(([value, label]) => (
          <button key={value} type="button" onClick={() => setTab(value)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === value ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>
        ))}
      </div>
      <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm theo mã, tên sinh viên hoặc đề tài..." resultCount={visible.length} />
      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={4} /> : visible.length === 0 ? <EmptyState title="Không có yêu cầu trong nhóm này" /> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((item) => (
            <TopicRegistrationCard key={item.id} item={item} onView={() => setSelected(item)} actions={item.supervisorResponseStatus === 'PENDING' ? <>
              <button type="button" disabled={processingId === item.id} onClick={() => setAction({ type: 'reject', item })} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Từ chối</button>
              <button type="button" disabled={processingId === item.id} onClick={() => setAction({ type: 'accept', item })} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Đồng ý</button>
            </> : undefined} />
          ))}
        </div>
      )}

      <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title="Chi tiết yêu cầu hướng dẫn" description={selected ? `${selected.student.studentCode} – ${selected.student.user.fullName}` : undefined}>
        {selected && <TopicRegistrationDetail item={selected} />}
      </DetailDrawer>
      <ConfirmActionModal open={action?.type === 'accept'} onClose={() => !processingId && setAction(null)} onConfirm={accept} loading={Boolean(processingId)} title="Đồng ý hướng dẫn" confirmLabel="Đồng ý" description={action?.type === 'accept' ? <>Bạn xác nhận đồng ý hướng dẫn sinh viên <strong>{action.item.student.studentCode} – {action.item.student.user.fullName}</strong> với đề tài <strong>{action.item.proposedTitle ?? action.item.topic?.title}</strong>. Hồ sơ sẽ chuyển sang Khoa xử lý.</> : null} />
      <ReasonModal open={action?.type === 'reject'} onClose={() => !processingId && setAction(null)} onSubmit={reject} loading={Boolean(processingId)} title="Từ chối hướng dẫn" description={action?.type === 'reject' ? `Lý do sẽ được gửi đến ${action.item.student.user.fullName}.` : undefined} submitLabel="Từ chối hướng dẫn" />
    </div>
  );
}
