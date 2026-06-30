'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/sprint4/file-upload';
import type { FileDocument } from '@/types/sprint4';
import type { RevisionSubmissionValues } from '@/schemas/sprint8.schema';

export function RevisionSubmissionForm({
  disabled,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit: (values: RevisionSubmissionValues) => Promise<void> | void;
}) {
  const [reportFileId, setReportFileId] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!reportFileId) {
      setError('Vui lòng upload bản chỉnh sửa.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await onSubmit({ reportFileId, note: note || undefined });
      setReportFileId('');
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nộp bản chỉnh sửa thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  if (disabled) {
    return <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Hồ sơ đã khóa hoặc yêu cầu đã được duyệt, không thể nộp lại.</div>;
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <div>
        <label className="text-sm font-semibold text-slate-800">Bản chỉnh sửa</label>
        <FileUpload fileType="REVISION_REPORT" onUploaded={(file: FileDocument) => setReportFileId(file.id)} />
      </div>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        placeholder="Ghi chú bản chỉnh sửa"
      />
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !reportFileId}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? 'Đang nộp...' : 'Nộp bản chỉnh sửa'}
      </button>
    </div>
  );
}
