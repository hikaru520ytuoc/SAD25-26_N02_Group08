'use client';

import { StatusBadge } from '@/components/sprint2/status-badge';
import type { TopicRegistration } from '@/types/sprint3';

type Props = {
  registrations: TopicRegistration[];
  onCancel: (id: string) => Promise<void>;
  loading?: boolean;
};

export function StudentRegistrationStatusCard({ registrations, onCancel, loading }: Props) {
  const active = registrations.find((item) => !['CANCELLED', 'FACULTY_REJECTED'].includes(item.status));

  if (!active) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">Bạn chưa có đăng ký đề tài active.</div>;
  }

  return (
    <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Trạng thái đăng ký hiện tại</h2>
          <p className="mt-2 text-slate-700">{active.topic?.title ?? active.proposedTitle}</p>
          <p className="mt-1 text-sm text-slate-600">GVHD: {active.requestedSupervisor?.user.fullName ?? active.topic?.supervisor?.user?.fullName ?? 'Chưa có'}</p>
          {active.rejectedReason && <p className="mt-2 text-sm text-red-600">Lý do từ chối: {active.rejectedReason}</p>}
        </div>
        <StatusBadge value={active.status} />
      </div>
      {active.status !== 'OFFICIALLY_ASSIGNED' && (
        <button disabled={loading} onClick={() => onCancel(active.id)} className="mt-5 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">
          Hủy đăng ký
        </button>
      )}
    </div>
  );
}
