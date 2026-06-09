import { apiFetch } from '@/lib/api-client';
import type { NotificationItem } from '@/types/sprint3';

export function getNotifications() {
  return apiFetch<NotificationItem[]>('/api/notifications');
}

export function markNotificationRead(id: string) {
  return apiFetch<NotificationItem>(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead() {
  return apiFetch<{ updated: boolean }>('/api/notifications/read-all', { method: 'PATCH' });
}
