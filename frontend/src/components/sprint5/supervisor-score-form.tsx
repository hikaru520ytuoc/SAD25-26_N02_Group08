'use client';

import { useState } from 'react';
import type { SupervisorApproveDefenseValues } from '@/schemas/sprint5.schema';

export function SupervisorScoreForm({ onSubmit }: { onSubmit: (payload: SupervisorApproveDefenseValues) => Promise<void> }) {
  const [score, setScore] = useState('8');
  const [comment, setComment] = useState('');
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <input className="rounded-xl border px-3 py-2" value={score} onChange={(event) => setScore(event.target.value)} placeholder="Điểm GVHD 0-10" />
      <input className="rounded-xl border px-3 py-2" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Nhận xét" />
      <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => onSubmit({ score: Number(score), comment })}>Lưu điểm</button>
    </div>
  );
}
