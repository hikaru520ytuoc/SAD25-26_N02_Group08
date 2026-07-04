'use client';

import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'xl',
  closeDisabled = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'lg' | 'xl' | '2xl';
  closeDisabled?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !closeDisabled) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, closeDisabled]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
      <button type="button" className="absolute inset-0 cursor-default" onClick={closeDisabled ? undefined : onClose} aria-label="Đóng modal" />
      <section className={cn(
        'relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl',
        size === 'lg' && 'sm:max-w-2xl',
        size === 'xl' && 'sm:max-w-4xl',
        size === '2xl' && 'sm:max-w-6xl',
      )}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="form-modal-title" className="text-xl font-bold text-slate-950">{title}</h2>
            {description && <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>}
          </div>
          <button type="button" disabled={closeDisabled} onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50" aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
      </section>
    </div>
  );
}
