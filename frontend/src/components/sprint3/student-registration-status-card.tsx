'use client';

import { Eye, UserRound } from 'lucide-react';
import { useState } from 'react';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import type { TopicRegistration } from '@/types/sprint3';

type Props = {
  registrations: TopicRegistration[];
  onCancel: (registration: TopicRegistration) => void;
  loading?: boolean;
};

export function StudentRegistrationStatusCard({ registrations, onCancel, loading }: Props) {
  const [selected, setSelected] = useState<TopicRegistration | null>(null);
  const active = registrations.find((item) => !['CANCELLED', 'FACULTY_REJECTED'].includes(item.status));

  if (!active) {
    return <EmptyState title="Chưa có đăng ký đang hoạt động" description="Bạn có thể chọn đề tài có sẵn hoặc gửi một đề xuất mới." />;
  }

  const title = active.topic?.title ?? active.proposedTitle ?? 'Đề tài chưa cập nhật';
  const supervisor = active.supervisorAssignment?.supervisor?.user.fullName
    ?? active.requestedSupervisor?.user.fullName
    ?? active.topic?.supervisor?.user?.fullName
    ?? 'Khoa sẽ phân công';

  return (
    <>
      <article className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Đăng ký đang hoạt động</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{title}</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><UserRound className="h-4 w-4" />GVHD: {supervisor}</p>
            {active.rejectedReason && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">Lý do: {active.rejectedReason}</p>}
            {active.supervisorResponseNote && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Phản hồi GVHD: {active.supervisorResponseNote}</p>}
          </div>
          <StatusBadge value={active.status} />
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => setSelected(active)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Eye className="h-4 w-4" /> Xem chi tiết
          </button>
          {!['OFFICIALLY_ASSIGNED', 'FACULTY_APPROVED'].includes(active.status) && (
            <button type="button" disabled={loading} onClick={() => onCancel(active)} className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
              {loading ? 'Đang xử lý...' : 'Hủy đăng ký'}
            </button>
          )}
        </div>
      </article>

      <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title="Chi tiết đăng ký đề tài" description={title}>
        {selected && (
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold text-slate-950">Trạng thái hiện tại</h3>
                <StatusBadge value={selected.status} />
              </div>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Hình thức đăng ký</dt><dd className="mt-1 font-semibold text-slate-900">{selected.registrationType === 'EXISTING_TOPIC' ? 'Đề tài có sẵn' : 'Sinh viên đề xuất'}</dd></div>
                <div><dt className="text-slate-500">Đợt đồ án</dt><dd className="mt-1 font-semibold text-slate-900">{selected.projectPeriod.name}</dd></div>
                <div><dt className="text-slate-500">GVHD</dt><dd className="mt-1 font-semibold text-slate-900">{supervisor}</dd></div>
                <div><dt className="text-slate-500">Ngày gửi</dt><dd className="mt-1 font-semibold text-slate-900">{new Date(selected.createdAt).toLocaleDateString('vi-VN')}</dd></div>
              </dl>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-slate-950">Nội dung đề tài</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selected.topic?.description ?? selected.proposedDescription ?? 'Chưa cập nhật.'}</p>
              {(selected.topic?.objectives || selected.proposedObjectives) && <><h4 className="mt-5 text-sm font-semibold text-slate-900">Mục tiêu</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selected.topic?.objectives ?? selected.proposedObjectives}</p></>}
              {(selected.topic?.expectedOutput || selected.proposedExpectedOutput) && <><h4 className="mt-5 text-sm font-semibold text-slate-900">Sản phẩm dự kiến</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selected.topic?.expectedOutput ?? selected.proposedExpectedOutput}</p></>}
            </section>
            {(selected.rejectedReason || selected.facultyNote || selected.supervisorResponseNote) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-950">Lịch sử xử lý gần nhất</h3>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  {selected.supervisorResponseNote && <p><strong>GVHD:</strong> {selected.supervisorResponseNote}</p>}
                  {selected.facultyNote && <p><strong>Khoa:</strong> {selected.facultyNote}</p>}
                  {selected.rejectedReason && <p className="text-rose-700"><strong>Lý do từ chối:</strong> {selected.rejectedReason}</p>}
                </div>
              </section>
            )}
          </div>
        )}
      </DetailDrawer>
    </>
  );
}
