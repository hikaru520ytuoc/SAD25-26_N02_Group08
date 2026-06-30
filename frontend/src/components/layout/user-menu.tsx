'use client';

import { LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAccessToken } from '@/lib/auth-storage';
import { getInitials, roleLabel } from '@/lib/formatters';
import type { AuthUser } from '@/types/auth';

export function UserMenu({ user }: { user: AuthUser }) {
  const router = useRouter();

  function logout() {
    clearAccessToken();
    router.push('/login');
  }

  return (
    <div className="group relative">
      <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:bg-slate-50">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-sm font-bold text-white">
          {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" /> : getInitials(user.fullName)}
        </div>
        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-semibold text-slate-950">{user.fullName}</p>
          <p className="truncate text-xs text-slate-500">{user.roles.map(roleLabel).join(', ')}</p>
        </div>
      </button>
      <div className="invisible absolute right-0 z-50 mt-2 w-64 translate-y-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold text-slate-950">{user.fullName}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <Link href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><UserRound className="h-4 w-4" /> Hồ sơ cá nhân</Link>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"><LogOut className="h-4 w-4" /> Đăng xuất</button>
      </div>
    </div>
  );
}
