# Test Cases Sprint 6

| Nhóm | Test case | Kết quả mong đợi |
|---|---|---|
| Council | FACULTY_MANAGER tạo hội đồng | Thành công |
| Council | STUDENT tạo hội đồng | 403 |
| Council | Thêm thành viên hội đồng | Thành công |
| Council | Thêm trùng thành viên | 409 COUNCIL_MEMBER_EXISTS |
| Council | Gán 2 CHAIR | 409 COUNCIL_INVALID_ROLE |
| Council | Gán 2 SECRETARY | 409 COUNCIL_INVALID_ROLE |
| Schedule | FACULTY_MANAGER lập lịch cho hồ sơ READY_FOR_COUNCIL | Thành công |
| Schedule | Lập lịch khi hội đồng không ACTIVE | 404/400 COUNCIL_NOT_FOUND |
| Schedule | Lập lịch khi hồ sơ chưa sẵn sàng | 409 DEFENSE_REGISTRATION_NOT_READY |
| Schedule | startTime >= endTime | 400 DEFENSE_SCHEDULE_INVALID_TIME |
| Schedule | Trùng phòng hoặc hội đồng cùng khung giờ | 409 DEFENSE_SCHEDULE_CONFLICT |
| Schedule | STUDENT xem lịch của mình | Thành công |
| Schedule | COUNCIL_MEMBER xem lịch hội đồng mình | Thành công |
| Document | STUDENT nộp hồ sơ bảo vệ | Thành công |
| Document | Thiếu report/slide | 400 DEFENSE_DOCUMENT_MISSING_REQUIRED_FILE |
| Document | SECRETARY yêu cầu bổ sung thiếu note | 400 DEFENSE_DOCUMENT_SUPPLEMENT_NOTE_REQUIRED |
| Document | STUDENT bổ sung hồ sơ khi NEEDS_SUPPLEMENT | Thành công |
| Document | SECRETARY xác nhận hồ sơ hợp lệ | Thành công |
| RBAC | User không token | 401 |
| RBAC | User sai role | 403 |
| Audit | Tạo hội đồng/lập lịch/nộp hồ sơ/yêu cầu bổ sung/approve | Có audit log |
| Notification | Lập lịch/yêu cầu bổ sung/approve | Có notification |
