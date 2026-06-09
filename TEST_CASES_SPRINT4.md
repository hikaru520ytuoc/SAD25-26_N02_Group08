# Test cases Sprint 4

| Nhóm | Test case | Kết quả kỳ vọng |
|---|---|---|
| Outline | STUDENT có assignment ACTIVE nộp đề cương | Tạo outline và outline_version thành công |
| Outline | STUDENT chưa có assignment ACTIVE nộp đề cương | Trả lỗi SUPERVISOR_ASSIGNMENT_NOT_FOUND |
| Outline | STUDENT thiếu title/summary | Trả lỗi VALIDATION_ERROR |
| Outline | SUPERVISOR xem đề cương sinh viên mình hướng dẫn | Trả danh sách outline đúng quyền |
| Outline | SUPERVISOR xem đề cương ngoài quyền | Không truy cập được |
| Outline | SUPERVISOR approve outline | Outline chuyển APPROVED |
| Outline | SUPERVISOR request revision không nhập feedback | Trả lỗi OUTLINE_FEEDBACK_REQUIRED |
| Outline | STUDENT resubmit khi NEEDS_REVISION | Tạo version mới và status SUBMITTED |
| Outline | STUDENT resubmit khi APPROVED | Trả lỗi OUTLINE_ALREADY_APPROVED |
| Progress | STUDENT có outline APPROVED tạo progress | Tạo progress thành công |
| Progress | STUDENT chưa có outline APPROVED tạo progress | Trả lỗi PROJECT_PROGRESS_NOT_ALLOWED |
| Progress | progressPercent ngoài 0-100 | Trả lỗi PROGRESS_PERCENT_INVALID/VALIDATION_ERROR |
| Progress | SUPERVISOR xem progress của sinh viên mình | Trả danh sách progress đúng quyền |
| Progress | SUPERVISOR comment progress | Tạo comment và progress chuyển REVIEWED |
| File | Upload file PDF/DOC/DOCX/ZIP hợp lệ | File lên MinIO và metadata lưu PostgreSQL |
| File | Upload file sai định dạng | Trả lỗi FILE_UPLOAD_INVALID_TYPE |
| File | Upload file vượt dung lượng | Trả lỗi FILE_UPLOAD_TOO_LARGE |
| File | User không có quyền download | Trả lỗi FILE_ACCESS_DENIED |
| Notification | Nộp đề cương | Tạo notification cho GVHD |
| Notification | GVHD duyệt/yêu cầu sửa | Tạo notification cho sinh viên |
| Notification | Sinh viên cập nhật tiến độ | Tạo notification cho GVHD |
| Audit log | Các thao tác outline/progress/file | Có audit log tương ứng |
| RBAC | Sai role gọi API | Trả 403 |
| Auth | Không có token gọi API | Trả 401 |
