'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, FilePenLine, Save } from 'lucide-react';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { FileCard } from '@/components/common/file-card';
import { FormModal } from '@/components/common/form-modal';
import { StatusBadge } from '@/components/common/status-badge';
import { useToast } from '@/components/providers/toast-provider';
import { submitReviewerEvaluation } from '@/services/reviewers.service';
import type { ReviewerAssignment } from '@/types/sprint5';

type Draft = { comment: string; strengths: string; weaknesses: string; questionSuggestions: string; eligibilityStatus: 'ELIGIBLE_FOR_DEFENSE' | 'NOT_ELIGIBLE_FOR_DEFENSE'; feedbackToStudent: string; score: string; scoreComment: string };
const emptyDraft: Draft = { comment: '', strengths: '', weaknesses: '', questionSuggestions: '', eligibilityStatus: 'ELIGIBLE_FOR_DEFENSE', feedbackToStudent: '', score: '', scoreComment: '' };
const draftKey = (id: string) => `reviewer-evaluation-draft:${id}`;

export function ReviewerEvaluationForm({ assignments, onChanged, tab, search = '' }: { assignments: ReviewerAssignment[]; onChanged: () => Promise<void>; tab: 'PENDING' | 'COMPLETED'; search?: string }) {
  const toast = useToast();
  const [selected, setSelected] = useState<ReviewerAssignment | null>(null);
  const [editing, setEditing] = useState<ReviewerAssignment | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    return assignments.filter((item) => (tab === 'PENDING' ? item.status === 'ASSIGNED' : item.status === 'COMPLETED')).filter((item) => !keyword || [item.student.studentCode, item.student.user.fullName, item.defenseRegistration.title, item.supervisor.user.fullName].some((value) => value.toLocaleLowerCase('vi').includes(keyword)));
  }, [assignments, search, tab]);

  useEffect(() => {
    if (!editing) return;
    const persisted = window.localStorage.getItem(draftKey(editing.id));
    const evaluation = editing.evaluation;
    setDraft(persisted ? JSON.parse(persisted) as Draft : { comment: evaluation?.comment ?? '', strengths: evaluation?.strengths ?? '', weaknesses: evaluation?.weaknesses ?? '', questionSuggestions: evaluation?.questionSuggestions ?? '', eligibilityStatus: evaluation?.eligibilityStatus ?? 'ELIGIBLE_FOR_DEFENSE', feedbackToStudent: evaluation?.feedbackToStudent ?? '', score: editing.reviewerScore?.score?.toString() ?? '', scoreComment: editing.reviewerScore?.comment ?? '' });
    setError('');
  }, [editing]);

  function validate() {
    if (!draft.comment.trim()) return 'Nhận xét phản biện là bắt buộc.';
    if (draft.eligibilityStatus === 'NOT_ELIGIBLE_FOR_DEFENSE' && !draft.feedbackToStudent.trim()) return 'Phản hồi cho sinh viên là bắt buộc khi hồ sơ chưa đủ điều kiện.';
    if (draft.score && (!Number.isFinite(Number(draft.score)) || Number(draft.score) < 0 || Number(draft.score) > 10)) return 'Điểm phản biện phải nằm trong khoảng 0–10.';
    return '';
  }
  function saveDraft() { if (!editing) return; window.localStorage.setItem(draftKey(editing.id), JSON.stringify(draft)); toast.success('Đã lưu nháp trên thiết bị', 'Bản nháp sẽ được khôi phục khi mở lại hồ sơ trên trình duyệt này.'); }
  function askComplete() { const message = validate(); if (message) { setError(message); return; } setConfirming(true); }
  async function complete() {
    if (!editing) return;
    setLoading(true); setError('');
    try {
      await submitReviewerEvaluation({ reviewerAssignmentId: editing.id, comment: draft.comment.trim(), strengths: draft.strengths.trim() || undefined, weaknesses: draft.weaknesses.trim() || undefined, questionSuggestions: draft.questionSuggestions.trim() || undefined, eligibilityStatus: draft.eligibilityStatus, feedbackToStudent: draft.feedbackToStudent.trim() || undefined, score: draft.score ? Number(draft.score) : undefined, scoreComment: draft.scoreComment.trim() || undefined });
      window.localStorage.removeItem(draftKey(editing.id));
      toast.success('Đã hoàn tất phản biện', `${editing.student.studentCode} – ${editing.student.user.fullName}`);
      setConfirming(false); setEditing(null); setSelected(null); await onChanged();
    } catch (err) { toast.error('Không thể hoàn tất phản biện', err instanceof Error ? err.message : undefined); }
    finally { setLoading(false); }
  }

  if (!filtered.length) return <EmptyState title={tab === 'PENDING' ? 'Không có hồ sơ chờ phản biện' : 'Chưa có phản biện hoàn tất'} description="Hồ sơ phù hợp sẽ hiển thị tại đây." />;
  return <>
    <div className="grid gap-4 xl:grid-cols-2">{filtered.map((item) => <article key={item.id} className="section-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">{item.student.studentCode} – {item.student.user.fullName}</h3><p className="mt-1 line-clamp-1 text-sm text-slate-500">{item.defenseRegistration.title}</p></div><StatusBadge value={item.status} /></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-slate-500">GVHD:</span> <strong>{item.supervisor.user.fullName}</strong></p><p><span className="text-slate-500">Ngày phân công:</span> <strong>{new Date(item.assignedAt).toLocaleDateString('vi-VN')}</strong></p></div><div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelected(item)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button>{item.status === 'ASSIGNED' && <button type="button" onClick={() => setEditing(item)} className="primary-button"><FilePenLine className="mr-1.5 h-4 w-4" />Nhập phản biện</button>}</div></article>)}</div>

    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${selected.student.studentCode} – ${selected.student.user.fullName}` : 'Hồ sơ phản biện'} description={selected?.defenseRegistration.title} footer={selected?.status === 'ASSIGNED' ? <div className="flex justify-end"><button type="button" onClick={() => setEditing(selected)} className="primary-button">Nhập phản biện</button></div> : undefined}>{selected && <div className="space-y-5"><section className="section-card"><div className="flex items-center justify-between"><h3 className="font-bold">Thông tin hồ sơ</h3><StatusBadge value={selected.status} /></div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Info label="Sinh viên" value={`${selected.student.studentCode} – ${selected.student.user.fullName}`} /><Info label="GVHD" value={selected.supervisor.user.fullName} /><Info label="Tóm tắt" value={selected.defenseRegistration.summary || 'Chưa cập nhật'} /></dl></section><section className="section-card"><h3 className="font-bold">Tài liệu</h3><div className="mt-4 space-y-3">{selected.defenseRegistration.reportFile && <FileCard file={selected.defenseRegistration.reportFile} />}{selected.defenseRegistration.slideFile && <FileCard file={selected.defenseRegistration.slideFile} />}{selected.defenseRegistration.additionalDocumentFile && <FileCard file={selected.defenseRegistration.additionalDocumentFile} />}</div></section>{selected.evaluation && <section className="section-card"><div className="flex items-center justify-between"><h3 className="font-bold">Đánh giá đã hoàn tất</h3><StatusBadge value={selected.evaluation.eligibilityStatus} /></div><div className="mt-4 space-y-3 text-sm"><Info label="Nhận xét" value={selected.evaluation.comment} /><Info label="Ưu điểm" value={selected.evaluation.strengths || 'Chưa cập nhật'} /><Info label="Hạn chế" value={selected.evaluation.weaknesses || 'Chưa cập nhật'} /><Info label="Câu hỏi gợi ý" value={selected.evaluation.questionSuggestions || 'Chưa cập nhật'} /><Info label="Phản hồi sinh viên" value={selected.evaluation.feedbackToStudent || 'Không có'} /><Info label="Điểm" value={selected.reviewerScore?.score?.toString() ?? 'Chưa nhập'} /></div></section>}</div>}</DetailDrawer>

    <FormModal open={Boolean(editing)} onClose={() => !loading && setEditing(null)} title="Đánh giá phản biện" description={editing ? `${editing.student.studentCode} – ${editing.student.user.fullName}` : undefined} size="2xl" closeDisabled={loading}><div className="grid gap-5 md:grid-cols-2"><Field label="Nhận xét tổng thể *" value={draft.comment} onChange={(value) => setDraft({ ...draft, comment: value })} rows={5} className="md:col-span-2" /><Field label="Ưu điểm" value={draft.strengths} onChange={(value) => setDraft({ ...draft, strengths: value })} /><Field label="Hạn chế" value={draft.weaknesses} onChange={(value) => setDraft({ ...draft, weaknesses: value })} /><Field label="Câu hỏi gợi ý" value={draft.questionSuggestions} onChange={(value) => setDraft({ ...draft, questionSuggestions: value })} /><Field label="Phản hồi cho sinh viên" value={draft.feedbackToStudent} onChange={(value) => setDraft({ ...draft, feedbackToStudent: value })} /><label className="block text-sm font-semibold">Kết luận<select value={draft.eligibilityStatus} onChange={(event) => setDraft({ ...draft, eligibilityStatus: event.target.value as Draft['eligibilityStatus'] })} className="mt-2 field-input w-full"><option value="ELIGIBLE_FOR_DEFENSE">Đủ điều kiện bảo vệ</option><option value="NOT_ELIGIBLE_FOR_DEFENSE">Chưa đủ điều kiện bảo vệ</option></select></label><label className="block text-sm font-semibold">Điểm phản biện (0–10)<input type="number" min="0" max="10" step="0.01" value={draft.score} onChange={(event) => setDraft({ ...draft, score: event.target.value })} className="mt-2 field-input w-full" /></label><Field label="Nhận xét điểm" value={draft.scoreComment} onChange={(value) => setDraft({ ...draft, scoreComment: value })} className="md:col-span-2" />{error && <p className="md:col-span-2 text-sm font-medium text-rose-600">{error}</p>}<div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 md:col-span-2 sm:flex-row sm:justify-end"><button type="button" disabled={loading} onClick={saveDraft} className="secondary-button"><Save className="mr-1.5 h-4 w-4" />Lưu nháp trên thiết bị</button><button type="button" disabled={loading} onClick={askComplete} className="primary-button"><CheckCircle2 className="mr-1.5 h-4 w-4" />Hoàn tất phản biện</button></div></div></FormModal>
    <ConfirmActionModal open={confirming} onClose={() => !loading && setConfirming(false)} onConfirm={complete} loading={loading} title="Hoàn tất phản biện" confirmLabel="Hoàn tất và khóa xử lý" description={editing ? <>Đánh giá của <strong>{editing.student.studentCode} – {editing.student.user.fullName}</strong> sẽ được gửi chính thức; trạng thái hồ sơ và quyền hành động tiếp theo sẽ thay đổi.</> : null} />
  </>;
}
function Field({ label, value, onChange, rows = 3, className = '' }: { label: string; value: string; onChange: (value: string) => void; rows?: number; className?: string }) { return <label className={`block text-sm font-semibold ${className}`}>{label}<textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 field-input w-full resize-y" /></label>; }
function Info({ label, value }: { label: string; value: string }) { return <div><dt className="font-semibold text-slate-800">{label}</dt><dd className="mt-1 whitespace-pre-wrap leading-6 text-slate-600">{value}</dd></div>; }
