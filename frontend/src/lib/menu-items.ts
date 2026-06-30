import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  FileArchive,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LockKeyhole,
  Medal,
  ScrollText,
  Shield,
  Star,
  UserCheck,
  Users,
} from 'lucide-react';

export type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
  description?: string;
};

export const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'STUDENT', 'SUPERVISOR', 'REVIEWER', 'FACULTY_MANAGER', 'COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'ARCHIVE_STAFF'] },
  { label: 'Quản lý người dùng', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { label: 'Phân quyền', href: '/admin/users', icon: Shield, roles: ['ADMIN'] },
  { label: 'Thông báo', href: '/notifications', icon: Bell, roles: ['ADMIN', 'STUDENT', 'SUPERVISOR', 'REVIEWER', 'FACULTY_MANAGER', 'COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'ARCHIVE_STAFF'] },

  { label: 'Xem đề tài', href: '/topics', icon: BookOpen, roles: ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'] },
  { label: 'Đăng ký đề tài', href: '/student/topic-registration', icon: GraduationCap, roles: ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'] },
  { label: 'GVHD chính thức', href: '/student/supervisor-assignment', icon: UserCheck, roles: ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'] },
  { label: 'Nộp đề cương', href: '/student/outline', icon: FileText, roles: ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'] },
  { label: 'Cập nhật tiến độ', href: '/student/progress', icon: CheckSquare, roles: ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'] },
  { label: 'Đăng ký bảo vệ', href: '/student/defense-registration', icon: ClipboardCheck, roles: ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'] },
  { label: 'Lịch bảo vệ', href: '/student/defense-schedule', icon: CalendarDays, roles: ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'] },
  { label: 'Kết quả bảo vệ', href: '/student/result', icon: Medal, roles: ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'] },
  { label: 'Chỉnh sửa sau bảo vệ', href: '/student/revision', icon: ScrollText, roles: ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'] },
  { label: 'Lưu trữ hồ sơ', href: '/student/archive', icon: Archive, roles: ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'] },
  { label: 'Hồ sơ đã khóa', href: '/records/locked', icon: LockKeyhole, roles: ['STUDENT', 'ARCHIVE_STAFF', 'ADMIN', 'FACULTY_MANAGER'] },

  { label: 'Đề tài của tôi', href: '/supervisor/topics', icon: BookOpen, roles: ['SUPERVISOR', 'ADMIN'] },
  { label: 'Yêu cầu hướng dẫn', href: '/supervisor/registration-requests', icon: UserCheck, roles: ['SUPERVISOR', 'ADMIN'] },
  { label: 'Sinh viên tôi hướng dẫn', href: '/supervisor/my-students', icon: Users, roles: ['SUPERVISOR', 'ADMIN'] },
  { label: 'Duyệt đề cương', href: '/supervisor/outlines', icon: FileText, roles: ['SUPERVISOR', 'ADMIN'] },
  { label: 'Theo dõi tiến độ', href: '/supervisor/progress', icon: CheckSquare, roles: ['SUPERVISOR', 'ADMIN'] },
  { label: 'Duyệt điều kiện bảo vệ', href: '/supervisor/defense-registrations', icon: ClipboardCheck, roles: ['SUPERVISOR', 'ADMIN'] },

  { label: 'Đợt đồ án', href: '/faculty/project-periods', icon: CalendarDays, roles: ['FACULTY_MANAGER', 'ADMIN'] },
  { label: 'Sinh viên đủ điều kiện', href: '/faculty/student-eligibilities', icon: CheckSquare, roles: ['FACULTY_MANAGER', 'ADMIN'] },
  { label: 'Duyệt đề tài', href: '/faculty/topics', icon: BookOpen, roles: ['FACULTY_MANAGER', 'ADMIN'] },
  { label: 'Xử lý đăng ký đề tài', href: '/faculty/topic-registrations', icon: UserCheck, roles: ['FACULTY_MANAGER', 'ADMIN'] },
  { label: 'Phân công GVHD', href: '/faculty/supervisor-assignments', icon: Users, roles: ['FACULTY_MANAGER', 'ADMIN'] },
  { label: 'Phân công GVPB', href: '/faculty/reviewer-assignments', icon: Users, roles: ['FACULTY_MANAGER', 'ADMIN'] },
  { label: 'Hội đồng bảo vệ', href: '/faculty/councils', icon: GraduationCap, roles: ['FACULTY_MANAGER', 'ADMIN'] },
  { label: 'Lịch bảo vệ', href: '/faculty/defense-schedules', icon: CalendarDays, roles: ['FACULTY_MANAGER', 'ADMIN'] },
  { label: 'Kết quả bảo vệ', href: '/faculty/results', icon: Medal, roles: ['FACULTY_MANAGER', 'ADMIN'] },
  { label: 'Theo dõi chỉnh sửa', href: '/faculty/revisions', icon: ScrollText, roles: ['FACULTY_MANAGER', 'ADMIN'] },

  { label: 'Hồ sơ phản biện', href: '/reviewer/assignments', icon: FileText, roles: ['REVIEWER', 'ADMIN'] },
  { label: 'Lịch hội đồng', href: '/council/schedules', icon: CalendarDays, roles: ['COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'ADMIN'] },
  { label: 'Nhập điểm của tôi', href: '/council/my-scores', icon: Star, roles: ['COUNCIL_MEMBER', 'ADMIN'] },
  { label: 'Kiểm tra hồ sơ bảo vệ', href: '/secretary/defense-documents', icon: FileText, roles: ['COUNCIL_SECRETARY', 'ADMIN'] },
  { label: 'Nhập điểm hội đồng', href: '/secretary/council-scoring', icon: Star, roles: ['COUNCIL_SECRETARY', 'ADMIN'] },

  { label: 'Hồ sơ chờ lưu trữ', href: '/archive/records', icon: FileArchive, roles: ['ARCHIVE_STAFF', 'ADMIN'] },
];

export function getMenuForRoles(roles: string[]) {
  const unique = new Map<string, MenuItem>();
  MENU_ITEMS.forEach((item) => {
    if (item.roles.some((role) => roles.includes(role))) unique.set(item.href, item);
  });
  return Array.from(unique.values());
}

export function isPathAllowed(pathname: string, roles: string[]) {
  if (pathname === '/' || pathname === '/login' || pathname === '/dashboard' || pathname === '/profile') return true;
  const item = MENU_ITEMS.find((menuItem) => pathname === menuItem.href || pathname.startsWith(`${menuItem.href}/`));
  if (!item) return true;
  return item.roles.some((role) => roles.includes(role));
}
