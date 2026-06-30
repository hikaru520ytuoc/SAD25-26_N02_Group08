'use client';

import { useState } from 'react';
import { ProjectPeriodSelect } from '@/components/common/selects';
import type { CouncilValues } from '@/schemas/sprint6.schema';

export function CouncilForm({ onSubmit }: { onSubmit: (values: CouncilValues) => Promise<void> }) {
  const [form, setForm] = useState<CouncilValues>({ name: '', projectPeriodId: '', description: '', status: 'DRAFT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name || !form.projectPeriodId) {
      setError('Vui lòng nhập tên hội đồng và chọn đợt đồ án.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await onSubmit({ ...form, status: 'DRAFT' });
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
      <p className="text-sm text-slate-500">Chọn đợt đồ án bằng tên/mã dễ đọc. Trạng thái hội đồng được điều khiển bằng workflow, không nhập tay.</p>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <input className="w-full rounded-xl border p-3" placeholder="Tên hội đồng" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <ProjectPeriodSelect value={form.projectPeriodId} onChange={(value) => setForm({ ...form, projectPeriodId: value })} />
      <textarea className="w-full rounded-xl border p-3" placeholder="Mô tả" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Trạng thái khởi tạo: <span className="font-semibold text-slate-900">Nháp</span>. Khoa kích hoạt/đóng hội đồng bằng nút nghiệp vụ riêng.</div>
      <button disabled={loading} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? 'Đang tạo...' : 'Tạo hội đồng'}
      </button>
    </form>
  );
}
