# Fix lỗi backend Restarting: Cannot find module /app/dist/main.js

## Nguyên nhân

Backend build thành công nhưng NestJS output trong Docker có thể nằm ở:

- `dist/main.js`, hoặc
- `dist/src/main.js`

Dockerfile cũ chạy cố định:

```bash
node dist/main.js
```

nên nếu file thực tế là `dist/src/main.js`, container sẽ restart liên tục và log báo:

```text
Error: Cannot find module '/app/dist/main.js'
```

## Cách sửa trong bản này

`backend/Dockerfile` đã được sửa để tự kiểm tra cả 2 vị trí:

```bash
if [ -f dist/main.js ]; then node dist/main.js;
elif [ -f dist/src/main.js ]; then node dist/src/main.js;
else find dist -maxdepth 3 -type f; exit 1;
fi
```

## Lệnh chạy lại sạch

Chạy từ thư mục gốc project:

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
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}'
```
