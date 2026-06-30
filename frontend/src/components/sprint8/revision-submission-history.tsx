import { FileText } from 'lucide-react';
import type { RevisionSubmission } from '@/types/sprint8';

export function RevisionSubmissionHistory({ submissions = [] }: { submissions?: RevisionSubmission[] }) {
  if (submissions.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Chưa có bản chỉnh sửa nào được nộp.</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-950">Lịch sử nộp bản chỉnh sửa</h3>
      {submissions.map((submission) => (
        <div key={submission.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900">Phiên bản {submission.versionNumber}</p>
            <p className="text-slate-500">Nộp lúc: {new Date(submission.submittedAt).toLocaleString()}</p>
            {submission.note ? <p className="mt-1 whitespace-pre-wrap text-slate-600">{submission.note}</p> : null}
            {submission.reportFileId ? <p className="mt-1 text-xs text-slate-400">File đã nộp được lưu ẩn trong hệ thống.</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
