# Install and run commands

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

Check services:

```bash
docker compose ps
curl http://localhost:8080/api/health
```

View logs if needed:

```bash
docker compose logs backend --tail=200
docker compose logs frontend --tail=200
```
