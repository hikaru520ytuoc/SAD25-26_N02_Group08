# Sprint 8 Summary - Revision, Archive and Record Locking

## Mục tiêu
Sprint 8 triển khai nghiệp vụ sau bảo vệ: chỉnh sửa sau bảo vệ, nộp hồ sơ lưu trữ cuối cùng, kiểm tra lưu trữ và khóa hồ sơ sau khi hoàn tất.

## Phạm vi đã triển khai
- Revision Module: tạo yêu cầu chỉnh sửa, sinh viên nộp bản chỉnh sửa, duyệt/yêu cầu sửa lại.
- Archive Module: sinh viên nộp/bổ sung hồ sơ lưu trữ, archive staff duyệt/hoàn tất/khóa hồ sơ.
- Record Lock Service: kiểm tra trạng thái khóa hồ sơ trước thao tác chỉnh sửa Sprint 8.
- Prisma schema: revision_requests, revision_submissions, archive_records, project_record_locks.
- File types: REVISION_REPORT, FINAL_REPORT, FINAL_SLIDE, SOURCE_CODE, ARCHIVE_DOCUMENT, ARCHIVE_SUPPLEMENT, ARCHIVE_OTHER.
- Frontend pages: /student/revision, /faculty/revisions, /student/archive, /archive/records, /records/locked.
- Notification và audit log cho các thao tác chính.

## Ngoài phạm vi
Không triển khai báo cáo PDF/Excel, dashboard nâng cao, email tự động, chữ ký số hoặc mở khóa hồ sơ.
