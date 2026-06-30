'use client';

import { ChevronRight } from 'lucide-react';
import type { SidebarMenuGroup as SidebarMenuGroupType } from '@/lib/sidebar-menu';
import { SidebarSubItem } from './sidebar-sub-item';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SidebarGroup({
  group,
  pathname,
  open,
  active,
  onToggle,
  onNavigate,
}: {
  group: SidebarMenuGroupType;
  pathname: string;
  open: boolean;
  active: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const Icon = group.icon;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cx(
          'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition-colors',
          active ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white',
        )}
      >
        <span className={cx('rounded-xl p-2 transition-colors', active ? 'bg-orange-400/15 text-orange-300' : 'bg-white/10 text-blue-100')}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate">{group.title}</span>
        <ChevronRight className={cx('h-4 w-4 shrink-0 text-blue-200 transition-transform duration-150', open && 'rotate-90', active && 'text-orange-300')} />
      </button>

      {open && (
        <div className="overflow-hidden">
          <div className="relative ml-6 mt-1 space-y-1 border-l border-blue-400/40 pl-4 pb-2">
            {group.items.map((item) => (
              <SidebarSubItem key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
