# Graduation Project Management System

Web application quản lý đồ án tốt nghiệp theo kiến trúc Client-Server, Modular Monolith và Layered Architecture.

## Sprint hiện tại

Sprint 5 triển khai nghiệp vụ nộp/duyệt đề cương, theo dõi tiến độ và upload file qua MinIO.

### Module đã có

- Sprint 0: nền tảng monorepo, Docker Compose, NestJS, Next.js, PostgreSQL, Redis, MinIO, Nginx.
- Sprint 1: Auth, User, Role, JWT, RBAC, Audit Log cơ bản.
- Sprint 2: Project Period, Student Eligibility, Topic workflow.
- Sprint 3: Topic Registration, Supervisor Assignment, Notification cơ bản.
- Sprint 5: Outline, Project Progress, File Storage MinIO.

## Công nghệ

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- RBAC Authorization
- Swagger/OpenAPI
- MinIO SDK

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Hook Form/Zod-friendly structure
- Fetch wrapper

### DevOps

- Docker
- Docker Compose
- PostgreSQL
- Redis
- MinIO
- Nginx

## Environment

Backend cần các biến chính:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/graduation_project_db?schema=public
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:3000,http://localhost
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=graduation-project-files
MAX_FILE_SIZE_MB=20
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/zip,application/x-zip-compressed
```

Frontend cần:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Graduation Project Management
NEXT_PUBLIC_MAX_FILE_SIZE_MB=20
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.zip
```

## Chạy bằng Docker Compose

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

Kiểm tra:

```bash
docker compose ps
curl http://localhost:8080/api/health
```

Nếu backend restart:

```bash
docker logs gpm_backend --tail=200
```

## URL

- Frontend: http://localhost:3000
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard
- Swagger: http://localhost:8080/api/docs
- MinIO Console: http://localhost:9001

### Sprint 5 routes

- Student outline: http://localhost:3000/student/outline
- Supervisor outline review: http://localhost:3000/supervisor/outlines
- Student progress: http://localhost:3000/student/progress
- Supervisor progress: http://localhost:3000/supervisor/progress

## Demo accounts

- Admin: admin@example.com / Admin@123456
- Student: student@example.com / Student@123456
- Supervisor 1: supervisor@example.com / Supervisor@123456
- Supervisor 2: supervisor2@example.com / Supervisor2@123456
- Faculty Manager: faculty@example.com / Faculty@123456

## Sprint 5 demo flow

1. Login `student@example.com`.
2. Vào `/student/outline` để upload file và nộp đề cương.
3. Login `supervisor@example.com`.
4. Vào `/supervisor/outlines` để yêu cầu chỉnh sửa hoặc duyệt đề cương.
5. Nếu yêu cầu chỉnh sửa, student nộp lại đề cương.
6. Supervisor duyệt đề cương.
7. Student vào `/student/progress` để cập nhật tiến độ và upload bản nháp/tài liệu.
8. Supervisor vào `/supervisor/progress` để góp ý tiến độ.
9. Kiểm tra notification tại `/notifications`.

## API Sprint 5

### Files

- `POST /api/files/upload`
- `GET /api/files`
- `GET /api/files/:id`
- `GET /api/files/:id/download`
- `DELETE /api/files/:id`

### Outlines

- `GET /api/outlines/me`
- `GET /api/outlines/supervisor`
- `GET /api/outlines`
- `GET /api/outlines/:id`
- `GET /api/outlines/:id/history`
- `POST /api/outlines`
- `PATCH /api/outlines/:id/resubmit`
- `PATCH /api/outlines/:id/approve`
- `PATCH /api/outlines/:id/request-revision`

### Project Progress

- `GET /api/project-progress/me`
- `GET /api/project-progress/supervisor`
- `GET /api/project-progress/:id`
- `POST /api/project-progress`
- `PATCH /api/project-progress/:id`
- `POST /api/project-progress/:id/comments`
- `GET /api/project-progress/:id/comments`

## Sprint 5 assumptions

- File đề cương là optional trong form demo, nhưng backend hỗ trợ gắn `fileDocumentId` sau khi upload.
- Khi outline được APPROVED, hệ thống cho phép cập nhật tiến độ bằng rule kiểm tra outline APPROVED thay vì tạo thêm bảng workflow phức tạp.
- Download file đi qua backend để kiểm tra quyền; MinIO bucket không public.
- Không triển khai đăng ký bảo vệ, phản biện, hội đồng, chấm điểm hoặc lưu trữ trong Sprint 5.

---

# Sprint 5 - Defense Registration, Reviewer and Partial Scoring

## Phạm vi Sprint 5

Sprint 5 triển khai nghiệp vụ đăng ký bảo vệ và phản biện trước hội đồng:

- Sinh viên đăng ký bảo vệ khi outline đã `APPROVED`.
- Upload report, slide và defense document qua MinIO.
- GVHD kiểm tra hồ sơ, approve/reject điều kiện bảo vệ và nhập điểm hướng dẫn.
- Khoa phân công GVPB cho hồ sơ đã được GVHD xác nhận.
- GVPB xem hồ sơ được phân công, nhập nhận xét, điểm phản biện và xác nhận điều kiện bảo vệ.
- Notification và audit log cho các thao tác quan trọng.

Sprint 5 chưa triển khai hội đồng bảo vệ, lịch bảo vệ, điểm hội đồng, tính điểm tổng kết, công bố kết quả, chỉnh sửa sau bảo vệ hoặc lưu trữ.

## Database mới

Sprint 5 thêm các bảng:

- `defense_registrations`
- `reviewer_assignments`
- `reviewer_evaluations`
- `supervisor_scores`
- `reviewer_scores`

Sprint 5 mở rộng enum `FileDocumentType` thêm:

- `DEFENSE_DOCUMENT`

## API chính

### Defense Registration

- `GET /api/defense-registrations/me`
- `GET /api/defense-registrations/supervisor`
- `GET /api/defense-registrations/faculty`
- `GET /api/defense-registrations/:id`
- `POST /api/defense-registrations`
- `PATCH /api/defense-registrations/:id/resubmit`
- `PATCH /api/defense-registrations/:id/supervisor/approve`
- `PATCH /api/defense-registrations/:id/supervisor/reject`

### Reviewer

- `GET /api/reviewers/assignments`
- `GET /api/reviewers/assignments/me`
- `GET /api/reviewers/assignments/:id`
- `POST /api/reviewers/assignments`
- `PATCH /api/reviewers/assignments/:id`
- `POST /api/reviewers/evaluations`
- `GET /api/reviewers/evaluations/:assignmentId`
- `PATCH /api/reviewers/evaluations/:id`

### Scores

- `POST /api/scores/supervisor`
- `PATCH /api/scores/supervisor/:id`
- `GET /api/scores/supervisor/:defenseRegistrationId`
- `POST /api/scores/reviewer`
- `PATCH /api/scores/reviewer/:id`
- `GET /api/scores/reviewer/:reviewerAssignmentId`

## Frontend routes

- `/student/defense-registration`
- `/supervisor/defense-registrations`
- `/faculty/reviewer-assignments`
- `/reviewer/assignments`

## Lệnh chạy Sprint 5

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

## Tài khoản demo Sprint 5

- `student@example.com` / `Student@123456`
- `supervisor@example.com` / `Supervisor@123456`
- `faculty@example.com` / `Faculty@123456`
- `reviewer@example.com` / `Reviewer@123456`
- `admin@example.com` / `Admin@123456`

## Luồng demo Sprint 5

1. Login student, vào `/student/defense-registration`, upload report/slide và đăng ký bảo vệ.
2. Login supervisor, vào `/supervisor/defense-registrations`, xem hồ sơ, nhập điểm và approve hoặc reject.
3. Login faculty, vào `/faculty/reviewer-assignments`, phân công GVPB cho hồ sơ đã được GVHD approve.
4. Login reviewer, vào `/reviewer/assignments`, xem hồ sơ, nhập nhận xét và điểm phản biện.
5. Kiểm tra notification và audit log.

---

# Sprint 6 - Defense Council, Schedule and Document Review

Sprint 6 triển khai chuẩn bị bảo vệ chính thức: hội đồng, lịch bảo vệ và kiểm tra hồ sơ bảo vệ.

## New modules

- Council Module
- Defense Schedule Module
- Defense Document Module

## New frontend routes

- `http://localhost:3000/faculty/councils`
- `http://localhost:3000/faculty/defense-schedules`
- `http://localhost:3000/student/defense-schedule`
- `http://localhost:3000/council/schedules`
- `http://localhost:3000/secretary/defense-documents`

## Demo flow

1. Login `faculty@example.com`.
2. Vào `/faculty/councils` để tạo hội đồng và thêm thành viên.
3. Vào `/faculty/defense-schedules` để xếp lịch cho hồ sơ READY_FOR_COUNCIL.
4. Login `student@example.com` để xem lịch tại `/student/defense-schedule`.
5. Student upload file qua `/api/files/upload`, sau đó dán file ID để nộp hồ sơ bảo vệ.
6. Login `secretary@example.com` vào `/secretary/defense-documents` để yêu cầu bổ sung hoặc xác nhận hồ sơ hợp lệ.
7. Login `council@example.com` vào `/council/schedules` để xem lịch hội đồng.

## Run

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

## Accounts

```text
Faculty Manager: faculty@example.com / Faculty@123456
Student: student@example.com / Student@123456
Council Chair: council@example.com / Council@123456
Council Secretary: secretary@example.com / Secretary@123456
Admin: admin@example.com / Admin@123456
```

---

# Sprint 7 - Council Scoring and Final Result Publication

Sprint 7 triển khai nghiệp vụ chấm điểm và công bố kết quả bảo vệ.

## Scope

- Nhập điểm từng thành viên hội đồng.
- Tính điểm hội đồng trung bình.
- Lấy điểm GVHD và GVPB từ Sprint 5.
- Tính điểm tổng kết theo công thức `(councilAverageScore * 2 + supervisorScore + reviewerScore) / 4`.
- Generate, confirm và publish final result.
- Sinh viên xem kết quả sau khi được công bố.
- Defense session/minutes cơ bản.
- Notification và audit log cho thao tác quan trọng.

## Out of scope

- Quy trình chỉnh sửa sau bảo vệ.
- Nộp bản chỉnh sửa.
- Kiểm tra bản chỉnh sửa.
- Lưu trữ hồ sơ.

## Run

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

## Sprint 7 URLs

- Secretary council scoring: `http://localhost:3000/secretary/council-scoring`
- Council member scoring: `http://localhost:3000/council/my-scores`
- Faculty results: `http://localhost:3000/faculty/results`
- Student result: `http://localhost:3000/student/result`

## Demo workflow

1. Login `secretary@example.com` and enter council scores.
2. Login `faculty@example.com`, generate result, confirm result, then publish result.
3. Login `student@example.com` and view published result.

## Demo accounts

- secretary@example.com / Secretary@123456
- council@example.com / Council@123456
- faculty@example.com / Faculty@123456
- student@example.com / Student@123456
