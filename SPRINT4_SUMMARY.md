# Sprint 4 Summary

## Mục tiêu

Sprint 4 triển khai nghiệp vụ nộp/duyệt đề cương và theo dõi tiến độ thực hiện đồ án sau khi sinh viên đã có đề tài và GVHD chính thức.

## Phạm vi

- Outline Module.
- Project Progress Module.
- File Storage Module dùng MinIO.
- Sinh viên nộp và nộp lại đề cương.
- GVHD duyệt hoặc yêu cầu chỉnh sửa đề cương.
- Sinh viên cập nhật tiến độ và upload bản nháp/tài liệu.
- GVHD theo dõi và góp ý tiến độ.
- Notification và audit log cơ bản.

## Ngoài phạm vi

Không triển khai đăng ký bảo vệ, phản biện, hội đồng, lịch bảo vệ, chấm điểm, kết quả hoặc lưu trữ hồ sơ.

## Kết quả đầu ra

- Backend API: `/api/outlines`, `/api/project-progress`, `/api/files`.
- Frontend routes: `/student/outline`, `/supervisor/outlines`, `/student/progress`, `/supervisor/progress`.
- Prisma migration Sprint 4.
- Seed cập nhật để student demo có `topic_registration OFFICIALLY_ASSIGNED` và `supervisor_assignment ACTIVE`.
- README, run guide, test case và commit notes.
