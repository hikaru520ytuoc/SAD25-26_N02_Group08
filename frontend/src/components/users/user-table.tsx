'use client';

import { Loader2, Lock, Pencil, Unlock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTableToolbar } from '@/components/common/data-table-toolbar';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import type { UserListItem } from '@/types/auth';

type Props = {
  users: UserListItem[];
  currentUserId?: string;
  onEdit: (user: UserListItem) => void;
  onLock: (id: string) => Promise<void>;
  onUnlock: (id: string) => Promise<void>;
};

export function UserTable({ users, currentUserId, onEdit, onLock, onUnlock }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [pendingAction, setPendingAction] = useState<{ user: UserListItem; type: 'lock' | 'unlock' } | null>(null);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users.filter((user) => {
      const searchable = [
        user.email,
        user.fullName,
        user.phone,
        user.student?.studentCode,
        user.student?.className,
        user.student?.major.code,
        user.student?.major.name,
        user.lecturer?.lecturerCode,
        user.lecturer?.department,
        ...user.roles.map((role) => role.code),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchKeyword = !keyword || searchable.includes(keyword);
      const matchStatus = status === 'ALL' || user.status === status;
      return matchKeyword && matchStatus;
    });
  }, [search, status, users]);

  async function runAction(userId: string, action: () => Promise<void>) {
    setLoadingId(userId);
    setActionError('');
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể thực hiện thao tác tài khoản');
    } finally {
      setLoadingId(null);
    }
  }

  if (users.length === 0) {
    return <EmptyState title="Chưa có người dùng" description="Tạo tài khoản mới để bắt đầu quản lý người dùng." />;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        statuses={[{ value: 'ACTIVE', label: 'Đang hoạt động' }, { value: 'LOCKED', label: 'Đã khóa' }]}
        placeholder="Tìm theo email, họ tên, mã sinh viên, mã giảng viên..."
      />

      {actionError ? <div className="mx-4 mb-3 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{actionError}</div> : null}

      {filteredUsers.length === 0 ? (
        <div className="p-5"><EmptyState title="Không tìm thấy tài khoản" description="Thử thay đổi từ khóa hoặc bộ lọc trạng thái." /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3">Tài khoản</th>
                <th className="px-5 py-3">Hồ sơ</th>
                <th className="px-5 py-3">Vai trò</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isCurrentUser = user.id === currentUserId;
                const profile = user.student
                  ? {
                      primary: user.student.studentCode,
                      secondary: `${user.student.className} · ${user.student.major.code} - ${user.student.major.name}`,
                    }
                  : user.lecturer
                    ? {
                        primary: user.lecturer.lecturerCode,
                        secondary: user.lecturer.department || 'Giảng viên',
                      }
                    : null;

                return (
                  <tr key={user.id} className="align-middle hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {user.fullName.trim().slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">{user.fullName}</p>
                            {isCurrentUser ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Bạn</span> : null}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                          {user.phone ? <p className="mt-1 text-xs text-slate-500">{user.phone}</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {profile ? (
                        <div>
                          <p className="font-semibold text-slate-800">{profile.primary}</p>
                          <p className="mt-1 text-xs text-slate-500">{profile.secondary}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Chưa có hồ sơ liên kết</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex max-w-xs flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <span key={role.id} title={role.name} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                            {role.code}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge value={user.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Sửa
                        </button>

                        {user.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            disabled={loadingId === user.id || isCurrentUser}
                            title={isCurrentUser ? 'Không thể khóa tài khoản đang đăng nhập' : 'Khóa tài khoản'}
                            onClick={() => setPendingAction({ user, type: 'lock' })}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {loadingId === user.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                            Khóa
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => setPendingAction({ user, type: 'unlock' })}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            {loadingId === user.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                            Mở khóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmActionModal
        open={Boolean(pendingAction)}
        onClose={() => !loadingId && setPendingAction(null)}
        onConfirm={async () => {
          if (!pendingAction) return;
          const { user, type } = pendingAction;
          await runAction(user.id, () => type === 'lock' ? onLock(user.id) : onUnlock(user.id));
          setPendingAction(null);
        }}
        loading={Boolean(loadingId)}
        tone={pendingAction?.type === 'lock' ? 'danger' : 'primary'}
        title={pendingAction?.type === 'lock' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        confirmLabel={pendingAction?.type === 'lock' ? 'Khóa tài khoản' : 'Mở khóa'}
        description={pendingAction ? <>Bạn sắp {pendingAction.type === 'lock' ? 'khóa' : 'mở khóa'} tài khoản <strong>{pendingAction.user.email}</strong>. {pendingAction.type === 'lock' ? 'Người dùng sẽ không thể đăng nhập.' : 'Người dùng sẽ có thể đăng nhập lại.'}</> : null}
      />
    </div>
  );
}
