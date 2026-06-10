# Workflow và state transition Sprint 9

## Transition hợp lệ

| Workflow | Trạng thái hiện tại | Trạng thái kế tiếp hợp lệ |
|---|---|---|
| Topic | DRAFT | SUBMITTED |
| Topic | SUBMITTED | APPROVED, REJECTED |
| Topic | APPROVED | PUBLISHED, CLOSED |
| Topic | REJECTED | SUBMITTED |
| Topic | PUBLISHED | CLOSED |
| Topic Registration | PENDING_SUPERVISOR | PENDING_FACULTY, FACULTY_REJECTED, CANCELLED |
| Topic Registration | PENDING_FACULTY | OFFICIALLY_ASSIGNED, FACULTY_REJECTED, CANCELLED |
| Topic Registration | OFFICIALLY_ASSIGNED | Không chuyển tiếp trong MVP |
| Outline | SUBMITTED | NEEDS_REVISION, APPROVED |
| Outline | NEEDS_REVISION | SUBMITTED |
| Outline | APPROVED | Không sửa tiếp trong MVP |
| Progress | SUBMITTED | REVIEWED |
| Defense Registration | SUBMITTED | NEEDS_REVISION, APPROVED_BY_SUPERVISOR |
| Defense Registration | NEEDS_REVISION | SUBMITTED |
| Defense Registration | APPROVED_BY_SUPERVISOR | SENT_TO_REVIEWER, APPROVED_BY_REVIEWER, READY_FOR_COUNCIL |
| Defense Registration | SENT_TO_REVIEWER | REVIEWER_NEEDS_REVISION, APPROVED_BY_REVIEWER, READY_FOR_COUNCIL |
| Defense Registration | REVIEWER_NEEDS_REVISION | SUBMITTED |
| Defense Registration | APPROVED_BY_REVIEWER | READY_FOR_COUNCIL |
| Defense Schedule | SCHEDULED | DOCUMENT_PENDING, CANCELLED |
| Defense Schedule | DOCUMENT_PENDING | DOCUMENT_NEEDS_SUPPLEMENT, DOCUMENT_APPROVED, CANCELLED |
| Defense Schedule | DOCUMENT_NEEDS_SUPPLEMENT | DOCUMENT_PENDING, DOCUMENT_APPROVED, CANCELLED |
| Defense Schedule | DOCUMENT_APPROVED | COMPLETED, CANCELLED |
| Final Result Publication | DRAFT | CONFIRMED |
| Final Result Publication | CONFIRMED | PUBLISHED |
| Revision | PENDING_SUBMISSION | SUBMITTED, CANCELLED |
| Revision | SUBMITTED | NEEDS_CHANGES, APPROVED |
| Revision | NEEDS_CHANGES | SUBMITTED, CANCELLED |
| Archive | NOT_SUBMITTED | SUBMITTED |
| Archive | SUBMITTED | NEEDS_SUPPLEMENT, APPROVED |
| Archive | NEEDS_SUPPLEMENT | SUBMITTED |
| Archive | APPROVED | COMPLETED |
| Archive | COMPLETED | LOCKED |

## Transition cần chặn

| Tình huống | Error code đề xuất |
|---|---|
| Student đăng ký topic khi chưa ELIGIBLE | STUDENT_NOT_ELIGIBLE |
| Student đăng ký topic lần hai trong cùng đợt | TOPIC_REGISTRATION_ACTIVE_EXISTS |
| Nộp outline khi chưa có GVHD chính thức | SUPERVISOR_ASSIGNMENT_REQUIRED |
| Đăng ký bảo vệ khi outline chưa APPROVED | OUTLINE_NOT_APPROVED |
| Lập lịch khi defense registration chưa READY_FOR_COUNCIL | DEFENSE_REGISTRATION_NOT_READY |
| Nhập điểm hội đồng khi defense document chưa APPROVED | DEFENSE_DOCUMENT_INVALID_STATUS |
| Generate result khi thiếu điểm | SCORE_MISSING_COMPONENT |
| Publish result khi chưa CONFIRMED | FINAL_RESULT_NOT_CONFIRMED |
| Tạo revision cho result FAILED/PASSED | REVISION_NOT_ALLOWED |
| Nộp archive khi revision chưa APPROVED | ARCHIVE_NOT_ALLOWED |
| Update hồ sơ đã LOCKED | PROJECT_RECORD_LOCKED |

## Ghi chú triển khai

- Backend mới là nơi bắt buộc kiểm tra transition, frontend chỉ hỗ trợ ẩn/hiện nút.
- `backend/src/common/constants/workflow-transitions.ts` được bổ sung trong Sprint 9 làm tài liệu mã hóa cho transition chuẩn.
- Trong Giai đoạn 7, test case cần bao phủ cả transition hợp lệ và transition bị chặn.
