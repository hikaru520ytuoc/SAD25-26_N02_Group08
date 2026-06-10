# Smoke test Sprint 9 trước Giai đoạn 7

| ID | Chức năng | Role | Dữ liệu test | Bước kiểm tra | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|---|---|
| ST-001 | Login admin | ADMIN | admin@example.com | Login và vào dashboard | Đăng nhập thành công | TODO |
| ST-002 | Xem user | ADMIN | Seed users | Vào `/admin/users` | Thấy danh sách user/role | TODO |
| ST-003 | Mở đợt đồ án | FACULTY_MANAGER | Project period demo | Vào `/faculty/project-periods` | Tạo/mở đợt thành công | TODO |
| ST-004 | Xét đủ điều kiện | FACULTY_MANAGER | student@example.com | Vào `/faculty/student-eligibilities` | Student có ELIGIBLE | TODO |
| ST-005 | Tạo topic | SUPERVISOR | supervisor@example.com | Vào `/supervisor/topics` | Tạo topic SUBMITTED/DRAFT | TODO |
| ST-006 | Publish topic | FACULTY_MANAGER | Topic submitted | Vào `/faculty/topics` | Topic PUBLISHED | TODO |
| ST-007 | Student xem topic | STUDENT | Topic published | Vào `/topics` hoặc đăng ký | Thấy topic published | TODO |
| ST-008 | Student đăng ký topic | STUDENT | Student eligible | Vào `/student/topic-registration` | Tạo registration | TODO |
| ST-009 | Faculty confirm registration | FACULTY_MANAGER | Registration pending | Vào `/faculty/topic-registrations` | OFFICIALLY_ASSIGNED | TODO |
| ST-010 | Student nộp outline | STUDENT | Assigned topic | Vào `/student/outline` | Outline SUBMITTED | TODO |
| ST-011 | Supervisor approve outline | SUPERVISOR | Outline submitted | Vào `/supervisor/outlines` | Outline APPROVED | TODO |
| ST-012 | Student cập nhật progress | STUDENT | Outline approved | Vào `/student/progress` | Progress SUBMITTED | TODO |
| ST-013 | Student đăng ký bảo vệ | STUDENT | Outline approved | Vào `/student/defense-registration` | Defense registration submitted | TODO |
| ST-014 | Supervisor approve defense | SUPERVISOR | Defense submitted | Vào `/supervisor/defense-registrations` | Có supervisor score | TODO |
| ST-015 | Faculty assign reviewer | FACULTY_MANAGER | Defense approved | Vào `/faculty/reviewer-assignments` | Reviewer assigned | TODO |
| ST-016 | Reviewer submit evaluation | REVIEWER | reviewer@example.com | Vào `/reviewer/assignments` | Reviewer score/evaluation completed | TODO |
| ST-017 | Faculty create council | FACULTY_MANAGER | lecturer demo | Vào `/faculty/councils` | Council ACTIVE có chair/secretary | TODO |
| ST-018 | Faculty create schedule | FACULTY_MANAGER | READY_FOR_COUNCIL | Vào `/faculty/defense-schedules` | Schedule created | TODO |
| ST-019 | Student view schedule | STUDENT | Schedule created | Vào `/student/defense-schedule` | Thấy lịch của mình | TODO |
| ST-020 | Secretary approve document | COUNCIL_SECRETARY | Defense document | Vào `/secretary/defense-documents` | Document APPROVED | TODO |
| ST-021 | Secretary input council score | COUNCIL_SECRETARY | Council members | Vào `/secretary/council-scoring` | Điểm hội đồng hợp lệ | TODO |
| ST-022 | Faculty publish result | FACULTY_MANAGER | Đủ điểm | Vào `/faculty/results` | Result PUBLISHED | TODO |
| ST-023 | Student view result | STUDENT | Result published | Vào `/student/result` | Thấy điểm/trạng thái | TODO |
| ST-024 | Student submit revision | STUDENT | PASSED_WITH_REVISION | Vào `/student/revision` | Revision submitted | TODO |
| ST-025 | Faculty approve revision | FACULTY_MANAGER | Revision submitted | Vào `/faculty/revisions` | Revision APPROVED | TODO |
| ST-026 | Student submit archive | STUDENT | Eligible archive | Vào `/student/archive` | Archive SUBMITTED | TODO |
| ST-027 | ArchiveStaff complete archive | ARCHIVE_STAFF | Archive submitted | Vào `/archive/records` | Archive COMPLETED | TODO |
| ST-028 | ArchiveStaff lock record | ARCHIVE_STAFF | Archive completed | Bấm lock | Archive LOCKED | TODO |
| ST-029 | Locked record readonly | STUDENT | Archive locked | Vào `/records/locked` | Chỉ xem, không sửa | TODO |
| ST-030 | Wrong role forbidden | STUDENT | Student token | Gọi API faculty | 403 Forbidden | TODO |
| ST-031 | No token unauthorized | None | Không token | Gọi API protected | 401 Unauthorized | TODO |
| ST-032 | File download ownership | STUDENT khác | File của student demo | Gọi download | 403/FILE_ACCESS_DENIED | TODO |
