import type { ComponentType } from 'react';
import {
  Archive,
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  FileArchive,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  Medal,
  ScrollText,
  Settings,
  Shield,
  Star,
  UserCheck,
  UserCircle,
  Users,
} from 'lucide-react';

export type AppRole =
  | 'ADMIN'
  | 'STUDENT'
  | 'SUPERVISOR'
  | 'REVIEWER'
  | 'FACULTY_MANAGER'
  | 'COUNCIL_MEMBER'
  | 'COUNCIL_SECRETARY'
  | 'ARCHIVE_STAFF';

export type SidebarMenuItem = {
  title: string;
  href: string;
  roles: AppRole[];
};

export type SidebarMenuGroup = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  roles: AppRole[];
  items: SidebarMenuItem[];
};

export const ALL_ROLES: AppRole[] = [
  'ADMIN',
  'STUDENT',
  'SUPERVISOR',
  'REVIEWER',
  'FACULTY_MANAGER',
  'COUNCIL_MEMBER',
  'COUNCIL_SECRETARY',
  'ARCHIVE_STAFF',
];

export function hasAnyRole(userRoles: string[] = [], allowedRoles: string[] = []) {
  return userRoles.some((role) => allowedRoles.includes(role));
}

export const SIDEBAR_MENU_GROUPS: SidebarMenuGroup[] = [
  {
    title: 'Tổng quan',
    icon: LayoutDashboard,
    roles: ALL_ROLES,
    items: [
      { title: 'Trang chủ', href: '/dashboard', roles: ALL_ROLES },
      { title: 'Thông báo', href: '/notifications', roles: ALL_ROLES },
    ],
  },
  {
    title: 'Quản trị hệ thống',
    icon: Shield,
    roles: ['ADMIN'],
    items: [
      { title: 'Người dùng', href: '/admin/users', roles: ['ADMIN'] },
      { title: 'Vai trò', href: '/admin/roles', roles: ['ADMIN'] },
    ],
  },
  {
    title: 'Đợt đồ án & điều kiện',
    icon: CheckSquare,
    roles: ['FACULTY_MANAGER', 'ADMIN'],
    items: [
      { title: 'Đợt đồ án', href: '/faculty/project-periods', roles: ['FACULTY_MANAGER', 'ADMIN'] },
      { title: 'Sinh viên đủ điều kiện', href: '/faculty/student-eligibilities', roles: ['FACULTY_MANAGER', 'ADMIN'] },
    ],
  },
  {
    title: 'Đề tài & GVHD',
    icon: BookOpen,
    roles: ['STUDENT', 'SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN'],
    items: [
      { title: 'Danh sách đề tài', href: '/topics', roles: ['STUDENT', 'FACULTY_MANAGER', 'ADMIN'] },
      { title: 'Đề tài của tôi', href: '/supervisor/topics', roles: ['SUPERVISOR', 'ADMIN'] },
      { title: 'Duyệt đề tài', href: '/faculty/topics', roles: ['FACULTY_MANAGER', 'ADMIN'] },
      { title: 'Đăng ký đề tài', href: '/student/topic-registration', roles: ['STUDENT', 'ADMIN'] },
      { title: 'Yêu cầu hướng dẫn', href: '/supervisor/registration-requests', roles: ['SUPERVISOR', 'ADMIN'] },
      { title: 'Xử lý đăng ký', href: '/faculty/topic-registrations', roles: ['FACULTY_MANAGER', 'ADMIN'] },
      { title: 'Phân công GVHD', href: '/faculty/supervisor-assignments', roles: ['FACULTY_MANAGER', 'ADMIN'] },
      { title: 'Sinh viên hướng dẫn', href: '/supervisor/my-students', roles: ['SUPERVISOR', 'ADMIN'] },
      { title: 'GVHD chính thức', href: '/student/supervisor-assignment', roles: ['STUDENT', 'ADMIN'] },
    ],
  },
  {
    title: 'Đề cương & tiến độ',
    icon: FileText,
    roles: ['STUDENT', 'SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN'],
    items: [
      { title: 'Nộp đề cương', href: '/student/outline', roles: ['STUDENT', 'ADMIN'] },
      { title: 'Duyệt đề cương', href: '/supervisor/outlines', roles: ['SUPERVISOR', 'ADMIN'] },
      { title: 'Cập nhật tiến độ', href: '/student/progress', roles: ['STUDENT', 'ADMIN'] },
      { title: 'Theo dõi tiến độ', href: '/supervisor/progress', roles: ['SUPERVISOR', 'ADMIN'] },
    ],
  },
  {
    title: 'Bảo vệ & phản biện',
    icon: ClipboardCheck,
    roles: ['STUDENT', 'SUPERVISOR', 'REVIEWER', 'FACULTY_MANAGER', 'ADMIN'],
    items: [
      { title: 'Đăng ký bảo vệ', href: '/student/defense-registration', roles: ['STUDENT', 'ADMIN'] },
      { title: 'Xác nhận bảo vệ', href: '/supervisor/defense-registrations', roles: ['SUPERVISOR', 'ADMIN'] },
      { title: 'Phân công phản biện', href: '/faculty/reviewer-assignments', roles: ['FACULTY_MANAGER', 'ADMIN'] },
      { title: 'Hồ sơ phản biện', href: '/reviewer/assignments', roles: ['REVIEWER', 'ADMIN'] },
    ],
  },
  {
    title: 'Hội đồng & lịch bảo vệ',
    icon: CalendarDays,
    roles: ['STUDENT', 'FACULTY_MANAGER', 'COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'ADMIN'],
    items: [
      { title: 'Hội đồng', href: '/faculty/councils', roles: ['FACULTY_MANAGER', 'ADMIN'] },
      { title: 'Lịch bảo vệ', href: '/faculty/defense-schedules', roles: ['FACULTY_MANAGER', 'ADMIN'] },
      { title: 'Lịch của tôi', href: '/student/defense-schedule', roles: ['STUDENT', 'ADMIN'] },
      { title: 'Lịch hội đồng', href: '/council/schedules', roles: ['COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'ADMIN'] },
      { title: 'Hồ sơ bảo vệ', href: '/secretary/defense-documents', roles: ['COUNCIL_SECRETARY', 'ADMIN'] },
    ],
  },
  {
    title: 'Điểm & kết quả',
    icon: Medal,
    roles: ['STUDENT', 'SUPERVISOR', 'REVIEWER', 'FACULTY_MANAGER', 'COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'ADMIN'],
    items: [
      { title: 'Nhập điểm hội đồng', href: '/secretary/council-scoring', roles: ['COUNCIL_SECRETARY', 'ADMIN'] },
      { title: 'Điểm của tôi', href: '/council/my-scores', roles: ['COUNCIL_MEMBER', 'ADMIN'] },
      { title: 'Công bố kết quả', href: '/faculty/results', roles: ['FACULTY_MANAGER', 'ADMIN'] },
      { title: 'Kết quả của tôi', href: '/student/result', roles: ['STUDENT', 'ADMIN'] },
    ],
  },
  {
    title: 'Sau bảo vệ & lưu trữ',
    icon: FileArchive,
    roles: ['STUDENT', 'SUPERVISOR', 'FACULTY_MANAGER', 'COUNCIL_SECRETARY', 'ARCHIVE_STAFF', 'ADMIN'],
    items: [
      { title: 'Chỉnh sửa sau bảo vệ', href: '/student/revision', roles: ['STUDENT', 'ADMIN'] },
      { title: 'Theo dõi chỉnh sửa', href: '/faculty/revisions', roles: ['FACULTY_MANAGER', 'ADMIN'] },
      { title: 'Nộp lưu trữ', href: '/student/archive', roles: ['STUDENT', 'ADMIN'] },
      { title: 'Duyệt lưu trữ', href: '/archive/records', roles: ['ARCHIVE_STAFF', 'ADMIN'] },
      { title: 'Hồ sơ đã khóa', href: '/records/locked', roles: ['STUDENT', 'FACULTY_MANAGER', 'ARCHIVE_STAFF', 'ADMIN'] },
    ],
  },
  {
    title: 'Cá nhân',
    icon: UserCircle,
    roles: ALL_ROLES,
    items: [
      { title: 'Hồ sơ cá nhân', href: '/profile', roles: ALL_ROLES },
    ],
  },
];

export function getSidebarGroupsForRoles(userRoles: string[] = []) {
  return SIDEBAR_MENU_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasAnyRole(userRoles, item.roles)),
  })).filter((group) => group.items.length > 0 && hasAnyRole(userRoles, group.roles));
}

export function isMenuItemActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === '/' || href === '/dashboard') return false;
  return pathname.startsWith(`${href}/`);
}

export function isGroupActive(pathname: string, group: SidebarMenuGroup) {
  return group.items.some((item) => isMenuItemActive(pathname, item.href));
}

export function getFlatMenuForRoles(userRoles: string[] = []) {
  const unique = new Map<string, SidebarMenuItem & { groupTitle: string; icon: ComponentType<{ className?: string }> }>();
  getSidebarGroupsForRoles(userRoles).forEach((group) => {
    group.items.forEach((item) => {
      if (!unique.has(item.href)) {
        unique.set(item.href, { ...item, groupTitle: group.title, icon: group.icon });
      }
    });
  });
  return Array.from(unique.values());
}

// Re-export a few icons for legacy imports/tests if needed.
export { Archive, Bell, ChevronRight, GraduationCap, LockKeyhole, Settings, Star, Users };
