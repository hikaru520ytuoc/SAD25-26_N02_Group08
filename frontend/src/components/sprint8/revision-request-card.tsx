import { CalendarDays, UserRound } from 'lucide-react';
import { StatusBadge } from '@/components/common/status-badge';
import type { RevisionRequest } from '@/types/sprint8';

export function RevisionRequestCard({ request }: { request: RevisionRequest }) {
  const studentName = request.student?.user?.fullName ?? request.finalResult?.student?.user?.fullName ?? 'Sinh viên';
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={request.status} />
            {request.dueDate ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                <CalendarDays className="h-3.5 w-3.5" />
                Hạn: {new Date(request.dueDate).toLocaleDateString()}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-xl font-bold text-slate-950">{request.title}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{request.description}</p>
          {request.feedback ? <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Feedback: {request.feedback}</p> : null}
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 md:min-w-52">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <UserRound className="h-4 w-4" />
            {studentName}
          </div>
          <p className="mt-1 text-xs text-slate-500">Yêu cầu chỉnh sửa sau bảo vệ</p>
        </div>
      </div>
    </section>
  );
}
