# Test Cases Sprint 3

| Mã | Test case | Kết quả mong đợi |
|---|---|---|
| TC-S3-REG-01 | STUDENT đủ điều kiện đăng ký topic PUBLISHED | Tạo topic_registration trạng thái PENDING_FACULTY |
| TC-S3-REG-02 | STUDENT không đủ điều kiện đăng ký | API trả STUDENT_NOT_ELIGIBLE |
| TC-S3-REG-03 | STUDENT đăng ký topic chưa PUBLISHED | API trả TOPIC_NOT_PUBLISHED |
| TC-S3-REG-04 | STUDENT đăng ký hai topic active cùng period | API trả TOPIC_REGISTRATION_EXISTS |
| TC-S3-REG-05 | STUDENT đề xuất đề tài mới có GVHD | Tạo registration PENDING_SUPERVISOR và notification cho GVHD |
| TC-S3-REG-06 | STUDENT đề xuất đề tài mới không có title | API trả VALIDATION_ERROR |
| TC-S3-REG-07 | STUDENT hủy registration chưa official | Registration chuyển CANCELLED |
| TC-S3-REG-08 | STUDENT hủy registration OFFICIALLY_ASSIGNED | API trả TOPIC_REGISTRATION_INVALID_STATUS |
| TC-S3-SUP-01 | SUPERVISOR xem request gửi tới mình | Chỉ thấy request có requestedSupervisorId của mình |
| TC-S3-SUP-02 | SUPERVISOR accept request | Registration chuyển PENDING_FACULTY, supervisorResponseStatus ACCEPTED |
| TC-S3-SUP-03 | SUPERVISOR reject không nhập lý do | API trả SUPERVISOR_RESPONSE_NOTE_REQUIRED |
| TC-S3-SUP-04 | SUPERVISOR xử lý request không thuộc mình | API trả SUPERVISOR_REQUEST_NOT_FOR_CURRENT_USER |
| TC-S3-FAC-01 | FACULTY_MANAGER xem danh sách registration | Trả danh sách registration |
| TC-S3-FAC-02 | FACULTY_MANAGER phân công GVHD | requestedSupervisorId được cập nhật |
| TC-S3-FAC-03 | FACULTY_MANAGER confirm registration | Tạo supervisor_assignment ACTIVE, registration OFFICIALLY_ASSIGNED |
| TC-S3-FAC-04 | FACULTY_MANAGER reject không nhập lý do | API trả FACULTY_REJECTION_REASON_REQUIRED |
| TC-S3-RBAC-01 | STUDENT gọi API faculty confirm | API trả AUTH_FORBIDDEN |
| TC-S3-RBAC-02 | User không token gọi protected API | API trả AUTH_UNAUTHORIZED |
| TC-S3-NOTI-01 | User xem notification của mình | Chỉ trả notification theo current user |
| TC-S3-AUDIT-01 | Registration created/confirmed tạo audit log | Có audit log tương ứng |
