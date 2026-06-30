'use client';

import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getMenuForRoles } from '@/lib/menu-items';
import type { AuthUser } from '@/types/auth';

export function Sidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const items = getMenuForRoles(user.roles);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-slate-200 bg-slate-950 text-white lg:flex">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="rounded-2xl bg-white p-2 text-slate-950">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Quản lý đồ án</p>
          <p className="text-xs text-slate-300">Tốt nghiệp · MVP</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-white text-slate-950 shadow' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-400">
        <p>Nhóm 08 · SAD 2025-2026</p>
        <p className="mt-1">v0.10 UI polish</p>
      </div>
    </aside>
  );
}
