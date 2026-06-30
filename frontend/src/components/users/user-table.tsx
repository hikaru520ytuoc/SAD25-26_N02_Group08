'use client';

import { Loader2, Lock, Unlock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTableToolbar } from '@/components/common/data-table-toolbar';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { confirmImportantAction } from '@/components/common/confirm-dialog';
import type { Role, UserListItem } from '@/types/auth';

type Props = {
  users: UserListItem[];
  roles: Role[];
  onLock: (id: string) => Promise<void>;
  onUnlock: (id: string) => Promise<void>;
  onAssignRoles: (id: string, roleIds: string[]) => Promise<void>;
};

export function UserTable({ users, roles, onLock, onUnlock, onAssignRoles }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchKeyword = !keyword || [user.email, user.fullName, user.student?.studentCode, user.student?.className].filter(Boolean).join(' ').toLowerCase().includes(keyword);
      const matchStatus = status === 'ALL' || user.status === status;
      return matchKeyword && matchStatus;
    });
  }, [search, status, users]);

  async function runAction(userId: string, action: () => Promise<void>) {
    setLoadingId(userId);
    try {
      await action();
    } finally {
      setLoadingId(null);
    }
  }

  if (users.length === 0) return <EmptyState title="Chưa có người dùng" description="Tạo người dùng mới để bắt đầu phân quyền." />;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        statuses={[{ value: 'ACTIVE', label: 'Đang hoạt động' }, { value: 'LOCKED', label: 'Đã khóa' }]}
        placeholder="Tìm theo email, họ tên, mã sinh viên..."
      />
      {filteredUsers.length === 0 ? (
        <div className="p-5"><EmptyState /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Tài khoản</th>
                <th className="px-4 py-3">Hồ sơ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Gán role</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const selectedRoleIds = roleDraft[user.id] ?? user.roles.map((role) => role.id);
                return (
                  <tr key={user.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{user.fullName}</p>
                      <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                      {user.phone && <p className="mt-1 text-xs text-slate-500">{user.phone}</p>}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {user.student ? <span>{user.student.studentCode} · {user.student.className}</span> : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-4"><StatusBadge value={user.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => <span key={role.id} className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">{role.code}</span>)}
                      </div>
                    </td>
                    <td className="min-w-56 px-4 py-4">
                      <div className="grid gap-1 md:grid-cols-2">
                        {roles.map((role) => (
                          <label key={role.id} className="flex items-center gap-2 text-xs text-slate-600">
                            <input
                              type="checkbox"
                              checked={selectedRoleIds.includes(role.id)}
                              onChange={(event) => {
                                const next = event.target.checked ? [...selectedRoleIds, role.id] : selectedRoleIds.filter((id) => id !== role.id);
                                setRoleDraft((current) => ({ ...current, [user.id]: next }));
                              }}
                            />
                            {role.code}
                          </label>
                        ))}
                      </div>
                      <button onClick={() => runAction(user.id, () => onAssignRoles(user.id, selectedRoleIds))} className="mt-2 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">Lưu role</button>
                    </td>
                    <td className="px-4 py-4">
                      {user.status === 'ACTIVE' ? (
                        <button onClick={() => confirmImportantAction('Bạn chắc chắn muốn khóa tài khoản này?') && runAction(user.id, () => onLock(user.id))} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                          {loadingId === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />} Khóa
                        </button>
                      ) : (
                        <button onClick={() => confirmImportantAction('Bạn chắc chắn muốn mở khóa tài khoản này?') && runAction(user.id, () => onUnlock(user.id))} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                          {loadingId === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlock className="h-3 w-3" />} Mở khóa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
