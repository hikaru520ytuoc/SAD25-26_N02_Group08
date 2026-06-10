# Rà soát frontend Sprint 9

## Route chính cần kiểm tra

| Route | Role |
|---|---|
| `/login` | Public |
| `/dashboard` | Auth |
| `/admin/users` | ADMIN |
| `/faculty/project-periods` | FACULTY_MANAGER |
| `/faculty/student-eligibilities` | FACULTY_MANAGER |
| `/supervisor/topics` | SUPERVISOR |
| `/faculty/topics` | FACULTY_MANAGER |
| `/topics` | Auth |
| `/student/topic-registration` | STUDENT |
| `/supervisor/registration-requests` | SUPERVISOR |
| `/faculty/topic-registrations` | FACULTY_MANAGER |
| `/student/outline` | STUDENT |
| `/supervisor/outlines` | SUPERVISOR |
| `/student/progress` | STUDENT |
| `/supervisor/progress` | SUPERVISOR |
| `/student/defense-registration` | STUDENT |
| `/supervisor/defense-registrations` | SUPERVISOR |
| `/faculty/reviewer-assignments` | FACULTY_MANAGER |
| `/reviewer/assignments` | REVIEWER |
| `/faculty/councils` | FACULTY_MANAGER |
| `/faculty/defense-schedules` | FACULTY_MANAGER |
| `/student/defense-schedule` | STUDENT |
| `/council/schedules` | COUNCIL_MEMBER/COUNCIL_SECRETARY |
| `/secretary/defense-documents` | COUNCIL_SECRETARY |
| `/secretary/council-scoring` | COUNCIL_SECRETARY |
| `/council/my-scores` | COUNCIL_MEMBER/COUNCIL_SECRETARY |
| `/faculty/results` | FACULTY_MANAGER |
| `/student/result` | STUDENT |
| `/student/revision` | STUDENT |
| `/faculty/revisions` | FACULTY_MANAGER |
| `/student/archive` | STUDENT |
| `/archive/records` | ARCHIVE_STAFF |
| `/records/locked` | STUDENT/FACULTY_MANAGER/ARCHIVE_STAFF/ADMIN |

## Checklist UI

- Không màn hình trắng.
- Loading state rõ ràng.
- Error state thân thiện, có thể retry.
- Empty state rõ ràng.
- Form validation hoạt động.
- Menu dashboard hiển thị theo role.
- Sai quyền được redirect hoặc báo không có quyền.
- API error hiển thị message từ backend.
- Nút update bị ẩn/disable khi record locked.

## Ghi chú Sprint 9

Dashboard đã cập nhật thông báo code freeze: `Sprint 9 đã tích hợp tổng thể, ổn định MVP và sẵn sàng chuyển sang kiểm thử.`
