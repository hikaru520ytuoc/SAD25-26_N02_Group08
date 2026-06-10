# RBAC và Ownership Matrix Sprint 9

| Role | Màn hình chính | API chính | Ownership cần kiểm tra |
|---|---|---|---|
| ADMIN | `/admin/users`, `/dashboard` | `/api/users`, `/api/roles`, các API xem hệ thống | Không thay nghiệp vụ nếu không cần; có quyền quản trị kỹ thuật |
| FACULTY_MANAGER | `/faculty/*` | project periods, eligibilities, topics, registrations, reviewer assignments, councils, schedules, results, revisions | Chỉ thao tác trong phạm vi quản lý/khoa nếu có multi-faculty |
| STUDENT | `/student/*` | topic-registration, outline, progress, defense-registration, defense-schedule, result, revision, archive | Chỉ xem/sửa hồ sơ của chính mình |
| SUPERVISOR | `/supervisor/*` | topics, registration-requests, my-students, outlines, progress, defense-registrations | Chỉ xử lý sinh viên mình hướng dẫn |
| REVIEWER | `/reviewer/assignments` | reviewer assignments/evaluations/scores | Chỉ xử lý hồ sơ được phân công phản biện |
| COUNCIL_MEMBER | `/council/schedules`, `/council/my-scores` | defense schedules, council scores | Chỉ xem/nhập điểm lịch thuộc hội đồng mình |
| COUNCIL_SECRETARY | `/secretary/*` | defense-documents, council-scoring, revisions nếu được phân công | Chỉ xử lý hội đồng mình làm thư ký |
| ARCHIVE_STAFF | `/archive/records` | archives, record lock | Chỉ xử lý hồ sơ lưu trữ, không sửa điểm/kết quả |

## API cần ownership mạnh

- `/api/topic-registrations/me`
- `/api/outlines/me`
- `/api/project-progress/me`
- `/api/defense-registrations/me`
- `/api/defense-schedules/me`
- `/api/defense-documents/me`
- `/api/results/me`
- `/api/revisions/me`
- `/api/archives/me`
- `/api/files/:id/download`

## Nguyên tắc

- Frontend chỉ điều hướng theo role, không thay thế backend authorization.
- API protected phải có JWT guard.
- API nghiệp vụ phải có Role guard và ownership check trong service.
- File download phải kiểm tra quyền theo metadata, không public MinIO bucket.
