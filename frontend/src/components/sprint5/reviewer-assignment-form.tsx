'use client';

import { useState } from 'react';
import type { ReviewerAssignmentValues } from '@/schemas/sprint5.schema';

export function ReviewerAssignmentForm({ defenseRegistrationId, onSubmit }: { defenseRegistrationId: string; onSubmit: (payload: ReviewerAssignmentValues) => Promise<void> }) {
  const [reviewerId, setReviewerId] = useState('');
  return (
    <div className="flex gap-2">
      <input className="flex-1 rounded-xl border px-3 py-2" value={reviewerId} onChange={(event) => setReviewerId(event.target.value)} placeholder="reviewerId/lecturerId" />
      <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white" onClick={() => onSubmit({ defenseRegistrationId, reviewerId })}>Phân công</button>
    </div>
  );
}
