# Graduation Project Management System

Web application quản lý đồ án tốt nghiệp theo kiến trúc Client-Server, Modular Monolith và Layered Architecture.

## Sprint hiện tại

Sprint 4 triển khai nghiệp vụ nộp/duyệt đề cương, theo dõi tiến độ và upload file qua MinIO.

### Module đã có

- Sprint 0: nền tảng monorepo, Docker Compose, NestJS, Next.js, PostgreSQL, Redis, MinIO, Nginx.
- Sprint 1: Auth, User, Role, JWT, RBAC, Audit Log cơ bản.
- Sprint 2: Project Period, Student Eligibility, Topic workflow.
- Sprint 3: Topic Registration, Supervisor Assignment, Notification cơ bản.
- Sprint 4: Outline, Project Progress, File Storage MinIO.

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

### Sprint 4 routes

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

## Sprint 4 demo flow

1. Login `student@example.com`.
2. Vào `/student/outline` để upload file và nộp đề cương.
3. Login `supervisor@example.com`.
4. Vào `/supervisor/outlines` để yêu cầu chỉnh sửa hoặc duyệt đề cương.
5. Nếu yêu cầu chỉnh sửa, student nộp lại đề cương.
6. Supervisor duyệt đề cương.
7. Student vào `/student/progress` để cập nhật tiến độ và upload bản nháp/tài liệu.
8. Supervisor vào `/supervisor/progress` để góp ý tiến độ.
9. Kiểm tra notification tại `/notifications`.

## API Sprint 4

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

## Sprint 4 assumptions

- File đề cương là optional trong form demo, nhưng backend hỗ trợ gắn `fileDocumentId` sau khi upload.
- Khi outline được APPROVED, hệ thống cho phép cập nhật tiến độ bằng rule kiểm tra outline APPROVED thay vì tạo thêm bảng workflow phức tạp.
- Download file đi qua backend để kiểm tra quyền; MinIO bucket không public.
- Không triển khai đăng ký bảo vệ, phản biện, hội đồng, chấm điểm hoặc lưu trữ trong Sprint 4.
