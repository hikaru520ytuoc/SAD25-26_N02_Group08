'use client';

import { useState } from 'react';

export function ReviewerScoreForm({ onSubmit }: { onSubmit: (payload: { score: number; comment?: string }) => Promise<void> }) {
  const [score, setScore] = useState('8');
  const [comment, setComment] = useState('');
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <input className="rounded-xl border px-3 py-2" value={score} onChange={(event) => setScore(event.target.value)} placeholder="Điểm GVPB 0-10" />
      <input className="rounded-xl border px-3 py-2" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Nhận xét điểm" />
      <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white" onClick={() => onSubmit({ score: Number(score), comment })}>Lưu điểm phản biện</button>
    </div>
  );
}
