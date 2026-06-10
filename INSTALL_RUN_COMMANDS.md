# Sprint 9 - Lệnh cài đặt và chạy

## Chạy sạch bằng Docker Compose

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

## Kiểm tra hệ thống

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

## URL

```text
Frontend:       http://localhost:3000
Backend health: http://localhost:8080/api/health
Swagger:        http://localhost:8080/api/docs
MinIO Console:  http://localhost:9001
```

## Chạy riêng backend

```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

## Chạy riêng frontend

```bash
cd frontend
npm install
npm run dev
```
