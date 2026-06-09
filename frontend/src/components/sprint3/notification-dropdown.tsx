'use client';

import type { NotificationItem } from '@/types/sprint3';

type Props = {
  items: NotificationItem[];
  onMarkAllRead: () => Promise<void>;
};

export function NotificationDropdown({ items, onMarkAllRead }: Props) {
  const unread = items.filter((item) => !item.isRead).length;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Thông báo</h2>
          <p className="text-sm text-slate-500">{unread} thông báo chưa đọc</p>
        </div>
        <button onClick={onMarkAllRead} className="rounded-xl border px-4 py-2 text-sm font-semibold">Đánh dấu đã đọc</button>
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-500">Chưa có thông báo.</p>}
        {items.map((item) => (
          <div key={item.id} className={`rounded-2xl border p-4 ${item.isRead ? 'bg-white' : 'bg-blue-50'}`}>
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.message}</p>
            <p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
