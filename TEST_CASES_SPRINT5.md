# Test Cases Sprint 5

| Nhóm | Test case | Kỳ vọng |
|---|---|---|
| Defense Registration | STUDENT có outline APPROVED đăng ký bảo vệ | Thành công |
| Defense Registration | STUDENT chưa có outline APPROVED đăng ký bảo vệ | Bị từ chối `OUTLINE_NOT_APPROVED` |
| Defense Registration | STUDENT đăng ký hai lần cùng period | Bị từ chối `DEFENSE_REGISTRATION_EXISTS` |
| Defense Registration | Thiếu reportFileId | Bị từ chối `FILE_NOT_FOUND` |
| Defense Registration | Resubmit khi NEEDS_REVISION | Thành công |
| Defense Registration | Resubmit khi APPROVED_BY_SUPERVISOR | Bị từ chối `DEFENSE_REGISTRATION_INVALID_STATUS` |
| Supervisor | SUPERVISOR xem hồ sơ của sinh viên mình hướng dẫn | Thành công |
| Supervisor | SUPERVISOR xử lý sinh viên không thuộc mình | Bị từ chối `DEFENSE_REGISTRATION_NOT_ALLOWED` |
| Supervisor | Approve với score 0-10 | Thành công, tạo supervisor_scores |
| Supervisor | Approve score > 10 | Bị từ chối `SUPERVISOR_SCORE_INVALID` |
| Supervisor | Reject không feedback | Bị từ chối `SUPERVISOR_FEEDBACK_REQUIRED` |
| Reviewer Assignment | FACULTY_MANAGER phân công GVPB | Thành công |
| Reviewer Assignment | STUDENT phân công GVPB | 403 |
| Reviewer Assignment | GVPB trùng GVHD | Bị từ chối `REVIEWER_CANNOT_BE_SUPERVISOR` |
| Reviewer Assignment | Defense chưa APPROVED_BY_SUPERVISOR | Bị từ chối `DEFENSE_REGISTRATION_INVALID_STATUS` |
| Reviewer Assignment | Phân công trùng defenseRegistration | Bị từ chối `REVIEWER_ASSIGNMENT_EXISTS` |
| Reviewer Evaluation | REVIEWER xem assignment của mình | Thành công |
| Reviewer Evaluation | REVIEWER xem assignment người khác | 404 |
| Reviewer Evaluation | Nhập comment + score hợp lệ | Thành công |
| Reviewer Evaluation | Score ngoài 0-10 | Bị từ chối `REVIEWER_SCORE_INVALID` |
| Reviewer Evaluation | NOT_ELIGIBLE thiếu feedback | Bị từ chối `REVIEWER_FEEDBACK_REQUIRED` |
| File | Upload report PDF/DOCX/PPTX/ZIP hợp lệ | Thành công |
| File | File sai định dạng | Bị từ chối `FILE_UPLOAD_INVALID_TYPE` |
| File | File quá dung lượng | Bị từ chối `FILE_UPLOAD_TOO_LARGE` |
| RBAC | Không token gọi API | 401 |
| RBAC | Sai role gọi API | 403 |
| Audit | Đăng ký bảo vệ | Có audit log |
| Audit | GVHD approve/reject | Có audit log |
| Audit | Khoa phân công GVPB | Có audit log |
| Audit | GVPB nhập nhận xét/điểm | Có audit log |
| Notification | Student đăng ký bảo vệ | GVHD nhận notification |
| Notification | GVHD phản hồi | Student nhận notification |
| Notification | Faculty phân công GVPB | Reviewer nhận notification |
| Notification | Reviewer phản hồi | Student nhận notification |
