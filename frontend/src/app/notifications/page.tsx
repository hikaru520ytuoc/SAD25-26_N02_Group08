'use client';

import { useEffect, useState } from 'react';
import { NotificationDropdown } from '@/components/sprint3/notification-dropdown';
import { getNotifications, markAllNotificationsRead } from '@/services/notifications.service';
import type { NotificationItem } from '@/types/sprint3';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setItems(await getNotifications());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được thông báo');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    await loadData();
    window.dispatchEvent(new Event('notifications:updated'));
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Thông báo</h1>
          <p className="mt-2 text-slate-600">Notification cơ bản cho Sprint 3.</p>
        </div>
        {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : <NotificationDropdown items={items} onMarkAllRead={handleMarkAllRead} />}
      </div>
    </>
  );
}
