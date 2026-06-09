import type { DefenseSchedule } from '@/types/sprint6';

export function DefenseScheduleTable({ schedules }: { schedules: DefenseSchedule[] }) {
  if (!schedules.length) return <div className="rounded-3xl bg-white p-6 text-slate-500">Chưa có lịch bảo vệ.</div>;
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50"><tr><th className="p-4">Sinh viên</th><th className="p-4">Hội đồng</th><th className="p-4">Thời gian</th><th className="p-4">Phòng</th><th className="p-4">Trạng thái</th></tr></thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id} className="border-t">
              <td className="p-4">{schedule.student?.user?.fullName ?? schedule.defenseRegistration?.student?.user?.fullName ?? schedule.studentId}</td>
              <td className="p-4">{schedule.council?.name ?? schedule.councilId}</td>
              <td className="p-4">{new Date(schedule.startTime).toLocaleString()} - {new Date(schedule.endTime).toLocaleTimeString()}</td>
              <td className="p-4">{schedule.room}</td>
              <td className="p-4"><span className="rounded-full bg-slate-100 px-2 py-1">{schedule.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
