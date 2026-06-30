'use client';

import { Bell, Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs } from './breadcrumbs';
import { UserMenu } from './user-menu';
import { StatusBadge } from '@/components/common/status-badge';
import { roleLabel } from '@/lib/formatters';
import { getNotifications } from '@/services/notifications.service';
import type { AuthUser } from '@/types/auth';

export function Topbar({ user, onMenuClick }: { user: AuthUser; onMenuClick?: () => void }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const refreshUnreadCount = () => {
      getNotifications()
      .then((items) => {
        if (!mounted) return;
        setUnreadCount(items.filter((item) => !item.isRead).length);
      })
      .catch(() => {
        if (mounted) setUnreadCount(0);
      });
    };

    refreshUnreadCount();
    window.addEventListener('notifications:updated', refreshUnreadCount);

    return () => {
      mounted = false;
      window.removeEventListener('notifications:updated', refreshUnreadCount);
    };
  }, []);

  const displayCount = useMemo(() => (unreadCount > 99 ? '99+' : String(unreadCount)), [unreadCount]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <Breadcrumbs />
          <div className="mt-2 hidden max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 md:flex">
            <Search className="h-4 w-4" />
            <span>Tìm kiếm nhanh sinh viên, đề tài, hội đồng...</span>
          </div>
        </div>
        <div className="hidden items-center gap-2 xl:flex">
          {user.roles.slice(0, 2).map((role) => <span key={role} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">{roleLabel(role)}</span>)}
          <StatusBadge value={user.status} />
        </div>
        <Link href="/notifications" className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm hover:bg-slate-50" aria-label="Thông báo">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white ring-2 ring-white">
              {displayCount}
            </span>
          ) : null}
        </Link>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
