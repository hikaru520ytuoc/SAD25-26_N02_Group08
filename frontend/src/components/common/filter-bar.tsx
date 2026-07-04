import { SlidersHorizontal } from 'lucide-react';
import { SearchInput } from './search-input';
import type { ReactNode } from 'react';

export function FilterBar({ search, onSearchChange, placeholder = 'Tìm kiếm...', children, resultCount }: { search?: string; onSearchChange?: (value: string) => void; placeholder?: string; children?: ReactNode; resultCount?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {onSearchChange && <SearchInput value={search ?? ''} onChange={onSearchChange} placeholder={placeholder} />}
        {children && <div className="flex flex-wrap items-center gap-3"><SlidersHorizontal className="hidden h-4 w-4 text-slate-400 sm:block" />{children}</div>}
        {typeof resultCount === 'number' && <span className="whitespace-nowrap text-xs font-medium text-slate-500">{resultCount} kết quả</span>}
      </div>
    </div>
  );
}
