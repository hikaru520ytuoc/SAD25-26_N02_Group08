# Install and run Sprint 8

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

Nếu backend lỗi:

```bash
docker logs gpm_backend --tail=200
```
