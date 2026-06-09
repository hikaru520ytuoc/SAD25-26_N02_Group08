# Sprint 6 install and run commands

## Docker clean run

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

## Check

```bash
docker compose ps
curl http://localhost:8080/api/health
```

## Demo accounts

```text
faculty@example.com / Faculty@123456
student@example.com / Student@123456
council@example.com / Council@123456
secretary@example.com / Secretary@123456
reviewer@example.com / Reviewer@123456
```
