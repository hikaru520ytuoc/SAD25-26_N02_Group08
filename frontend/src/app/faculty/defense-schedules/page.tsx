'use client';

import { AlertTriangle, CalendarPlus, List, Rows3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { FormModal } from '@/components/common/form-modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { DefenseScheduleForm } from '@/components/sprint6/defense-schedule-form';
import { createDefenseSchedule, getDefenseSchedules } from '@/services/defense-schedules.service';
import type { DefenseScheduleValues } from '@/schemas/sprint6.schema';
import type { DefenseSchedule } from '@/types/sprint6';

export default function FacultyDefenseSchedulesPage() {
  const toast = useToast();
  const [items, setItems] = useState<DefenseSchedule[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      setItems(await getDefenseSchedules());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch bảo vệ');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(values: DefenseScheduleValues) {
    const created = await createDefenseSchedule(values);
    setItems((current) => [...current, created].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    setFormOpen(false);
    toast.success('Đã tạo lịch bảo vệ', 'Hệ thống đã kiểm tra xung đột phòng, hội đồng, thành viên và sinh viên.');
    await load(false);
  }

  const visible = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    if (!keyword) return items;
    return items.filter((item) => [item.student?.studentCode, item.student?.user?.fullName, item.council?.name, item.room].filter(Boolean).some((value) => String(value).toLocaleLowerCase('vi').includes(keyword)));
  }, [items, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Lịch bảo vệ" description="Xếp lịch cho hồ sơ sẵn sàng và kiểm tra xung đột nghiệp vụ ở backend." actions={<button type="button" onClick={() => setFormOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"><CalendarPlus className="h-4 w-4" />Tạo lịch bảo vệ</button>} />
      <div className="grid gap-4 sm:grid-cols-3"><SummaryStatCard label="Tổng lịch" value={items.length} icon={Rows3} /><SummaryStatCard label="Đã công bố/đang diễn ra" value={items.filter((item) => !['CANCELLED', 'COMPLETED'].includes(item.status)).length} tone="blue" /><SummaryStatCard label="Đã hoàn tất" value={items.filter((item) => item.status === 'COMPLETED').length} tone="emerald" /></div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"><AlertTriangle className="mr-2 inline h-4 w-4" />Backend chặn trùng phòng, trùng hội đồng, trùng thành viên, trùng sinh viên và vượt giới hạn hồ sơ của hội đồng.</div>
      <div className="flex flex-col gap-3 lg:flex-row"><div className="flex rounded-xl border border-slate-200 bg-white p-1"><button type="button" onClick={() => setView('list')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${view === 'list' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}><List className="h-4 w-4" />Danh sách</button><button type="button" onClick={() => setView('calendar')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${view === 'calendar' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}><Rows3 className="h-4 w-4" />Lịch</button></div><div className="flex-1"><FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm sinh viên, hội đồng hoặc phòng..." resultCount={visible.length} /></div></div>
      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={5} /> : visible.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Chưa có lịch bảo vệ phù hợp.</div> : (
        <div className={view === 'calendar' ? 'grid gap-4 lg:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>{visible.map((schedule) => <article key={schedule.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-lg font-bold text-slate-950">{new Date(schedule.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}–{new Date(schedule.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {new Date(schedule.defenseDate).toLocaleDateString('vi-VN')}</p><p className="mt-2 font-semibold text-slate-800">{schedule.student?.studentCode} – {schedule.student?.user?.fullName}</p><p className="mt-1 text-sm text-slate-500">{schedule.council?.name} · {schedule.room}</p></div><StatusBadge value={schedule.status} /></div></article>)}</div>
      )}
      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title="Tạo lịch bảo vệ" description="Chỉ hiển thị hồ sơ và hội đồng đủ điều kiện. Ngày được nhập theo định dạng dd/MM/yyyy." size="2xl"><DefenseScheduleForm onSubmit={submit} /></FormModal>
    </div>
  );
}
