'use client';

import { useState } from 'react';
import { FileUpload } from './file-upload';
import type { FileDocument } from '@/types/sprint4';
import type { ProgressFormValues } from '@/schemas/sprint4.schema';

export function StudentProgressForm({ onSubmit }: { onSubmit: (payload: ProgressFormValues) => Promise<void> }) {
  const [form, setForm] = useState<ProgressFormValues>({ title: '', content: '', progressPercent: undefined, fileDocumentId: '' });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof ProgressFormValues>(key: K, value: ProgressFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setMessage('Tiêu đề và nội dung tiến độ là bắt buộc');
      return;
    }
    try {
      setSubmitting(true);
      setMessage('');
      await onSubmit(form);
      setForm({ title: '', content: '', progressPercent: undefined, fileDocumentId: '' });
      setMessage('Cập nhật tiến độ thành công');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Cập nhật tiến độ thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Cập nhật tiến độ</h2>
      <input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Tiêu đề tiến độ" className="w-full rounded-xl border px-3 py-2" />
      <textarea value={form.content} onChange={(e) => setField('content', e.target.value)} placeholder="Nội dung tiến độ" className="min-h-24 w-full rounded-xl border px-3 py-2" />
      <input type="number" min={0} max={100} value={form.progressPercent ?? ''} onChange={(e) => setField('progressPercent', e.target.value === '' ? undefined : Number(e.target.value))} placeholder="% hoàn thành" className="w-full rounded-xl border px-3 py-2" />
      <FileUpload fileType="PROGRESS_DRAFT" onUploaded={(file: FileDocument) => setField('fileDocumentId', file.id)} />
      {message && <p className="text-sm text-slate-600">{message}</p>}
      <button disabled={submitting} className="rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-60">{submitting ? 'Đang gửi...' : 'Gửi tiến độ'}</button>
    </form>
  );
}
