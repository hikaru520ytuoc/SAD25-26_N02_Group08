'use client';

import { useState } from 'react';
import type { DefenseDocumentValues } from '@/schemas/sprint6.schema';

export function DefenseDocumentForm({ onSubmit, submitLabel = 'Nộp hồ sơ' }: { onSubmit: (values: DefenseDocumentValues) => Promise<void>; submitLabel?: string }) {
  const [form, setForm] = useState<DefenseDocumentValues>({ reportFileId: '', slideFileId: '', additionalFileId: '' });
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.reportFileId || !form.slideFileId) {
      setError('reportFileId và slideFileId là bắt buộc. Hãy upload file ở /api/files/upload trước rồi dán ID vào đây.');
      return;
    }
    try {
      setError('');
      await onSubmit({ ...form, additionalFileId: form.additionalFileId || undefined });
      setForm({ reportFileId: '', slideFileId: '', additionalFileId: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể nộp hồ sơ');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Hồ sơ bảo vệ</h2>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <input className="w-full rounded-xl border p-3" placeholder="Report file ID" value={form.reportFileId} onChange={(e) => setForm({ ...form, reportFileId: e.target.value })} />
      <input className="w-full rounded-xl border p-3" placeholder="Slide file ID" value={form.slideFileId} onChange={(e) => setForm({ ...form, slideFileId: e.target.value })} />
      <input className="w-full rounded-xl border p-3" placeholder="Additional file ID optional" value={form.additionalFileId ?? ''} onChange={(e) => setForm({ ...form, additionalFileId: e.target.value })} />
      <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">{submitLabel}</button>
    </form>
  );
}
