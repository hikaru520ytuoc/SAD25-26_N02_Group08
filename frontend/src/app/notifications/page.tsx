'use client';

import { Bell, BellRing } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { NotificationDropdown } from '@/components/sprint3/notification-dropdown';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/notifications.service';
import type { NotificationItem } from '@/types/sprint3';

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      setItems(await getNotifications());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được thông báo');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);
  const unread = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setItems((current) => current.map((item) => ({ ...item, isRead: true, readAt: new Date().toISOString() })));
    toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    window.dispatchEvent(new Event('notifications:updated'));
  }

  async function handleMarkRead(item: NotificationItem) {
    if (item.isRead) return;
    const updated = await markNotificationRead(item.id);
    setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
    window.dispatchEvent(new Event('notifications:updated'));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Trung tâm thông báo" description="Theo dõi các thay đổi nghiệp vụ và mở đúng hồ sơ liên quan." />
      <div className="grid gap-4 sm:grid-cols-3"><SummaryStatCard label="Tổng thông báo" value={items.length} icon={Bell} /><SummaryStatCard label="Chưa đọc" value={unread} icon={BellRing} tone="blue" /><SummaryStatCard label="Đã đọc" value={items.length - unread} icon={Bell} tone="emerald" /></div>
      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={5} /> : <NotificationDropdown items={items} onMarkAllRead={handleMarkAllRead} onMarkRead={handleMarkRead} />}
    </div>
  );
}
