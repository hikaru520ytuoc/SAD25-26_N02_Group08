'use client';

import { useState } from 'react';
import { FileUpload } from './file-upload';
import type { FileDocument, Outline } from '@/types/sprint4';
import type { OutlineFormValues } from '@/schemas/sprint4.schema';

const emptyForm: OutlineFormValues = {
  title: '',
  summary: '',
  objectives: '',
  methodology: '',
  expectedOutput: '',
  timeline: '',
  fileDocumentId: '',
  submitNote: '',
};

export function StudentOutlineForm({ outline, onSubmit }: { outline?: Outline | null; onSubmit: (payload: OutlineFormValues) => Promise<void> }) {
  const [form, setForm] = useState<OutlineFormValues>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const disabled = outline?.status === 'APPROVED' || (outline && outline.status !== 'NEEDS_REVISION');
  const title = outline?.status === 'NEEDS_REVISION' ? 'Nộp lại đề cương' : 'Nộp đề cương';

  function setField<K extends keyof OutlineFormValues>(key: K, value: OutlineFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) {
      setMessage('Tên đề cương và tóm tắt là bắt buộc');
      return;
    }
    try {
      setSubmitting(true);
      setMessage('');
      await onSubmit(form);
      setForm(emptyForm);
      setMessage('Gửi đề cương thành công');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gửi đề cương thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  if (disabled) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">Form đang khóa vì đề cương hiện tại không ở trạng thái được nộp mới/nộp lại.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Tên đề cương" className="w-full rounded-xl border px-3 py-2" />
      <textarea value={form.summary} onChange={(e) => setField('summary', e.target.value)} placeholder="Tóm tắt đề cương" className="min-h-24 w-full rounded-xl border px-3 py-2" />
      <textarea value={form.objectives} onChange={(e) => setField('objectives', e.target.value)} placeholder="Mục tiêu" className="w-full rounded-xl border px-3 py-2" />
      <textarea value={form.methodology} onChange={(e) => setField('methodology', e.target.value)} placeholder="Phương pháp thực hiện" className="w-full rounded-xl border px-3 py-2" />
      <textarea value={form.expectedOutput} onChange={(e) => setField('expectedOutput', e.target.value)} placeholder="Sản phẩm/kết quả dự kiến" className="w-full rounded-xl border px-3 py-2" />
      <textarea value={form.timeline} onChange={(e) => setField('timeline', e.target.value)} placeholder="Kế hoạch/timeline" className="w-full rounded-xl border px-3 py-2" />
      <input value={form.submitNote} onChange={(e) => setField('submitNote', e.target.value)} placeholder="Ghi chú khi nộp" className="w-full rounded-xl border px-3 py-2" />
      <FileUpload fileType={outline?.status === 'NEEDS_REVISION' ? 'REVISION' : 'OUTLINE'} onUploaded={(file: FileDocument) => setField('fileDocumentId', file.id)} />
      {message && <p className="text-sm text-slate-600">{message}</p>}
      <button disabled={submitting} className="rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-60">{submitting ? 'Đang gửi...' : title}</button>
    </form>
  );
}
