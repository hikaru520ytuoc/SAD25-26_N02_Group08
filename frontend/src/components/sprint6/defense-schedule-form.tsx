'use client';

import { useState } from 'react';
import type { DefenseScheduleValues } from '@/schemas/sprint6.schema';

export function DefenseScheduleForm({ onSubmit }: { onSubmit: (values: DefenseScheduleValues) => Promise<void> }) {
  const [form, setForm] = useState<DefenseScheduleValues>({ defenseRegistrationId: '', councilId: '', room: '', defenseDate: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.defenseRegistrationId || !form.councilId || !form.room || !form.defenseDate || !form.startTime || !form.endTime) {
      setError('Vui lòng nhập đủ thông tin lịch bảo vệ');
      return;
    }
    try {
      setError('');
      await onSubmit(form);
      setForm({ defenseRegistrationId: '', councilId: '', room: '', defenseDate: '', startTime: '', endTime: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo lịch bảo vệ');
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2">
      <h2 className="md:col-span-2 text-xl font-bold">Lập lịch bảo vệ</h2>
      {error ? <p className="md:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <input className="rounded-xl border p-3" placeholder="Defense registration ID" value={form.defenseRegistrationId} onChange={(e) => setForm({ ...form, defenseRegistrationId: e.target.value })} />
      <input className="rounded-xl border p-3" placeholder="Council ID" value={form.councilId} onChange={(e) => setForm({ ...form, councilId: e.target.value })} />
      <input className="rounded-xl border p-3" placeholder="Phòng" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
      <input className="rounded-xl border p-3" type="date" value={form.defenseDate} onChange={(e) => setForm({ ...form, defenseDate: e.target.value })} />
      <input className="rounded-xl border p-3" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
      <input className="rounded-xl border p-3" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
      <button className="md:col-span-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Tạo lịch</button>
    </form>
  );
}
