'use client';

import { BookCheck, BookOpen, Clock3, Megaphone, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { ReasonModal } from '@/components/common/reason-modal';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { TopicTable } from '@/components/sprint2/topic-table';
import { approveTopic, getTopics, publishTopic, rejectTopic } from '@/services/topics.service';
import type { Topic } from '@/types/sprint2';

type ConfirmState = { type: 'approve' | 'publish'; topic: Topic } | null;

export default function FacultyTopicsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'processed'>('pending');
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [rejectTarget, setRejectTarget] = useState<Topic | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setItems(await getTopics());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đề tài.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, []);

  const counts = useMemo(() => ({ total: items.length, pending: items.filter((item) => item.status === 'SUBMITTED').length, approved: items.filter((item) => item.status === 'APPROVED').length, published: items.filter((item) => item.status === 'PUBLISHED').length, rejected: items.filter((item) => item.status === 'REJECTED').length }), [items]);
  const visible = items.filter((item) => tab === 'pending' ? item.status === 'SUBMITTED' : item.status !== 'SUBMITTED');

  async function runConfirm() {
    if (!confirm) return;
    setActionLoadingId(confirm.topic.id);
    try {
      const updated = confirm.type === 'approve' ? await approveTopic(confirm.topic.id) : await publishTopic(confirm.topic.id);
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast.success(confirm.type === 'approve' ? 'Đã phê duyệt đề tài' : 'Đã công bố đề tài', confirm.type === 'publish' ? 'Sinh viên trong đợt có thể xem và đăng ký đề tài này.' : undefined);
      setConfirm(null);
    } catch (err) {
      toast.error('Thao tác không thành công', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function runReject(reason: string) {
    if (!rejectTarget) return;
    setActionLoadingId(rejectTarget.id);
    try {
      const updated = await rejectTopic(rejectTarget.id, reason);
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setRejectTarget(null);
      toast.success('Đã từ chối đề tài', 'Lý do đã được lưu để giảng viên chỉnh sửa và gửi duyệt lại.');
    } catch (err) {
      toast.error('Không thể từ chối đề tài', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader title="Duyệt và công bố đề tài" description="Xem nội dung đầy đủ, phê duyệt, từ chối có lý do và công bố đề tài theo đúng từng trạng thái." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryStatCard label="Tổng đề tài" value={counts.total} icon={BookOpen} />
        <SummaryStatCard label="Chờ xử lý" value={counts.pending} icon={Clock3} tone="amber" />
        <SummaryStatCard label="Đã duyệt" value={counts.approved} icon={BookCheck} tone="blue" />
        <SummaryStatCard label="Đã công bố" value={counts.published} icon={Megaphone} tone="emerald" />
        <SummaryStatCard label="Đã từ chối" value={counts.rejected} icon={XCircle} tone="rose" />
      </div>
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <button type="button" onClick={() => setTab('pending')} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === 'pending' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Chờ xử lý ({counts.pending})</button>
        <button type="button" onClick={() => setTab('processed')} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === 'processed' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Đã xử lý ({items.length - counts.pending})</button>
      </div>
      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={4} /> : <TopicTable topics={visible} mode="faculty" actionLoadingId={actionLoadingId} onApprove={(topic) => setConfirm({ type: 'approve', topic })} onPublish={(topic) => setConfirm({ type: 'publish', topic })} onReject={setRejectTarget} />}

      <ConfirmActionModal open={Boolean(confirm)} onClose={() => setConfirm(null)} onConfirm={runConfirm} loading={Boolean(actionLoadingId)} title={confirm?.type === 'approve' ? 'Phê duyệt đề tài' : 'Công bố đề tài'} confirmLabel={confirm?.type === 'approve' ? 'Phê duyệt' : 'Công bố'} description={confirm ? <>Đề tài <strong>{confirm.topic.title}</strong> sẽ {confirm.type === 'approve' ? 'được ghi nhận là đã duyệt. Công bố là bước riêng sau đó.' : 'hiển thị cho sinh viên trong đợt để đăng ký.'}</> : null} />
      <ReasonModal open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} onSubmit={runReject} loading={Boolean(actionLoadingId)} title="Từ chối đề tài" description={rejectTarget?.title} submitLabel="Xác nhận từ chối" />
    </div>
  );
}
