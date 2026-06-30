export function formatShortCode(prefix: string, id?: string | null, createdAt?: string | null) {
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  const shortId = (id ?? '000000').replaceAll('-', '').slice(0, 6).toUpperCase();
  return `${prefix}-${year}-${shortId}`;
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function roleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    STUDENT: 'Sinh viên',
    SUPERVISOR: 'GV hướng dẫn',
    REVIEWER: 'GV phản biện',
    FACULTY_MANAGER: 'Quản lý Khoa',
    COUNCIL_MEMBER: 'Thành viên HĐ',
    COUNCIL_SECRETARY: 'Thư ký HĐ',
    ARCHIVE_STAFF: 'Lưu trữ',
  };
  return labels[role] ?? role;
}

export function getInitials(name?: string | null) {
  if (!name) return 'U';
  const words = name.trim().split(/\s+/).slice(-2);
  return words.map((word) => word[0]).join('').toUpperCase();
}
