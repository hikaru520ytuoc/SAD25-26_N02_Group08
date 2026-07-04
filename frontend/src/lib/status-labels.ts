export type StatusTone = 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';
export type StatusMeta = { label: string; tone: StatusTone };

export const STATUS_LABELS: Record<string, StatusMeta> = {
  ACTIVE: { label: 'Đang hoạt động', tone: 'emerald' },
  LOCKED: { label: 'Đã khóa', tone: 'violet' },
  DRAFT: { label: 'Bản nháp', tone: 'slate' },
  OPEN: { label: 'Đang mở', tone: 'emerald' },
  CLOSED: { label: 'Đã đóng', tone: 'slate' },
  ARCHIVED: { label: 'Đã lưu trữ', tone: 'violet' },
  PUBLISHED: { label: 'Đã công bố', tone: 'emerald' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'emerald' },
  COMPLETED: { label: 'Đã hoàn tất', tone: 'violet' },
  CANCELLED: { label: 'Đã hủy', tone: 'rose' },

  REGISTERED: { label: 'Đã đăng ký', tone: 'blue' },
  SUBMITTED: { label: 'Chờ xử lý', tone: 'amber' },
  PENDING: { label: 'Chờ xử lý', tone: 'amber' },
  IN_PROGRESS: { label: 'Đang xử lý', tone: 'blue' },
  APPROVED: { label: 'Đã duyệt', tone: 'emerald' },
  REJECTED: { label: 'Đã từ chối', tone: 'rose' },
  REVIEWED: { label: 'Đã phản hồi', tone: 'blue' },

  NOT_REQUIRED: { label: 'Không yêu cầu phản hồi', tone: 'slate' },
  PENDING_SUPERVISOR: { label: 'Chờ GVHD phản hồi', tone: 'amber' },
  PENDING_FACULTY: { label: 'Chờ Khoa xử lý', tone: 'amber' },
  NEEDS_REVISION: { label: 'Cần chỉnh sửa', tone: 'amber' },
  FACULTY_APPROVED: { label: 'Khoa đã duyệt', tone: 'emerald' },
  FACULTY_REJECTED: { label: 'Khoa đã từ chối', tone: 'rose' },
  OFFICIALLY_ASSIGNED: { label: 'Đã chốt đề tài & GVHD', tone: 'emerald' },
  ACCEPTED: { label: 'Đã đồng ý', tone: 'emerald' },

  SUBMITTED_OUTLINE: { label: 'Đã nộp đề cương', tone: 'amber' },
  APPROVED_OUTLINE: { label: 'Đề cương đã duyệt', tone: 'emerald' },

  APPROVED_BY_SUPERVISOR: { label: 'GVHD đã xác nhận', tone: 'emerald' },
  REJECTED_BY_SUPERVISOR: { label: 'GVHD đã từ chối', tone: 'rose' },
  SENT_TO_REVIEWER: { label: 'Đã gửi phản biện', tone: 'blue' },
  REVIEWER_NEEDS_REVISION: { label: 'GVPB yêu cầu bổ sung', tone: 'amber' },
  APPROVED_BY_REVIEWER: { label: 'GVPB đã xác nhận', tone: 'emerald' },
  READY_FOR_COUNCIL: { label: 'Sẵn sàng xếp hội đồng', tone: 'violet' },

  ASSIGNED: { label: 'Đã phân công', tone: 'blue' },
  ELIGIBLE_FOR_DEFENSE: { label: 'Đủ điều kiện bảo vệ', tone: 'emerald' },
  NOT_ELIGIBLE_FOR_DEFENSE: { label: 'Chưa đủ điều kiện bảo vệ', tone: 'rose' },

  SCHEDULED: { label: 'Đã xếp lịch', tone: 'blue' },
  DOCUMENT_PENDING: { label: 'Chờ kiểm tra hồ sơ', tone: 'amber' },
  DOCUMENT_NEEDS_SUPPLEMENT: { label: 'Cần bổ sung hồ sơ', tone: 'amber' },
  DOCUMENT_APPROVED: { label: 'Hồ sơ hợp lệ', tone: 'emerald' },
  NEEDS_SUPPLEMENT: { label: 'Cần bổ sung', tone: 'amber' },

  NOT_STARTED: { label: 'Chưa bắt đầu', tone: 'slate' },
  PASSED: { label: 'Đạt', tone: 'emerald' },
  FAILED: { label: 'Không đạt', tone: 'rose' },
  PASSED_WITH_REVISION: { label: 'Đạt, cần chỉnh sửa', tone: 'amber' },

  PENDING_SUBMISSION: { label: 'Chờ nộp bản chỉnh sửa', tone: 'amber' },
  NEEDS_CHANGES: { label: 'Cần sửa lại', tone: 'amber' },
  NOT_SUBMITTED: { label: 'Chưa nộp', tone: 'slate' },


  ELIGIBILITY_CHECK: { label: 'Kiểm tra điều kiện', tone: 'slate' },
  PERIOD_REGISTRATION: { label: 'Đăng ký đợt đồ án', tone: 'blue' },
  TOPIC_REGISTRATION: { label: 'Đăng ký đề tài', tone: 'blue' },
  SUPERVISOR_ASSIGNMENT: { label: 'Phân công GVHD', tone: 'blue' },
  OUTLINE: { label: 'Thực hiện đề cương', tone: 'amber' },
  PROGRESS: { label: 'Theo dõi tiến độ', tone: 'blue' },
  DEFENSE_REGISTRATION: { label: 'Đăng ký bảo vệ', tone: 'violet' },
  REVIEW: { label: 'Phản biện', tone: 'violet' },
  COUNCIL: { label: 'Bảo vệ trước hội đồng', tone: 'violet' },
  RESULT: { label: 'Kết quả bảo vệ', tone: 'emerald' },
  REVISION: { label: 'Chỉnh sửa sau bảo vệ', tone: 'amber' },
  ARCHIVE: { label: 'Lưu trữ hồ sơ', tone: 'violet' },

  NOT_COMPLETED: { label: 'Chưa hoàn thành', tone: 'rose' },
  WAIVED: { label: 'Được miễn', tone: 'cyan' },
  SUSPENDED: { label: 'Tạm đình chỉ', tone: 'rose' },
  GRADUATED: { label: 'Đã tốt nghiệp', tone: 'slate' },
  DROPPED: { label: 'Thôi học', tone: 'rose' },
  ELIGIBLE: { label: 'Đủ điều kiện', tone: 'emerald' },
  NOT_ELIGIBLE: { label: 'Không đủ điều kiện', tone: 'rose' },
};

export function getStatusMeta(status?: string | null): StatusMeta {
  if (!status) return { label: 'Chưa xác định', tone: 'slate' };
  return STATUS_LABELS[status] ?? { label: 'Trạng thái chưa được ánh xạ', tone: 'slate' };
}
