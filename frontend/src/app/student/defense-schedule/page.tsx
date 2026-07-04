'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, FileUp, ShieldCheck } from 'lucide-react';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FileCard } from '@/components/common/file-card';
import { FormModal } from '@/components/common/form-modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { DefenseDocumentForm } from '@/components/sprint6/defense-document-form';
import { formatDateTime, formatShortCode } from '@/lib/formatters';
import { getMyDefenseDocuments, resubmitDefenseDocument, submitDefenseDocument } from '@/services/defense-documents.service';
import { getMyDefenseSchedules } from '@/services/defense-schedules.service';
import type { DefenseDocumentValues } from '@/schemas/sprint6.schema';
import type { DefenseDocument, DefenseSchedule } from '@/types/sprint6';

export default function StudentDefenseSchedulePage() {
  const toast = useToast();
  const [schedules, setSchedules] = useState<DefenseSchedule[]>([]); const [documents, setDocuments] = useState<DefenseDocument[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [selected, setSelected] = useState<DefenseSchedule | null>(null); const [formOpen, setFormOpen] = useState(false); const [submitting, setSubmitting] = useState(false);
  async function load() { setLoading(true); setError(''); try { const [scheduleItems, documentItems] = await Promise.all([getMyDefenseSchedules(), getMyDefenseDocuments()]); setSchedules(scheduleItems); setDocuments(documentItems); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải lịch/hồ sơ bảo vệ'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  const schedule = schedules[0];
  const document = documents.find((item) => item.defenseScheduleId === schedule?.id) ?? documents[0];
  const canSubmit = Boolean(schedule) && document?.status !== 'APPROVED' && schedule?.status !== 'COMPLETED' && schedule?.status !== 'CANCELLED';
  const checklist = useMemo(() => [
    { label: 'Đã có lịch bảo vệ', done: Boolean(schedule) },
    { label: 'Đã nộp báo cáo và slide', done: Boolean(document?.reportFileId && document?.slideFileId) },
    { label: 'Hồ sơ được thư ký xác nhận', done: document?.status === 'APPROVED' },
  ], [schedule, document]);
  async function submit(values: DefenseDocumentValues) {
    if (!schedule) return;
    setSubmitting(true);
    try {
      if (document?.status === 'NEEDS_SUPPLEMENT') await resubmitDefenseDocument(document.id, values); else await submitDefenseDocument(schedule.id, values);
      toast.success(document?.status === 'NEEDS_SUPPLEMENT' ? 'Đã bổ sung hồ sơ' : 'Đã nộp hồ sơ', 'Trạng thái hồ sơ đã được cập nhật ngay.');
      setFormOpen(false); await load();
    } catch (err) { toast.error('Không thể nộp hồ sơ', err instanceof Error ? err.message : 'Vui lòng thử lại.'); throw err; }
    finally { setSubmitting(false); }
  }
  return <div className="space-y-6"><PageHeader title="Lịch và hồ sơ bảo vệ" description="Xem lịch bảo vệ, theo dõi checklist hồ sơ và chỉ mở form khi cần nộp hoặc bổ sung tài liệu." actions={canSubmit ? <button type="button" onClick={() => setFormOpen(true)} className="primary-button"><FileUp className="mr-2 h-4 w-4" />{document?.status === 'NEEDS_SUPPLEMENT' ? 'Bổ sung hồ sơ' : 'Nộp hồ sơ bảo vệ'}</button> : undefined} />
    <div className="grid gap-4 sm:grid-cols-3"><SummaryStatCard label="Lịch bảo vệ" value={schedule ? 1 : 0} icon={CalendarDays} /><SummaryStatCard label="Tài liệu đã nộp" value={[document?.reportFileId, document?.slideFileId, document?.additionalFileId].filter(Boolean).length} icon={FileUp} tone="blue" /><SummaryStatCard label="Hồ sơ hợp lệ" value={document?.status === 'APPROVED' ? 1 : 0} icon={ShieldCheck} tone="emerald" /></div>
    {error && <ErrorState message={error} onRetry={() => void load()} />}{loading ? <LoadingSkeleton rows={4} /> : !schedule ? <EmptyState title="Bạn chưa có lịch bảo vệ" description="Lịch sẽ hiển thị sau khi hồ sơ đủ điều kiện và Khoa hoàn tất xếp hội đồng." /> : <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]"><article className="section-card"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase text-slate-400">{formatShortCode('BV', schedule.id, schedule.defenseDate)}</p><h2 className="mt-1 text-xl font-bold">{schedule.defenseRegistration?.title ?? 'Đồ án tốt nghiệp'}</h2><p className="mt-2 text-sm text-slate-600">{schedule.council?.name ?? 'Hội đồng bảo vệ'}</p></div><StatusBadge value={schedule.status} /></div><div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3"><div><span className="text-slate-500">Ngày giờ</span><p className="mt-1 font-semibold">{formatDateTime(schedule.startTime)}</p></div><div><span className="text-slate-500">Phòng</span><p className="mt-1 font-semibold">{schedule.room}</p></div><div><span className="text-slate-500">Hồ sơ</span><div className="mt-1"><StatusBadge value={document?.status ?? 'PENDING'} /></div></div></div>{document?.secretaryNote && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"><b>Yêu cầu bổ sung:</b> {document.secretaryNote}</p>}<button type="button" onClick={() => setSelected(schedule)} className="secondary-button mt-4">Xem chi tiết</button></article><aside className="section-card"><h2 className="font-bold">Checklist hồ sơ</h2><div className="mt-4 space-y-3">{checklist.map((item) => <div key={item.label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><CheckCircle2 className={`h-5 w-5 ${item.done ? 'text-emerald-600' : 'text-slate-300'}`} /><span className={item.done ? 'font-medium text-slate-900' : 'text-slate-500'}>{item.label}</span></div>)}</div></aside></div>}
    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title="Chi tiết lịch và hồ sơ bảo vệ" description={selected?.defenseRegistration?.title} footer={canSubmit ? <button type="button" onClick={() => { setSelected(null); setFormOpen(true); }} className="primary-button w-full">{document?.status === 'NEEDS_SUPPLEMENT' ? 'Bổ sung hồ sơ' : 'Nộp hồ sơ'}</button> : undefined}>{selected && <div className="space-y-5"><section className="section-card"><div className="flex justify-between gap-3"><h3 className="font-bold">Lịch bảo vệ</h3><StatusBadge value={selected.status} /></div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Info label="Hội đồng" value={selected.council?.name} /><Info label="Phòng" value={selected.room} /><Info label="Bắt đầu" value={formatDateTime(selected.startTime)} /><Info label="Kết thúc" value={formatDateTime(selected.endTime)} /></dl></section><section className="space-y-3"><h3 className="font-bold">Tài liệu hồ sơ</h3>{document?.reportFile ? <FileCard file={document.reportFile} /> : <MissingFile label="Báo cáo bảo vệ" />}{document?.slideFile ? <FileCard file={document.slideFile} /> : <MissingFile label="Slide bảo vệ" />}{document?.additionalFile ? <FileCard file={document.additionalFile} /> : null}</section></div>}</DetailDrawer>
    <FormModal open={formOpen} onClose={() => !submitting && setFormOpen(false)} closeDisabled={submitting} title={document?.status === 'NEEDS_SUPPLEMENT' ? 'Bổ sung hồ sơ bảo vệ' : 'Nộp hồ sơ bảo vệ'} description="Upload báo cáo, slide và tài liệu bổ sung. Hệ thống tự gắn file vào hồ sơ, không cần nhập ID." size="xl"><DefenseDocumentForm onSubmit={submit} submitLabel={document?.status === 'NEEDS_SUPPLEMENT' ? 'Gửi bổ sung' : 'Nộp hồ sơ'} /></FormModal>
  </div>;
}
function Info({ label, value }: { label: string; value?: string | null }) { return <div><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value || '—'}</dd></div>; }
function MissingFile({ label }: { label: string }) { return <div className="rounded-2xl border border-dashed bg-white p-4 text-sm text-slate-500">{label}: chưa có file.</div>; }
