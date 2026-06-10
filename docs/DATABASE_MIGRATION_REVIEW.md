# Rà soát database và migration Sprint 9

## Migration hiện có

| Sprint | Migration |
|---|---|
| Sprint 1 | `20260602091156_sprint_1_auth_user_role` |
| Sprint 2 | `20260602103000_sprint_2_project_period_eligibility_topic` |
| Sprint 3 | `20260602120000_sprint_3_topic_registration_supervisor_assignment` |
| Sprint 4 | `20260602133000_sprint_4_outline_progress_files` |
| Sprint 5 | `20260602150000_sprint_5_defense_reviewer_scoring` |
| Sprint 6 | `20260602163000_sprint_6_council_schedule_documents` |
| Sprint 7 | `20260602180000_sprint_7_council_scoring_results` |
| Sprint 8 | `20260602193000_sprint_8_revision_archive_lock` |

## Quan hệ cần kiểm tra

- `users` ↔ `roles` qua `user_roles`.
- `students` ↔ `student_eligibilities` theo project period.
- `topics` ↔ `topic_registrations` ↔ `supervisor_assignments`.
- `outlines` và `project_progresses` đi qua student/assignment.
- `defense_registrations` ↔ `reviewer_assignments` ↔ `reviewer_scores`.
- `defense_councils` ↔ `council_members` ↔ `defense_schedules`.
- `defense_documents` gắn với schedule và file metadata.
- `council_scores`, `score_summaries`, `final_results` gắn với defense registration/schedule.
- `revision_requests`, `revision_submissions`, `archive_records`, `project_record_locks` hoàn tất sau bảo vệ.

## Unique constraint quan trọng

- User email unique.
- Student code unique.
- Lecturer code unique.
- One active topic registration per student/period theo business rule.
- One defense registration per student/period hoặc per registration theo module.
- One defense schedule per defense registration.
- One defense document per schedule.
- One score summary/final result per defense registration.
- One archive record per final result.
- One project record lock per student/project period.

## Lệnh kiểm tra migration sạch

```bash
docker compose down -v
docker compose up -d postgres redis minio
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npm run prisma:seed
docker compose run --rm backend npx prisma validate
```

## Rủi ro dữ liệu

- Seed demo có thể tạo workflow ở trạng thái cuối, khiến student demo không test lại được bước đầu nếu không dùng user demo khác.
- Nếu cần test từ đầu, tạo student mới hoặc reset database.
- Không dùng `docker compose down -v` trên dữ liệu thật vì sẽ xóa volume PostgreSQL/MinIO.
