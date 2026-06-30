import { Archive, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/common/status-badge';
import type { ArchiveRecord } from '@/types/sprint8';
import { LockedRecordBadge } from './locked-record-badge';

export function ArchiveStatusCard({ record }: { record?: ArchiveRecord | null }) {
  if (!record) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-600"><Archive className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-950">Chưa có hồ sơ lưu trữ</h2>
            <p className="text-sm text-slate-500">Sinh viên cần nộp hồ sơ sau khi đạt điều kiện lưu trữ.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={record.status} />
            {record.status === 'LOCKED' ? <LockedRecordBadge /> : null}
          </div>
          <h2 className="mt-3 text-xl font-bold text-slate-950">Trạng thái hồ sơ lưu trữ</h2>
          <p className="mt-2 text-sm text-slate-600">Hồ sơ lưu trữ cuối cùng của sinh viên được quản lý theo trạng thái nghiệp vụ.</p>
          {record.supplementReason ? (
            <div className="mt-4 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              <p><b>Lý do cần bổ sung:</b> {record.supplementReason}</p>
            </div>
          ) : null}
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 md:min-w-64">
          <p>Sinh viên: <b>{record.student?.user?.fullName ?? record.finalResult?.student?.user?.fullName ?? 'N/A'}</b></p>
          <p className="mt-1">Ngày khóa: <b>{record.lockedAt ? new Date(record.lockedAt).toLocaleString() : 'Chưa khóa'}</b></p>
          {record.archiveNote ? <p className="mt-1">Ghi chú: {record.archiveNote}</p> : null}
        </div>
      </div>
    </section>
  );
}
