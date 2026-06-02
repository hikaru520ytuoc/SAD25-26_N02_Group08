# Hệ thống quản lý đồ án tốt nghiệp

## 1. Mô tả ngắn

Dự án **Hệ thống quản lý đồ án tốt nghiệp** là web application hỗ trợ quản lý quy trình đồ án tốt nghiệp của sinh viên. Sprint 1 tập trung vào nền tảng xác thực, người dùng và phân quyền: đăng nhập JWT, quản lý user, role, gán role và audit log cơ bản.

Sprint 1 chưa triển khai các nghiệp vụ đồ án như đề tài, đăng ký đề tài, đề cương, bảo vệ, phản biện, hội đồng, chấm điểm hoặc lưu trữ hồ sơ.

## 2. Công nghệ sử dụng

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Fetch API wrapper

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- RBAC Authorization
- bcryptjs
- Swagger/OpenAPI
- class-validator
- class-transformer

### Infrastructure

- PostgreSQL
- Redis
- MinIO
- Docker
- Docker Compose
- Nginx

## 3. Cấu trúc thư mục

```text
graduation-project-management/
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── exceptions/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── responses/
│   │   │   └── types/
│   │   ├── modules/
│   │   │   ├── audit-logs/
│   │   │   ├── auth/
│   │   │   ├── health/
│   │   │   ├── roles/
│   │   │   └── users/
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── types/
│   ├── Dockerfile
│   └── .env.example
├── nginx/
├── docker-compose.yml
├── COMMIT_NOTES.md
├── INSTALL_RUN_COMMANDS.md
├── SPRINT1_SUMMARY.md
├── TEST_CASES_SPRINT1.md
└── README.md
```

## 4. Yêu cầu cài đặt

- Node.js 20+
- Docker
- Docker Compose

## 5. Chạy toàn bộ hệ thống bằng Docker Compose

Từ thư mục root:

```bash
cp .env.example .env
docker compose up -d --build
```

Kiểm tra container:

```bash
docker compose ps
```

## 6. Chạy migration và seed dữ liệu Sprint 1

Sau khi container chạy:

```bash
docker compose exec backend npx prisma migrate dev --name sprint_1_auth_user_role
docker compose exec backend npm run prisma:seed
```

Nếu muốn chạy backend riêng ở local, xem mục 7.

## 7. Chạy backend riêng

```bash
docker compose up -d postgres redis minio
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name sprint_1_auth_user_role
npm run prisma:seed
npm run start:dev
```

Backend chạy tại:

```text
http://localhost:8080/api
```

Health check:

```text
http://localhost:8080/api/health
```

Swagger:

```text
http://localhost:8080/api/docs
```

## 8. Chạy frontend riêng

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:3000
```

## 9. Tài khoản demo

Các tài khoản này chỉ dùng cho môi trường development/demo.

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@example.com | Admin@123456 |
| STUDENT | student@example.com | Student@123456 |
| SUPERVISOR | supervisor@example.com | Supervisor@123456 |
| FACULTY_MANAGER | faculty@example.com | Faculty@123456 |

## 10. URL truy cập

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Dashboard | http://localhost:3000/dashboard |
| Admin Users | http://localhost:3000/admin/users |
| Backend health | http://localhost:8080/api/health |
| Swagger | http://localhost:8080/api/docs |
| Nginx reverse proxy | http://localhost |
| MinIO Console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

MinIO mặc định:

```text
Username: minioadmin
Password: minioadmin123
```

## 11. API Sprint 1 chính

| Method | Endpoint | Role |
|---|---|---|
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Authenticated |
| GET | /api/users | ADMIN |
| GET | /api/users/:id | ADMIN |
| POST | /api/users | ADMIN |
| PATCH | /api/users/:id | ADMIN |
| PATCH | /api/users/:id/lock | ADMIN |
| PATCH | /api/users/:id/unlock | ADMIN |
| PATCH | /api/users/:id/roles | ADMIN |
| GET | /api/roles | ADMIN |
| POST | /api/roles | ADMIN |
| PATCH | /api/roles/:id | ADMIN |
| GET | /api/audit-logs | ADMIN |

## 12. Test nhanh API bằng curl

Đăng nhập admin:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}'
```

Lấy profile, thay `<TOKEN>` bằng accessToken:

```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

Lấy danh sách user:

```bash
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer <TOKEN>"
```

## 13. Dừng hệ thống

```bash
docker compose down
```

Xóa cả volume dữ liệu:

```bash
docker compose down -v
```

## 14. Lưu ý bảo mật

- Không commit file `.env` thật.
- Không dùng `JWT_SECRET=change-me-in-production` khi triển khai thật.
- Không dùng mật khẩu demo trong production.
- Không public MinIO bucket trong môi trường production.
- Sprint 1 lưu token ở localStorage để phục vụ demo môn học; production nên cân nhắc httpOnly cookie.

---

## Sprint 1 Hotfix: backend restart, Prisma drift and seed error

If the backend container is restarting, or Prisma reports migration drift, or seed fails with `Unknown file extension ".ts"`, run the clean development reset below.

> This removes local Docker volumes. Use only for development/demo.

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

Check backend:

```bash
curl http://localhost:8080/api/health
```

Check logs if needed:

```bash
docker logs gpm_backend --tail=200
```

---

## Hotfix v2: backend Restarting vì `/app/dist/main.js`

Nếu backend container bị restart và log có lỗi:

```text
Error: Cannot find module '/app/dist/main.js'
```

bản này đã sửa `backend/Dockerfile` để hỗ trợ cả `dist/main.js` và `dist/src/main.js`.

Chạy lại từ đầu:

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
