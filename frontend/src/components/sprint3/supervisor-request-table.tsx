'use client';

import { StatusBadge } from '@/components/sprint2/status-badge';
import type { TopicRegistration } from '@/types/sprint3';

type Props = {
  items: TopicRegistration[];
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  loading?: boolean;
};

export function SupervisorRequestTable({ items, onAccept, onReject, loading }: Props) {
  if (items.length === 0) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500">Không có yêu cầu hướng dẫn đang chờ.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Sinh viên</th>
            <th className="px-4 py-3">Đề tài đề xuất</th>
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
              <td className="px-4 py-3">
                <p className="font-medium">{item.proposedTitle ?? item.topic?.title}</p>
                <p className="text-xs text-slate-500">{item.proposedDescription ?? item.topic?.description}</p>
              </td>
              <td className="px-4 py-3"><StatusBadge value={item.status} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button disabled={loading} onClick={() => onAccept(item.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Đồng ý</button>
                  <button disabled={loading} onClick={() => {
                    const reason = window.prompt('Nhập lý do từ chối hướng dẫn');
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
