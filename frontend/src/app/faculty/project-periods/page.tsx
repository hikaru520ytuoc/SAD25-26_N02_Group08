'use client';

import { Archive, BookOpen, CalendarDays, Clock3, FolderKanban, GraduationCap, Plus, Trash2, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { FormModal } from '@/components/common/form-modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { VietnameseDateInput, toIsoDate, toVietnameseDate } from '@/components/common/vietnamese-date-input';
import { useToast } from '@/components/providers/toast-provider';
import { ProjectPeriodForm } from '@/components/sprint2/project-period-form';
import { closeProjectPeriod, createProjectPeriod, deleteDraftProjectPeriod, extendProjectPeriod, getProjectPeriodStudents, getProjectPeriodTopics, getProjectPeriods, openProjectPeriod, type ProjectPeriodExtensionInput, type ProjectPeriodInput } from '@/services/project-periods.service';
import type { ProjectPeriod } from '@/types/sprint2';

type ConfirmState = { type: 'open' | 'close' | 'delete'; period: ProjectPeriod } | null;

function registrationTimeLabel(period: ProjectPeriod) {
  if (!period.registrationStartDate || !period.registrationEndDate) return { label: 'Chưa thiết lập', tone: 'slate' as const };
  const now = Date.now();
  const start = new Date(period.registrationStartDate).getTime();
  const end = new Date(period.registrationEndDate).getTime();
  if (now < start) return { label: 'Chưa đến hạn đăng ký', tone: 'blue' as const };
  if (now > end) return { label: 'Đã hết hạn đăng ký', tone: 'slate' as const };
  return { label: 'Đang trong thời gian đăng ký', tone: 'emerald' as const };
}

export default function FacultyProjectPeriodsPage() {
  const toast = useToast();
  const [items, setItems] = useState<ProjectPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [academicYear, setAcademicYear] = useState('ALL');
  const [semester, setSemester] = useState('ALL');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [detail, setDetail] = useState<ProjectPeriod | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'students' | 'topics'>('overview');
  const [detailItems, setDetailItems] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [extendTarget, setExtendTarget] = useState<ProjectPeriod | null>(null);
  const [extension, setExtension] = useState<ProjectPeriodExtensionInput>({ type: 'REGISTRATION', reason: '', notifyUsers: true });
  const pageSize = 6;

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setItems(await getProjectPeriods());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đợt đồ án.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const normalized = search.trim().toLowerCase();
    return (!normalized || `${item.name} ${item.academicYear} ${item.semester}`.toLowerCase().includes(normalized))
      && (status === 'ALL' || item.status === status)
      && (academicYear === 'ALL' || item.academicYear === academicYear)
      && (semester === 'ALL' || item.semester === semester);
  }), [items, search, status, academicYear, semester]);

  useEffect(() => setPage(1), [search, status, academicYear, semester]);
  const visibleItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const years = [...new Set(items.map((item) => item.academicYear))].sort().reverse();
  const counts = useMemo(() => ({ total: items.length, draft: items.filter((item) => item.status === 'DRAFT').length, open: items.filter((item) => item.status === 'OPEN').length, closed: items.filter((item) => item.status === 'CLOSED').length }), [items]);

  async function handleCreate(input: ProjectPeriodInput) {
    setSaving(true);
    try {
      const created = await createProjectPeriod(input);
      setItems((current) => [created, ...current]);
      setCreateOpen(false);
      toast.success('Đã lưu bản nháp', 'Đợt đồ án mới đã được tạo. Hãy kiểm tra trước khi mở đợt.');
    } catch (err) {
      toast.error('Không thể tạo đợt đồ án', err instanceof Error ? err.message : 'Vui lòng kiểm tra lại dữ liệu.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function runConfirmedAction() {
    if (!confirm) return;
    setSaving(true);
    try {
      if (confirm.type === 'delete') {
        await deleteDraftProjectPeriod(confirm.period.id);
        setItems((current) => current.filter((item) => item.id !== confirm.period.id));
        toast.success('Đã xóa bản nháp');
      } else {
        const updated = confirm.type === 'open' ? await openProjectPeriod(confirm.period.id) : await closeProjectPeriod(confirm.period.id);
        setItems((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
        toast.success(confirm.type === 'open' ? 'Đã mở đợt đồ án' : 'Đã đóng đợt đồ án');
      }
      setConfirm(null);
    } catch (err) {
      toast.error('Thao tác không thành công', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  async function openDetail(period: ProjectPeriod, tab: 'overview' | 'students' | 'topics' = 'overview') {
    setDetail(period);
    setDetailTab(tab);
    setDetailItems([]);
    if (tab !== 'overview') await loadDetailTab(period, tab);
  }

  async function loadDetailTab(period: ProjectPeriod, tab: 'students' | 'topics') {
    setDetailTab(tab);
    setDetailLoading(true);
    try {
      setDetailItems(tab === 'students' ? await getProjectPeriodStudents(period.id) : await getProjectPeriodTopics(period.id));
    } catch (err) {
      toast.error('Không thể tải dữ liệu chi tiết', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function submitExtension() {
    if (!extendTarget) return;
    if (!extension.reason.trim()) {
      toast.error('Thiếu lý do gia hạn', 'Vui lòng nhập lý do trước khi tiếp tục.');
      return;
    }
    const payload = { ...extension };
    if (payload.endDate) payload.endDate = toIsoDate(payload.endDate);
    if (payload.registrationEndDate) payload.registrationEndDate = toIsoDate(payload.registrationEndDate);
    if ((payload.type === 'PERIOD' || payload.type === 'BOTH') && !payload.endDate) return toast.error('Thiếu ngày kết thúc đợt mới');
    if ((payload.type === 'REGISTRATION' || payload.type === 'BOTH') && !payload.registrationEndDate) return toast.error('Thiếu ngày kết thúc đăng ký mới');

    setSaving(true);
    try {
      const updated = await extendProjectPeriod(extendTarget.id, payload);
      setItems((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
      setExtendTarget(null);
      setExtension({ type: 'REGISTRATION', reason: '', notifyUsers: true });
      toast.success('Đã gia hạn đợt đồ án', payload.notifyUsers ? 'Thông báo đã được gửi tới sinh viên trong đợt.' : undefined);
    } catch (err) {
      toast.error('Không thể gia hạn', err instanceof Error ? err.message : 'Vui lòng kiểm tra ngày mới.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader title="Quản lý đợt đồ án" description="Tạo, theo dõi và điều phối toàn bộ vòng đời từng đợt đồ án tốt nghiệp." actions={<button type="button" onClick={() => setCreateOpen(true)} className="primary-button"><Plus className="mr-2 h-4 w-4" />Tạo đợt mới</button>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard label="Tổng số đợt" value={counts.total} icon={FolderKanban} />
        <SummaryStatCard label="Bản nháp" value={counts.draft} icon={Clock3} tone="amber" />
        <SummaryStatCard label="Đang mở" value={counts.open} icon={CalendarDays} tone="emerald" />
        <SummaryStatCard label="Đã đóng" value={counts.closed} icon={Archive} tone="slate" />
      </div>

      <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm theo tên đợt, năm học..." resultCount={filtered.length}>
        <select value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} className="field-input w-auto min-w-36"><option value="ALL">Tất cả năm học</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select>
        <select value={semester} onChange={(event) => setSemester(event.target.value)} className="field-input w-auto min-w-36"><option value="ALL">Tất cả học kỳ</option><option value="HK1">Học kỳ 1</option><option value="HK2">Học kỳ 2</option><option value="HK3">Học kỳ hè</option></select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="field-input w-auto min-w-40"><option value="ALL">Tất cả trạng thái</option><option value="DRAFT">Bản nháp</option><option value="OPEN">Đang mở</option><option value="CLOSED">Đã đóng</option><option value="ARCHIVED">Đã lưu trữ</option></select>
      </FilterBar>

      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={4} /> : visibleItems.length === 0 ? <EmptyState title="Không có đợt đồ án phù hợp" description="Thử thay đổi bộ lọc hoặc tạo một đợt đồ án mới." /> : (
        <div className="grid gap-5 xl:grid-cols-2">
          {visibleItems.map((period) => {
            const registrationTime = registrationTimeLabel(period);
            const statistics = period.statistics ?? { students: period._count?.projectPeriodRegistrations ?? 0, topics: period._count?.topics ?? 0, supervisors: 0 };
            return (
              <article key={period.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><StatusBadge value={period.status} /><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${registrationTime.tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : registrationTime.tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{registrationTime.label}</span></div>
                    <h2 className="mt-3 text-xl font-bold text-slate-950">{period.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{period.academicYear} · {period.semester}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Thời gian đợt</p><p className="mt-1 font-semibold text-slate-800">{toVietnameseDate(period.startDate)} – {toVietnameseDate(period.endDate)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Thời gian đăng ký</p><p className="mt-1 font-semibold text-slate-800">{period.registrationStartDate ? toVietnameseDate(period.registrationStartDate) : 'Chưa đặt'} – {period.registrationEndDate ? toVietnameseDate(period.registrationEndDate) : 'Chưa đặt'}</p></div>
                </div>

                <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200">
                  <button type="button" onClick={() => openDetail(period, 'students')} className="p-3 text-center hover:bg-blue-50"><UsersRound className="mx-auto h-4 w-4 text-blue-600" /><strong className="mt-1 block text-lg text-slate-950">{statistics.students}</strong><span className="text-xs text-slate-500">Sinh viên</span></button>
                  <button type="button" onClick={() => openDetail(period, 'topics')} className="border-x border-slate-200 p-3 text-center hover:bg-violet-50"><BookOpen className="mx-auto h-4 w-4 text-violet-600" /><strong className="mt-1 block text-lg text-slate-950">{statistics.topics}</strong><span className="text-xs text-slate-500">Đề tài</span></button>
                  <button type="button" onClick={() => openDetail(period)} className="p-3 text-center hover:bg-emerald-50"><GraduationCap className="mx-auto h-4 w-4 text-emerald-600" /><strong className="mt-1 block text-lg text-slate-950">{statistics.supervisors}</strong><span className="text-xs text-slate-500">GVHD</span></button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => openDetail(period)} className="secondary-button">Xem chi tiết</button>
                  {(period.status === 'DRAFT' || period.status === 'CLOSED') && <button type="button" onClick={() => setConfirm({ type: 'open', period })} className="primary-button">Mở đợt</button>}
                  {period.status === 'OPEN' && <button type="button" onClick={() => setConfirm({ type: 'close', period })} className="secondary-button">Đóng đợt</button>}
                  {period.status !== 'ARCHIVED' && <button type="button" onClick={() => { setExtendTarget(period); setExtension({ type: 'REGISTRATION', reason: '', notifyUsers: true }); }} className="secondary-button">Gia hạn</button>}
                  {period.status === 'DRAFT' && <button type="button" onClick={() => setConfirm({ type: 'delete', period })} className="inline-flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"><Trash2 className="mr-1.5 h-4 w-4" />Xóa nháp</button>}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />

      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Tạo đợt đồ án mới" description="Điền thông tin cơ bản. Form được để trống hoàn toàn và đợt sẽ được lưu ở trạng thái bản nháp." closeDisabled={saving}>
        <ProjectPeriodForm onSubmit={handleCreate} loading={saving} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <ConfirmActionModal open={Boolean(confirm)} onClose={() => setConfirm(null)} onConfirm={runConfirmedAction} loading={saving} tone={confirm?.type === 'delete' ? 'danger' : 'primary'} title={confirm?.type === 'open' ? 'Mở đợt đồ án' : confirm?.type === 'close' ? 'Đóng đợt đồ án' : 'Xóa bản nháp'} confirmLabel={confirm?.type === 'open' ? 'Mở đợt' : confirm?.type === 'close' ? 'Đóng đợt' : 'Xóa bản nháp'} description={confirm ? <><strong>{confirm.period.name}</strong><br />{confirm.type === 'open' ? 'Sinh viên sẽ có thể nhìn thấy và đăng ký theo thời gian đã cấu hình.' : confirm.type === 'close' ? 'Đợt sẽ ngừng tiếp nhận đăng ký mới sau thao tác này.' : 'Bản nháp sẽ bị xóa vĩnh viễn nếu chưa có dữ liệu liên quan.'}</> : null} />

      <FormModal open={Boolean(extendTarget)} onClose={() => setExtendTarget(null)} title="Gia hạn đợt đồ án" description={extendTarget?.name} closeDisabled={saving} size="lg">
        <div className="space-y-5">
          <label className="field-label">Loại gia hạn<select value={extension.type} onChange={(event) => setExtension((current) => ({ ...current, type: event.target.value as ProjectPeriodExtensionInput['type'] }))} className="field-input"><option value="REGISTRATION">Thời gian đăng ký</option><option value="PERIOD">Thời gian đợt</option><option value="BOTH">Cả hai</option></select></label>
          {(extension.type === 'PERIOD' || extension.type === 'BOTH') && <label className="field-label">Ngày kết thúc đợt mới<VietnameseDateInput value={extension.endDate ?? ''} onChange={(value) => setExtension((current) => ({ ...current, endDate: value }))} /><span className="text-xs font-normal text-slate-500">Ngày hiện tại: {extendTarget ? toVietnameseDate(extendTarget.endDate) : '-'}</span></label>}
          {(extension.type === 'REGISTRATION' || extension.type === 'BOTH') && <label className="field-label">Ngày kết thúc đăng ký mới<VietnameseDateInput value={extension.registrationEndDate ?? ''} onChange={(value) => setExtension((current) => ({ ...current, registrationEndDate: value }))} /><span className="text-xs font-normal text-slate-500">Ngày hiện tại: {extendTarget?.registrationEndDate ? toVietnameseDate(extendTarget.registrationEndDate) : 'Chưa thiết lập'}</span></label>}
          <label className="field-label">Lý do gia hạn <span className="text-rose-600">*</span><textarea value={extension.reason} onChange={(event) => setExtension((current) => ({ ...current, reason: event.target.value }))} rows={4} placeholder="Nêu rõ lý do gia hạn..." className="field-input resize-y" /></label>
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm"><input type="checkbox" checked={extension.notifyUsers} onChange={(event) => setExtension((current) => ({ ...current, notifyUsers: event.target.checked }))} className="mt-1" /><span><strong>Gửi thông báo</strong><br /><span className="text-slate-500">Thông báo cho sinh viên đang tham gia đợt.</span></span></label>
          <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setExtendTarget(null)} className="secondary-button">Hủy</button><button type="button" disabled={saving} onClick={submitExtension} className="primary-button">{saving ? 'Đang xử lý...' : 'Xác nhận gia hạn'}</button></div>
        </div>
      </FormModal>

      <DetailDrawer open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.name ?? 'Chi tiết đợt'} description={detail ? `${detail.academicYear} · ${detail.semester}` : undefined}>
        {detail && <div className="space-y-5">
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">
            {([['overview', 'Thông tin chung'], ['students', 'Sinh viên'], ['topics', 'Đề tài']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => value === 'overview' ? setDetailTab(value) : loadDetailTab(detail, value)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${detailTab === value ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{label}</button>)}
          </div>
          {detailTab === 'overview' ? <div className="space-y-4">
            <section className="section-card"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-950">Trạng thái hiện tại</h3><StatusBadge value={detail.status} /></div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Thời gian đợt</dt><dd className="mt-1 font-semibold">{toVietnameseDate(detail.startDate)} – {toVietnameseDate(detail.endDate)}</dd></div><div><dt className="text-slate-500">Thời gian đăng ký</dt><dd className="mt-1 font-semibold">{detail.registrationStartDate ? toVietnameseDate(detail.registrationStartDate) : '-'} – {detail.registrationEndDate ? toVietnameseDate(detail.registrationEndDate) : '-'}</dd></div></dl></section>
            <section className="section-card"><h3 className="font-bold text-slate-950">Quy trình vòng đời</h3><div className="mt-4 grid gap-3"><div className="rounded-xl bg-slate-50 p-3 text-sm"><strong>1. Bản nháp</strong><p className="text-slate-500">Thiết lập thời gian và kiểm tra cấu hình.</p></div><div className="rounded-xl bg-slate-50 p-3 text-sm"><strong>2. Đang mở</strong><p className="text-slate-500">Sinh viên đăng ký đợt và đề tài.</p></div><div className="rounded-xl bg-slate-50 p-3 text-sm"><strong>3. Đã đóng / Lưu trữ</strong><p className="text-slate-500">Ngừng tiếp nhận mới và hoàn tất hồ sơ.</p></div></div></section>
          </div> : detailLoading ? <LoadingSkeleton rows={3} /> : detailItems.length === 0 ? <EmptyState title={detailTab === 'students' ? 'Chưa có sinh viên' : 'Chưa có đề tài'} /> : detailTab === 'students' ? <div className="space-y-3">{detailItems.map((item) => <article key={item.id} className="section-card"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">{item.student.studentCode} – {item.student.user.fullName}</h3><p className="mt-1 text-sm text-slate-500">{item.student.className} · {item.student.major?.name}</p></div><StatusBadge value={item.topicRegistration?.status ?? item.status} /></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-slate-500">Giai đoạn:</span> <StatusBadge value={item.currentStage} /></p><p><span className="text-slate-500">Đề tài:</span> {item.topicRegistration?.topic?.title ?? item.topicRegistration?.proposedTitle ?? 'Chưa đăng ký'}</p><p><span className="text-slate-500">GVHD:</span> {item.topicRegistration?.supervisorAssignment?.supervisor?.user?.fullName ?? item.topicRegistration?.requestedSupervisor?.user?.fullName ?? 'Chưa phân công'}</p><p><span className="text-slate-500">Email:</span> {item.student.user.email}</p></div></article>)}</div> : <div className="space-y-3">{detailItems.map((topic) => <article key={topic.id} className="section-card"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">{topic.title}</h3><p className="mt-1 text-sm text-slate-500">GVHD: {topic.supervisor.user.fullName} · {topic.major ?? 'Chưa phân ngành'}</p></div><StatusBadge value={topic.status} /></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{topic.description}</p><div className="mt-4 flex gap-4 text-sm"><span><strong>{topic.registrationCount}</strong> đăng ký</span><span><strong>{topic.approvedCount}</strong> đã duyệt</span><span><strong>{Math.max(0, topic.maxStudents - topic.approvedCount)}</strong> còn lại</span></div></article>)}</div>}
        </div>}
      </DetailDrawer>
    </div>
  );
}
