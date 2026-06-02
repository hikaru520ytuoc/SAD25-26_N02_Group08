# Installation and Run Commands

## Quick fix run for Sprint 1

Use this when backend is restarting, Prisma has migration drift, or seed fails with `Unknown file extension ".ts"`.

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

Check:

```bash
docker compose ps
curl http://localhost:8080/api/health
```

## URLs

- Frontend: http://localhost:3000
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard
- Admin Users: http://localhost:3000/admin/users
- Backend Health: http://localhost:8080/api/health
- Swagger: http://localhost:8080/api/docs
- MinIO Console: http://localhost:9001

## Demo accounts

- Admin: admin@example.com / Admin@123456
- Student: student@example.com / Student@123456
- Supervisor: supervisor@example.com / Supervisor@123456
- Faculty Manager: faculty@example.com / Faculty@123456

## Backend local run

```bash
docker compose up -d postgres redis minio
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

## Frontend local run

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

# Hotfix v2: sửa lỗi backend không tìm thấy dist/main.js

Nếu backend bị `Restarting (1)` và log báo:

```text
Error: Cannot find module '/app/dist/main.js'
```

hãy chạy lại sạch:

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build

docker compose ps

curl http://localhost:8080/api/health
```
