# Seed data demo Sprint 9

## Tài khoản demo

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@example.com` | `Admin@123456` |
| STUDENT | `student@example.com` | `Student@123456` |
| SUPERVISOR | `supervisor@example.com` | `Supervisor@123456` |
| REVIEWER | `reviewer@example.com` | `Reviewer@123456` |
| FACULTY_MANAGER | `faculty@example.com` | `Faculty@123456` |
| COUNCIL_MEMBER | `council@example.com` | `Council@123456` |
| COUNCIL_SECRETARY | `secretary@example.com` | `Secretary@123456` |
| ARCHIVE_STAFF | `archive@example.com` | `Archive@123456` |

## Dữ liệu nghiệp vụ demo cần có

- Faculty demo `FIT`.
- Project period OPEN.
- Student demo đủ điều kiện.
- Supervisor/reviewer/council/secretary/archive staff demo.
- Topic PUBLISHED.
- Topic registration OFFICIALLY_ASSIGNED.
- Supervisor assignment ACTIVE.
- Outline APPROVED.
- Progress demo.
- Defense registration READY_FOR_COUNCIL.
- Reviewer assignment COMPLETED.
- Defense council ACTIVE.
- Defense schedule DOCUMENT_APPROVED hoặc COMPLETED.
- Supervisor score, reviewer score, council score.
- Score summary và final result.
- Revision request cho case PASSED_WITH_REVISION.
- Archive record để test submit/approve/complete/lock.

## Kiểm tra seed idempotent

```bash
docker compose run --rm backend npm run prisma:seed
docker compose run --rm backend npm run prisma:seed
```

Nếu lần chạy thứ hai không lỗi unique constraint, seed đạt yêu cầu cơ bản.

## SQL kiểm tra nhanh

```bash
docker compose exec postgres psql -U postgres -d graduation_project_db -c "SELECT email, status FROM users ORDER BY email;"
docker compose exec postgres psql -U postgres -d graduation_project_db -c "SELECT status, COUNT(*) FROM topic_registrations GROUP BY status;"
docker compose exec postgres psql -U postgres -d graduation_project_db -c "SELECT status, COUNT(*) FROM archive_records GROUP BY status;"
```
