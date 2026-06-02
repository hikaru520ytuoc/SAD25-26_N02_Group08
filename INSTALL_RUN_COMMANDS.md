# Sprint 1 — Installation and Run Commands

## 1. Chạy toàn bộ bằng Docker Compose

```bash
cp .env.example .env
docker compose up -d --build
```

## 2. Chạy migration và seed trong container backend

```bash
docker compose exec backend npx prisma migrate dev --name sprint_1_auth_user_role
docker compose exec backend npm run prisma:seed
```

Nếu backend container đang chạy production mode và không có interactive TTY, có thể chạy local backend theo mục 3.

## 3. Chạy backend riêng ở máy local

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

## 4. Chạy frontend riêng ở máy local

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## 5. URL kiểm tra

```text
Frontend:        http://localhost:3000
Login:           http://localhost:3000/login
Dashboard:       http://localhost:3000/dashboard
Admin users:     http://localhost:3000/admin/users
Backend health:  http://localhost:8080/api/health
Swagger:         http://localhost:8080/api/docs
MinIO Console:   http://localhost:9001
```

## 6. Tài khoản demo

```text
Admin:           admin@example.com / Admin@123456
Student:         student@example.com / Student@123456
Supervisor:      supervisor@example.com / Supervisor@123456
Faculty Manager: faculty@example.com / Faculty@123456
```

## 7. Dừng hệ thống

```bash
docker compose down
```

## 8. Xóa volume dữ liệu nếu cần reset database

```bash
docker compose down -v
```
