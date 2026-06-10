# Docker và môi trường chạy Sprint 9

## Port mặc định

| Service | Port |
|---|---|
| Frontend | `3000` |
| Backend API | `8080` |
| Swagger | `8080/api/docs` |
| PostgreSQL | `5432` |
| Redis | `6379` |
| MinIO API | `9000` |
| MinIO Console | `9001` |

## Chạy sạch từ đầu

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

## Kiểm tra container

```bash
docker compose ps
curl http://localhost:8080/api/health
```

## Xem log

```bash
docker compose logs backend --tail=200
docker compose logs frontend --tail=200
docker compose logs postgres --tail=100
docker compose logs minio --tail=100
```

## Lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| Backend không có container | Build backend fail, xem log build và sửa TypeScript/Prisma |
| Prisma migration drift | Dev local có thể `docker compose down -v`, sau đó migrate deploy lại |
| Cannot find NestJS build entry | Dockerfile/start script đã có fallback `dist/main.js` và `dist/src/main.js` |
| Không connect health | Backend chưa build/chưa up hoặc port 8080 bị chiếm |
