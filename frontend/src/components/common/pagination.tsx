import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <span className="text-slate-500">Trang {page}/{totalPages}</span>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-40" aria-label="Trang trước"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-40" aria-label="Trang sau"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
