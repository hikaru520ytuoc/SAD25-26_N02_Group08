'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Eye, FileWarning } from 'lucide-react';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FileCard } from '@/components/common/file-card';
import { FilterBar } from '@/components/common/filter-bar';
import { FormModal } from '@/components/common/form-modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { approveDefenseDocument, getSecretaryDefenseDocuments, requestDefenseDocumentSupplement } from '@/services/defense-documents.service';
import type { DefenseDocument } from '@/types/sprint6';

type MissingKey = 'report' | 'slide' | 'additional';
const missingLabels: Record<MissingKey, string> = { report: 'Báo cáo', slide: 'Slide', additional: 'File bổ sung/phiếu xác nhận' };

export default function SecretaryDefenseDocumentsPage() {
  const toast = useToast();
  const [items, setItems] = useState<DefenseDocument[]>([]);
  const [tab, setTab] = useState<'PENDING' | 'PROCESSED'>('PENDING');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DefenseDocument | null>(null);
  const [approveTarget, setApproveTarget] = useState<DefenseDocument | null>(null);
  const [supplementTarget, setSupplementTarget] = useState<DefenseDocument | null>(null);
  const [missing, setMissing] = useState<MissingKey[]>([]);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  async function load() { setLoading(true); setError(''); try { setItems(await getSecretaryDefenseDocuments()); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ bảo vệ'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  const stats = useMemo(() => ({ total: items.length, pending: items.filter((item) => item.status === 'SUBMITTED').length, supplement: items.filter((item) => item.status === 'NEEDS_SUPPLEMENT').length, approved: items.filter((item) => item.status === 'APPROVED').length }), [items]);
  const visible = items.filter((item) => tab === 'PENDING' ? item.status === 'SUBMITTED' : item.status !== 'SUBMITTED').filter((item) => { const keyword = search.trim().toLocaleLowerCase('vi'); const schedule = item.defenseSchedule; return !keyword || [schedule?.student?.studentCode, schedule?.student?.user?.fullName, schedule?.council?.name, schedule?.room].some((value) => value?.toLocaleLowerCase('vi').includes(keyword)); });

  function openSupplement(item: DefenseDocument) { setSupplementTarget(item); setMissing([]); setReason(''); setFormError(''); }
  function toggleMissing(key: MissingKey) { setMissing((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]); }
  async function requestSupplement() {
    if (!supplementTarget) return;
    if (!missing.length) { setFormError('Vui lòng chọn ít nhất một tài liệu cần bổ sung.'); return; }
    if (!reason.trim()) { setFormError('Vui lòng nhập lý do hoặc yêu cầu cụ thể.'); return; }
    setProcessing(true); setFormError('');
    try {
      const note = `Tài liệu cần bổ sung: ${missing.map((key) => missingLabels[key]).join(', ')}. ${reason.trim()}`;
      await requestDefenseDocumentSupplement(supplementTarget.id, { secretaryNote: note });
      toast.success('Đã yêu cầu bổ sung hồ sơ', 'Sinh viên sẽ nhận được danh sách tài liệu còn thiếu.');
      setSupplementTarget(null); setSelected(null); await load(); setTab('PROCESSED');
    } catch (err) { toast.error('Không thể yêu cầu bổ sung', err instanceof Error ? err.message : undefined); }
    finally { setProcessing(false); }
  }
  async function approve() {
    if (!approveTarget) return;
    setProcessing(true);
    try { await approveDefenseDocument(approveTarget.id); toast.success('Hồ sơ đã được xác nhận hợp lệ'); setApproveTarget(null); setSelected(null); await load(); setTab('PROCESSED'); }
    catch (err) { toast.error('Không thể xác nhận hồ sơ', err instanceof Error ? err.message : undefined); }
    finally { setProcessing(false); }
  }

  return <div className="space-y-6">
    <PageHeader title="Kiểm tra hồ sơ bảo vệ" description="Kiểm tra checklist tài liệu theo từng lịch bảo vệ; xác nhận hồ sơ hợp lệ hoặc yêu cầu bổ sung đúng file còn thiếu." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryStatCard label="Tổng hồ sơ" value={stats.total} icon={ClipboardCheck} /><SummaryStatCard label="Chờ kiểm tra" value={stats.pending} tone="amber" /><SummaryStatCard label="Cần bổ sung" value={stats.supplement} icon={FileWarning} tone="rose" /><SummaryStatCard label="Hợp lệ" value={stats.approved} icon={CheckCircle2} tone="emerald" /></div>
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2"><button type="button" onClick={() => setTab('PENDING')} className={tab === 'PENDING' ? 'tab-button-active' : 'tab-button'}>Chờ xử lý ({stats.pending})</button><button type="button" onClick={() => setTab('PROCESSED')} className={tab === 'PROCESSED' ? 'tab-button-active' : 'tab-button'}>Đã xử lý ({stats.supplement + stats.approved})</button></div>
    <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm sinh viên, hội đồng hoặc phòng..." resultCount={visible.length} />
    {error && <ErrorState message={error} onRetry={() => void load()} />}
    {loading ? <LoadingSkeleton rows={5} /> : visible.length === 0 ? <EmptyState title="Không có hồ sơ phù hợp" description="Hồ sơ bảo vệ sẽ hiển thị theo trạng thái xử lý." /> : <div className="grid gap-4 xl:grid-cols-2">{visible.map((item) => { const schedule = item.defenseSchedule; return <article key={item.id} className="section-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-slate-950">{schedule?.student?.studentCode ?? 'Sinh viên'} – {schedule?.student?.user?.fullName ?? 'Chưa cập nhật'}</h2><p className="mt-1 text-sm text-slate-500">{schedule?.council?.name ?? 'Chưa có hội đồng'} · {schedule?.room ?? '-'}</p></div><StatusBadge value={item.status} /></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><Checklist present={Boolean(item.reportFile)} label="Báo cáo" /><Checklist present={Boolean(item.slideFile)} label="Slide" /><Checklist present={Boolean(item.additionalFile)} label="File khác" optional /></div><div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelected(item)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button>{item.status !== 'APPROVED' && <><button type="button" onClick={() => openSupplement(item)} className="secondary-button text-amber-700">Yêu cầu bổ sung</button><button type="button" onClick={() => setApproveTarget(item)} className="primary-button">Xác nhận hợp lệ</button></>}</div></article>; })}</div>}

    <DetailDrawer open={Boolean(selected)} onClose={() => !processing && setSelected(null)} title={selected ? `${selected.defenseSchedule?.student?.studentCode ?? ''} – ${selected.defenseSchedule?.student?.user?.fullName ?? 'Chi tiết hồ sơ'}` : 'Chi tiết hồ sơ'} description={selected ? `${selected.defenseSchedule?.council?.name ?? ''} · ${selected.defenseSchedule?.room ?? ''}` : undefined} footer={selected && selected.status !== 'APPROVED' ? <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => openSupplement(selected)} className="secondary-button">Yêu cầu bổ sung</button><button type="button" onClick={() => setApproveTarget(selected)} className="primary-button">Xác nhận hợp lệ</button></div> : undefined}>{selected && <div className="space-y-5"><section className="section-card"><div className="flex items-center justify-between"><h3 className="font-bold">Thông tin lịch bảo vệ</h3><StatusBadge value={selected.status} /></div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Info label="Hội đồng" value={selected.defenseSchedule?.council?.name} /><Info label="Phòng" value={selected.defenseSchedule?.room} /><Info label="Bắt đầu" value={selected.defenseSchedule?.startTime ? new Date(selected.defenseSchedule.startTime).toLocaleString('vi-VN') : '-'} /><Info label="Ngày nộp hồ sơ" value={new Date(selected.submittedAt).toLocaleString('vi-VN')} /></dl>{selected.secretaryNote && <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{selected.secretaryNote}</div>}</section><section className="section-card"><h3 className="font-bold">Checklist tài liệu</h3><div className="mt-4 space-y-3">{selected.reportFile ? <FileCard file={selected.reportFile} /> : <MissingFile label="Báo cáo" />}{selected.slideFile ? <FileCard file={selected.slideFile} /> : <MissingFile label="Slide" />}{selected.additionalFile ? <FileCard file={selected.additionalFile} /> : <MissingFile label="File bổ sung/phiếu xác nhận (nếu yêu cầu)" optional />}</div></section></div>}</DetailDrawer>

    <FormModal open={Boolean(supplementTarget)} onClose={() => !processing && setSupplementTarget(null)} title="Yêu cầu bổ sung hồ sơ" description="Chọn rõ tài liệu còn thiếu và nhập hướng dẫn cụ thể cho sinh viên." size="lg" closeDisabled={processing}><div className="space-y-5"><fieldset><legend className="text-sm font-semibold">Tài liệu cần bổ sung <span className="text-rose-600">*</span></legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{(Object.keys(missingLabels) as MissingKey[]).map((key) => <label key={key} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm"><input type="checkbox" checked={missing.includes(key)} onChange={() => toggleMissing(key)} className="h-4 w-4" />{missingLabels[key]}</label>)}</div></fieldset><label className="block text-sm font-semibold">Lý do/Yêu cầu cụ thể <span className="text-rose-600">*</span><textarea rows={5} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Mô tả file cần thay thế, định dạng hoặc nội dung phải bổ sung..." className="mt-2 field-input w-full resize-y" /></label>{formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={processing} onClick={() => setSupplementTarget(null)} className="secondary-button">Hủy</button><button type="button" disabled={processing} onClick={requestSupplement} className="primary-button disabled:opacity-50">{processing ? 'Đang xử lý...' : 'Gửi yêu cầu bổ sung'}</button></div></div></FormModal>
    <ConfirmActionModal open={Boolean(approveTarget)} onClose={() => !processing && setApproveTarget(null)} onConfirm={approve} loading={processing} title="Xác nhận hồ sơ hợp lệ" confirmLabel="Xác nhận hợp lệ" description={approveTarget ? <>Hồ sơ của <strong>{approveTarget.defenseSchedule?.student?.studentCode} – {approveTarget.defenseSchedule?.student?.user?.fullName}</strong> sẽ được xác nhận đầy đủ và tiếp tục sang bước chấm điểm/bảo vệ.</> : null} />
  </div>;
}
function Checklist({ present, label, optional = false }: { present: boolean; label: string; optional?: boolean }) { return <div className={`rounded-xl p-2 font-semibold ${present ? 'bg-emerald-50 text-emerald-700' : optional ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-700'}`}>{present ? '✓' : optional ? '○' : '✕'} {label}</div>; }
function Info({ label, value }: { label: string; value?: string | null }) { return <div><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value || '-'}</dd></div>; }
function MissingFile({ label, optional = false }: { label: string; optional?: boolean }) { return <div className={`rounded-2xl border border-dashed p-4 text-sm ${optional ? 'border-slate-300 text-slate-500' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{optional ? 'Chưa có' : 'Thiếu'}: {label}</div>; }
