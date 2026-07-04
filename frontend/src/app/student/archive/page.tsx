'use client';

import { ArchiveRestore } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/common/error-state';
import { FormModal } from '@/components/common/form-modal';
import { PageHeader } from '@/components/common/page-header';
import { useToast } from '@/components/providers/toast-provider';
import { ArchiveStatusCard } from '@/components/sprint8/archive-status-card';
import { ArchiveSubmissionForm } from '@/components/sprint8/archive-submission-form';
import { getMyArchives, resubmitArchive, submitArchive } from '@/services/archives.service';
import type { ArchiveSubmissionValues } from '@/schemas/sprint8.schema';
import type { ArchiveRecord } from '@/types/sprint8';

export default function StudentArchivePage() {
  const toast = useToast();
  const [items, setItems] = useState<ArchiveRecord[]>([]);
  const [formOpen, setFormOpen] = useState(false);
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

  const current = items[0];
  const canSubmit = !current || current.status === 'NEEDS_SUPPLEMENT' || current.status === 'NOT_SUBMITTED';

  async function submit(values: ArchiveSubmissionValues) {
    if (current?.id) await resubmitArchive(current.id, values);
    else await submitArchive(values);
    setFormOpen(false);
    toast.success('Đã nộp hồ sơ lưu trữ', 'Hồ sơ đã được chuyển đến bộ phận lưu trữ kiểm tra.');
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hồ sơ lưu trữ cuối cùng" description="Nộp báo cáo, slide, mã nguồn và tài liệu bổ sung sau khi đáp ứng điều kiện kết quả/chỉnh sửa." actions={canSubmit ? <button type="button" onClick={() => setFormOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"><ArchiveRestore className="h-4 w-4" />{current ? 'Bổ sung hồ sơ lưu trữ' : 'Nộp hồ sơ lưu trữ'}</button> : undefined} />
      {error && <ErrorState message={error} />}
      <ArchiveStatusCard record={current} />
      {current?.status === 'LOCKED' && <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm font-semibold text-violet-800">Hồ sơ đã khóa và chỉ còn quyền xem. Backend sẽ từ chối mọi mutation.</div>}
      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title={current ? 'Bổ sung hồ sơ lưu trữ' : 'Nộp hồ sơ lưu trữ'} size="2xl">
        <ArchiveSubmissionForm onSubmit={submit} />
      </FormModal>
    </div>
  );
}
