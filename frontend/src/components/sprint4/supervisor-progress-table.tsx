'use client';

import { useState } from 'react';
import { addProgressComment } from '@/services/project-progress.service';
import { FileDownloadButton } from './file-download-button';
import type { ProjectProgress } from '@/types/sprint4';

export function SupervisorProgressTable({ progresses, onChanged }: { progresses: ProjectProgress[]; onChanged: () => Promise<void> }) {
  const [comments, setComments] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  async function submitComment(id: string) {
    const comment = comments[id]?.trim();
    if (!comment) {
      setMessage('Nội dung góp ý không được rỗng');
      return;
    }
    await addProgressComment(id, { comment });
    setMessage('Đã gửi góp ý');
    setComments((current) => ({ ...current, [id]: '' }));
    await onChanged();
  }

  if (!progresses.length) return <div className="rounded-3xl bg-white p-6 text-slate-600">Chưa có tiến độ sinh viên.</div>;

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-slate-600">{message}</p>}
      {progresses.map((item) => (
        <div key={item.id} className="space-y-3 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
              <p className="text-sm text-slate-500">SV: {item.student.user.fullName} - {item.student.studentCode}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{item.progressPercent ?? 0}%</span>
          </div>
          <p className="text-slate-700">{item.content}</p>
          <FileDownloadButton file={item.fileDocument} />
          <div className="flex flex-col gap-2 md:flex-row">
            <input value={comments[item.id] ?? ''} onChange={(e) => setComments((current) => ({ ...current, [item.id]: e.target.value }))} placeholder="Nhập góp ý tiến độ" className="flex-1 rounded-xl border px-3 py-2" />
            <button onClick={() => submitComment(item.id)} className="rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white">Gửi góp ý</button>
          </div>
        </div>
      ))}
    </div>
  );
}
