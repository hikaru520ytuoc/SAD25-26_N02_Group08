'use client';

import { Bell, BellRing, CheckCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import type { NotificationItem } from '@/types/sprint3';

function notificationRoute(type: string) {
  if (type.includes('OUTLINE')) return '/student/outline';
  if (type.includes('PROGRESS')) return '/student/progress';
  if (type.includes('DEFENSE')) return '/student/defense-registration';
  if (type.includes('REVIEWER')) return '/reviewer/assignments';
  if (type.includes('COUNCIL') || type.includes('SCHEDULE')) return '/student/defense-schedule';
  if (type.includes('RESULT')) return '/student/result';
  if (type.includes('REVISION')) return '/student/revision';
  if (type.includes('ARCHIVE')) return '/student/archive';
  if (type.includes('SUPERVISOR') || type.includes('TOPIC')) return '/student/topic-registration';
  return '/dashboard';
}

type Props = {
  items: NotificationItem[];
  onMarkAllRead: () => Promise<void>;
  onMarkRead: (item: NotificationItem) => Promise<void>;
};

export function NotificationDropdown({ items, onMarkAllRead, onMarkRead }: Props) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [type, setType] = useState('ALL');
  const unread = items.filter((item) => !item.isRead).length;
  const types = useMemo(() => Array.from(new Set(items.map((item) => item.type))).sort(), [items]);
  const visible = useMemo(() => items.filter((item) => {
    if (filter === 'unread' && item.isRead) return false;
    if (filter === 'read' && !item.isRead) return false;
    if (type !== 'ALL' && item.type !== type) return false;
    return true;
  }), [filter, items, type]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {([['all', `Tất cả (${items.length})`], ['unread', `Chưa đọc (${unread})`], ['read', `Đã đọc (${items.length - unread})`]] as const).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold ${filter === value ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{label}</button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="ALL">Tất cả loại</option>
            {types.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
          </select>
          <button type="button" disabled={unread === 0} onClick={onMarkAllRead} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"><CheckCheck className="h-4 w-4" />Đánh dấu tất cả đã đọc</button>
        </div>
      </div>

      {visible.length === 0 ? <EmptyState title="Không có thông báo phù hợp" /> : (
        <div className="space-y-3">
          {visible.map((item) => (
            <article key={item.id} className={`rounded-2xl border p-4 shadow-sm ${item.isRead ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50/70'}`}>
              <div className="flex items-start gap-3">
                <div className={`rounded-xl p-2 ${item.isRead ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>{item.isRead ? <Bell className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-bold text-slate-950">{item.title}</h3>{!item.isRead && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">Chưa đọc</span>}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={notificationRoute(item.type)} onClick={() => !item.isRead && void onMarkRead(item)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white"><ExternalLink className="h-3.5 w-3.5" />Xem hồ sơ</Link>
                    {!item.isRead && <button type="button" onClick={() => onMarkRead(item)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Đánh dấu đã đọc</button>}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
