# Install and Run Commands - Sprint 7

## Docker clean run

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

## Kiểm tra

```bash
docker compose ps
curl http://localhost:8080/api/health
```

## Nếu backend lỗi

```bash
docker logs gpm_backend --tail=200
```

## URL Sprint 7

- Secretary council scoring: http://localhost:3000/secretary/council-scoring
- Council member scoring: http://localhost:3000/council/my-scores
- Faculty results: http://localhost:3000/faculty/results
- Student result: http://localhost:3000/student/result
- Swagger: http://localhost:8080/api/docs

## Demo accounts

- secretary@example.com / Secretary@123456
- council@example.com / Council@123456
- faculty@example.com / Faculty@123456
- student@example.com / Student@123456
