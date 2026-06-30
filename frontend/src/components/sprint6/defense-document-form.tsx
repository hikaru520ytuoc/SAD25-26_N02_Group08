'use client';

import { useState } from 'react';
import { FileCard } from '@/components/common/file-card';
import { FileUpload } from '@/components/sprint4/file-upload';
import type { DefenseDocumentValues } from '@/schemas/sprint6.schema';
import type { FileDocument } from '@/types/sprint4';

export function DefenseDocumentForm({ onSubmit, submitLabel = 'Nộp hồ sơ' }: { onSubmit: (values: DefenseDocumentValues) => Promise<void>; submitLabel?: string }) {
  const [form, setForm] = useState<DefenseDocumentValues>({ reportFileId: '', slideFileId: '', additionalFileId: '' });
  const [files, setFiles] = useState<{ report?: FileDocument; slide?: FileDocument; additional?: FileDocument }>({});
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.reportFileId || !form.slideFileId) {
      setError('Vui lòng upload báo cáo và slide.');
      return;
    }
    try {
      setError('');
      await onSubmit({ ...form, additionalFileId: form.additionalFileId || undefined });
      setForm({ reportFileId: '', slideFileId: '', additionalFileId: '' });
      setFiles({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể nộp hồ sơ');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Hồ sơ bảo vệ</h2>
      <p className="text-sm text-slate-500">Chọn file để upload. Hệ thống tự nhận fileDocumentId và gắn ẩn vào hồ sơ, không cần dán ID.</p>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <p className="font-semibold">Báo cáo bảo vệ <span className="text-red-600">*</span></p>
          <FileUpload fileType="DEFENSE_REPORT_FINAL" onUploaded={(file) => { setFiles((prev) => ({ ...prev, report: file })); setForm((prev) => ({ ...prev, reportFileId: file.id })); }} />
          {files.report ? <FileCard file={{ ...files.report, type: files.report.fileType }} /> : null}
        </div>
        <div className="rounded-2xl border p-4">
          <p className="font-semibold">Slide bảo vệ <span className="text-red-600">*</span></p>
          <FileUpload fileType="DEFENSE_SLIDE_FINAL" onUploaded={(file) => { setFiles((prev) => ({ ...prev, slide: file })); setForm((prev) => ({ ...prev, slideFileId: file.id })); }} />
          {files.slide ? <FileCard file={{ ...files.slide, type: files.slide.fileType }} /> : null}
        </div>
        <div className="rounded-2xl border p-4 md:col-span-2">
          <p className="font-semibold">Tài liệu bổ sung</p>
          <FileUpload fileType="DEFENSE_SUPPLEMENT" onUploaded={(file) => { setFiles((prev) => ({ ...prev, additional: file })); setForm((prev) => ({ ...prev, additionalFileId: file.id })); }} />
          {files.additional ? <FileCard file={{ ...files.additional, type: files.additional.fileType }} /> : null}
        </div>
      </div>
      <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">{submitLabel}</button>
    </form>
  );
}
