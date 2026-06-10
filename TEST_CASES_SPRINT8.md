# Test Cases Sprint 8

| Nhóm | Test case | Kết quả mong đợi |
|---|---|---|
| Revision | Tạo revision request cho PASSED_WITH_REVISION | Thành công |
| Revision | Tạo revision request cho FAILED | Bị từ chối |
| Revision | Student xem revision của mình | Thành công |
| Revision | Student nộp bản chỉnh sửa | Tạo revision_submission version mới |
| Revision | Request changes không có feedback | Trả REVISION_FEEDBACK_REQUIRED |
| Revision | Approve revision | Status APPROVED |
| Archive | Student PASSED nộp archive | Thành công |
| Archive | PASSED_WITH_REVISION chưa approve revision | Bị từ chối |
| Archive | FAILED nộp archive | Bị từ chối |
| Archive | Thiếu finalReportFileId | Trả ARCHIVE_REQUIRED_FILE_MISSING |
| Archive | ArchiveStaff request supplement không có reason | Trả ARCHIVE_SUPPLEMENT_REASON_REQUIRED |
| Archive | Student bổ sung khi NEEDS_SUPPLEMENT | Status SUBMITTED |
| Archive | ArchiveStaff approve | Status APPROVED |
| Archive | ArchiveStaff complete | Status COMPLETED |
| Lock | ArchiveStaff lock record | Status LOCKED và tạo project_record_locks |
| Lock | Update hồ sơ đã khóa | Trả PROJECT_RECORD_LOCKED |
| RBAC | User không token | 401 |
| RBAC | Sai role | 403 |
| Notification | Revision/Archive status change | Tạo notification |
| Audit | Revision/Archive/Lock actions | Tạo audit log |
