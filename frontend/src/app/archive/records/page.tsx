'use client';

import { useEffect, useState } from 'react';
import { ArchiveRecordTable } from '@/components/sprint8/archive-record-table';
import { approveArchive, completeArchive, getArchives, lockArchive, requestArchiveSupplement } from '@/services/archives.service';
import type { ArchiveRecord } from '@/types/sprint8';

export default function ArchiveRecordsPage() {
  const [items, setItems] = useState<ArchiveRecord[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      setItems(await getArchives());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được hồ sơ');
    }
  }

  useEffect(() => { void load(); }, []);

  async function supplement(record: ArchiveRecord, reason: string) {
    await requestArchiveSupplement(record.id, { supplementReason: reason });
    await load();
  }

  async function approve(record: ArchiveRecord) {
    await approveArchive(record.id);
    await load();
  }

  async function complete(record: ArchiveRecord) {
    await completeArchive(record.id);
    await load();
  }

  async function lock(record: ArchiveRecord) {
    await lockArchive(record.id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Kiểm tra hồ sơ lưu trữ</h1>
        <p className="mt-2 text-sm text-slate-600">Duyệt, yêu cầu bổ sung, hoàn tất và khóa hồ sơ theo từng dòng riêng biệt.</p>
      </div>
      {error ? <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div> : null}
      <ArchiveRecordTable records={items} onApprove={approve} onRequestSupplement={supplement} onComplete={complete} onLock={lock} />
    </div>
  );
}
