'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, PencilLine, Star } from 'lucide-react';
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
import { getStoredUser } from '@/lib/auth-storage';
import { formatDateTime, formatShortCode } from '@/lib/formatters';
import { getCouncilScores, saveCouncilScore } from '@/services/council-scores.service';
import { getCouncilDefenseSchedules } from '@/services/defense-schedules.service';
import { getDefenseSession } from '@/services/defense-sessions.service';
import type { DefenseSchedule } from '@/types/sprint6';
import type { CouncilScore, DefenseSession } from '@/types/sprint7';

type Row = { schedule: DefenseSchedule; score?: CouncilScore; session: DefenseSession | null; memberId?: string };

export default function CouncilMyScoresPage() {
  const toast = useToast();
  const user = getStoredUser();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');
  const [selected, setSelected] = useState<Row | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const schedules = await getCouncilDefenseSchedules();
      const hydrated = await Promise.all(schedules.map(async (schedule): Promise<Row> => {
        const member = schedule.council?.members?.find((item) => item.userId === user?.id);
        const [scores, session] = await Promise.all([getCouncilScores(schedule.id), getDefenseSession(schedule.id)]);
        return { schedule, memberId: member?.id, score: scores.find((item) => item.councilMemberId === member?.id), session };
      }));
      setRows(hydrated);
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải danh sách chấm điểm'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => ({
    total: rows.length,
    pending: rows.filter((row) => !row.score && row.session?.sessionStatus !== 'COMPLETED').length,
    entered: rows.filter((row) => Boolean(row.score) && row.session?.sessionStatus !== 'COMPLETED').length,
    completed: rows.filter((row) => row.session?.sessionStatus === 'COMPLETED').length,
  }), [rows]);

  const filtered = useMemo(() => rows.filter((row) => {
    const completed = row.session?.sessionStatus === 'COMPLETED';
    if ((tab === 'COMPLETED') !== completed) return false;
    const text = `${row.schedule.student?.studentCode ?? ''} ${row.schedule.student?.user?.fullName ?? ''} ${row.schedule.defenseRegistration?.title ?? ''} ${row.schedule.council?.name ?? ''}`.toLowerCase();
    return text.includes(search.toLowerCase().trim());
  }), [rows, tab, search]);

  function openScore(row: Row) {
    setEditing(row); setScore(row.score?.score?.toString() ?? ''); setComment(row.score?.comment ?? '');
  }

  async function submit() {
    if (!editing?.memberId) return;
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 10) {
      toast.error('Điểm không hợp lệ', 'Điểm phải nằm trong khoảng từ 0 đến 10.'); return;
    }
    setSaving(true);
    try {
      await saveCouncilScore({ defenseScheduleId: editing.schedule.id, councilMemberId: editing.memberId, score: numericScore, comment: comment.trim() || undefined });
      toast.success('Đã lưu điểm', `Điểm của ${editing.schedule.student?.user?.fullName ?? 'sinh viên'} đã được cập nhật.`);
      setEditing(null); await load();
    } catch (err) { toast.error('Không thể lưu điểm', err instanceof Error ? err.message : 'Vui lòng thử lại.'); }
    finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <PageHeader title="Điểm của tôi trong hội đồng" description="Xem hồ sơ được phân công và nhập điểm của chính bạn. Điểm bị khóa sau khi thư ký hoàn tất phiên bảo vệ." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryStatCard label="Tổng hồ sơ" value={stats.total} icon={Star} />
      <SummaryStatCard label="Chưa nhập" value={stats.pending} icon={Clock3} tone="amber" onClick={() => setTab('PENDING')} />
      <SummaryStatCard label="Đã nhập" value={stats.entered} icon={PencilLine} tone="blue" onClick={() => setTab('PENDING')} />
      <SummaryStatCard label="Đã khóa" value={stats.completed} icon={CheckCircle2} tone="emerald" onClick={() => setTab('COMPLETED')} />
    </div>
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
      <button type="button" onClick={() => setTab('PENDING')} className={tab === 'PENDING' ? 'tab-button-active' : 'tab-button'}>Đang chấm ({stats.pending + stats.entered})</button>
      <button type="button" onClick={() => setTab('COMPLETED')} className={tab === 'COMPLETED' ? 'tab-button-active' : 'tab-button'}>Đã hoàn tất ({stats.completed})</button>
    </div>
    <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm sinh viên, đề tài hoặc hội đồng..." />
    {error && <ErrorState message={error} onRetry={() => void load()} />}
    {loading ? <LoadingSkeleton rows={5} /> : filtered.length === 0 ? <EmptyState title="Không có hồ sơ phù hợp" description="Danh sách sẽ cập nhật khi bạn được phân công vào hội đồng." /> : <div className="grid gap-4 lg:grid-cols-2">
      {filtered.map((row) => {
        const locked = row.session?.sessionStatus === 'COMPLETED';
        return <article key={row.schedule.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{formatShortCode('BV', row.schedule.id, row.schedule.defenseDate)}</p><h2 className="mt-1 truncate text-lg font-bold text-slate-950">{row.schedule.student?.studentCode} – {row.schedule.student?.user?.fullName ?? 'Sinh viên'}</h2><p className="mt-1 line-clamp-2 text-sm text-slate-600">{row.schedule.defenseRegistration?.title ?? 'Đồ án tốt nghiệp'}</p></div><StatusBadge value={locked ? 'LOCKED' : row.score ? 'IN_PROGRESS' : 'PENDING'} /></div>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-sm"><div><span className="text-slate-500">Thời gian</span><p className="mt-1 font-semibold">{formatDateTime(row.schedule.startTime)}</p></div><div><span className="text-slate-500">Điểm hiện tại</span><p className="mt-1 text-lg font-bold">{row.score?.score ?? '—'}</p></div></div>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setSelected(row)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Xem chi tiết</button>{!locked && row.memberId && <button type="button" onClick={() => openScore(row)} className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">{row.score ? 'Cập nhật điểm' : 'Nhập điểm'}</button>}</div>
        </article>;
      })}
    </div>}

    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${selected.schedule.student?.studentCode ?? ''} – ${selected.schedule.student?.user?.fullName ?? 'Sinh viên'}` : 'Chi tiết'} description={selected?.schedule.defenseRegistration?.title} footer={selected && selected.session?.sessionStatus !== 'COMPLETED' && selected.memberId ? <button type="button" onClick={() => { openScore(selected); setSelected(null); }} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white">{selected.score ? 'Cập nhật điểm' : 'Nhập điểm'}</button> : undefined}>
      {selected && <div className="space-y-5"><section className="rounded-2xl border bg-white p-4"><h3 className="font-bold">Lịch bảo vệ</h3><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Hội đồng</dt><dd className="font-semibold">{selected.schedule.council?.name ?? '—'}</dd></div><div><dt className="text-slate-500">Phòng</dt><dd className="font-semibold">{selected.schedule.room}</dd></div><div><dt className="text-slate-500">Bắt đầu</dt><dd className="font-semibold">{formatDateTime(selected.schedule.startTime)}</dd></div><div><dt className="text-slate-500">Kết thúc</dt><dd className="font-semibold">{formatDateTime(selected.schedule.endTime)}</dd></div></dl></section><section className="rounded-2xl border bg-white p-4"><div className="flex items-center justify-between"><h3 className="font-bold">Đánh giá của tôi</h3><StatusBadge value={selected.session?.sessionStatus === 'COMPLETED' ? 'LOCKED' : selected.score ? 'IN_PROGRESS' : 'PENDING'} /></div><p className="mt-4 text-3xl font-black text-slate-950">{selected.score?.score ?? '—'}<span className="text-base font-medium text-slate-400"> / 10</span></p><p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{selected.score?.comment || 'Chưa có nhận xét.'}</p></section></div>}
    </DetailDrawer>

    <FormModal open={Boolean(editing)} onClose={() => !saving && setEditing(null)} closeDisabled={saving} title={editing?.score ? 'Cập nhật điểm hội đồng' : 'Nhập điểm hội đồng'} description={editing ? `${editing.schedule.student?.studentCode ?? ''} – ${editing.schedule.student?.user?.fullName ?? 'Sinh viên'}` : undefined} size="lg">
      <div className="space-y-5"><label className="block"><span className="text-sm font-semibold text-slate-800">Điểm (0–10) <span className="text-red-600">*</span></span><input value={score} onChange={(event) => setScore(event.target.value)} type="number" min="0" max="10" step="0.1" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" /></label><label className="block"><span className="text-sm font-semibold text-slate-800">Nhận xét</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={5} placeholder="Nhập nhận xét chuyên môn..." className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" /></label><div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2.5 font-semibold disabled:opacity-50">Hủy</button><button type="button" disabled={saving} onClick={() => void submit()} className="rounded-xl bg-slate-950 px-4 py-2.5 font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu điểm'}</button></div></div>
    </FormModal>
  </div>;
}
