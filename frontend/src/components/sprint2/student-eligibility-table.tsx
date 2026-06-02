import type { StudentEligibility } from '@/types/sprint2';
import { StatusBadge } from './status-badge';

export function StudentEligibilityTable({ items }: { items: StudentEligibility[] }) {
  if (!items.length) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Chưa có sinh viên đủ điều kiện.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="p-4">Sinh viên</th>
            <th className="p-4">Mã SV</th>
            <th className="p-4">Đợt đồ án</th>
            <th className="p-4">Thực tập</th>
            <th className="p-4">Đủ điều kiện</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-slate-100">
              <td className="p-4 font-semibold">{item.student.user.fullName}</td>
              <td className="p-4">{item.student.studentCode}</td>
              <td className="p-4">{item.projectPeriod.name}</td>
              <td className="p-4"><StatusBadge value={item.internshipStatus} /></td>
              <td className="p-4"><StatusBadge value={item.eligibilityStatus} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
