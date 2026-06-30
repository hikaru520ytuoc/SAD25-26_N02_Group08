'use client';

import { GraduationCap, PanelLeftClose, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getSidebarGroupsForRoles, isGroupActive } from '@/lib/sidebar-menu';
import type { AuthUser } from '@/types/auth';
import { SidebarGroup } from './sidebar-group';

const STORAGE_KEY = 'gpm-sidebar-open-groups';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function safeReadOpenGroups(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

function safeWriteOpenGroups(value: Record<string, boolean>) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore localStorage errors in private mode or restricted environments.
  }
}

function SidebarContent({ user, onNavigate, onClose }: { user: AuthUser; onNavigate?: () => void; onClose?: () => void }) {
  const pathname = usePathname();
  const groups = useMemo(() => getSidebarGroupsForRoles(user.roles), [user.roles]);
  const activeGroupTitle = useMemo(() => groups.find((group) => isGroupActive(pathname, group))?.title, [groups, pathname]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const stored = safeReadOpenGroups();

    // On first page load/reload, open the group that contains the current route immediately.
    // This prevents the sidebar from rendering closed first and then jumping open in useEffect.
    if (activeGroupTitle) {
      return { ...stored, [activeGroupTitle]: true };
    }

    return stored;
  });

  useEffect(() => {
    if (!activeGroupTitle) return;

    // Auto-open the new active group only when the route changes.
    // Do not force active groups to stay open forever: after this effect runs, the user can
    // click the active group and collapse it because `open` is controlled only by openGroups.
    setOpenGroups((current) => {
      if (current[activeGroupTitle]) return current;

      const next = { ...current, [activeGroupTitle]: true };
      safeWriteOpenGroups(next);
      return next;
    });
  }, [activeGroupTitle]);

  function toggleGroup(title: string) {
    setOpenGroups((current) => {
      const next = { ...current, [title]: !current[title] };
      safeWriteOpenGroups(next);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col bg-[#243B7A] text-white shadow-2xl">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="rounded-2xl bg-white p-2 text-[#243B7A] shadow-sm">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight">Quản lý đồ án</p>
          <p className="truncate text-xs text-blue-200">Graduation Project</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-blue-100 transition-colors hover:bg-white/10 lg:hidden" aria-label="Đóng menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {groups.map((group) => {
          const active = isGroupActive(pathname, group);
          const open = Boolean(openGroups[group.title]);
          return (
            <SidebarGroup
              key={group.title}
              group={group}
              pathname={pathname}
              open={open}
              active={active}
              onToggle={() => toggleGroup(group.title)}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-xs text-blue-200">
        <div className="flex items-center gap-2">
          <PanelLeftClose className="h-4 w-4" />
          <span className="truncate">{user.fullName || user.email}</span>
        </div>
        <p className="mt-1 text-blue-300">Nhóm 08 · v1.0 MVP</p>
      </div>
    </div>
  );
}

export function Sidebar({ user, mobileOpen = false, onMobileClose }: { user: AuthUser; mobileOpen?: boolean; onMobileClose?: () => void }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col lg:flex">
        <SidebarContent user={user} />
      </aside>

      <div className={cx('fixed inset-0 z-50 lg:hidden', mobileOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div
          className={cx('absolute inset-0 bg-slate-950/50 transition-opacity duration-150', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={onMobileClose}
        />
        <aside className={cx('absolute inset-y-0 left-0 w-80 max-w-[86vw] transition-transform duration-150 ease-out', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
          <SidebarContent user={user} onNavigate={onMobileClose} onClose={onMobileClose} />
        </aside>
      </div>
    </>
  );
}
