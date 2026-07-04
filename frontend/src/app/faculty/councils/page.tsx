'use client';

import { CheckCircle2, Clock3, Eye, Plus, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { FormModal } from '@/components/common/form-modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { CouncilForm } from '@/components/sprint6/council-form';
import { CouncilMemberForm } from '@/components/sprint6/council-member-form';
import { CouncilMemberTable } from '@/components/sprint6/council-member-table';
import { addCouncilMember, createCouncil, getCouncils, updateCouncil } from '@/services/councils.service';
import { getDefenseSchedules } from '@/services/defense-schedules.service';
import type { CouncilMemberValues, CouncilValues } from '@/schemas/sprint6.schema';
import type { DefenseCouncil, DefenseSchedule } from '@/types/sprint6';

type CouncilAction = { item: DefenseCouncil; status: 'ACTIVE' | 'CLOSED' } | null;

export default function FacultyCouncilsPage() {
  const toast = useToast();
  const [items, setItems] = useState<DefenseCouncil[]>([]);
  const [schedules, setSchedules] = useState<DefenseSchedule[]>([]);
  const [selected, setSelected] = useState<DefenseCouncil | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [action, setAction] = useState<CouncilAction>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  async function load(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      const [councils, defenseSchedules] = await Promise.all([getCouncils(), getDefenseSchedules()]);
      setItems(councils);
      setSchedules(defenseSchedules);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải hội đồng');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const scheduleCountByCouncil = useMemo(() => schedules.reduce<Record<string, number>>((acc, schedule) => {
    acc[schedule.councilId] = (acc[schedule.councilId] ?? 0) + 1;
    return acc;
  }, {}), [schedules]);

  const stats = useMemo(() => ({
    total: items.length,
    draft: items.filter((item) => item.status === 'DRAFT').length,
    active: items.filter((item) => item.status === 'ACTIVE').length,
    closed: items.filter((item) => item.status === 'CLOSED').length,
  }), [items]);

  const visible = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    return items.filter((item) => {
      if (status !== 'ALL' && item.status !== status) return false;
      if (!keyword) return true;
      return [item.name, item.projectPeriod?.name, item.description].filter(Boolean).some((value) => String(value).toLocaleLowerCase('vi').includes(keyword));
    });
  }, [items, search, status]);

  async function submit(values: CouncilValues) {
    const created = await createCouncil(values);
    setItems((current) => [created, ...current]);
    setCreateOpen(false);
    toast.success('Đã tạo hội đồng', 'Hội đồng mới được lưu ở trạng thái bản nháp.');
    await load(false);
  }

  async function submitMember(councilId: string, values: CouncilMemberValues) {
    await addCouncilMember(councilId, values);
    toast.success('Đã thêm thành viên hội đồng');
    await load(false);
    const updated = (await getCouncils()).find((item) => item.id === councilId) ?? null;
    setSelected(updated);
  }

  async function executeStatusAction() {
    if (!action || processing) return;
    setProcessing(true);
    try {
      const updated = await updateCouncil(action.item.id, { status: action.status });
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setAction(null);
      toast.success(action.status === 'ACTIVE' ? 'Đã kích hoạt hội đồng' : 'Đã đóng hội đồng');
      await load(false);
    } catch (err) {
      toast.error('Không thể cập nhật hội đồng', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hội đồng bảo vệ" description="Quản lý hội đồng, thành viên và số hồ sơ được xếp lịch theo từng đợt." actions={<button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Tạo hội đồng</button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard label="Tổng hội đồng" value={stats.total} icon={Users} />
        <SummaryStatCard label="Bản nháp" value={stats.draft} icon={Clock3} tone="amber" />
        <SummaryStatCard label="Đang hoạt động" value={stats.active} icon={ShieldCheck} tone="emerald" />
        <SummaryStatCard label="Đã đóng" value={stats.closed} icon={CheckCircle2} tone="slate" />
      </div>
      <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm tên hội đồng hoặc đợt đồ án..." resultCount={visible.length}>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
          <option value="ALL">Tất cả trạng thái</option><option value="DRAFT">Bản nháp</option><option value="ACTIVE">Đang hoạt động</option><option value="CLOSED">Đã đóng</option>
        </select>
      </FilterBar>
      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={4} /> : visible.length === 0 ? <EmptyState title="Chưa có hội đồng phù hợp" /> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((council) => {
            const assignedCount = scheduleCountByCouncil[council.id] ?? 0;
            return (
              <article key={council.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-950">{council.name}</h2><p className="mt-1 text-sm text-slate-500">{council.projectPeriod?.name ?? 'Chưa cập nhật đợt'}</p></div><StatusBadge value={council.status} /></div>
                <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Thành viên</p><p className="mt-1 text-lg font-bold text-slate-900">{council.members?.length ?? 0}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Hồ sơ đã xếp</p><p className="mt-1 text-lg font-bold text-slate-900">{assignedCount}/6</p></div></div>
                <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => setSelected(council)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"><Eye className="h-4 w-4" />Xem chi tiết</button>{council.status === 'DRAFT' && <button type="button" onClick={() => setAction({ item: council, status: 'ACTIVE' })} className="rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white">Kích hoạt</button>}{council.status === 'ACTIVE' && <button type="button" onClick={() => setAction({ item: council, status: 'CLOSED' })} className="rounded-xl bg-slate-700 px-3 py-2.5 text-sm font-semibold text-white">Đóng hội đồng</button>}</div>
              </article>
            );
          })}
        </div>
      )}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Tạo hội đồng bảo vệ" description="Hội đồng được tạo ở trạng thái bản nháp và chỉ kích hoạt khi đủ thông tin." size="xl"><CouncilForm onSubmit={submit} /></FormModal>
      <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? 'Chi tiết hội đồng'} description={selected?.projectPeriod?.name}>
        {selected && <div className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-950">Thông tin chung</h3><StatusBadge value={selected.status} /></div><p className="mt-3 text-sm leading-6 text-slate-600">{selected.description || 'Chưa có mô tả.'}</p><p className="mt-3 text-sm text-slate-600">Số hồ sơ đã xếp lịch: <strong>{scheduleCountByCouncil[selected.id] ?? 0}/6</strong></p></section><section className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-950">Thành viên hội đồng</h3><CouncilMemberTable members={selected.members} /><CouncilMemberForm councilId={selected.id} onSubmit={submitMember} /></section></div>}
      </DetailDrawer>
      <ConfirmActionModal open={Boolean(action)} onClose={() => !processing && setAction(null)} onConfirm={executeStatusAction} loading={processing} title={action?.status === 'ACTIVE' ? 'Kích hoạt hội đồng' : 'Đóng hội đồng'} confirmLabel={action?.status === 'ACTIVE' ? 'Kích hoạt' : 'Đóng hội đồng'} description={action ? <>Bạn sắp chuyển <strong>{action.item.name}</strong> sang trạng thái <strong>{action.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã đóng'}</strong>. Các hành động hợp lệ sẽ thay đổi theo trạng thái mới.</> : null} />
    </div>
  );
}
