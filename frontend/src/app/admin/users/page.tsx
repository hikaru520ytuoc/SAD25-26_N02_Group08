'use client';

import { ArrowLeft, Loader2, Plus, ShieldAlert, UserCheck, Users, UserX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
import { EditUserDialog } from '@/components/users/edit-user-dialog';
import { UserTable } from '@/components/users/user-table';
import { ApiClientError } from '@/lib/api-client';
import { clearAccessToken } from '@/lib/auth-storage';
import { getMe } from '@/services/auth.service';
import { createUser, getRoles, getUsers, lockUser, unlockUser, updateUser } from '@/services/users.service';
import type { AuthUser, Role, UserListItem } from '@/types/auth';
import type { CreateUserFormValues, UpdateUserFormValues } from '@/schemas/user.schema';

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);

  const summary = useMemo(() => ({
    total: users.length,
    active: users.filter((user) => user.status === 'ACTIVE').length,
    locked: users.filter((user) => user.status === 'LOCKED').length,
  }), [users]);

  async function loadData(showLoading = true) {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const me = await getMe();
      if (!me.roles.includes('ADMIN')) {
        setForbidden(true);
        return;
      }
      setCurrentUser(me);
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
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateUser(values: CreateUserFormValues) {
    setError(null);
    setNotice(null);
    try {
      await createUser(values);
      await loadData(false);
      setNotice('Đã tạo tài khoản thành công.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo tài khoản';
      setError(message);
      throw err;
    }
  }

  async function handleUpdateUser(id: string, values: UpdateUserFormValues) {
    setError(null);
    setNotice(null);
    try {
      await updateUser(id, values);
      await loadData(false);
      setNotice('Đã cập nhật tài khoản và vai trò.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật tài khoản';
      setError(message);
      throw err;
    }
  }

  async function handleLockUser(id: string) {
    setError(null);
    setNotice(null);
    await lockUser(id);
    await loadData(false);
    setNotice('Đã khóa tài khoản.');
  }

  async function handleUnlockUser(id: string) {
    setError(null);
    setNotice(null);
    await unlockUser(id);
    await loadData(false);
    setNotice('Đã mở khóa tài khoản. Người dùng có thể đăng nhập lại.');
  }

  if (loading) {
    return <div className="rounded-3xl bg-white p-8 shadow"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Đang tải...</div>;
  }

  if (forbidden) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow">
        <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-rose-600" />
        <h1 className="text-2xl font-bold text-slate-950">Không có quyền</h1>
        <p className="mt-2 text-slate-600">Chỉ ADMIN được truy cập trang quản lý người dùng.</p>
        <Link href="/dashboard" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Quay lại Dashboard</Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/dashboard" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
            <h1 className="text-3xl font-bold text-slate-950">Quản lý tài khoản</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Tạo, sửa, khóa hoặc mở khóa tài khoản. Vai trò được cập nhật trong màn hình sửa, không chỉnh trực tiếp trên từng dòng.</p>
          </div>
          <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
            <Plus className="h-4 w-4" /> Thêm tài khoản
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Tổng tài khoản</span><Users className="h-5 w-5 text-blue-600" /></div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Đang hoạt động</span><UserCheck className="h-5 w-5 text-emerald-600" /></div>
            <p className="mt-3 text-3xl font-bold text-emerald-700">{summary.active}</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Đã khóa</span><UserX className="h-5 w-5 text-rose-600" /></div>
            <p className="mt-3 text-3xl font-bold text-rose-700">{summary.locked}</p>
          </div>
        </div>

        {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}
        {notice ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</div> : null}

        <UserTable
          users={users}
          currentUserId={currentUser?.id}
          onEdit={setEditingUser}
          onLock={handleLockUser}
          onUnlock={handleUnlockUser}
        />
      </div>

      <CreateUserDialog open={createOpen} roles={roles} onClose={() => setCreateOpen(false)} onSubmit={handleCreateUser} />
      <EditUserDialog open={Boolean(editingUser)} user={editingUser} roles={roles} onClose={() => setEditingUser(null)} onSubmit={handleUpdateUser} />
    </>
  );
}
