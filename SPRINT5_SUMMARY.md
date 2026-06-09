# Sprint 5 Summary - Defense Registration, Reviewer and Partial Scoring

## Mục tiêu
Sprint 5 triển khai nghiệp vụ đăng ký bảo vệ và phản biện trước hội đồng.

## Phạm vi đã triển khai
- Defense Registration Module.
- Reviewer Assignment Module.
- Scoring Module một phần: điểm GVHD và điểm GVPB.
- Sinh viên đăng ký/nộp lại hồ sơ bảo vệ khi outline đã APPROVED.
- Upload file report, slide, defense document qua MinIO, metadata lưu PostgreSQL.
- GVHD duyệt/từ chối điều kiện bảo vệ, nhập điểm hướng dẫn.
- Khoa phân công GVPB, không cho GVPB trùng GVHD.
- GVPB nhận xét, nhập điểm phản biện và xác nhận điều kiện bảo vệ.
- Notification và audit log cho thao tác quan trọng.
- Frontend cho student, supervisor, faculty và reviewer.

## Ngoài phạm vi
- Hội đồng bảo vệ.
- Lịch bảo vệ.
- Điểm hội đồng.
- Tính điểm tổng kết.
- Công bố kết quả.
- Chỉnh sửa sau bảo vệ.
- Lưu trữ hồ sơ.

## API chính
- `GET /api/defense-registrations/me`
- `GET /api/defense-registrations/supervisor`
- `GET /api/defense-registrations/faculty`
- `POST /api/defense-registrations`
- `PATCH /api/defense-registrations/:id/resubmit`
- `PATCH /api/defense-registrations/:id/supervisor/approve`
- `PATCH /api/defense-registrations/:id/supervisor/reject`
- `GET /api/reviewers/assignments`
- `GET /api/reviewers/assignments/me`
- `POST /api/reviewers/assignments`
- `POST /api/reviewers/evaluations`
- `POST /api/scores/supervisor`
- `POST /api/scores/reviewer`

## Frontend routes
- `/student/defense-registration`
- `/supervisor/defense-registrations`
- `/faculty/reviewer-assignments`
- `/reviewer/assignments`
