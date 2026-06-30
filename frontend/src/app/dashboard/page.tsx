'use client';

import { ArrowRight, Bell, CheckCircle2, ClipboardList, GraduationCap, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { LoadingState } from '@/components/common/loading-state';
import { StatusBadge } from '@/components/common/status-badge';
import { getInitials, roleLabel } from '@/lib/formatters';
import { getMenuForRoles } from '@/lib/menu-items';
import { getMe } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth';

type Stat = { label: string; value: string; hint: string };

function statsForRoles(user: AuthUser): Stat[] {
  const roles = user.roles;
  if (roles.includes('STUDENT')) {
    return [
      { label: 'Đề tài', value: 'Theo workflow', hint: 'Xem ở Đăng ký đề tài' },
      { label: 'Đề cương', value: 'Theo GVHD', hint: 'Nộp và theo dõi phản hồi' },
      { label: 'Bảo vệ', value: 'Theo lịch', hint: 'Đăng ký và nộp hồ sơ' },
      { label: 'Lưu trữ', value: 'Cuối quy trình', hint: 'Nộp file cuối và khóa hồ sơ' },
    ];
  }
  if (roles.includes('FACULTY_MANAGER')) {
    return [
      { label: 'Đợt đồ án', value: 'OPEN', hint: 'Quản lý theo project period' },
      { label: 'Điều kiện', value: 'Manual', hint: 'Dữ liệu học vụ nhập thủ công' },
      { label: 'Hội đồng', value: '4–6 đề tài', hint: 'Có cảnh báo số lượng và lịch' },
      { label: 'Kết quả', value: 'Publish', hint: 'Khoa xác nhận/công bố' },
    ];
  }
  if (roles.includes('SUPERVISOR')) {
    return [
      { label: 'Đề tài', value: 'Của tôi', hint: 'Tạo và gửi Khoa duyệt' },
      { label: 'Đề cương', value: 'Chờ duyệt', hint: 'Duyệt/yêu cầu sửa' },
      { label: 'Tiến độ', value: 'Theo dõi', hint: 'Nhận xét quá trình làm' },
      { label: 'Bảo vệ', value: 'Xác nhận', hint: 'Nhập điểm GVHD' },
    ];
  }
  if (roles.includes('REVIEWER')) {
    return [
      { label: 'Phản biện', value: 'Được phân công', hint: 'Xem hồ sơ sinh viên' },
      { label: 'Nhận xét', value: 'Bắt buộc', hint: 'Đủ điều kiện hoặc yêu cầu bổ sung' },
      { label: 'Điểm GVPB', value: '0–10', hint: 'Lưu vào reviewer score' },
    ];
  }
  if (roles.includes('ARCHIVE_STAFF')) {
    return [
      { label: 'Hồ sơ', value: 'Chờ lưu trữ', hint: 'Kiểm tra file cuối' },
      { label: 'Bổ sung', value: 'Nếu thiếu', hint: 'Yêu cầu sinh viên nộp lại' },
      { label: 'Khóa hồ sơ', value: 'LOCKED', hint: 'Sau khi hoàn tất lưu trữ' },
    ];
  }
  return [
    { label: 'Người dùng', value: 'RBAC', hint: 'Quản lý tài khoản và role' },
    { label: 'Audit', value: 'Theo dõi', hint: 'Ghi nhận thao tác chính' },
    { label: 'Hệ thống', value: 'MVP', hint: 'Sẵn sàng kiểm thử' },
  ];
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then(setUser).finally(() => setLoading(false));
  }, []);

  const menuItems = useMemo(() => (user ? getMenuForRoles(user.roles).filter((item) => item.href !== '/dashboard').slice(0, 8) : []), [user]);

  if (loading || !user) return <AppShell><LoadingState label="Đang tải dashboard..." /></AppShell>;

  const stats = statsForRoles(user);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20"><Sparkles className="h-4 w-4" /> Dashboard học vụ</div>
                <h1 className="text-3xl font-black">Xin chào, {user.fullName}</h1>
                <p className="mt-2 text-slate-300">Theo dõi các chức năng đúng vai trò, không cần chọn role khi đăng nhập.</p>
              </div>
              <div className="flex items-center gap-4 rounded-3xl bg-white/10 p-4 ring-1 ring-white/15">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-950">{getInitials(user.fullName)}</div>
                <div>
                  <p className="font-semibold">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">{user.roles.map((role) => <span key={role} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/20">{roleLabel(role)}</span>)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Thao tác nhanh</h2>
                <p className="mt-1 text-sm text-slate-500">Menu được gộp tự động theo role của tài khoản.</p>
              </div>
              <StatusBadge value={user.status} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50">
                    <span className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2 text-blue-700"><Icon className="h-5 w-5" /></span><span className="font-semibold text-slate-900">{item.label}</span></span>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-slate-950"><GraduationCap className="h-5 w-5" /> Quy trình đang áp dụng</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Hệ thống giữ nguyên nghiệp vụ: Khoa chốt đề tài/GVHD, sinh viên chỉ xem đề tài PUBLISHED, hồ sơ LOCKED chỉ được xem.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-slate-950"><ClipboardList className="h-5 w-5" /> Cảnh báo nghiệp vụ</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Hội đồng hợp lệ khi có 4–6 đề tài.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Không xếp lịch nếu trùng phòng, trùng hội đồng hoặc trùng thành viên.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Điều kiện làm đồ án dùng dữ liệu học vụ nhập thủ công.</li>
              </ul>
            </div>
            <Link href="/notifications" className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"><span className="flex items-center gap-2 font-semibold"><Bell className="h-5 w-5" /> Xem thông báo</span><ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
