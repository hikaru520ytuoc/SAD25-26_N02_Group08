# Hệ thống quản lý đồ án tốt nghiệp

## 1. Mô tả ngắn

Dự án **Hệ thống quản lý đồ án tốt nghiệp** là web application hỗ trợ quản lý quy trình đồ án tốt nghiệp của sinh viên. Sprint 0 chỉ khởi tạo nền tảng kỹ thuật gồm frontend, backend, database, Redis, MinIO, Docker Compose, Prisma và Swagger. Sprint 0 chưa triển khai đăng nhập, phân quyền hoặc nghiệp vụ đồ án.

## 2. Công nghệ sử dụng

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod
- Axios hoặc fetch wrapper

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
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
│   │   ├── prisma/
│   │   └── modules/health/
│   ├── prisma/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
├── README.md
└── .gitignore
```

## 4. Yêu cầu cài đặt

- Node.js 20+
- Docker
- Docker Compose

## 5. Chạy toàn bộ hệ thống bằng Docker Compose

Từ thư mục root:

```bash
docker compose up -d --build
```

Kiểm tra container:

```bash
docker compose ps
```

Xem log backend:

```bash
docker compose logs -f backend
```

Xem log frontend:

```bash
docker compose logs -f frontend
```

## 6. Chạy backend riêng

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
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

## 7. Chạy frontend riêng

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

## 8. Prisma setup

Sprint 0 chưa có model nghiệp vụ. Prisma được cấu hình để kết nối PostgreSQL và kiểm tra database qua API health.

Generate Prisma Client:

```bash
cd backend
npx prisma generate
```

Khi Sprint 1 bắt đầu và có model đầu tiên, chạy migration:

```bash
npx prisma migrate dev --name init
```

Mở Prisma Studio nếu cần:

```bash
npx prisma studio
```

## 9. Truy cập các service

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
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

## 10. Dừng hệ thống

```bash
docker compose down
```

Xóa cả volume dữ liệu:

```bash
docker compose down -v
```

## 11. Lưu ý bảo mật

- Không commit file `.env` thật.
- Không dùng mật khẩu mặc định khi triển khai thật.
- Không public MinIO bucket trong môi trường production.
- Không để lộ stack trace trong response lỗi production.
- Sprint 1 sẽ bổ sung Auth, User, Role, JWT và RBAC.

## 12. Phạm vi Sprint 0

Đã làm:

- Khởi tạo cấu trúc frontend/backend.
- Cấu hình Docker Compose.
- Cấu hình PostgreSQL, Redis, MinIO.
- Cấu hình Prisma.
- Tạo Health API.
- Cấu hình Swagger.
- Tạo frontend placeholder.

Chưa làm:

- Auth/User/Role/RBAC.
- Nghiệp vụ đăng ký đề tài.
- Nghiệp vụ đề cương.
- Nghiệp vụ bảo vệ, phản biện, chấm điểm.
- Nghiệp vụ chỉnh sửa và lưu trữ hồ sơ.
