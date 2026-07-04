'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { FormModal } from './form-modal';

export function ConfirmActionModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Xác nhận', processingLabel = 'Đang xử lý...', loading = false, tone = 'primary' }: { open: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; title: string; description: React.ReactNode; confirmLabel?: string; processingLabel?: string; loading?: boolean; tone?: 'primary' | 'danger' }) {
  return (
    <FormModal open={open} onClose={onClose} title={title} size="lg" closeDisabled={loading}>
      <div className="space-y-5">
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>{description}</div>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" disabled={loading} onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
          <button type="button" disabled={loading} onClick={onConfirm} className={tone === 'danger' ? 'inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50' : 'inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50'}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? processingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </FormModal>
  );
}
