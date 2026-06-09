'use client';

import { StatusBadge } from '@/components/sprint2/status-badge';
import type { SupervisorAssignment } from '@/types/sprint3';

type Props = {
  items: SupervisorAssignment[];
  mode?: 'faculty' | 'supervisor' | 'student';
};

export function SupervisorAssignmentTable({ items, mode = 'faculty' }: Props) {
  if (items.length === 0) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500">Chưa có phân công GVHD.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Sinh viên</th>
            <th className="px-4 py-3">GVHD</th>
            <th className="px-4 py-3">Đề tài</th>
            <th className="px-4 py-3">Loại</th>
            <th className="px-4 py-3">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3">{mode === 'student' ? item.student.studentCode : item.student.user.fullName}</td>
              <td className="px-4 py-3">{item.supervisor.user.fullName}</td>
              <td className="px-4 py-3">{item.topic?.title ?? 'Đề tài sinh viên đề xuất'}</td>
              <td className="px-4 py-3">{item.assignmentType}</td>
              <td className="px-4 py-3"><StatusBadge value={item.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
