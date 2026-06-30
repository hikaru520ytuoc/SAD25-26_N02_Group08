'use client';

import { LockKeyhole } from 'lucide-react';
import type { ArchiveRecord } from '@/types/sprint8';

export function LockRecordDialog({ record, onLock }: { record: ArchiveRecord; onLock: (record: ArchiveRecord) => Promise<void> | void }) {
  async function lock() {
    if (!confirm('Sau khi khóa, hồ sơ chỉ được xem và không thể chỉnh sửa. Xác nhận khóa hồ sơ?')) return;
    await onLock(record);
  }

  return (
    <button
      type="button"
      onClick={lock}
      disabled={record.status === 'LOCKED'}
      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      <LockKeyhole className="h-4 w-4" />
      Khóa hồ sơ
    </button>
  );
}
