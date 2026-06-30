import type { StudentEligibility } from '@/types/sprint2';
import { StatusBadge } from './status-badge';

function yesNo(value: boolean) {
  return value ? 'Có' : 'Không';
}

export function StudentEligibilityTable({ items }: { items: StudentEligibility[] }) {
  if (!items.length) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Chưa có sinh viên đủ điều kiện.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="p-4">Sinh viên</th>
            <th className="p-4">Mã SV</th>
            <th className="p-4">Đợt đồ án</th>
            <th className="p-4">Thực tập</th>
            <th className="p-4">Học vụ</th>
            <th className="p-4">Tín chỉ</th>
            <th className="p-4">GPA/CPA</th>
            <th className="p-4">Nợ môn</th>
            <th className="p-4">Nợ HP</th>
            <th className="p-4">Kỷ luật</th>
            <th className="p-4">Kết quả</th>
            <th className="p-4">Lý do</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-slate-100 align-top">
              <td className="p-4 font-semibold">{item.student.user.fullName}</td>
              <td className="p-4">{item.student.studentCode}</td>
              <td className="p-4">{item.projectPeriod.name}</td>
              <td className="p-4"><StatusBadge value={item.internshipStatus} /></td>
              <td className="p-4"><StatusBadge value={item.academicStatus} /></td>
              <td className="p-4">{item.completedCredits ?? '-'} / {item.requiredCredits ?? '-'}</td>
              <td className="p-4">{item.gpa ?? '-'}</td>
              <td className="p-4">{yesNo(item.hasPrerequisiteDebt)}</td>
              <td className="p-4">{yesNo(item.hasTuitionDebt)}</td>
              <td className="p-4">{yesNo(item.hasDisciplinaryAction)}</td>
              <td className="p-4"><StatusBadge value={item.eligibilityStatus} /></td>
              <td className="p-4 text-slate-600">{item.reason || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
