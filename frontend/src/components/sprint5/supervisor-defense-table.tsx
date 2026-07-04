'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, FileWarning } from 'lucide-react';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { FileCard } from '@/components/common/file-card';
import { FormModal } from '@/components/common/form-modal';
import { ReasonModal } from '@/components/common/reason-modal';
import { StatusBadge } from '@/components/common/status-badge';
import { useToast } from '@/components/providers/toast-provider';
import type { DefenseRegistration } from '@/types/sprint5';
import { approveDefenseRegistration, rejectDefenseRegistration } from '@/services/defense-registrations.service';

export function SupervisorDefenseTable({ items, onChanged, search = '' }: { items: DefenseRegistration[]; onChanged: () => Promise<void>; search?: string }) {
  const toast = useToast();
  const [selected, setSelected] = useState<DefenseRegistration | null>(null);
  const [approveTarget, setApproveTarget] = useState<DefenseRegistration | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DefenseRegistration | null>(null);
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    return keyword ? items.filter((item) => [item.student.studentCode, item.student.user.fullName, item.title, item.topicRegistration?.topic?.title].some((value) => value?.toLocaleLowerCase('vi').includes(keyword))) : items;
  }, [items, search]);

  function openApprove(item: DefenseRegistration) { setApproveTarget(item); setScore(item.supervisorScore?.score?.toString() ?? ''); setComment(item.supervisorScore?.comment ?? ''); setFormError(''); }
  async function approve() {
    if (!approveTarget) return;
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 10) { setFormError('Điểm GVHD phải nằm trong khoảng 0–10.'); return; }
    setLoading(true); setFormError('');
    try { await approveDefenseRegistration(approveTarget.id, { score: numericScore, comment: comment.trim() || 'Đủ điều kiện bảo vệ' }); toast.success('Đã xác nhận đủ điều kiện bảo vệ', `${approveTarget.student.studentCode} – ${approveTarget.student.user.fullName}`); setApproveTarget(null); setSelected(null); await onChanged(); }
    catch (err) { toast.error('Không thể xác nhận hồ sơ', err instanceof Error ? err.message : undefined); }
    finally { setLoading(false); }
  }
  async function reject(reason: string) {
    if (!rejectTarget) return;
    setLoading(true);
    try { await rejectDefenseRegistration(rejectTarget.id, { feedback: reason }); toast.success('Đã yêu cầu bổ sung hồ sơ', 'Sinh viên sẽ nhận được phản hồi và có thể nộp lại.'); setRejectTarget(null); setSelected(null); await onChanged(); }
    catch (err) { toast.error('Không thể gửi yêu cầu bổ sung', err instanceof Error ? err.message : undefined); }
    finally { setLoading(false); }
  }

  if (!filtered.length) return <EmptyState title="Chưa có hồ sơ bảo vệ" description="Không có hồ sơ phù hợp với bộ lọc hiện tại." />;
  return <>
    <div className="grid gap-4 xl:grid-cols-2">{filtered.map((item) => <article key={item.id} className="section-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">{item.student.studentCode} – {item.student.user.fullName}</h3><p className="mt-1 line-clamp-1 text-sm text-slate-500">{item.title}</p></div><StatusBadge value={item.status} /></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-slate-500">Nộp ngày:</span> <strong>{new Date(item.submittedAt).toLocaleDateString('vi-VN')}</strong></p><p><span className="text-slate-500">File:</span> <strong>{[item.reportFile, item.slideFile, item.additionalDocumentFile].filter(Boolean).length}</strong></p></div><div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelected(item)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button>{['SUBMITTED', 'NEEDS_REVISION'].includes(item.status) && <><button type="button" onClick={() => setRejectTarget(item)} className="secondary-button text-amber-700"><FileWarning className="mr-1.5 h-4 w-4" />Yêu cầu bổ sung</button><button type="button" onClick={() => openApprove(item)} className="primary-button"><CheckCircle2 className="mr-1.5 h-4 w-4" />Xác nhận</button></>}</div></article>)}</div>
    <DetailDrawer open={Boolean(selected)} onClose={() => !loading && setSelected(null)} title={selected ? `${selected.student.studentCode} – ${selected.student.user.fullName}` : 'Chi tiết hồ sơ'} description={selected?.title} footer={selected && ['SUBMITTED', 'NEEDS_REVISION'].includes(selected.status) ? <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setRejectTarget(selected)} className="secondary-button">Yêu cầu bổ sung</button><button type="button" onClick={() => openApprove(selected)} className="primary-button">Xác nhận đủ điều kiện</button></div> : undefined}>{selected && <div className="space-y-5"><section className="section-card"><div className="flex items-center justify-between gap-3"><h3 className="font-bold">Thông tin hồ sơ</h3><StatusBadge value={selected.status} /></div><dl className="mt-4 space-y-4 text-sm"><Info label="Tóm tắt" value={selected.summary} /><Info label="Ghi chú sinh viên" value={selected.studentNote} /><Info label="Phản hồi GVHD" value={selected.supervisorFeedback} /></dl></section><section className="section-card"><h3 className="font-bold">Tài liệu bảo vệ</h3><div className="mt-4 space-y-3">{selected.reportFile && <FileCard file={selected.reportFile} />}{selected.slideFile && <FileCard file={selected.slideFile} />}{selected.additionalDocumentFile && <FileCard file={selected.additionalDocumentFile} />}{![selected.reportFile, selected.slideFile, selected.additionalDocumentFile].some(Boolean) && <p className="text-sm text-slate-500">Chưa có file.</p>}</div></section>{selected.supervisorScore && <section className="section-card"><h3 className="font-bold">Điểm GVHD</h3><p className="mt-3 text-3xl font-bold text-emerald-700">{selected.supervisorScore.score.toFixed(2)}</p><p className="mt-2 text-sm text-slate-600">{selected.supervisorScore.comment || 'Không có nhận xét.'}</p></section>}</div>}</DetailDrawer>
    <FormModal open={Boolean(approveTarget)} onClose={() => !loading && setApproveTarget(null)} title="Xác nhận điều kiện bảo vệ" description={approveTarget ? `${approveTarget.student.studentCode} – ${approveTarget.student.user.fullName}` : undefined} size="lg" closeDisabled={loading}><div className="space-y-5"><label className="block text-sm font-semibold">Điểm GVHD (0–10) <span className="text-rose-600">*</span><input type="number" min="0" max="10" step="0.01" value={score} onChange={(event) => setScore(event.target.value)} className="mt-2 field-input w-full" /></label><label className="block text-sm font-semibold">Nhận xét<textarea rows={4} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Nhận xét mức độ hoàn thành và điều kiện bảo vệ..." className="mt-2 field-input w-full resize-y" /></label>{formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={loading} onClick={() => setApproveTarget(null)} className="secondary-button">Hủy</button><button type="button" disabled={loading} onClick={approve} className="primary-button disabled:opacity-50">{loading ? 'Đang xác nhận...' : 'Xác nhận đủ điều kiện'}</button></div></div></FormModal>
    <ReasonModal open={Boolean(rejectTarget)} onClose={() => !loading && setRejectTarget(null)} onSubmit={reject} loading={loading} title="Yêu cầu bổ sung hồ sơ bảo vệ" label="Nội dung cần bổ sung" submitLabel="Gửi yêu cầu" />
  </>;
}
function Info({ label, value }: { label: string; value?: string | null }) { return <div><dt className="font-semibold text-slate-800">{label}</dt><dd className="mt-1 whitespace-pre-wrap leading-6 text-slate-600">{value || 'Chưa cập nhật'}</dd></div>; }
