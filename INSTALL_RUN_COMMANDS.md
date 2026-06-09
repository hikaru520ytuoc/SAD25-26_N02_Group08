# Install and Run Commands - Sprint 5

## Chạy bằng Docker Compose

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

## URLs

- Frontend: http://localhost:3000
- Swagger: http://localhost:8080/api/docs
- MinIO Console: http://localhost:9001
- Student Defense Registration: http://localhost:3000/student/defense-registration
- Supervisor Defense Review: http://localhost:3000/supervisor/defense-registrations
- Faculty Reviewer Assignment: http://localhost:3000/faculty/reviewer-assignments
- Reviewer Assignments: http://localhost:3000/reviewer/assignments

## Demo accounts

- student@example.com / Student@123456
- supervisor@example.com / Supervisor@123456
- faculty@example.com / Faculty@123456
- reviewer@example.com / Reviewer@123456
- admin@example.com / Admin@123456
