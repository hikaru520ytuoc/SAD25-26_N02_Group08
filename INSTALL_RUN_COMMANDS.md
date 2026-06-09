# Install and Run Commands - Sprint 3

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

## URL

```text
Frontend:                         http://localhost:3000
Swagger:                          http://localhost:8080/api/docs
Student topic registration:        http://localhost:3000/student/topic-registration
Supervisor registration requests:  http://localhost:3000/supervisor/registration-requests
Faculty topic registrations:       http://localhost:3000/faculty/topic-registrations
Faculty supervisor assignments:    http://localhost:3000/faculty/supervisor-assignments
Supervisor my students:            http://localhost:3000/supervisor/my-students
Student supervisor assignment:     http://localhost:3000/student/supervisor-assignment
Notifications:                     http://localhost:3000/notifications
```

## Demo accounts

```text
Admin:            admin@example.com / Admin@123456
Student:          student@example.com / Student@123456
Supervisor 1:     supervisor@example.com / Supervisor@123456
Supervisor 2:     supervisor2@example.com / Supervisor2@123456
Faculty Manager:  faculty@example.com / Faculty@123456
```

## Demo flow Sprint 3

1. Login Student: `student@example.com`.
2. Mở `/student/topic-registration`.
3. Đăng ký topic PUBLISHED hoặc đề xuất topic mới.
4. Nếu đề xuất GVHD, login Supervisor tương ứng và mở `/supervisor/registration-requests` để accept/reject.
5. Login Faculty Manager và mở `/faculty/topic-registrations`.
6. Phân công GVHD nếu cần, sau đó Confirm.
7. Student mở `/student/supervisor-assignment` để xem GVHD chính thức.
8. Supervisor mở `/supervisor/my-students` để xem sinh viên hướng dẫn.
