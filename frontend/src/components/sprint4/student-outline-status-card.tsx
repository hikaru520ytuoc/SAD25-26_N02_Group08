'use client';

import { FileDownloadButton } from './file-download-button';
import { OutlineStatusBadge } from './outline-status-badge';
import type { Outline } from '@/types/sprint4';

export function StudentOutlineStatusCard({ outline }: { outline?: Outline | null }) {
  if (!outline) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">Bạn chưa nộp đề cương.</div>;
  }

  const latest = outline.versions?.[0];

  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{outline.title}</h2>
          <p className="text-sm text-slate-500">Phiên bản hiện tại: {outline.currentVersion}</p>
        </div>
        <OutlineStatusBadge status={outline.status} />
      </div>
      <p className="text-slate-700">{outline.summary}</p>
      {outline.feedback && <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">Feedback GVHD: {outline.feedback}</div>}
      <FileDownloadButton file={latest?.fileDocument} />
    </div>
  );
}
