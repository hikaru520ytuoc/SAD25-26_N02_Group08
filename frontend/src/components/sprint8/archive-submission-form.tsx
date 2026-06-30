'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/sprint4/file-upload';
import type { FileDocument } from '@/types/sprint4';
import type { ArchiveSubmissionValues } from '@/schemas/sprint8.schema';

export function ArchiveSubmissionForm({
  disabled,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit: (values: ArchiveSubmissionValues) => Promise<void> | void;
}) {
  const [finalReportFileId, setFinalReportFileId] = useState('');
  const [finalSlideFileId, setFinalSlideFileId] = useState('');
  const [sourceCodeFileId, setSourceCodeFileId] = useState('');
  const [additionalDocumentFileId, setAdditionalDocumentFileId] = useState('');
  const [archiveNote, setArchiveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!finalReportFileId) {
      setError('Vui lòng upload báo cáo cuối cùng.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await onSubmit({
        finalReportFileId,
        finalSlideFileId: finalSlideFileId || undefined,
        sourceCodeFileId: sourceCodeFileId || undefined,
        additionalDocumentFileId: additionalDocumentFileId || undefined,
        archiveNote: archiveNote || undefined,
      });
      setFinalReportFileId('');
      setFinalSlideFileId('');
      setSourceCodeFileId('');
      setAdditionalDocumentFileId('');
      setArchiveNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nộp hồ sơ lưu trữ thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  if (disabled) {
    return <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Hồ sơ đã khóa hoặc không ở trạng thái cho phép nộp lại.</div>;
  }

  return (
    <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-950">Nộp hồ sơ lưu trữ</h2>
        <p className="mt-1 text-sm text-slate-500">File ID được hệ thống tự gắn sau khi upload, người dùng không cần nhập mã file.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><label className="font-semibold">Báo cáo cuối cùng *</label><FileUpload fileType="FINAL_REPORT" onUploaded={(file: FileDocument) => setFinalReportFileId(file.id)} /></div>
        <div className="space-y-2"><label className="font-semibold">Slide cuối</label><FileUpload fileType="FINAL_SLIDE" onUploaded={(file: FileDocument) => setFinalSlideFileId(file.id)} /></div>
        <div className="space-y-2"><label className="font-semibold">Mã nguồn/file ZIP</label><FileUpload fileType="SOURCE_CODE" onUploaded={(file: FileDocument) => setSourceCodeFileId(file.id)} /></div>
        <div className="space-y-2"><label className="font-semibold">Tài liệu bổ sung</label><FileUpload fileType="ARCHIVE_SUPPLEMENT" onUploaded={(file: FileDocument) => setAdditionalDocumentFileId(file.id)} /></div>
      </div>
      <textarea value={archiveNote} onChange={(event) => setArchiveNote(event.target.value)} className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" placeholder="Ghi chú lưu trữ" />
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <button type="button" onClick={handleSubmit} disabled={submitting || !finalReportFileId} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {submitting ? 'Đang nộp...' : 'Nộp hồ sơ'}
      </button>
    </div>
  );
}
