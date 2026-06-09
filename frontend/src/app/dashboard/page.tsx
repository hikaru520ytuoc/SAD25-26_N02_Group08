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
  const isReviewer = user.roles.includes('REVIEWER') || isAdmin;
  const isCouncil = user.roles.includes('COUNCIL_MEMBER') || user.roles.includes('COUNCIL_SECRETARY') || isAdmin;
  const isSecretary = user.roles.includes('COUNCIL_SECRETARY') || isAdmin;

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

          {isStudent && (
            <Link href="/student/outline" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <FileText className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Nộp đề cương</h2>
              <p className="mt-2 text-slate-600">Nộp, xem trạng thái và nộp lại đề cương nếu GVHD yêu cầu sửa.</p>
            </Link>
          )}

          {isStudent && (
            <Link href="/student/progress" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <CheckSquare className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Cập nhật tiến độ</h2>
              <p className="mt-2 text-slate-600">Cập nhật tiến độ và xem góp ý của GVHD sau khi đề cương được duyệt.</p>
            </Link>
          )}


          {isStudent && (
            <Link href="/student/defense-registration" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <FileText className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Đăng ký bảo vệ</h2>
              <p className="mt-2 text-slate-600">Nộp báo cáo, slide và theo dõi trạng thái điều kiện bảo vệ.</p>
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

          {isSupervisor && (
            <Link href="/supervisor/outlines" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <FileText className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Duyệt đề cương</h2>
              <p className="mt-2 text-slate-600">Xem, duyệt hoặc yêu cầu sinh viên chỉnh sửa đề cương.</p>
            </Link>
          )}

          {isSupervisor && (
            <Link href="/supervisor/progress" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <CheckSquare className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Theo dõi tiến độ</h2>
              <p className="mt-2 text-slate-600">Theo dõi và góp ý tiến độ đồ án của sinh viên.</p>
            </Link>
          )}


          {isSupervisor && (
            <Link href="/supervisor/defense-registrations" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <UserCheck className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Duyệt điều kiện bảo vệ</h2>
              <p className="mt-2 text-slate-600">Kiểm tra hồ sơ, nhập điểm hướng dẫn và xác nhận điều kiện bảo vệ.</p>
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


          {isFaculty && (
            <Link href="/faculty/reviewer-assignments" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <Users className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Phân công GVPB</h2>
              <p className="mt-2 text-slate-600">Phân công giảng viên phản biện cho hồ sơ đã được GVHD xác nhận.</p>
            </Link>
          )}


          {isFaculty && (
            <Link href="/faculty/councils" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <Users className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Quản lý hội đồng</h2>
              <p className="mt-2 text-slate-600">Tạo hội đồng, thêm chủ tịch, thư ký và thành viên.</p>
            </Link>
          )}

          {isFaculty && (
            <Link href="/faculty/defense-schedules" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <CalendarDays className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Lập lịch bảo vệ</h2>
              <p className="mt-2 text-slate-600">Xếp lịch bảo vệ cho hồ sơ đã sẵn sàng lên hội đồng.</p>
            </Link>
          )}

          {isStudent && (
            <Link href="/student/defense-schedule" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <CalendarDays className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Lịch bảo vệ</h2>
              <p className="mt-2 text-slate-600">Xem lịch bảo vệ và nộp/bổ sung hồ sơ bảo vệ.</p>
            </Link>
          )}

          {isCouncil && (
            <Link href="/council/schedules" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <CalendarDays className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Lịch hội đồng</h2>
              <p className="mt-2 text-slate-600">Xem lịch bảo vệ thuộc hội đồng của bạn.</p>
            </Link>
          )}

          {isSecretary && (
            <Link href="/secretary/defense-documents" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <FileText className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Kiểm tra hồ sơ bảo vệ</h2>
              <p className="mt-2 text-slate-600">Yêu cầu bổ sung hoặc xác nhận hồ sơ hợp lệ.</p>
            </Link>
          )}

          {isReviewer && (
            <Link href="/reviewer/assignments" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <BookOpen className="mb-4 h-7 w-7 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-950">Phản biện đồ án</h2>
              <p className="mt-2 text-slate-600">Xem hồ sơ được phân công, nhập nhận xét và điểm phản biện.</p>
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
            <p className="mt-2 text-slate-600">Hội đồng, lịch bảo vệ, nhập điểm hội đồng, tính điểm tổng kết, công bố kết quả và lưu trữ sẽ được triển khai ở Sprint 7–8.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
