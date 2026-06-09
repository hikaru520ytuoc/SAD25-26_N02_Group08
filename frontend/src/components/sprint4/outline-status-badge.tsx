export function OutlineStatusBadge({ status }: { status?: string }) {
  const label: Record<string, string> = {
    SUBMITTED: 'Đã nộp',
    NEEDS_REVISION: 'Cần chỉnh sửa',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  };
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{label[status ?? ''] ?? status ?? 'Chưa có'}</span>;
}
