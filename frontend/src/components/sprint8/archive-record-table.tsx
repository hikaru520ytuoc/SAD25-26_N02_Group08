'use client';

import { useMemo, useState } from 'react';
import { StatusBadge } from '@/components/common/status-badge';
import { formatShortCode } from '@/lib/formatters';
import type { ArchiveRecord } from '@/types/sprint8';
import { ArchiveCompleteDialog } from './archive-complete-dialog';
import { ArchiveReviewDialog } from './archive-review-dialog';
import { LockRecordDialog } from './lock-record-dialog';
import { LockedRecordBadge } from './locked-record-badge';

type Props = {
  records: ArchiveRecord[];
  onApprove: (record: ArchiveRecord) => Promise<void> | void;
  onRequestSupplement: (record: ArchiveRecord, reason: string) => Promise<void> | void;
  onComplete: (record: ArchiveRecord) => Promise<void> | void;
  onLock: (record: ArchiveRecord) => Promise<void> | void;
};

export function ArchiveRecordTable({ records, onApprove, onRequestSupplement, onComplete, onLock }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((record) => {
      const studentName = record.finalResult?.student?.user?.fullName ?? record.student?.user?.fullName ?? '';
      const matchedStatus = status === 'ALL' || record.status === status;
      const matchedSearch = !q || `${studentName} ${record.status} ${record.archiveNote ?? ''}`.toLowerCase().includes(q);
      return matchedStatus && matchedSearch;
    });
  }, [records, search, status]);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Danh sách hồ sơ lưu trữ</h2>
          <p className="text-sm text-slate-500">Không hiển thị UUID dài, chỉ dùng mã ngắn và thông tin sinh viên.</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm sinh viên/trạng thái..." className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUBMITTED">Đã nộp</option>
            <option value="NEEDS_SUPPLEMENT">Cần bổ sung</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="COMPLETED">Đã lưu trữ</option>
            <option value="LOCKED">Đã khóa</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr className="border-b">
              <th className="py-3">Mã</th>
              <th>Sinh viên</th>
              <th>Trạng thái</th>
              <th>Ghi chú/Lý do</th>
              <th className="min-w-96">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.id} className="border-b align-top last:border-b-0">
                <td className="py-4 font-semibold text-slate-700">{formatShortCode('LT', record.id)}</td>
                <td className="py-4">
                  <p className="font-semibold text-slate-900">{record.finalResult?.student?.user?.fullName ?? record.student?.user?.fullName ?? 'N/A'}</p>
                  <p className="text-xs text-slate-500">{record.student?.studentCode ?? record.finalResult?.student?.studentCode ?? ''}</p>
                </td>
                <td className="py-4"><div className="flex flex-wrap gap-2"><StatusBadge value={record.status} />{record.status === 'LOCKED' ? <LockedRecordBadge /> : null}</div></td>
                <td className="py-4 text-slate-600">{record.supplementReason ?? record.archiveNote ?? '-'}</td>
                <td className="space-y-3 py-4">
                  <ArchiveReviewDialog record={record} onApprove={onApprove} onRequestSupplement={onRequestSupplement} />
                  <div className="flex flex-wrap gap-2">
                    <ArchiveCompleteDialog record={record} onComplete={onComplete} />
                    <LockRecordDialog record={record} onLock={onLock} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Không có hồ sơ phù hợp.</p> : null}
      </div>
    </div>
  );
}
