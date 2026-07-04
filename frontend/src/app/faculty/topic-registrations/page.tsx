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
import { facultyAssignSupervisor, facultyConfirmRegistration, facultyRejectRegistration, getAllTopicRegistrations, listSupervisorOptions } from '@/services/topic-registrations.service';
import type { LecturerOption, TopicRegistration } from '@/types/sprint3';

type ActionState = { type: 'confirm' | 'reject'; item: TopicRegistration } | null;
const pendingStatuses = new Set(['PENDING_FACULTY', 'NEEDS_REVISION']);

export default function FacultyTopicRegistrationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<TopicRegistration[]>([]);
  const [supervisors, setSupervisors] = useState<LecturerOption[]>([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<TopicRegistration | null>(null);
  const [action, setAction] = useState<ActionState>(null);
  const [tab, setTab] = useState<'pending' | 'processed'>('pending');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      const [registrations, supervisorOptions] = await Promise.all([getAllTopicRegistrations(), listSupervisorOptions()]);
      setItems(registrations);
      setSupervisors(supervisorOptions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được đăng ký đề tài.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter((item) => pendingStatuses.has(item.status)).length,
    confirmed: items.filter((item) => item.status === 'OFFICIALLY_ASSIGNED').length,
    rejected: items.filter((item) => item.status === 'FACULTY_REJECTED').length,
  }), [items]);

  const visible = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    return items.filter((item) => {
      const isPending = pendingStatuses.has(item.status);
      if ((tab === 'pending') !== isPending) return false;
      if (status !== 'ALL' && item.status !== status) return false;
      if (!keyword) return true;
      return [item.student.studentCode, item.student.user.fullName, item.topic?.title, item.proposedTitle, item.requestedSupervisor?.user.fullName]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase('vi').includes(keyword));
    });
  }, [items, search, status, tab]);

  function currentSupervisorId(item: TopicRegistration) {
    return selectedSupervisors[item.id]
      || item.supervisorAssignment?.supervisor.id
      || item.requestedSupervisor?.id
      || supervisors.find((option) => option.lecturerCode === item.topic?.supervisor?.lecturerCode)?.id
      || '';
  }

  function currentSupervisorName(item: TopicRegistration) {
    const id = currentSupervisorId(item);
    return supervisors.find((supervisor) => supervisor.id === id)?.user.fullName
      ?? item.topic?.supervisor?.user?.fullName
      ?? 'Chưa chọn GVHD';
  }

  async function confirmRegistration() {
    if (!action || action.type !== 'confirm' || processingId) return;
    const item = action.item;
    const supervisorId = currentSupervisorId(item);
    if (!supervisorId) {
      toast.error('Chưa chọn GVHD', 'Vui lòng chọn giảng viên hướng dẫn chính thức trước khi xác nhận.');
      return;
    }
    setProcessingId(item.id);
    try {
      const existingSupervisorId = item.requestedSupervisor?.id
        || supervisors.find((option) => option.lecturerCode === item.topic?.supervisor?.lecturerCode)?.id;
      let intermediate = item;
      if (supervisorId !== existingSupervisorId) {
        intermediate = await facultyAssignSupervisor(item.id, supervisorId);
        setItems((current) => current.map((entry) => entry.id === intermediate.id ? intermediate : entry));
      }
      const updated = await facultyConfirmRegistration(item.id);
      setItems((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
      setAction(null);
      setTab('processed');
      toast.success('Đã chốt đề tài và GVHD', `${updated.student.user.fullName} đã được phân công chính thức.`);
      await loadData(false);
    } catch (err) {
      toast.error('Không thể xác nhận đăng ký', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
    }
  }

  async function rejectRegistration(reason: string) {
    if (!action || action.type !== 'reject' || processingId) return;
    setProcessingId(action.item.id);
    try {
      const updated = await facultyRejectRegistration(action.item.id, reason);
      setItems((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
      setAction(null);
      setTab('processed');
      toast.success('Đã từ chối đăng ký', 'Sinh viên sẽ nhận được lý do từ chối.');
      await loadData(false);
    } catch (err) {
      toast.error('Không thể từ chối đăng ký', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Khoa xử lý đăng ký đề tài" description="Phân công GVHD chính thức, xác nhận hoặc từ chối đăng ký theo đúng trạng thái nghiệp vụ." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard label="Tổng đăng ký" value={stats.total} icon={ListChecks} />
        <SummaryStatCard label="Chờ xử lý" value={stats.pending} icon={Clock3} tone="amber" onClick={() => setTab('pending')} />
        <SummaryStatCard label="Đã chốt" value={stats.confirmed} icon={CheckCircle2} tone="emerald" onClick={() => setTab('processed')} />
        <SummaryStatCard label="Đã từ chối" value={stats.rejected} icon={XCircle} tone="rose" onClick={() => setTab('processed')} />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
        <button type="button" onClick={() => setTab('pending')} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === 'pending' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Chờ xử lý ({stats.pending})</button>
        <button type="button" onClick={() => setTab('processed')} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === 'processed' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Đã xử lý ({stats.total - stats.pending})</button>
      </div>

      <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm theo sinh viên, đề tài hoặc GVHD..." resultCount={visible.length}>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING_FACULTY">Chờ Khoa xử lý</option>
          <option value="NEEDS_REVISION">Cần chỉnh sửa</option>
          <option value="OFFICIALLY_ASSIGNED">Đã chốt đề tài & GVHD</option>
          <option value="FACULTY_REJECTED">Đã từ chối</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </FilterBar>

      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={5} /> : visible.length === 0 ? (
        <EmptyState title={tab === 'pending' ? 'Không có đăng ký chờ xử lý' : 'Chưa có đăng ký đã xử lý'} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((item) => {
            const pending = pendingStatuses.has(item.status);
            const selectedId = currentSupervisorId(item);
            return (
              <TopicRegistrationCard
                key={item.id}
                item={item}
                onView={() => setSelected(item)}
                actions={pending ? (
                  <div className="flex w-full flex-col gap-2 lg:flex-row">
                    <select
                      aria-label={`Chọn GVHD cho ${item.student.user.fullName}`}
                      value={selectedId}
                      disabled={processingId === item.id}
                      onChange={(event) => setSelectedSupervisors((current) => ({ ...current, [item.id]: event.target.value }))}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    >
                      <option value="">Chọn GVHD chính thức</option>
                      {supervisors.map((supervisor) => <option key={supervisor.id} value={supervisor.id}>{supervisor.user.fullName} · {supervisor.lecturerCode}</option>)}
                    </select>
                    <button type="button" disabled={!selectedId || processingId === item.id} onClick={() => setAction({ type: 'confirm', item })} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Xác nhận</button>
                    <button type="button" disabled={processingId === item.id} onClick={() => setAction({ type: 'reject', item })} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Từ chối</button>
                  </div>
                ) : undefined}
              />
            );
          })}
        </div>
      )}

      <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title="Chi tiết đăng ký" description={selected ? `${selected.student.studentCode} – ${selected.student.user.fullName}` : undefined}>
        {selected && <TopicRegistrationDetail item={selected} />}
      </DetailDrawer>

      <ConfirmActionModal
        open={action?.type === 'confirm'}
        onClose={() => !processingId && setAction(null)}
        onConfirm={confirmRegistration}
        loading={Boolean(processingId)}
        title="Xác nhận đề tài và GVHD chính thức"
        confirmLabel="Xác nhận phân công"
        description={action?.type === 'confirm' ? <>
          Sinh viên: <strong>{action.item.student.studentCode} – {action.item.student.user.fullName}</strong><br />
          Đề tài: <strong>{action.item.topic?.title ?? action.item.proposedTitle}</strong><br />
          GVHD chính thức: <strong>{currentSupervisorName(action.item)}</strong><br />
          Sau thao tác, hồ sơ chuyển sang trạng thái “Đã chốt đề tài & GVHD”.
        </> : null}
      />

      <ReasonModal
        open={action?.type === 'reject'}
        onClose={() => !processingId && setAction(null)}
        onSubmit={rejectRegistration}
        loading={Boolean(processingId)}
        title="Từ chối đăng ký đề tài"
        description={action?.type === 'reject' ? `Nhập lý do cụ thể cho ${action.item.student.user.fullName}.` : undefined}
        submitLabel="Từ chối đăng ký"
      />
    </div>
  );
}
