'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const labels: Record<string, string> = {
  dashboard: 'Dashboard',
  admin: 'Quản trị',
  users: 'Người dùng',
  faculty: 'Khoa',
  supervisor: 'GVHD',
  student: 'Sinh viên',
  reviewer: 'Phản biện',
  council: 'Hội đồng',
  secretary: 'Thư ký',
  archive: 'Lưu trữ',
  records: 'Hồ sơ',
  topics: 'Đề tài',
  profile: 'Hồ sơ cá nhân',
  notifications: 'Thông báo',
  'project-periods': 'Đợt đồ án',
  'student-eligibilities': 'Điều kiện sinh viên',
  'topic-registrations': 'Đăng ký đề tài',
  'supervisor-assignments': 'Phân công GVHD',
  outlines: 'Đề cương',
  progress: 'Tiến độ',
  'defense-registrations': 'Đăng ký bảo vệ',
  'reviewer-assignments': 'Phân công GVPB',
  councils: 'Hội đồng',
  'defense-schedules': 'Lịch bảo vệ',
  schedules: 'Lịch bảo vệ',
  'defense-documents': 'Hồ sơ bảo vệ',
  results: 'Kết quả',
  revisions: 'Chỉnh sửa',
  locked: 'Đã khóa',
  'council-scoring': 'Điểm hội đồng',
  'my-scores': 'Điểm của tôi',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return <span className="text-sm text-slate-500">Trang chủ</span>;

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
      <Link href="/dashboard" className="font-medium text-slate-700 hover:text-slate-950">Dashboard</Link>
      {parts.filter((part) => part !== 'dashboard').map((part, index, array) => {
        const href = `/${parts.slice(0, parts.indexOf(part) + 1).join('/')}`;
        const isLast = index === array.length - 1;
        return (
          <span key={`${part}-${index}`} className="flex items-center gap-1">
            <span>/</span>
            {isLast ? <span className="font-semibold text-slate-900">{labels[part] ?? part}</span> : <Link href={href} className="hover:text-slate-900">{labels[part] ?? part}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
