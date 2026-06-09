# Sprint 3 Summary - Topic Registration and Supervisor Assignment Workflow

## Mục tiêu
Sprint 3 triển khai Phase 2 của Giai đoạn 1: đăng ký và xét duyệt đề tài.

## Phạm vi đã triển khai
- Sinh viên đăng ký đề tài có sẵn đã PUBLISHED.
- Sinh viên đề xuất đề tài mới.
- Sinh viên đề xuất GVHD khi đề xuất đề tài.
- GVHD xem yêu cầu hướng dẫn gửi tới mình.
- GVHD đồng ý hoặc từ chối hướng dẫn.
- Khoa phân công GVHD khi cần.
- Khoa xác nhận chính thức đề tài và GVHD.
- Khoa từ chối đăng ký/đề xuất và ghi lý do.
- Hệ thống tạo supervisor_assignment ACTIVE sau khi Khoa xác nhận.
- Notification cơ bản.
- Audit log cho thao tác quan trọng.

## Ngoài phạm vi
- Không triển khai đề cương.
- Không triển khai tiến độ đồ án.
- Không triển khai đăng ký bảo vệ.
- Không triển khai phản biện.
- Không triển khai hội đồng.
- Không triển khai chấm điểm.
- Không triển khai lưu trữ hồ sơ.

## Backend modules
- TopicRegistrationModule
- SupervisorAssignmentModule
- NotificationsModule

## Frontend pages
- `/student/topic-registration`
- `/supervisor/registration-requests`
- `/faculty/topic-registrations`
- `/faculty/supervisor-assignments`
- `/supervisor/my-students`
- `/student/supervisor-assignment`
- `/notifications`

## Demo accounts
- Student: `student@example.com` / `Student@123456`
- Supervisor 1: `supervisor@example.com` / `Supervisor@123456`
- Supervisor 2: `supervisor2@example.com` / `Supervisor2@123456`
- Faculty Manager: `faculty@example.com` / `Faculty@123456`
