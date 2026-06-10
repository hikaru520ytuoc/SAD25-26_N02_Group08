# Rà soát API Sprint 9

## Response thành công chuẩn

```json
{
  "success": true,
  "data": {},
  "message": "Thao tác thành công"
}
```

## Response lỗi chuẩn

```json
{
  "success": false,
  "errorCode": "ERROR_CODE",
  "message": "Thông báo lỗi rõ ràng",
  "statusCode": 400,
  "timestamp": "2026-06-10T00:00:00.000Z",
  "path": "/api/..."
}
```

## Endpoint chính cần smoke test

| Module | Endpoint đại diện | Role |
|---|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/me` | Public/Auth |
| Users | `GET /api/users` | ADMIN |
| Project Period | `GET/POST /api/project-periods` | FACULTY_MANAGER |
| Eligibility | `GET/POST /api/student-eligibilities` | FACULTY_MANAGER |
| Topic | `GET /api/topics/published`, `POST /api/topics` | STUDENT/SUPERVISOR |
| Registration | `GET/POST /api/topic-registrations` | STUDENT/FACULTY |
| Outline | `GET/POST /api/outlines` | STUDENT/SUPERVISOR |
| Progress | `GET/POST /api/project-progress` | STUDENT/SUPERVISOR |
| Defense Registration | `GET/POST /api/defense-registrations` | STUDENT/SUPERVISOR |
| Reviewer | `GET/POST /api/reviewers/assignments` | FACULTY/REVIEWER |
| Council | `GET/POST /api/councils` | FACULTY |
| Schedule | `GET/POST /api/defense-schedules` | FACULTY/STUDENT/COUNCIL |
| Defense Document | `GET/POST/PATCH /api/defense-documents` | STUDENT/SECRETARY |
| Scores | `GET/POST/PATCH /api/scores/*` | SECRETARY/COUNCIL/FACULTY |
| Results | `GET/POST/PATCH /api/results/*` | FACULTY/STUDENT |
| Revisions | `GET/POST/PATCH /api/revisions/*` | STUDENT/FACULTY |
| Archives | `GET/POST/PATCH /api/archives/*` | STUDENT/ARCHIVE_STAFF |
| Files | `POST /api/files/upload`, `GET /api/files/:id/download` | Auth + ownership |
| Notifications | `GET /api/notifications` | Auth |

## Swagger

- Swagger truy cập tại `http://localhost:8080/api/docs`.
- Cần bật Bearer token bằng nút Authorize.
- Giai đoạn 7 nên kiểm tra Swagger không thiếu controller chính và không lộ DTO nhạy cảm.

## Error code tập trung Sprint 9

- `WORKFLOW_INVALID_TRANSITION`
- `PROJECT_RECORD_LOCKED`
- `FILE_ACCESS_DENIED`
- `RESULT_ACCESS_DENIED`
- `SCORE_MISSING_COMPONENT`
- `DEFENSE_REGISTRATION_NOT_READY`
- `ARCHIVE_NOT_ALLOWED`
