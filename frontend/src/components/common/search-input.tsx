'use client';

import { Search, X } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder = 'Tìm kiếm...', label = 'Tìm kiếm' }: { value: string; onChange: (value: string) => void; placeholder?: string; label?: string }) {
  return <label className="relative block min-w-0 flex-1"><span className="sr-only">{label}</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />{value && <button type="button" onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Xóa nội dung tìm kiếm"><X className="h-4 w-4" /></button>}</label>;
}
