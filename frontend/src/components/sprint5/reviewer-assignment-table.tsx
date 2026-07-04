'use client';

import { useMemo, useState } from 'react';
import { Eye, UserPlus } from 'lucide-react';
import { ReviewerSelect } from '@/components/common/selects';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { FileCard } from '@/components/common/file-card';
import { StatusBadge } from '@/components/common/status-badge';
import { useToast } from '@/components/providers/toast-provider';
import { createReviewerAssignment } from '@/services/reviewers.service';
import type { LookupOption } from '@/services/lookups.service';
import type { DefenseRegistration, ReviewerAssignment } from '@/types/sprint5';

export function ReviewerAssignmentTable({ defenseItems, assignments, onChanged, tab, search = '' }: { defenseItems: DefenseRegistration[]; assignments: ReviewerAssignment[]; onChanged: () => Promise<void>; tab: 'UNASSIGNED' | 'ASSIGNED'; search?: string }) {
  const toast = useToast();
  const [reviewerById, setReviewerById] = useState<Record<string, { id: string; option?: LookupOption }>>({});
  const [target, setTarget] = useState<DefenseRegistration | null>(null);
  const [selectedDefense, setSelectedDefense] = useState<DefenseRegistration | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<ReviewerAssignment | null>(null);
  const [loading, setLoading] = useState(false);
  const keyword = search.trim().toLocaleLowerCase('vi');
  const pending = useMemo(() => defenseItems.filter((item) => !keyword || [item.student.studentCode, item.student.user.fullName, item.title, item.supervisor.user.fullName].some((value) => value.toLocaleLowerCase('vi').includes(keyword))), [defenseItems, keyword]);
  const assigned = useMemo(() => assignments.filter((item) => !keyword || [item.student.studentCode, item.student.user.fullName, item.defenseRegistration.title, item.reviewer.user.fullName].some((value) => value.toLocaleLowerCase('vi').includes(keyword))), [assignments, keyword]);

  async function assign() {
    if (!target) return;
    const selected = reviewerById[target.id];
    if (!selected?.id) { toast.error('Chưa chọn giảng viên phản biện'); return; }
    if (selected.id === target.supervisor.id) { toast.error('Phân công không hợp lệ', 'GVPB không được trùng với GVHD.'); return; }
    setLoading(true);
    try {
      await createReviewerAssignment({ defenseRegistrationId: target.id, reviewerId: selected.id });
      toast.success('Đã phân công GVPB', `${selected.option?.label ?? 'Giảng viên đã chọn'} phụ trách hồ sơ ${target.student.studentCode}.`);
      setReviewerById((current) => ({ ...current, [target.id]: { id: '' } }));
      setTarget(null);
      await onChanged();
    } catch (err) { toast.error('Phân công thất bại', err instanceof Error ? err.message : undefined); }
    finally { setLoading(false); }
  }

  if (tab === 'UNASSIGNED' && pending.length === 0) return <EmptyState title="Không còn hồ sơ chưa phân công" description="Các hồ sơ đủ điều kiện đã được gán giảng viên phản biện." />;
  if (tab === 'ASSIGNED' && assigned.length === 0) return <EmptyState title="Chưa có phân công phản biện" description="Phân công đã xác nhận sẽ hiển thị tại đây." />;

  return <>
    {tab === 'UNASSIGNED' ? <div className="grid gap-4 xl:grid-cols-2">{pending.map((item) => <article key={item.id} className="section-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">{item.student.studentCode} – {item.student.user.fullName}</h3><p className="mt-1 line-clamp-1 text-sm text-slate-500">{item.title}</p></div><StatusBadge value={item.status} /></div><p className="mt-4 text-sm text-slate-600">GVHD: <strong>{item.supervisor.user.fullName}</strong></p><div className="mt-4"><ReviewerSelect value={reviewerById[item.id]?.id ?? ''} excludeLecturerId={item.supervisor.id} onChange={(id, option) => setReviewerById((current) => ({ ...current, [item.id]: { id, option } }))} label="GVPB chính thức" /></div><div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelectedDefense(item)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button><button type="button" disabled={!reviewerById[item.id]?.id} onClick={() => setTarget(item)} className="primary-button disabled:opacity-50"><UserPlus className="mr-1.5 h-4 w-4" />Xác nhận phân công</button></div></article>)}</div> : <div className="grid gap-4 xl:grid-cols-2">{assigned.map((item) => <article key={item.id} className="section-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">{item.student.studentCode} – {item.student.user.fullName}</h3><p className="mt-1 line-clamp-1 text-sm text-slate-500">{item.defenseRegistration.title}</p></div><StatusBadge value={item.status} /></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-slate-500">GVPB:</span> <strong>{item.reviewer.user.fullName}</strong></p><p><span className="text-slate-500">Phân công:</span> <strong>{new Date(item.assignedAt).toLocaleDateString('vi-VN')}</strong></p></div><div className="mt-4 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelectedAssignment(item)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button></div></article>)}</div>}

    <DetailDrawer open={Boolean(selectedDefense || selectedAssignment)} onClose={() => { setSelectedDefense(null); setSelectedAssignment(null); }} title={selectedDefense ? `${selectedDefense.student.studentCode} – ${selectedDefense.student.user.fullName}` : selectedAssignment ? `${selectedAssignment.student.studentCode} – ${selectedAssignment.student.user.fullName}` : 'Chi tiết hồ sơ'} description={(selectedDefense ?? selectedAssignment?.defenseRegistration)?.title}>
      {(() => { const registration = selectedDefense ?? selectedAssignment?.defenseRegistration; if (!registration) return null; return <div className="space-y-5"><section className="section-card"><div className="flex items-center justify-between"><h3 className="font-bold">Thông tin phân công</h3><StatusBadge value={selectedAssignment?.status ?? registration.status} /></div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Info label="Sinh viên" value={`${registration.student.studentCode} – ${registration.student.user.fullName}`} /><Info label="GVHD" value={registration.supervisor.user.fullName} /><Info label="GVPB" value={selectedAssignment?.reviewer.user.fullName ?? 'Chưa phân công'} /><Info label="Ngày nộp" value={new Date(registration.submittedAt).toLocaleDateString('vi-VN')} /></dl></section><section className="section-card"><h3 className="font-bold">Nội dung và file</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{registration.summary || 'Chưa có tóm tắt.'}</p><div className="mt-4 space-y-3">{registration.reportFile && <FileCard file={registration.reportFile} />}{registration.slideFile && <FileCard file={registration.slideFile} />}{registration.additionalDocumentFile && <FileCard file={registration.additionalDocumentFile} />}</div></section>{selectedAssignment?.evaluation && <section className="section-card"><h3 className="font-bold">Kết quả phản biện</h3><p className="mt-3 text-sm leading-6 text-slate-600">{selectedAssignment.evaluation.comment}</p><div className="mt-3"><StatusBadge value={selectedAssignment.evaluation.eligibilityStatus} /></div></section>}</div>; })()}
    </DetailDrawer>
    <ConfirmActionModal open={Boolean(target)} onClose={() => !loading && setTarget(null)} onConfirm={assign} loading={loading} title="Xác nhận phân công GVPB" confirmLabel="Xác nhận phân công" description={target ? <>Phân công <strong>{reviewerById[target.id]?.option?.label ?? 'giảng viên đã chọn'}</strong> phản biện hồ sơ của <strong>{target.student.studentCode} – {target.student.user.fullName}</strong>. Sau xác nhận, GVPB sẽ nhận được thông báo và quyền truy cập hồ sơ.</> : null} />
  </>;
}
function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value}</dd></div>; }
