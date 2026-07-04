import type { ReactNode } from 'react';

export function CompactEntityCard({ eyebrow, title, description, status, meta, actions }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; status?: ReactNode; meta?: ReactNode; actions?: ReactNode }) {
  return <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div className="min-w-0 flex-1">{eyebrow && <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{eyebrow}</div>}<h2 className="mt-1 truncate text-lg font-bold text-slate-950">{title}</h2>{description && <div className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{description}</div>}</div>{status}</div>{meta && <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{meta}</div>}{actions && <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">{actions}</div>}</article>;
}
