'use client';

import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FormModal } from '@/components/common/form-modal';
import { PageHeader } from '@/components/common/page-header';
import { useToast } from '@/components/providers/toast-provider';
import { RevisionRequestCard } from '@/components/sprint8/revision-request-card';
import { RevisionSubmissionForm } from '@/components/sprint8/revision-submission-form';
import { RevisionSubmissionHistory } from '@/components/sprint8/revision-submission-history';
import { getMyRevisions, submitRevision } from '@/services/revisions.service';
import type { RevisionRequest } from '@/types/sprint8';
import type { RevisionSubmissionValues } from '@/schemas/sprint8.schema';

export default function StudentRevisionPage() {
  const toast = useToast();
  const [items, setItems] = useState<RevisionRequest[]>([]);
  const [selected, setSelected] = useState<RevisionRequest | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      setItems(await getMyRevisions());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được yêu cầu chỉnh sửa');
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleSubmit(values: RevisionSubmissionValues) {
    if (!selected) return;
    await submitRevision(selected.id, values);
    setSelected(null);
    toast.success('Đã nộp bản chỉnh sửa', 'Phiên bản mới đã được thêm vào lịch sử.');
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Chỉnh sửa sau bảo vệ" description="Theo dõi yêu cầu của hội đồng, lịch sử phiên bản và nộp bản chỉnh sửa khi được phép." />
      {error && <ErrorState message={error} />}
      {items.length === 0 ? <EmptyState title="Không có yêu cầu chỉnh sửa" /> : items.map((item) => {
        const canSubmit = ['PENDING_SUBMISSION', 'NEEDS_CHANGES'].includes(item.status);
        return (
          <div key={item.id} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <RevisionRequestCard request={item} />
            {canSubmit && <button type="button" onClick={() => setSelected(item)} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Nộp bản chỉnh sửa</button>}
            <RevisionSubmissionHistory submissions={item.submissions} />
          </div>
        );
      })}
      <FormModal open={Boolean(selected)} onClose={() => setSelected(null)} title="Nộp bản chỉnh sửa sau bảo vệ" description={selected?.description ?? undefined} size="xl">
        <RevisionSubmissionForm onSubmit={handleSubmit} />
      </FormModal>
    </div>
  );
}
