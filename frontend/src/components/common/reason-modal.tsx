'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormModal } from './form-modal';

export function ReasonModal({ open, onClose, onSubmit, title, description, label = 'Lý do', placeholder = 'Nhập lý do cụ thể để người nhận biết cần xử lý gì...', submitLabel = 'Xác nhận', loading = false }: { open: boolean; onClose: () => void; onSubmit: (reason: string) => void | Promise<void>; title: string; description?: string; label?: string; placeholder?: string; submitLabel?: string; loading?: boolean }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
      setError('');
    }
  }, [open]);

  async function submit() {
    const normalized = reason.trim();
    if (!normalized) {
      setError('Vui lòng nhập lý do trước khi tiếp tục.');
      return;
    }
    setError('');
    await onSubmit(normalized);
  }

  return (
    <FormModal open={open} onClose={onClose} title={title} description={description} size="lg" closeDisabled={loading}>
      <div className="space-y-5">
        <label className="block text-sm font-semibold text-slate-800">
          {label} <span className="text-rose-600">*</span>
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={5} placeholder={placeholder} className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
        </label>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" disabled={loading} onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
          <button type="button" disabled={loading} onClick={submit} className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Đang xử lý...' : submitLabel}
          </button>
        </div>
      </div>
    </FormModal>
  );
}
