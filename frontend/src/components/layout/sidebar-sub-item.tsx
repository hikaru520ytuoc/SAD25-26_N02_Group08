'use client';

import Link from 'next/link';
import type { SidebarMenuItem } from '@/lib/sidebar-menu';
import { isMenuItemActive } from '@/lib/sidebar-menu';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SidebarSubItem({ item, pathname, onNavigate }: { item: SidebarMenuItem; pathname: string; onNavigate?: () => void }) {
  const active = isMenuItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cx(
        'relative flex min-h-9 items-center rounded-xl px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-white/10 font-semibold text-orange-400 shadow-sm'
          : 'text-blue-100/90 hover:bg-white/10 hover:text-white',
      )}
    >
      <span
        className={cx(
          'absolute -left-[21px] h-2.5 w-2.5 rounded-full ring-4 ring-[#243B7A] transition-colors',
          active ? 'bg-orange-400' : 'bg-blue-400',
        )}
      />
      <span className="truncate">{item.title}</span>
    </Link>
  );
}
