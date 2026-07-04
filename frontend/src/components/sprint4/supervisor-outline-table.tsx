'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, FileClock } from 'lucide-react';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { FileCard } from '@/components/common/file-card';
import { ReasonModal } from '@/components/common/reason-modal';
import { StatusBadge } from '@/components/common/status-badge';
import { useToast } from '@/components/providers/toast-provider';
import { approveOutline, requestOutlineRevision } from '@/services/outlines.service';
import type { Outline } from '@/types/sprint4';

export function SupervisorOutlineTable({ outlines, onChanged, search = '' }: { outlines: Outline[]; onChanged: () => Promise<void>; search?: string }) {
  const toast = useToast();
  const [selected, setSelected] = useState<Outline | null>(null);
  const [approveTarget, setApproveTarget] = useState<Outline | null>(null);
  const [reviseTarget, setReviseTarget] = useState<Outline | null>(null);
  const [loadingId, setLoadingId] = useState('');
  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    return keyword ? outlines.filter((item) => [item.student.studentCode, item.student.user.fullName, item.title, item.supervisorAssignment.topic?.title].some((value) => value?.toLocaleLowerCase('vi').includes(keyword))) : outlines;
  }, [outlines, search]);

  async function approve() {
    if (!approveTarget) return;
    setLoadingId(approveTarget.id);
    try {
      await approveOutline(approveTarget.id);
      toast.success('Đã phê duyệt đề cương', `${approveTarget.student.studentCode} – ${approveTarget.student.user.fullName}`);
      setApproveTarget(null);
      setSelected((current) => current?.id === approveTarget.id ? { ...current, status: 'APPROVED' } : current);
      await onChanged();
    } catch (err) { toast.error('Không thể duyệt đề cương', err instanceof Error ? err.message : undefined); }
    finally { setLoadingId(''); }
  }

  async function revise(reason: string) {
    if (!reviseTarget) return;
    setLoadingId(reviseTarget.id);
    try {
      await requestOutlineRevision(reviseTarget.id, { feedback: reason });
      toast.success('Đã yêu cầu chỉnh sửa', 'Sinh viên sẽ nhận được nội dung phản hồi.');
      setReviseTarget(null);
      setSelected((current) => current?.id === reviseTarget.id ? { ...current, status: 'NEEDS_REVISION', feedback: reason } : current);
      await onChanged();
    } catch (err) { toast.error('Không thể gửi yêu cầu chỉnh sửa', err instanceof Error ? err.message : undefined); }
    finally { setLoadingId(''); }
  }

  if (!filtered.length) return <EmptyState title="Chưa có đề cương" description="Không có đề cương phù hợp với trạng thái hoặc từ khóa hiện tại." />;

  return <>
    <div className="grid gap-4 xl:grid-cols-2">
      {filtered.map((outline) => (
        <article key={outline.id} className="section-card">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">{outline.student.studentCode} – {outline.student.user.fullName}</h3><p className="mt-1 line-clamp-1 text-sm text-slate-500">{outline.title}</p></div><StatusBadge value={outline.status} /></div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-slate-500">Phiên bản:</span> <strong>{outline.currentVersion}</strong></p><p><span className="text-slate-500">Nộp ngày:</span> <strong>{new Date(outline.submittedAt).toLocaleDateString('vi-VN')}</strong></p></div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelected(outline)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button>{outline.status !== 'APPROVED' && <><button type="button" onClick={() => setReviseTarget(outline)} className="secondary-button text-amber-700"><FileClock className="mr-1.5 h-4 w-4" />Yêu cầu chỉnh sửa</button><button type="button" onClick={() => setApproveTarget(outline)} className="primary-button"><CheckCircle2 className="mr-1.5 h-4 w-4" />Phê duyệt</button></>}</div>
        </article>
      ))}
    </div>
    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${selected.student.studentCode} – ${selected.student.user.fullName}` : 'Chi tiết đề cương'} description={selected?.title} footer={selected && selected.status !== 'APPROVED' ? <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setReviseTarget(selected)} className="secondary-button">Yêu cầu chỉnh sửa</button><button type="button" onClick={() => setApproveTarget(selected)} className="primary-button">Phê duyệt</button></div> : undefined}>
      {selected && <div className="space-y-5"><section className="section-card"><div className="flex items-center justify-between gap-3"><h3 className="font-bold">Nội dung đề cương</h3><StatusBadge value={selected.status} /></div><dl className="mt-4 space-y-4 text-sm"><Info label="Tóm tắt" value={selected.summary} /><Info label="Mục tiêu" value={selected.objectives} /><Info label="Phương pháp" value={selected.methodology} /><Info label="Sản phẩm dự kiến" value={selected.expectedOutput} /><Info label="Kế hoạch" value={selected.timeline} /></dl>{selected.feedback && <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"><strong>Phản hồi gần nhất:</strong> {selected.feedback}</div>}</section><section className="section-card"><h3 className="font-bold">File và lịch sử phiên bản</h3><div className="mt-4 space-y-4">{selected.versions.map((version) => <div key={version.id} className="rounded-2xl bg-slate-50 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">Phiên bản {version.versionNumber}</p><span className="text-xs text-slate-500">{new Date(version.submittedAt).toLocaleString('vi-VN')}</span></div>{version.fileDocument ? <FileCard file={{ ...version.fileDocument, versionNumber: version.versionNumber }} /> : <p className="text-sm text-slate-500">Không có file đính kèm.</p>}{version.submitNote && <p className="mt-3 text-sm text-slate-600">Ghi chú: {version.submitNote}</p>}</div>)}</div></section></div>}
    </DetailDrawer>
    <ConfirmActionModal open={Boolean(approveTarget)} onClose={() => !loadingId && setApproveTarget(null)} onConfirm={approve} loading={Boolean(loadingId)} title="Phê duyệt đề cương" confirmLabel="Phê duyệt" description={approveTarget ? <>Đề cương của <strong>{approveTarget.student.studentCode} – {approveTarget.student.user.fullName}</strong> sẽ chuyển sang trạng thái đã duyệt và sinh viên có thể tiếp tục workflow.</> : null} />
    <ReasonModal open={Boolean(reviseTarget)} onClose={() => !loadingId && setReviseTarget(null)} onSubmit={revise} loading={Boolean(loadingId)} title="Yêu cầu chỉnh sửa đề cương" submitLabel="Gửi yêu cầu" label="Nội dung cần chỉnh sửa" description="Nêu rõ nội dung chưa đạt và hướng sửa để sinh viên có thể nộp phiên bản mới." />
  </>;
}

function Info({ label, value }: { label: string; value?: string | null }) { return <div><dt className="font-semibold text-slate-800">{label}</dt><dd className="mt-1 whitespace-pre-wrap leading-6 text-slate-600">{value || 'Chưa cập nhật'}</dd></div>; }
