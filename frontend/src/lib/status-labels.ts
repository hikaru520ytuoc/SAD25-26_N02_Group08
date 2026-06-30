export type StatusTone = 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';

export type StatusMeta = {
  label: string;
  tone: StatusTone;
};

export const STATUS_LABELS: Record<string, StatusMeta> = {
  ACTIVE: { label: 'Đang hoạt động', tone: 'emerald' },
  LOCKED: { label: 'Đã khóa', tone: 'rose' },
  DRAFT: { label: 'Nháp', tone: 'slate' },
  SUBMITTED: { label: 'Đã nộp / Chờ duyệt', tone: 'blue' },
  APPROVED: { label: 'Đã duyệt', tone: 'emerald' },
  REJECTED: { label: 'Bị từ chối', tone: 'rose' },
  PUBLISHED: { label: 'Đã công bố', tone: 'emerald' },
  CLOSED: { label: 'Đã đóng', tone: 'slate' },
  CANCELLED: { label: 'Đã hủy', tone: 'rose' },

  PENDING_SUPERVISOR: { label: 'Chờ GVHD phản hồi', tone: 'amber' },
  PENDING_FACULTY: { label: 'Chờ Khoa xác nhận', tone: 'amber' },
  FACULTY_REJECTED: { label: 'Khoa từ chối', tone: 'rose' },
  OFFICIALLY_ASSIGNED: { label: 'Đã chốt đề tài/GVHD', tone: 'emerald' },

  NEEDS_REVISION: { label: 'Cần chỉnh sửa', tone: 'amber' },
  PENDING_SUBMISSION: { label: 'Chờ nộp bản chỉnh sửa', tone: 'amber' },
  REVIEWED: { label: 'Đã kiểm tra', tone: 'blue' },
  REJECTED_BY_SUPERVISOR: { label: 'GVHD từ chối', tone: 'rose' },

  NEEDS_CHANGES: { label: 'Cần chỉnh sửa', tone: 'amber' },
  APPROVED_BY_SUPERVISOR: { label: 'GVHD đã xác nhận', tone: 'emerald' },
  APPROVED_BY_REVIEWER: { label: 'GVPB đã xác nhận', tone: 'emerald' },
  SENT_TO_REVIEWER: { label: 'Đã gửi phản biện', tone: 'blue' },
  READY_FOR_COUNCIL: { label: 'Sẵn sàng lập hội đồng', tone: 'violet' },
  REVIEWER_NEEDS_REVISION: { label: 'GVPB yêu cầu bổ sung', tone: 'amber' },

  SCHEDULED: { label: 'Đã xếp lịch', tone: 'blue' },
  DOCUMENT_PENDING: { label: 'Chờ hồ sơ', tone: 'amber' },
  DOCUMENT_NEEDS_SUPPLEMENT: { label: 'Cần bổ sung hồ sơ', tone: 'amber' },
  DOCUMENT_APPROVED: { label: 'Hồ sơ hợp lệ', tone: 'emerald' },
  COMPLETED: { label: 'Đã hoàn thành', tone: 'emerald' },
  WAIVED: { label: 'Được miễn', tone: 'cyan' },
  NOT_COMPLETED: { label: 'Chưa hoàn thành', tone: 'rose' },

  PASSED: { label: 'Đạt', tone: 'emerald' },
  FAILED: { label: 'Không đạt', tone: 'rose' },
  PASSED_WITH_REVISION: { label: 'Đạt, cần chỉnh sửa', tone: 'amber' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'emerald' },

  NOT_SUBMITTED: { label: 'Chưa nộp', tone: 'slate' },
  NEEDS_SUPPLEMENT: { label: 'Cần bổ sung', tone: 'amber' },

  ELIGIBLE: { label: 'Đủ điều kiện', tone: 'emerald' },
  NOT_ELIGIBLE: { label: 'Không đủ điều kiện', tone: 'rose' },
  ACTIVE_ACADEMIC: { label: 'Đang học', tone: 'emerald' },
  SUSPENDED: { label: 'Tạm đình chỉ', tone: 'rose' },
  GRADUATED: { label: 'Đã tốt nghiệp', tone: 'slate' },
  DROPPED: { label: 'Thôi học', tone: 'rose' },

  ASSIGNED: { label: 'Đã phân công', tone: 'blue' },
  ELIGIBLE_FOR_DEFENSE: { label: 'Đủ điều kiện bảo vệ', tone: 'emerald' },
  NOT_ELIGIBLE_FOR_DEFENSE: { label: 'Chưa đủ điều kiện bảo vệ', tone: 'rose' },
};

export function getStatusMeta(status?: string | null): StatusMeta {
  if (!status) return { label: '-', tone: 'slate' };
  if (status === 'ACTIVE') return STATUS_LABELS.ACTIVE;
  return STATUS_LABELS[status] ?? { label: status.replaceAll('_', ' '), tone: 'slate' };
}
