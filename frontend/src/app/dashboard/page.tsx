'use client';

import { Bell, BookOpen, CalendarDays, CheckSquare, FileText, LogOut, Shield, UserCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { clearAccessToken, getStoredUser, setStoredUser } from '@/lib/auth-storage';
import { getMe } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMe() {
      try {
        const me = await getMe();
        setUser(me);
        setStoredUser(me);
      } catch {
        clearAccessToken();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, [router]);

  function logout() {
    clearAccessToken();
    router.push('/login');
  }

  if (loading) {
    return <AppShell><div className="rounded-3xl bg-white p-8 shadow">Đang tải dashboard...</div></AppShell>;
  }

  if (!user) return null;

  const isAdmin = user.roles.includes('ADMIN');
  const isFaculty = user.roles.includes('FACULTY_MANAGER') || isAdmin;
  const isSupervisor = user.roles.includes('SUPERVISOR');
  const isStudent = user.roles.includes('STUDENT') || isAdmin || user.roles.includes('FACULTY_MANAGER');

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-950">Xin chào, {user.fullName}</h1>
              <p className="mt-2 text-slate-600">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span key={role} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-blue-100">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {isAdmin && (
            <Link href="/admin/users" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <Users className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Quản lý người dùng</h2>
              <p className="mt-2 text-slate-600">Tạo user, khóa/mở khóa tài khoản và gán role.</p>
            </Link>
          )}

          {isFaculty && (
            <Link href="/faculty/project-periods" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <CalendarDays className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Quản lý đợt đồ án</h2>
              <p className="mt-2 text-slate-600">Tạo, mở và đóng đợt đồ án tốt nghiệp.</p>
            </Link>
          )}

          {isFaculty && (
            <Link href="/faculty/student-eligibilities" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <CheckSquare className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Sinh viên đủ điều kiện</h2>
              <p className="mt-2 text-slate-600">Lập danh sách sinh viên đủ điều kiện theo đợt.</p>
            </Link>
          )}

          {isSupervisor && (
            <Link href="/supervisor/topics" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <FileText className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Đề tài của tôi</h2>
              <p className="mt-2 text-slate-600">Tạo đề tài và gửi Khoa xét duyệt.</p>
            </Link>
          )}

          {isFaculty && (
            <Link href="/faculty/topics" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <BookOpen className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Duyệt đề tài</h2>
              <p className="mt-2 text-slate-600">Duyệt, từ chối và công bố đề tài.</p>
            </Link>
          )}

          {isStudent && (
            <Link href="/student/topic-registration" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <BookOpen className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Đăng ký đề tài</h2>
              <p className="mt-2 text-slate-600">Đăng ký đề tài có sẵn hoặc đề xuất đề tài mới.</p>
            </Link>
          )}

          {isStudent && (
            <Link href="/student/supervisor-assignment" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <UserCheck className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">GVHD chính thức</h2>
              <p className="mt-2 text-slate-600">Xem giảng viên hướng dẫn sau khi Khoa xác nhận.</p>
            </Link>
          )}

          {isSupervisor && (
            <Link href="/supervisor/registration-requests" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <UserCheck className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Yêu cầu hướng dẫn</h2>
              <p className="mt-2 text-slate-600">Đồng ý hoặc từ chối yêu cầu hướng dẫn của sinh viên.</p>
            </Link>
          )}

          {isSupervisor && (
            <Link href="/supervisor/my-students" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <Users className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Sinh viên tôi hướng dẫn</h2>
              <p className="mt-2 text-slate-600">Danh sách sinh viên đã được phân công chính thức.</p>
            </Link>
          )}

          {isFaculty && (
            <Link href="/faculty/topic-registrations" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <UserCheck className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Xử lý đăng ký đề tài</h2>
              <p className="mt-2 text-slate-600">Phân công GVHD, xác nhận hoặc từ chối đăng ký.</p>
            </Link>
          )}

          {isFaculty && (
            <Link href="/faculty/supervisor-assignments" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <Users className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Phân công GVHD</h2>
              <p className="mt-2 text-slate-600">Theo dõi các phân công GVHD chính thức.</p>
            </Link>
          )}

          <Link href="/notifications" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <Bell className="mb-4 h-7 w-7 text-slate-800" />
            <h2 className="text-xl font-bold text-slate-950">Thông báo</h2>
            <p className="mt-2 text-slate-600">Xem notification cơ bản của hệ thống.</p>
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Shield className="mb-4 h-7 w-7 text-slate-800" />
            <h2 className="text-xl font-bold text-slate-950">Các nghiệp vụ tiếp theo</h2>
            <p className="mt-2 text-slate-600">Đăng ký đề tài, đề cương, bảo vệ và lưu trữ sẽ được triển khai ở sprint sau.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
