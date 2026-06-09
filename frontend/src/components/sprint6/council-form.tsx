'use client';

import { useState } from 'react';
import type { CouncilValues } from '@/schemas/sprint6.schema';

export function CouncilForm({ onSubmit }: { onSubmit: (values: CouncilValues) => Promise<void> }) {
  const [form, setForm] = useState<CouncilValues>({ name: '', projectPeriodId: '', description: '', status: 'DRAFT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name || !form.projectPeriodId) {
      setError('Tên hội đồng và projectPeriodId là bắt buộc');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await onSubmit(form);
      setForm({ name: '', projectPeriodId: '', description: '', status: 'DRAFT' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo hội đồng');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Tạo hội đồng bảo vệ</h2>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <input className="w-full rounded-xl border p-3" placeholder="Tên hội đồng" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="w-full rounded-xl border p-3" placeholder="Project period ID" value={form.projectPeriodId} onChange={(e) => setForm({ ...form, projectPeriodId: e.target.value })} />
      <textarea className="w-full rounded-xl border p-3" placeholder="Mô tả" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <select className="w-full rounded-xl border p-3" value={form.status ?? 'DRAFT'} onChange={(e) => setForm({ ...form, status: e.target.value as CouncilValues['status'] })}>
        <option value="DRAFT">DRAFT</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="CLOSED">CLOSED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      <button disabled={loading} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? 'Đang tạo...' : 'Tạo hội đồng'}
      </button>
    </form>
  );
}
