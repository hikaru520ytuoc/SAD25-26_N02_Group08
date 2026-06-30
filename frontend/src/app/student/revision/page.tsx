'use client';

import { useEffect, useState } from 'react';
import { RevisionRequestCard } from '@/components/sprint8/revision-request-card';
import { RevisionSubmissionForm } from '@/components/sprint8/revision-submission-form';
import { RevisionSubmissionHistory } from '@/components/sprint8/revision-submission-history';
import { getMyRevisions, submitRevision } from '@/services/revisions.service';
import type { RevisionRequest } from '@/types/sprint8';
import type { RevisionSubmissionValues } from '@/schemas/sprint8.schema';

export default function StudentRevisionPage() {
  const [items, setItems] = useState<RevisionRequest[]>([]);
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

  async function handleSubmit(id: string, values: RevisionSubmissionValues) {
    await submitRevision(id, values);
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Chỉnh sửa sau bảo vệ</h1>
        <p className="mt-2 text-sm text-slate-600">Nộp bản chỉnh sửa bằng file upload, hệ thống tự lưu mã file ẩn.</p>
      </div>
      {error ? <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div> : null}
      {items.length === 0 ? <div className="rounded-3xl bg-white p-6 shadow-sm">Không có yêu cầu chỉnh sửa.</div> : null}
      {items.map((item) => {
        const canSubmit = ['PENDING_SUBMISSION', 'NEEDS_CHANGES'].includes(item.status);
        return (
          <div key={item.id} className="space-y-4">
            <RevisionRequestCard request={item} />
            {canSubmit ? <RevisionSubmissionForm onSubmit={(values) => handleSubmit(item.id, values)} /> : null}
            <RevisionSubmissionHistory submissions={item.submissions} />
          </div>
        );
      })}
    </div>
  );
}
