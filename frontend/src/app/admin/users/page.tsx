'use client';

import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CreateUserForm } from '@/components/users/create-user-form';
import { UserTable } from '@/components/users/user-table';
import { AppShell } from '@/components/layout/app-shell';
import { ApiClientError } from '@/lib/api-client';
import { clearAccessToken } from '@/lib/auth-storage';
import { getMe } from '@/services/auth.service';
import { assignRoles, createUser, getRoles, getUsers, lockUser, unlockUser } from '@/services/users.service';
import type { Role, UserListItem } from '@/types/auth';
import type { CreateUserFormValues } from '@/schemas/user.schema';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const me = await getMe();
      if (!me.roles.includes('ADMIN')) {
        setForbidden(true);
        return;
      }
      const [usersResult, rolesResult] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersResult.items);
      setRoles(rolesResult);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        clearAccessToken();
        router.push('/login');
        return;
      }
      if (err instanceof ApiClientError && err.statusCode === 403) {
        setForbidden(true);
        return;
      }
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateUser(values: CreateUserFormValues) {
    await createUser(values);
    await loadData();
  }

  async function handleLockUser(id: string) {
    await lockUser(id);
    await loadData();
  }

  async function handleUnlockUser(id: string) {
    await unlockUser(id);
    await loadData();
  }

  async function handleAssignRoles(id: string, roleIds: string[]) {
    await assignRoles(id, roleIds);
    await loadData();
  }

  if (loading) {
    return <AppShell><div className="rounded-3xl bg-white p-8 shadow"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Đang tải...</div></AppShell>;
  }

  if (forbidden) {
    return (
      <AppShell>
        <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-rose-600" />
          <h1 className="text-2xl font-bold text-slate-950">Không có quyền</h1>
          <p className="mt-2 text-slate-600">Chỉ ADMIN được truy cập trang quản lý người dùng.</p>
          <Link href="/dashboard" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Quay lại Dashboard</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/dashboard" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
            <h1 className="text-3xl font-bold text-slate-950">Admin · Quản lý người dùng</h1>
            <p className="mt-2 text-slate-600">Tạo user, khóa/mở khóa tài khoản và gán role.</p>
          </div>
        </div>

        {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <CreateUserForm roles={roles} onSubmit={handleCreateUser} />
        <UserTable users={users} roles={roles} onLock={handleLockUser} onUnlock={handleUnlockUser} onAssignRoles={handleAssignRoles} />
      </div>
    </AppShell>
  );
}
