'use client';

import { useState } from 'react';
import { ReviewerSelect } from '@/components/common/selects';
import type { ReviewerAssignmentValues } from '@/schemas/sprint5.schema';

export function ReviewerAssignmentForm({ defenseRegistrationId, supervisorId, onSubmit }: { defenseRegistrationId: string; supervisorId?: string; onSubmit: (payload: ReviewerAssignmentValues) => Promise<void> }) {
  const [reviewerId, setReviewerId] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    if (!reviewerId) return setError('Vui lòng chọn GVPB.');
    if (supervisorId && reviewerId === supervisorId) return setError('GVPB không được trùng với GVHD.');
    setError('');
    await onSubmit({ defenseRegistrationId, reviewerId });
    setReviewerId('');
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <ReviewerSelect value={reviewerId} excludeLecturerId={supervisorId} onChange={setReviewerId} label="Chọn GVPB" error={error} />
        <button type="button" className="self-end rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white" onClick={submit}>Phân công</button>
      </div>
    </div>
  );
}
