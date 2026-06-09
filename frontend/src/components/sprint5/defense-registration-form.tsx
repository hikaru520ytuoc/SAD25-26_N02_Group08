'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/sprint4/file-upload';
import type { DefenseRegistrationValues } from '@/schemas/sprint5.schema';
import type { FileDocument } from '@/types/sprint4';

export function DefenseRegistrationForm({ onSubmit }: { onSubmit: (payload: DefenseRegistrationValues) => Promise<void> }) {
  const [title, setTitle] = useState('Hồ sơ bảo vệ đồ án tốt nghiệp');
  const [summary, setSummary] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [reportFile, setReportFile] = useState<FileDocument | null>(null);
  const [slideFile, setSlideFile] = useState<FileDocument | null>(null);
  const [additionalFile, setAdditionalFile] = useState<FileDocument | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!title.trim()) return setError('Tên hồ sơ không được rỗng');
    if (!reportFile) return setError('Báo cáo là bắt buộc');
    try {
      setSubmitting(true);
      setError('');
      await onSubmit({
        title: title.trim(),
        summary,
        studentNote,
        reportFileId: reportFile.id,
        slideFileId: slideFile?.id,
        additionalDocumentFileId: additionalFile?.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi hồ sơ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Đăng ký bảo vệ</h2>
      <div className="mt-4 space-y-4">
        <input className="w-full rounded-xl border px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên hồ sơ/báo cáo" />
        <textarea className="w-full rounded-xl border px-3 py-2" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Tóm tắt" />
        <textarea className="w-full rounded-xl border px-3 py-2" value={studentNote} onChange={(e) => setStudentNote(e.target.value)} placeholder="Ghi chú của sinh viên" />
        <div>
          <p className="mb-2 text-sm font-semibold">Báo cáo bảo vệ *</p>
          <FileUpload fileType="REPORT" onUploaded={setReportFile} />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Slide bảo vệ</p>
          <FileUpload fileType="SLIDE" onUploaded={setSlideFile} />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Tài liệu bổ sung</p>
          <FileUpload fileType="DEFENSE_DOCUMENT" onUploaded={setAdditionalFile} />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={submitting} onClick={submit} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {submitting ? 'Đang gửi...' : 'Gửi hồ sơ bảo vệ'}
        </button>
      </div>
    </div>
  );
}
