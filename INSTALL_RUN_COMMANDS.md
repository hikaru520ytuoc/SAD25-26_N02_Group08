# Install and Run Commands - Sprint 4

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

## Log khi lỗi

```bash
docker logs gpm_backend --tail=200
docker compose logs -f backend
```

## URL

- Frontend: http://localhost:3000
- Swagger: http://localhost:8080/api/docs
- Student outline: http://localhost:3000/student/outline
- Supervisor outlines: http://localhost:3000/supervisor/outlines
- Student progress: http://localhost:3000/student/progress
- Supervisor progress: http://localhost:3000/supervisor/progress
- MinIO console: http://localhost:9001

## Tài khoản demo

- student@example.com / Student@123456
- supervisor@example.com / Supervisor@123456
- faculty@example.com / Faculty@123456
- admin@example.com / Admin@123456

## Luồng demo Sprint 4

1. Login student@example.com.
2. Vào `/student/outline`, upload file và nộp đề cương.
3. Login supervisor@example.com.
4. Vào `/supervisor/outlines`, yêu cầu chỉnh sửa hoặc duyệt đề cương.
5. Nếu yêu cầu chỉnh sửa, student nộp lại đề cương.
6. Supervisor duyệt đề cương.
7. Student vào `/student/progress` cập nhật tiến độ và upload tài liệu.
8. Supervisor vào `/supervisor/progress` góp ý tiến độ.
