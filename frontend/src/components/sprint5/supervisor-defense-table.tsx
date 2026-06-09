'use client';

import { useState } from 'react';
import type { DefenseRegistration } from '@/types/sprint5';
import { approveDefenseRegistration, rejectDefenseRegistration } from '@/services/defense-registrations.service';
import { downloadFileUrl } from '@/services/files.service';

export function SupervisorDefenseTable({ items, onChanged }: { items: DefenseRegistration[]; onChanged: () => Promise<void> }) {
  const [scoreById, setScoreById] = useState<Record<string, string>>({});
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  async function approve(item: DefenseRegistration) {
    const score = Number(scoreById[item.id] ?? 8);
    try {
      await approveDefenseRegistration(item.id, { score, comment: 'Đủ điều kiện bảo vệ' });
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Duyệt thất bại');
    }
  }

  async function reject(item: DefenseRegistration) {
    const feedback = feedbackById[item.id] ?? '';
    try {
      await rejectDefenseRegistration(item.id, { feedback });
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Từ chối thất bại');
    }
  }

  if (!items.length) return <div className="rounded-3xl bg-white p-6 shadow-sm">Chưa có hồ sơ bảo vệ.</div>;

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div> : null}
      {items.map((item) => (
        <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-950">{item.title}</h3>
              <p className="text-sm text-slate-600">Sinh viên: {item.student.user.fullName} · Trạng thái: {item.status}</p>
            </div>
            <div className="flex gap-2 text-sm">
              {item.reportFile ? <a className="rounded-xl border px-3 py-2" href={downloadFileUrl(item.reportFile.id)}>Báo cáo</a> : null}
              {item.slideFile ? <a className="rounded-xl border px-3 py-2" href={downloadFileUrl(item.slideFile.id)}>Slide</a> : null}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input className="rounded-xl border px-3 py-2" value={scoreById[item.id] ?? ''} onChange={(e) => setScoreById({ ...scoreById, [item.id]: e.target.value })} placeholder="Điểm GVHD 0-10" />
            <button onClick={() => approve(item)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Duyệt đủ điều kiện</button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <input className="rounded-xl border px-3 py-2 md:col-span-2" value={feedbackById[item.id] ?? ''} onChange={(e) => setFeedbackById({ ...feedbackById, [item.id]: e.target.value })} placeholder="Feedback nếu chưa đủ điều kiện" />
            <button onClick={() => reject(item)} className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white">Yêu cầu chỉnh sửa</button>
          </div>
        </div>
      ))}
    </div>
  );
}
