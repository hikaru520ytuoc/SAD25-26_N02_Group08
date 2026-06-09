import type { DefenseSchedule } from '@/types/sprint6';

export function StudentDefenseScheduleCard({ schedule }: { schedule: DefenseSchedule }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Lịch bảo vệ</h2>
          <p className="mt-2 text-slate-600">{schedule.council?.name ?? 'Hội đồng bảo vệ'}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{schedule.status}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
        <div><span className="text-slate-500">Phòng</span><p className="font-semibold">{schedule.room}</p></div>
        <div><span className="text-slate-500">Bắt đầu</span><p className="font-semibold">{new Date(schedule.startTime).toLocaleString()}</p></div>
        <div><span className="text-slate-500">Kết thúc</span><p className="font-semibold">{new Date(schedule.endTime).toLocaleString()}</p></div>
      </div>
    </div>
  );
}
