import { CheckCircle2, Clock3 } from 'lucide-react';
import { formatDateTime } from '@/lib/formatters';

export type HistoryTimelineItem = { id: string; title: string; description?: string | null; createdAt?: string | null; actor?: string | null; completed?: boolean };

export function HistoryTimeline({ items, emptyText = 'Chưa có lịch sử xử lý.' }: { items: HistoryTimelineItem[]; emptyText?: string }) {
  if (!items.length) return <p className="rounded-2xl border border-dashed bg-white p-4 text-sm text-slate-500">{emptyText}</p>;
  return <ol className="space-y-0">{items.map((item, index) => { const Icon = item.completed === false ? Clock3 : CheckCircle2; return <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">{index < items.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-slate-200" />}<span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 ring-1 ring-slate-200"><Icon className="h-4 w-4" /></span><div className="min-w-0 pt-0.5"><p className="font-semibold text-slate-900">{item.title}</p>{item.description && <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-600">{item.description}</p>}<p className="mt-1 text-xs text-slate-400">{item.actor ? `${item.actor} · ` : ''}{formatDateTime(item.createdAt)}</p></div></li>; })}</ol>;
}
