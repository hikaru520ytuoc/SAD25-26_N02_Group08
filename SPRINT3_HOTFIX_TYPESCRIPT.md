# Sprint 3 Hotfix - TypeScript build errors in Topic Registration workflow

## Vấn đề

Khi chạy Docker build backend ở Sprint 3, NestJS build dừng tại `npm run build` với các lỗi TypeScript trong file:

`backend/src/modules/topic-registrations/topic-registrations.service.ts`

Các lỗi chính:

- `TS2322: Type 'PENDING' is not assignable to type 'NOT_REQUIRED'`
- `TS2322: Type 'PENDING_SUPERVISOR' is not assignable to type 'PENDING_FACULTY'`
- `TS2322: Type 'STUDENT_REQUESTED | FACULTY_ASSIGNED' is not assignable to type 'TOPIC_OWNER'`
- `TS2339: Property 'user' does not exist on type Student`

## Nguyên nhân

TypeScript suy luận một số biến enum thành literal type quá hẹp, ví dụ biến khởi tạo bằng `SupervisorResponseStatus.NOT_REQUIRED` bị hiểu là chỉ có thể nhận đúng giá trị `NOT_REQUIRED`. Khi gán sang `PENDING`, TypeScript báo lỗi.

Ngoài ra, object `registration.student` không được Prisma type inference giữ đầy đủ relation `user` khi dùng include helper, nên truy cập `registration.student.user.fullName` gây lỗi build.

## Cách sửa

- Khai báo type rõ ràng cho các biến workflow:
  - `let supervisorResponseStatus: SupervisorResponseStatus`
  - `let status: TopicRegistrationStatus`
  - `let assignmentType: SupervisorAssignmentType`
- Khi tạo notification cho supervisor, lấy tên sinh viên bằng truy vấn `user.findUnique()` dựa trên `registration.student.userId`, thay vì truy cập trực tiếp relation có thể bị mất type.

## File đã sửa

- `backend/src/modules/topic-registrations/topic-registrations.service.ts`

## Lệnh chạy lại

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

## Commit gợi ý

```text
fix(sprint-3): fix TypeScript build errors in topic registration workflow

- Fix enum literal type inference errors in topic registration service
- Explicitly type supervisor response status, registration status and assignment type variables
- Fix student notification message by querying student user profile explicitly
- Keep Sprint 3 workflow and business rules unchanged
- Add troubleshooting notes for backend Docker build failure
```
