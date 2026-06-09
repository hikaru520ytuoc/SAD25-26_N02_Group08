'use client';

import { StatusBadge } from '@/components/sprint2/status-badge';
import type { LecturerOption, TopicRegistration } from '@/types/sprint3';

type Props = {
  items: TopicRegistration[];
  supervisors: LecturerOption[];
  onAssign: (id: string, supervisorId: string) => Promise<void>;
  onConfirm: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  loading?: boolean;
};

export function FacultyRegistrationTable({ items, supervisors, onAssign, onConfirm, onReject, loading }: Props) {
  if (items.length === 0) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500">Chưa có đăng ký đề tài.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Sinh viên</th>
            <th className="px-4 py-3">Loại</th>
            <th className="px-4 py-3">Đề tài</th>
            <th className="px-4 py-3">GVHD</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-900">{item.student.user.fullName}</p>
                <p className="text-xs text-slate-500">{item.student.studentCode}</p>
              </td>
              <td className="px-4 py-3">{item.registrationType}</td>
              <td className="px-4 py-3">
                <p className="font-medium">{item.topic?.title ?? item.proposedTitle}</p>
                <p className="line-clamp-2 text-xs text-slate-500">{item.topic?.description ?? item.proposedDescription}</p>
              </td>
              <td className="px-4 py-3">{item.requestedSupervisor?.user.fullName ?? item.topic?.supervisor?.user?.fullName ?? 'Chưa có'}</td>
              <td className="px-4 py-3"><StatusBadge value={item.status} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <select
                    className="rounded-lg border px-2 py-2 text-xs"
                    disabled={loading}
                    defaultValue=""
                    onChange={(event) => event.target.value && onAssign(item.id, event.target.value)}
                  >
                    <option value="">Phân công GVHD</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>{supervisor.user.fullName}</option>
                    ))}
                  </select>
                  <button disabled={loading} onClick={() => onConfirm(item.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Xác nhận</button>
                  <button disabled={loading} onClick={() => {
                    const reason = window.prompt('Nhập lý do từ chối');
                    if (reason) onReject(item.id, reason);
                  }} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Từ chối</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
