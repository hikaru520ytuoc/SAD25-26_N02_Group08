'use client';

import type { ArchiveRecord } from '@/types/sprint8';

export function ArchiveCompleteDialog({ record, onComplete }: { record: ArchiveRecord; onComplete: (record: ArchiveRecord) => Promise<void> | void }) {
  async function complete() {
    if (!confirm('Xác nhận hoàn tất lưu trữ hồ sơ này?')) return;
    await onComplete(record);
  }

  return (
    <button
      type="button"
      onClick={complete}
      disabled={record.status === 'LOCKED'}
      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      Hoàn tất lưu trữ
    </button>
  );
}
