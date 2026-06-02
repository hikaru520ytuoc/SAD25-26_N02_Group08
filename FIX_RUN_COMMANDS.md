# Sprint 1 Hotfix Run Commands

Tài liệu này sửa 2 lỗi bạn đang gặp:

1. Backend container bị restart nên không `exec` được.
2. Prisma báo migration drift và seed lỗi `Unknown file extension ".ts"`.

## Cách chạy sạch cho môi trường demo/dev

> Lệnh này xóa volume database cũ. Chỉ dùng cho môi trường học tập/demo.

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

## Nếu không muốn xóa volume ngay

Chạy log để xem nguyên nhân backend restart:

```bash
docker logs gpm_backend --tail=200
```

Nếu Prisma báo drift, chạy reset dev database:

```bash
docker compose run --rm backend npx prisma migrate reset --force

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed
```

## Kiểm tra login

Sau khi seed thành công:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}'
```

## Sprint 2 TypeScript Build Hotfix Commands

Use these commands when backend build fails with `TS2345` in `topics.service.ts`.

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build

curl http://localhost:8080/api/health
```
