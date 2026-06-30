import { AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/common/status-badge';
import { EmptyState } from '@/components/common/empty-state';
import { formatDateTime, formatShortCode } from '@/lib/formatters';
import type { DefenseSchedule } from '@/types/sprint6';

export function DefenseScheduleTable({ schedules }: { schedules: DefenseSchedule[] }) {
  if (!schedules.length) return <EmptyState title="Chưa có lịch bảo vệ" description="Lịch bảo vệ sẽ được hiển thị sau khi Khoa xếp hội đồng." />;
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="mr-2 inline h-4 w-4" />
        Backend kiểm tra tối đa 6 đề tài/hội đồng, trùng phòng, trùng hội đồng và trùng thành viên ở nhiều hội đồng.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50"><tr><th className="p-4">Mã lịch</th><th className="p-4">Sinh viên</th><th className="p-4">Hội đồng</th><th className="p-4">Thời gian</th><th className="p-4">Phòng</th><th className="p-4">Trạng thái</th></tr></thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id} className="border-t border-slate-100">
                <td className="p-4 font-mono text-xs text-slate-500">{formatShortCode('BV', schedule.id, schedule.defenseDate)}</td>
                <td className="p-4"><p className="font-medium text-slate-900">{schedule.student?.user?.fullName ?? schedule.defenseRegistration?.student?.user?.fullName ?? schedule.studentId}</p><p className="text-xs text-slate-500">{schedule.student?.studentCode}</p></td>
                <td className="p-4"><p className="font-medium">{schedule.council?.name ?? schedule.councilId}</p><p className="text-xs text-slate-500">{schedule.council?.members?.length ?? 0} thành viên</p></td>
                <td className="p-4">{formatDateTime(schedule.startTime)} - {new Date(schedule.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="p-4">{schedule.room}</td>
                <td className="p-4"><StatusBadge value={schedule.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
