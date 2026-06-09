'use client';

import { useState } from 'react';
import type { DefenseDocument } from '@/types/sprint6';

export function SecretaryDocumentReviewDialog({ document, onApprove, onRequestSupplement }: { document: DefenseDocument; onApprove: (id: string) => Promise<void>; onRequestSupplement: (id: string, note: string) => Promise<void> }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  async function request() {
    if (!note.trim()) return setError('Lý do bổ sung là bắt buộc');
    try {
      setError('');
      await onRequestSupplement(document.id, note);
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể yêu cầu bổ sung');
    }
  }

  async function approve() {
    try {
      setError('');
      await onApprove(document.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xác nhận hồ sơ');
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border p-4">
      {error ? <p className="rounded-xl bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
      <textarea className="w-full rounded-xl border p-3 text-sm" placeholder="Lý do yêu cầu bổ sung" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={request} className="rounded-xl border px-3 py-2 text-sm font-semibold">Yêu cầu bổ sung</button>
        <button onClick={approve} className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">Xác nhận hợp lệ</button>
      </div>
    </div>
  );
}
