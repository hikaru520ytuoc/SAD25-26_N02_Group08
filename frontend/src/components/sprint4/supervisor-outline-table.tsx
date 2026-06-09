'use client';

import { useState } from 'react';
import { approveOutline, requestOutlineRevision } from '@/services/outlines.service';
import { FileDownloadButton } from './file-download-button';
import { OutlineStatusBadge } from './outline-status-badge';
import type { Outline } from '@/types/sprint4';

export function SupervisorOutlineTable({ outlines, onChanged }: { outlines: Outline[]; onChanged: () => Promise<void> }) {
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  async function approve(id: string) {
    await approveOutline(id);
    setMessage('Đã duyệt đề cương');
    await onChanged();
  }

  async function revise(id: string) {
    const value = feedback[id]?.trim();
    if (!value) {
      setMessage('Feedback là bắt buộc');
      return;
    }
    await requestOutlineRevision(id, { feedback: value });
    setMessage('Đã yêu cầu chỉnh sửa');
    await onChanged();
  }

  if (!outlines.length) return <div className="rounded-3xl bg-white p-6 text-slate-600">Chưa có đề cương chờ xử lý.</div>;

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-slate-600">{message}</p>}
      {outlines.map((outline) => (
        <div key={outline.id} className="space-y-3 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950">{outline.title}</h3>
              <p className="text-sm text-slate-500">SV: {outline.student.user.fullName} - {outline.student.studentCode}</p>
            </div>
            <OutlineStatusBadge status={outline.status} />
          </div>
          <p className="text-slate-700">{outline.summary}</p>
          <FileDownloadButton file={outline.versions?.[0]?.fileDocument} />
          {outline.status !== 'APPROVED' && (
            <div className="flex flex-col gap-2 md:flex-row">
              <button onClick={() => approve(outline.id)} className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">Duyệt</button>
              <input value={feedback[outline.id] ?? ''} onChange={(e) => setFeedback((cur) => ({ ...cur, [outline.id]: e.target.value }))} placeholder="Feedback yêu cầu sửa" className="flex-1 rounded-xl border px-3 py-2" />
              <button onClick={() => revise(outline.id)} className="rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white">Yêu cầu sửa</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
