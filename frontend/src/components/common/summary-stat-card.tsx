import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export function SummaryStatCard({ label, value, hint, icon: Icon, tone = 'slate', onClick }: { label: string; value: number | string; hint?: string; icon?: LucideIcon; tone?: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet'; onClick?: () => void }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && <div className={cn('rounded-2xl p-3', tone === 'slate' && 'bg-slate-100 text-slate-700', tone === 'blue' && 'bg-blue-50 text-blue-700', tone === 'emerald' && 'bg-emerald-50 text-emerald-700', tone === 'amber' && 'bg-amber-50 text-amber-700', tone === 'rose' && 'bg-rose-50 text-rose-700', tone === 'violet' && 'bg-violet-50 text-violet-700')}><Icon className="h-5 w-5" /></div>}
      </div>
    </>
  );
  const classes = 'rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition';
  return onClick ? <button type="button" onClick={onClick} className={`${classes} hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md`}>{content}</button> : <div className={classes}>{content}</div>;
}
