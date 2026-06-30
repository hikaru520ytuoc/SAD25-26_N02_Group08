'use client';

import { useEffect, useState } from 'react';
import { ArchiveStatusCard } from '@/components/sprint8/archive-status-card';
import { ArchiveSubmissionForm } from '@/components/sprint8/archive-submission-form';
import { getMyArchives, resubmitArchive, submitArchive } from '@/services/archives.service';
import type { ArchiveSubmissionValues } from '@/schemas/sprint8.schema';
import type { ArchiveRecord } from '@/types/sprint8';

export default function StudentArchivePage() {
  const [items, setItems] = useState<ArchiveRecord[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      setItems(await getMyArchives());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được hồ sơ lưu trữ');
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(record: ArchiveRecord | undefined, values: ArchiveSubmissionValues) {
    if (record?.id) await resubmitArchive(record.id, values);
    else await submitArchive(values);
    await load();
  }

  const current = items[0];
  const canSubmit = !current || current.status === 'NEEDS_SUPPLEMENT' || current.status === 'NOT_SUBMITTED';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Hồ sơ lưu trữ cuối cùng</h1>
        <p className="mt-2 text-sm text-slate-600">Nộp báo cáo, slide, source code và tài liệu bổ sung sau bảo vệ.</p>
      </div>
      {error ? <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div> : null}
      <ArchiveStatusCard record={current} />
      {canSubmit ? <ArchiveSubmissionForm onSubmit={(values) => submit(current, values)} /> : null}
    </div>
  );
}
