'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingState } from '@/components/common/loading-state';
import { ProjectWorkflowStepper } from '@/components/common/project-workflow-stepper';
import { clearAccessToken, getAccessToken, getStoredUser, setStoredUser } from '@/lib/auth-storage';
import { isPathAllowed } from '@/lib/menu-items';
import { getMe } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

const publicRoutes = ['/', '/login'];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = publicRoutes.includes(pathname);
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState(!isPublic);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      if (isPublic) {
        setLoading(false);
        return;
      }

      if (!getAccessToken()) {
        router.replace('/login');
        return;
      }

      try {
        const me = await getMe();
        if (!mounted) return;
        setUser(me);
        setStoredUser(me);
        setForbidden(!isPathAllowed(pathname, me.roles));
      } catch {
        clearAccessToken();
        router.replace('/login');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();
    return () => { mounted = false; };
  }, [isPublic, pathname, router]);

  if (isPublic) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  if (loading || !user) {
    return <main className="min-h-screen bg-slate-50 p-6"><LoadingState label="Đang kiểm tra phiên đăng nhập..." /></main>;
  }

  if (forbidden) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Sidebar user={user} />
        <div className="lg:pl-72">
          <Topbar user={user} />
          <div className="p-6 lg:p-8">
            <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-slate-950">Không có quyền truy cập</h1>
              <p className="mt-2 text-slate-600">Tài khoản hiện tại không có quyền truy cập màn hình này.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const showStudentStepper = user.roles.includes('STUDENT') && (pathname === '/dashboard' || pathname.startsWith('/student') || pathname.startsWith('/records/locked'));

  return (
    <main className="min-h-screen bg-slate-50">
      <Sidebar user={user} />
      <div className="lg:pl-72">
        <Topbar user={user} />
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
          {showStudentStepper && <ProjectWorkflowStepper locked={pathname.startsWith('/records/locked')} />}
          {children}
        </div>
      </div>
    </main>
  );
}
