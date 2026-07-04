'use client';

import { Download, X } from 'lucide-react';
import { useEffect } from 'react';

export function FileViewerModal({ open, onClose, url, filename, mimeType, onDownload }: { open: boolean; onClose: () => void; url: string; filename?: string | null; mimeType?: string | null; onDownload?: () => void }) {
  useEffect(() => { if (!open) return; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; const listener = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); document.addEventListener('keydown', listener); return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', listener); }; }, [open, onClose]);
  if (!open) return null;
  const isImage = Boolean(mimeType?.startsWith('image/'));
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Xem file ${filename ?? ''}`}><button type="button" className="absolute inset-0" onClick={onClose} aria-label="Đóng trình xem file" /><section className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"><header className="flex items-center justify-between gap-4 border-b px-4 py-3"><div className="min-w-0"><h2 className="truncate font-bold text-slate-950">{filename ?? 'Xem file'}</h2><p className="text-xs text-slate-500">{mimeType ?? 'Tệp đính kèm'}</p></div><div className="flex gap-2">{onDownload && <button type="button" onClick={onDownload} className="secondary-button"><Download className="mr-1.5 h-4 w-4" />Tải xuống</button>}<button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng"><X className="h-5 w-5" /></button></div></header><div className="flex min-h-0 flex-1 items-center justify-center bg-slate-100 p-2">{isImage ? <img src={url} alt={filename ?? 'Ảnh đính kèm'} className="max-h-full max-w-full object-contain" /> : <iframe src={url} title={filename ?? 'Nội dung file'} className="h-full w-full rounded-xl bg-white" />}</div></section></div>;
}
