# Install and Run Commands - Sprint 2

## Clean Docker run for development/demo

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

## Verify services

```bash
docker compose ps
curl http://localhost:8080/api/health
```

## API login test

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty@example.com","password":"Faculty@123456"}'
```

## Local backend run

```bash
docker compose up -d postgres redis minio
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

## Local frontend run

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## URLs

- Frontend: http://localhost:3000
- Backend health: http://localhost:8080/api/health
- Swagger: http://localhost:8080/api/docs
- Faculty project periods: http://localhost:3000/faculty/project-periods
- Faculty eligibilities: http://localhost:3000/faculty/student-eligibilities
- Faculty topic approval: http://localhost:3000/faculty/topics
- Supervisor topics: http://localhost:3000/supervisor/topics
- Student published topics: http://localhost:3000/topics
