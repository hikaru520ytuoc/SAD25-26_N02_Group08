'use client';

import { useState } from 'react';
import type { CouncilScoreValues } from '@/schemas/sprint7.schema';

export function CouncilScoreForm({ defenseScheduleId, councilMemberId, onSubmit }: { defenseScheduleId: string; councilMemberId: string; onSubmit: (values: CouncilScoreValues) => Promise<void> }) {
  const [score, setScore] = useState('8');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await onSubmit({ defenseScheduleId, councilMemberId, score: Number(score), comment });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input value={score} onChange={(event) => setScore(event.target.value)} type="number" min="0" max="10" step="0.1" className="w-24 rounded-xl border px-3 py-2 text-sm" />
      <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Nhận xét" className="min-w-52 flex-1 rounded-xl border px-3 py-2 text-sm" />
      <button onClick={submit} disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Đang lưu...' : 'Lưu điểm'}</button>
    </div>
  );
}
