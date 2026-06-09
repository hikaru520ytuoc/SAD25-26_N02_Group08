# Sprint 6 Summary - Defense Council, Schedule and Document Review

## Mục tiêu
Sprint 6 triển khai phần chuẩn bị tổ chức bảo vệ chính thức: hội đồng bảo vệ, lịch bảo vệ và kiểm tra hồ sơ bảo vệ trước buổi bảo vệ.

## Phạm vi
- Council Module: tạo/cập nhật hội đồng, thêm thành viên, gán CHAIR/SECRETARY/MEMBER.
- Defense Schedule Module: lập lịch bảo vệ cho hồ sơ đủ điều kiện sau phản biện.
- Defense Document Module: sinh viên nộp/bổ sung hồ sơ, thư ký yêu cầu bổ sung hoặc xác nhận hợp lệ.
- File type mở rộng cho hồ sơ bảo vệ cuối cùng.
- Notification và audit log cho thao tác quan trọng.
- Frontend cho Faculty, Student, Council member và Secretary.

## Ngoài phạm vi
- Không nhập điểm hội đồng.
- Không tính điểm tổng kết.
- Không công bố kết quả.
- Không chỉnh sửa sau bảo vệ.
- Không lưu trữ hồ sơ chính thức.

## Routes frontend
- `/faculty/councils`
- `/faculty/defense-schedules`
- `/student/defense-schedule`
- `/council/schedules`
- `/secretary/defense-documents`

## APIs backend
- `/api/councils`
- `/api/defense-schedules`
- `/api/defense-documents`
