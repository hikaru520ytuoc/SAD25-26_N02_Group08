'use client';

import { Loader2, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
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

  async function runAction(userId: string, action: () => Promise<void>) {
    setLoadingId(userId);
    try {
      await action();
    } finally {
      setLoadingId(null);
    }
  }

  if (users.length === 0) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Chưa có người dùng nào.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Gán role</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const selectedRoleIds = roleDraft[user.id] ?? user.roles.map((role) => role.id);
              return (
                <tr key={user.id} className="align-top">
                  <td className="px-4 py-4 font-medium text-slate-900">{user.email}</td>
                  <td className="px-4 py-4 text-slate-700">{user.fullName}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{user.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => <span key={role.id} className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{role.code}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-4 min-w-56">
                    <div className="space-y-1">
                      {roles.map((role) => (
                        <label key={role.id} className="flex items-center gap-2 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={selectedRoleIds.includes(role.id)}
                            onChange={(event) => {
                              const next = event.target.checked
                                ? [...selectedRoleIds, role.id]
                                : selectedRoleIds.filter((id) => id !== role.id);
                              setRoleDraft((current) => ({ ...current, [user.id]: next }));
                            }}
                          />
                          {role.code}
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => runAction(user.id, () => onAssignRoles(user.id, selectedRoleIds))}
                      className="mt-2 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Lưu role
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    {user.status === 'ACTIVE' ? (
                      <button onClick={() => runAction(user.id, () => onLock(user.id))} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                        {loadingId === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />} Khóa
                      </button>
                    ) : (
                      <button onClick={() => runAction(user.id, () => onUnlock(user.id))} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
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
    </div>
  );
}
