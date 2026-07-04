'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardPenLine, Eye, Save } from 'lucide-react';
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
import { getCouncilScores, saveCouncilScore } from '@/services/council-scores.service';
import { getCouncilDefenseSchedules } from '@/services/defense-schedules.service';
import { getDefenseSession, saveDefenseSession } from '@/services/defense-sessions.service';
import type { DefenseSchedule, CouncilMember } from '@/types/sprint6';
import type { CouncilScore, DefenseSession } from '@/types/sprint7';

type Entry = { score: string; comment: string };
const roleLabels: Record<string, string> = { CHAIR: 'Chủ tịch', SECRETARY: 'Thư ký', MEMBER: 'Ủy viên' };

export default function SecretaryCouncilScoringPage() {
  const toast = useToast();
  const [schedules, setSchedules] = useState<DefenseSchedule[]>([]);
  const [scoresBySchedule, setScoresBySchedule] = useState<Record<string, CouncilScore[]>>({});
  const [sessions, setSessions] = useState<Record<string, DefenseSession | null>>({});
  const [tab, setTab] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('NOT_STARTED');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DefenseSchedule | null>(null);
  const [editing, setEditing] = useState<DefenseSchedule | null>(null);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [generalComment, setGeneralComment] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [revisionRequired, setRevisionRequired] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const data = await getCouncilDefenseSchedules();
      const details = await Promise.all(data.map(async (schedule) => {
        const [scores, session] = await Promise.all([getCouncilScores(schedule.id).catch(() => []), getDefenseSession(schedule.id).catch(() => null)]);
        return { id: schedule.id, scores, session };
      }));
      setSchedules(data);
      setScoresBySchedule(Object.fromEntries(details.map((item) => [item.id, item.scores])));
      setSessions(Object.fromEntries(details.map((item) => [item.id, item.session])));
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu chấm điểm'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  function workflowStatus(schedule: DefenseSchedule) {
    const session = sessions[schedule.id];
    if (session?.sessionStatus === 'COMPLETED') return 'COMPLETED';
    const count = scoresBySchedule[schedule.id]?.length ?? 0;
    return count > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
  }
  const stats = useMemo(() => ({ total: schedules.length, notStarted: schedules.filter((item) => workflowStatus(item) === 'NOT_STARTED').length, inProgress: schedules.filter((item) => workflowStatus(item) === 'IN_PROGRESS').length, completed: schedules.filter((item) => workflowStatus(item) === 'COMPLETED').length }), [schedules, sessions, scoresBySchedule]);
  const visible = schedules.filter((item) => workflowStatus(item) === tab).filter((item) => { const keyword = search.trim().toLocaleLowerCase('vi'); return !keyword || [item.student?.studentCode, item.student?.user?.fullName, item.council?.name, item.room].some((value) => value?.toLocaleLowerCase('vi').includes(keyword)); });

  function openEditing(schedule: DefenseSchedule) {
    const existing = scoresBySchedule[schedule.id] ?? [];
    const initial: Record<string, Entry> = {};
    (schedule.council?.members ?? []).forEach((member) => { const score = existing.find((item) => item.councilMemberId === member.id); initial[member.id] = { score: score?.score?.toString() ?? '', comment: score?.comment ?? '' }; });
    const session = sessions[schedule.id];
    setEntries(initial); setGeneralComment(session?.generalComment ?? ''); setConclusion(session?.conclusion ?? ''); setRevisionRequired(session?.revisionRequired ?? false); setRevisionNote(session?.revisionNote ?? ''); setFormError(''); setEditing(schedule);
  }
  function validateEntries(schedule: DefenseSchedule, requireAll: boolean) {
    const members = schedule.council?.members ?? [];
    for (const member of members) {
      const value = entries[member.id]?.score;
      if (!value && !requireAll) continue;
      const numeric = Number(value);
      if (!value || !Number.isFinite(numeric) || numeric < 0 || numeric > 10) return `Điểm của ${member.lecturer?.user?.fullName ?? member.user?.fullName ?? 'thành viên'} phải nằm trong khoảng 0–10.`;
    }
    if (requireAll && members.length === 0) return 'Hội đồng chưa có thành viên.';
    if (requireAll && revisionRequired && !revisionNote.trim()) return 'Vui lòng nhập yêu cầu chỉnh sửa của hội đồng.';
    return '';
  }
  async function saveDraft() {
    if (!editing) return;
    const message = validateEntries(editing, false); if (message) { setFormError(message); return; }
    setProcessing(true); setFormError('');
    try {
      for (const member of editing.council?.members ?? []) { const entry = entries[member.id]; if (entry?.score) await saveCouncilScore({ defenseScheduleId: editing.id, councilMemberId: member.id, score: Number(entry.score), comment: entry.comment.trim() || undefined }); }
      const session = await saveDefenseSession({ defenseScheduleId: editing.id, sessionStatus: 'IN_PROGRESS', generalComment: generalComment.trim() || undefined, conclusion: conclusion.trim() || undefined, revisionRequired, revisionNote: revisionNote.trim() || undefined });
      toast.success('Đã lưu nháp điểm hội đồng'); setSessions((current) => ({ ...current, [editing.id]: session })); setEditing(null); await load(); setTab('IN_PROGRESS');
    } catch (err) { toast.error('Không thể lưu điểm', err instanceof Error ? err.message : undefined); }
    finally { setProcessing(false); }
  }
  function askComplete() { if (!editing) return; const message = validateEntries(editing, true); if (message) { setFormError(message); return; } setConfirming(true); }
  async function complete() {
    if (!editing) return;
    setProcessing(true);
    try {
      for (const member of editing.council?.members ?? []) { const entry = entries[member.id]; await saveCouncilScore({ defenseScheduleId: editing.id, councilMemberId: member.id, score: Number(entry.score), comment: entry.comment.trim() || undefined }); }
      const session = await saveDefenseSession({ defenseScheduleId: editing.id, sessionStatus: 'COMPLETED', generalComment: generalComment.trim() || undefined, conclusion: conclusion.trim() || undefined, revisionRequired, revisionNote: revisionNote.trim() || undefined });
      toast.success('Đã hoàn tất chấm điểm', 'Điểm hội đồng đã khóa và không thể chỉnh sửa.'); setSessions((current) => ({ ...current, [editing.id]: session })); setConfirming(false); setEditing(null); await load(); setTab('COMPLETED');
    } catch (err) { toast.error('Không thể hoàn tất chấm điểm', err instanceof Error ? err.message : undefined); }
    finally { setProcessing(false); }
  }

  return <div className="space-y-6">
    <PageHeader title="Nhập điểm hội đồng" description="Thư ký nhập điểm từng thành viên, lưu nháp biên bản và hoàn tất chấm điểm. Sau khi hoàn tất, backend khóa sửa điểm hội đồng." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryStatCard label="Tổng hồ sơ" value={stats.total} /><SummaryStatCard label="Chưa chấm" value={stats.notStarted} icon={ClipboardPenLine} tone="amber" onClick={() => setTab('NOT_STARTED')} /><SummaryStatCard label="Đang nhập" value={stats.inProgress} icon={Save} tone="blue" onClick={() => setTab('IN_PROGRESS')} /><SummaryStatCard label="Hoàn tất" value={stats.completed} icon={CheckCircle2} tone="emerald" onClick={() => setTab('COMPLETED')} /></div>
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2"><button type="button" onClick={() => setTab('NOT_STARTED')} className={tab === 'NOT_STARTED' ? 'tab-button-active' : 'tab-button'}>Chưa chấm ({stats.notStarted})</button><button type="button" onClick={() => setTab('IN_PROGRESS')} className={tab === 'IN_PROGRESS' ? 'tab-button-active' : 'tab-button'}>Đang nhập ({stats.inProgress})</button><button type="button" onClick={() => setTab('COMPLETED')} className={tab === 'COMPLETED' ? 'tab-button-active' : 'tab-button'}>Hoàn tất ({stats.completed})</button></div>
    <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm sinh viên, hội đồng hoặc phòng..." resultCount={visible.length} />
    {error && <ErrorState message={error} onRetry={() => void load()} />}
    {loading ? <LoadingSkeleton rows={5} /> : visible.length === 0 ? <EmptyState title="Không có hồ sơ phù hợp" /> : <div className="grid gap-4 xl:grid-cols-2">{visible.map((schedule) => { const scores = scoresBySchedule[schedule.id] ?? []; const members = schedule.council?.members ?? []; const average = scores.length ? scores.reduce((sum, item) => sum + item.score, 0) / scores.length : null; const statusValue = workflowStatus(schedule); return <article key={schedule.id} className="section-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-slate-950">{schedule.student?.studentCode ?? ''} – {schedule.student?.user?.fullName ?? 'Sinh viên'}</h2><p className="mt-1 text-sm text-slate-500">{schedule.council?.name} · {schedule.room}</p></div><StatusBadge value={statusValue} /></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><p><span className="text-slate-500">Đã nhập:</span> <strong>{scores.length}/{members.length}</strong></p><p><span className="text-slate-500">Trung bình:</span> <strong>{average === null ? '-' : average.toFixed(2)}</strong></p><p><span className="text-slate-500">Bảo vệ:</span> <strong>{new Date(schedule.startTime).toLocaleString('vi-VN')}</strong></p></div><div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelected(schedule)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem hồ sơ</button>{statusValue !== 'COMPLETED' && <button type="button" onClick={() => openEditing(schedule)} className="primary-button">{statusValue === 'NOT_STARTED' ? 'Nhập điểm' : 'Tiếp tục nhập'}</button>}</div></article>; })}</div>}

    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${selected.student?.studentCode ?? ''} – ${selected.student?.user?.fullName ?? 'Chi tiết chấm điểm'}` : 'Chi tiết chấm điểm'} description={selected ? `${selected.council?.name} · ${selected.room}` : undefined} footer={selected && workflowStatus(selected) !== 'COMPLETED' ? <div className="flex justify-end"><button type="button" onClick={() => openEditing(selected)} className="primary-button">Nhập điểm</button></div> : undefined}>{selected && <ScoreDetail members={selected.council?.members ?? []} scores={scoresBySchedule[selected.id] ?? []} session={sessions[selected.id]} />}</DetailDrawer>

    <FormModal open={Boolean(editing)} onClose={() => !processing && setEditing(null)} title="Nhập điểm hội đồng" description={editing ? `${editing.student?.studentCode ?? ''} – ${editing.student?.user?.fullName ?? ''}` : undefined} size="2xl" closeDisabled={processing}><div className="space-y-5"><div className="space-y-3">{editing?.council?.members?.map((member) => <div key={member.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_130px_1fr]"><div><p className="font-semibold">{member.lecturer?.user?.fullName ?? member.user?.fullName}</p><p className="text-xs text-slate-500">{roleLabels[member.roleInCouncil] ?? 'Thành viên'}</p></div><input type="number" min="0" max="10" step="0.01" value={entries[member.id]?.score ?? ''} onChange={(event) => setEntries((current) => ({ ...current, [member.id]: { ...current[member.id], score: event.target.value } }))} placeholder="Điểm 0–10" className="field-input" /><input value={entries[member.id]?.comment ?? ''} onChange={(event) => setEntries((current) => ({ ...current, [member.id]: { ...current[member.id], comment: event.target.value } }))} placeholder="Nhận xét của thành viên" className="field-input" /></div>)}</div><div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-semibold">Nhận xét chung<textarea rows={4} value={generalComment} onChange={(event) => setGeneralComment(event.target.value)} className="mt-2 field-input w-full resize-y" /></label><label className="block text-sm font-semibold">Kết luận<textarea rows={4} value={conclusion} onChange={(event) => setConclusion(event.target.value)} className="mt-2 field-input w-full resize-y" /></label></div><label className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900"><input type="checkbox" checked={revisionRequired} onChange={(event) => setRevisionRequired(event.target.checked)} />Yêu cầu sinh viên chỉnh sửa sau bảo vệ</label>{revisionRequired && <label className="block text-sm font-semibold">Nội dung cần chỉnh sửa <span className="text-rose-600">*</span><textarea rows={4} value={revisionNote} onChange={(event) => setRevisionNote(event.target.value)} className="mt-2 field-input w-full resize-y" /></label>}{formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}<div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" disabled={processing} onClick={saveDraft} className="secondary-button"><Save className="mr-1.5 h-4 w-4" />Lưu nháp</button><button type="button" disabled={processing} onClick={askComplete} className="primary-button"><CheckCircle2 className="mr-1.5 h-4 w-4" />Hoàn tất chấm điểm</button></div></div></FormModal>
    <ConfirmActionModal open={confirming} onClose={() => !processing && setConfirming(false)} onConfirm={complete} loading={processing} tone="danger" title="Hoàn tất và khóa điểm hội đồng" confirmLabel="Hoàn tất chấm điểm" description={editing ? <>Tất cả điểm của hội đồng cho <strong>{editing.student?.studentCode} – {editing.student?.user?.fullName}</strong> sẽ được lưu và khóa. Sau thao tác này không thể chỉnh sửa điểm.</> : null} />
  </div>;
}

function ScoreDetail({ members, scores, session }: { members: CouncilMember[]; scores: CouncilScore[]; session: DefenseSession | null }) { const average = scores.length ? scores.reduce((sum, item) => sum + item.score, 0) / scores.length : null; return <div className="space-y-5"><section className="section-card"><div className="flex items-center justify-between"><h3 className="font-bold">Tổng hợp điểm</h3><StatusBadge value={session?.sessionStatus ?? (scores.length ? 'IN_PROGRESS' : 'NOT_STARTED')} /></div><p className="mt-4 text-4xl font-bold">{average === null ? '-' : average.toFixed(2)}</p><p className="mt-1 text-sm text-slate-500">Trung bình {scores.length}/{members.length} thành viên</p></section><section className="section-card"><h3 className="font-bold">Điểm từng thành viên</h3><div className="mt-4 space-y-3">{members.map((member) => { const score = scores.find((item) => item.councilMemberId === member.id); return <div key={member.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-slate-50 p-4"><div><p className="font-semibold">{member.lecturer?.user?.fullName ?? member.user?.fullName}</p><p className="text-xs text-slate-500">{roleLabels[member.roleInCouncil] ?? 'Thành viên'}</p>{score?.comment && <p className="mt-2 text-sm text-slate-600">{score.comment}</p>}</div><strong className="text-xl">{score?.score?.toFixed(2) ?? 'Chưa nhập'}</strong></div>; })}</div></section>{session && <section className="section-card"><h3 className="font-bold">Biên bản</h3><dl className="mt-4 space-y-3 text-sm"><div><dt className="font-semibold">Nhận xét chung</dt><dd className="mt-1 text-slate-600">{session.generalComment || '-'}</dd></div><div><dt className="font-semibold">Kết luận</dt><dd className="mt-1 text-slate-600">{session.conclusion || '-'}</dd></div>{session.revisionRequired && <div className="rounded-2xl bg-amber-50 p-4 text-amber-800"><dt className="font-semibold">Yêu cầu chỉnh sửa</dt><dd className="mt-1">{session.revisionNote || '-'}</dd></div>}</dl></section>}</div>; }
