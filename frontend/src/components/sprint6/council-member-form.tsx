'use client';

import { useState } from 'react';
import { LecturerSelect } from '@/components/common/selects';
import type { CouncilMemberValues } from '@/schemas/sprint6.schema';

export function CouncilMemberForm({ councilId, onSubmit }: { councilId: string; onSubmit: (councilId: string, values: CouncilMemberValues) => Promise<void> }) {
  const [form, setForm] = useState<CouncilMemberValues>({ lecturerId: '', roleInCouncil: 'MEMBER' });
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.lecturerId) return setError('Vui lòng chọn giảng viên.');
    try {
      setError('');
      await onSubmit(councilId, form);
      setForm({ lecturerId: '', roleInCouncil: 'MEMBER' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thêm thành viên');
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 grid gap-2 md:grid-cols-[1fr_180px_auto]">
      {error ? <p className="md:col-span-3 rounded-xl bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
      <LecturerSelect value={form.lecturerId} onChange={(value) => setForm({ ...form, lecturerId: value })} label="Thành viên hội đồng" />
      <label className="text-sm font-medium text-slate-700">
        Vai trò
        <select className="mt-2 w-full rounded-xl border p-2 text-sm" value={form.roleInCouncil} onChange={(e) => setForm({ ...form, roleInCouncil: e.target.value as CouncilMemberValues['roleInCouncil'] })}>
          <option value="CHAIR">Chủ tịch</option>
          <option value="SECRETARY">Thư ký</option>
          <option value="MEMBER">Thành viên</option>
        </select>
      </label>
      <button className="self-end rounded-xl border px-3 py-2 text-sm font-semibold">Thêm</button>
    </form>
  );
}
