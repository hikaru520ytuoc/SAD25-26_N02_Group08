'use client';

import { useState } from 'react';
import { CouncilSelect, DefenseRegistrationSelect } from '@/components/common/selects';
import type { LookupOption } from '@/services/lookups.service';
import type { DefenseScheduleValues } from '@/schemas/sprint6.schema';

export function DefenseScheduleForm({ onSubmit }: { onSubmit: (values: DefenseScheduleValues) => Promise<void> }) {
  const [form, setForm] = useState<DefenseScheduleValues>({ defenseRegistrationId: '', councilId: '', room: '', defenseDate: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<LookupOption | undefined>();
  const [selectedCouncil, setSelectedCouncil] = useState<LookupOption | undefined>();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.defenseRegistrationId || !form.councilId || !form.room || !form.defenseDate || !form.startTime || !form.endTime) {
      setError('Vui lòng chọn hồ sơ bảo vệ, hội đồng và nhập đủ thời gian/phòng bảo vệ.');
      return;
    }
    try {
      setError('');
      await onSubmit(form);
      setForm({ defenseRegistrationId: '', councilId: '', room: '', defenseDate: '', startTime: '', endTime: '' });
      setSelectedRegistration(undefined);
      setSelectedCouncil(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo lịch bảo vệ');
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2">
      <h2 className="md:col-span-2 text-xl font-bold">Lập lịch bảo vệ</h2>
      <p className="md:col-span-2 text-sm text-slate-500">Chọn hồ sơ và hội đồng từ danh sách. Backend vẫn nhận mã nội bộ ẩn và kiểm tra trùng phòng, trùng hội đồng, trùng thành viên.</p>
      {error ? <p className="md:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <DefenseRegistrationSelect
        status="READY_FOR_COUNCIL,APPROVED_BY_REVIEWER"
        value={form.defenseRegistrationId}
        onChange={(value, option) => { setForm({ ...form, defenseRegistrationId: value }); setSelectedRegistration(option); }}
      />
      <CouncilSelect
        status="ACTIVE"
        value={form.councilId}
        onChange={(value, option) => { setForm({ ...form, councilId: value }); setSelectedCouncil(option); }}
      />
      {selectedRegistration ? <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">Hồ sơ: {selectedRegistration.label}<br />{selectedRegistration.subLabel}</div> : null}
      {selectedCouncil ? <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Hội đồng: {selectedCouncil.label}<br />{selectedCouncil.subLabel}</div> : null}
      <input className="rounded-xl border p-3" placeholder="Phòng" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
      <input className="rounded-xl border p-3" type="date" value={form.defenseDate} onChange={(e) => setForm({ ...form, defenseDate: e.target.value })} />
      <input className="rounded-xl border p-3" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
      <input className="rounded-xl border p-3" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
      <button className="md:col-span-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Tạo lịch</button>
    </form>
  );
}
