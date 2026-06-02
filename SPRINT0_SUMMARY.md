# Sprint 0 Summary

## Mục tiêu

Sprint 0 tạo nền kỹ thuật ban đầu cho hệ thống quản lý đồ án tốt nghiệp, bao gồm backend, frontend, database, cache, object storage, Docker Compose, Swagger và Health API.

## Kết quả đã có

- Backend NestJS scaffold.
- Frontend Next.js scaffold.
- PostgreSQL bằng Docker Compose.
- Redis bằng Docker Compose.
- MinIO bằng Docker Compose.
- Nginx reverse proxy local.
- Prisma ORM cấu hình PostgreSQL.
- Health API: `GET /api/health`.
- Swagger/OpenAPI: `/api/docs`.
- Landing page frontend có kiểm tra trạng thái backend.
- README, `.env.example`, Dockerfile backend, Dockerfile frontend.

## Ngoài phạm vi

- Auth/User/Role/RBAC.
- Các module nghiệp vụ đồ án tốt nghiệp.
- Upload file nghiệp vụ.
- Chấm điểm và lưu trữ hồ sơ.
