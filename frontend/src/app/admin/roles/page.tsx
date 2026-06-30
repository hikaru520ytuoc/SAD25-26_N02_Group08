'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, UsersRound } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { formatShortCode } from '@/lib/formatters';

type RoleRow = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  _count?: { userRoles?: number };
};

const roleVietnameseName: Record<string, string> = {
  ADMIN: 'Quản trị hệ thống',
  STUDENT: 'Sinh viên',
  SUPERVISOR: 'Giảng viên hướng dẫn',
  REVIEWER: 'Giảng viên phản biện',
  FACULTY_MANAGER: 'Quản lý khoa',
  COUNCIL_MEMBER: 'Thành viên hội đồng',
  COUNCIL_SECRETARY: 'Thư ký hội đồng',
  ARCHIVE_STAFF: 'Cán bộ lưu trữ',
};

function roleDisplayName(role: RoleRow) {
  return roleVietnameseName[role.code] ?? role.name ?? role.code;
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    apiFetch<RoleRow[]>('/api/roles')
      .then((data) => {
        if (mounted) setRoles(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Không tải được danh sách vai trò');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((role) => `${role.code} ${role.name} ${role.description ?? ''} ${roleDisplayName(role)}`.toLowerCase().includes(q));
  }, [roles, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
            <ShieldCheck className="h-4 w-4" />
            Quản trị hệ thống
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Vai trò và phân quyền</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Trang này dùng để tra cứu các vai trò trong hệ thống. Việc gán quyền cho người dùng vẫn thực hiện tại màn hình Người dùng để tránh thay đổi nghiệp vụ RBAC hiện có.
          </p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo mã hoặc tên vai trò..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 lg:max-w-sm"
        />
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        {loading ? <p className="text-sm text-slate-500">Đang tải danh sách vai trò...</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
        {!loading && !error && filteredRoles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Không tìm thấy vai trò phù hợp.</p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRoles.map((role) => (
            <article key={role.id} className="rounded-3xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{formatShortCode('ROLE', role.id)}</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">{roleDisplayName(role)}</h2>
                  <p className="mt-1 text-sm font-semibold text-blue-700">{role.code}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <UsersRound className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 min-h-10 text-sm text-slate-600">{role.description || 'Vai trò hệ thống phục vụ phân quyền theo nghiệp vụ quản lý đồ án.'}</p>
              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Số người dùng: <span className="font-bold text-slate-900">{role._count?.userRoles ?? 'N/A'}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
