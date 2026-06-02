'use client';

import type { ProjectPeriod } from '@/types/sprint2';
import { StatusBadge } from './status-badge';

type Props = {
  periods: ProjectPeriod[];
  onOpen: (id: string) => Promise<void>;
  onClose: (id: string) => Promise<void>;
};

export function ProjectPeriodTable({ periods, onOpen, onClose }: Props) {
  if (!periods.length) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Chưa có đợt đồ án.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="p-4">Tên đợt</th>
            <th className="p-4">Năm học</th>
            <th className="p-4">Học kỳ</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.id} className="border-t border-slate-100">
              <td className="p-4 font-semibold text-slate-950">{period.name}</td>
              <td className="p-4">{period.academicYear}</td>
              <td className="p-4">{period.semester}</td>
              <td className="p-4"><StatusBadge value={period.status} /></td>
              <td className="space-x-2 p-4">
                <button onClick={() => onOpen(period.id)} className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50">Mở</button>
                <button onClick={() => onClose(period.id)} className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50">Đóng</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
