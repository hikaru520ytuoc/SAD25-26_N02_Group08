'use client';

import { useEffect, useState } from 'react';
import { RevisionRequestCard } from '@/components/sprint8/revision-request-card';
import { RevisionReviewDialog } from '@/components/sprint8/revision-review-dialog';
import { RevisionSubmissionHistory } from '@/components/sprint8/revision-submission-history';
import { approveRevision, getRevisions, requestRevisionChanges } from '@/services/revisions.service';
import type { RevisionRequest } from '@/types/sprint8';

export default function FacultyRevisionsPage() {
  const [items, setItems] = useState<RevisionRequest[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      setItems(await getRevisions());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu');
    }
  }

  useEffect(() => { void load(); }, []);

  async function approve(request: RevisionRequest) {
    await approveRevision(request.id);
    await load();
  }

  async function changes(request: RevisionRequest, feedback: string) {
    await requestRevisionChanges(request.id, { feedback });
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Kiểm tra bản chỉnh sửa</h1>
        <p className="mt-2 text-sm text-slate-600">Mỗi yêu cầu có dialog riêng, feedback được reset theo từng hồ sơ.</p>
      </div>
      {error ? <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div> : null}
      {items.length === 0 ? <div className="rounded-3xl bg-white p-6 shadow-sm">Không có yêu cầu chỉnh sửa.</div> : null}
      {items.map((item) => (
        <div key={item.id} className="space-y-4 rounded-3xl bg-white/60 p-1">
          <RevisionRequestCard request={item} />
          <RevisionSubmissionHistory submissions={item.submissions} />
          {item.status !== 'APPROVED' && item.status !== 'CANCELLED' ? (
            <RevisionReviewDialog request={item} onApprove={approve} onRequestChanges={changes} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
