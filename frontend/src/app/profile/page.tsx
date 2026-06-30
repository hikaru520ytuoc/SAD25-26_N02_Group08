'use client';

import { Mail, Phone, Shield, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { StatusBadge } from '@/components/common/status-badge';
import { LoadingState } from '@/components/common/loading-state';
import { getInitials, roleLabel } from '@/lib/formatters';
import { getMe } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth';

function yesNo(value?: boolean | null) {
  return value ? 'Có' : 'Không';
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getMe().then(setUser).catch(() => setUser(null));
  }, []);

  if (!user) {
    return <AppShell><LoadingState label="Đang tải hồ sơ cá nhân..." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-950 text-3xl font-bold text-white shadow-lg">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" /> : getInitials(user.fullName)}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-950">{user.fullName}</h1>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {user.roles.map((role) => (
                <span key={role} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">{roleLabel(role)}</span>
              ))}
            </div>
            <div className="mt-4"><StatusBadge value={user.status} /></div>
            <button disabled className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-400">
              Đổi ảnh đại diện (chưa bật API)
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Thông tin tài khoản</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><Mail className="mb-2 h-4 w-4 text-slate-500" /><p className="text-xs text-slate-500">Email</p><p className="font-semibold text-slate-900">{user.email}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><Phone className="mb-2 h-4 w-4 text-slate-500" /><p className="text-xs text-slate-500">Số điện thoại</p><p className="font-semibold text-slate-900">{user.phone || 'Chưa cập nhật'}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2"><Shield className="mb-2 h-4 w-4 text-slate-500" /><p className="text-xs text-slate-500">Vai trò</p><p className="font-semibold text-slate-900">{user.roles.map(roleLabel).join(', ')}</p></div>
            </div>
          </div>

          {user.student && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Hồ sơ sinh viên</h2>
              <p className="mt-1 text-sm text-slate-500">Các trường học vụ là dữ liệu nhập thủ công/phụ trợ để xét điều kiện làm đồ án.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Mã sinh viên</p><p className="font-semibold text-slate-900">{user.student.studentCode}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Lớp</p><p className="font-semibold text-slate-900">{user.student.className}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Ngành</p><p className="font-semibold text-slate-900">{user.student.major}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Thực tập</p><div className="mt-1"><StatusBadge value={user.student.internshipStatus} /></div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Tín chỉ</p><p className="font-semibold text-slate-900">{user.student.completedCredits ?? '-'} / {user.student.requiredCredits ?? '-'}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">GPA/CPA</p><p className="font-semibold text-slate-900">{user.student.gpa ?? '-'}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Nợ môn tiên quyết</p><p className="font-semibold text-slate-900">{yesNo(user.student.hasPrerequisiteDebt)}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Nợ học phí</p><p className="font-semibold text-slate-900">{yesNo(user.student.hasTuitionDebt)}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Kỷ luật</p><p className="font-semibold text-slate-900">{yesNo(user.student.hasDisciplinaryAction)}</p></div>
              </div>
            </div>
          )}

          {user.lecturer && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Hồ sơ giảng viên</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Mã giảng viên</p><p className="font-semibold text-slate-900">{user.lecturer.lecturerCode}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Bộ môn</p><p className="font-semibold text-slate-900">{user.lecturer.department ?? user.lecturer.specialization ?? '-'}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Học hàm/học vị</p><p className="font-semibold text-slate-900">{user.lecturer.academicRank ?? user.lecturer.academicTitle ?? '-'}</p></div>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
