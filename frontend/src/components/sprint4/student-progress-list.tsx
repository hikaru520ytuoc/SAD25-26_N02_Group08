'use client';

import { FileDownloadButton } from './file-download-button';
import type { ProjectProgress } from '@/types/sprint4';

export function StudentProgressList({ progresses }: { progresses: ProjectProgress[] }) {
  if (!progresses.length) return <div className="rounded-3xl bg-white p-6 text-slate-600">Chưa có cập nhật tiến độ.</div>;

  return (
    <div className="space-y-4">
      {progresses.map((item) => (
        <div key={item.id} className="space-y-3 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{item.progressPercent ?? 0}%</span>
          </div>
          <p className="text-slate-700">{item.content}</p>
          <FileDownloadButton file={item.fileDocument} />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Góp ý GVHD</p>
            {item.comments.length ? item.comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{comment.comment}</div>
            )) : <p className="text-sm text-slate-400">Chưa có góp ý.</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
