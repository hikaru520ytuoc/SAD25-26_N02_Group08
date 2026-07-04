'use client';

import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

export function DetailDrawer({ open, onClose, title, description, children, footer }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[75] bg-slate-950/40 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Đóng chi tiết" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-slate-50 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
          <div>
            <h2 id="drawer-title" className="text-xl font-bold text-slate-950">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
        {footer && <footer className="border-t border-slate-200 bg-white p-4 sm:px-6">{footer}</footer>}
      </aside>
    </div>
  );
}
