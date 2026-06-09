# Sprint 4 Hotfix - Prisma Schema Duplicate Relations

## Lỗi gặp phải

Khi chạy Docker build backend, bước `npx prisma generate` dừng với lỗi Prisma P1012:

```text
Field "outlines" is already defined on model "Student".
Field "projectProgresses" is already defined on model "Student".
```

Nguyên nhân là trong `backend/prisma/schema.prisma`, model `Student` bị khai báo trùng 2 relation field:

```prisma
outlines          Outline[]
projectProgresses ProjectProgress[]
outlines          Outline[]
projectProgresses ProjectProgress[]
```

## Cách sửa

Giữ lại mỗi relation đúng một lần:

```prisma
model Student {
  ...
  supervisorAssignments SupervisorAssignment[]
  outlines              Outline[]
  projectProgresses     ProjectProgress[]
  proposedTopics        Topic[] @relation("TopicProposedByStudent")
}
```

## Lệnh chạy lại

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

Nếu backend vẫn lỗi runtime:

```bash
docker logs gpm_backend --tail=200
```
