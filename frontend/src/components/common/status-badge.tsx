import { getStatusMeta, type StatusTone } from '@/lib/status-labels';

const toneClasses: Record<StatusTone, string> = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
};

export function StatusBadge({ value, className = '' }: { value?: string | null; className?: string }) {
  const meta = getStatusMeta(value);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses[meta.tone]} ${className}`}>
      {meta.label}
    </span>
  );
}
