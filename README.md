# Graduation Project Management System

## 1. Tên dự án

Phát triển phần mềm quản lý đồ án tốt nghiệp.

## 2. Mô tả hệ thống

Graduation Project Management System là web application hỗ trợ quản lý tập trung quy trình đồ án tốt nghiệp của sinh viên, từ mở đợt đồ án, xét đủ điều kiện, tạo/duyệt/công bố đề tài, đăng ký đề tài, phân công GVHD, nộp đề cương, cập nhật tiến độ, đăng ký bảo vệ, phản biện, hội đồng, lịch bảo vệ, kiểm tra hồ sơ, nhập điểm, công bố kết quả, chỉnh sửa sau bảo vệ, lưu trữ và khóa hồ sơ.

Hệ thống không quản lý chi tiết quy trình thực tập tốt nghiệp. Trạng thái đã hoàn thành thực tập chỉ được dùng làm điều kiện đầu vào để xét sinh viên đủ điều kiện làm đồ án.

## 3. Công nghệ sử dụng

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- RBAC Authorization
- Swagger/OpenAPI
- MinIO SDK

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Table style tables where needed

### Database, storage và DevOps

- PostgreSQL
- Redis
- MinIO
- Docker
- Docker Compose
- Nginx reverse proxy nếu bật

## 4. Kiến trúc

- Client-Server Architecture
- Modular Monolith
- Layered Architecture
- REST API
- RBAC-based security

## 5. Cấu trúc thư mục

```text
graduation-project-management-sprint9/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── common/
│       ├── modules/
│       └── main.ts
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── services/
│       ├── schemas/
│       └── types/
├── nginx/
├── docs/
├── docker-compose.yml
├── .env.example
└── README.md
```

## 6. Cấu hình môi trường

Copy env example nếu muốn chạy local không qua Docker:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Các biến quan trọng:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/graduation_project_db?schema=public
JWT_SECRET=change_me_in_production
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MAX_FILE_SIZE_MB=50
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/zip,application/x-zip-compressed
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_MAX_FILE_SIZE_MB=50
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.ppt,.pptx,.zip
```

Không commit file `.env` thật.

## 7. Chạy bằng Docker Compose

Chạy sạch từ đầu trong môi trường development/demo:

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

URL:

```text
Frontend:       http://localhost:3000
Backend health: http://localhost:8080/api/health
Swagger:        http://localhost:8080/api/docs
MinIO Console:  http://localhost:9001
```

## 8. Chạy backend riêng

```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

## 9. Chạy frontend riêng

```bash
cd frontend
npm install
npm run dev
```

## 10. Migration

```bash
cd backend
npx prisma migrate deploy
```

Trong Docker:

```bash
docker compose run --rm backend npx prisma migrate deploy
```

## 11. Seed data

```bash
cd backend
npm run prisma:seed
```

Trong Docker:

```bash
docker compose run --rm backend npm run prisma:seed
```

Seed được thiết kế idempotent, có thể chạy nhiều lần để cập nhật dữ liệu demo mà không tạo trùng bản ghi quan trọng.

## 12. Tài khoản demo

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@example.com` | `Admin@123456` |
| STUDENT | `student@example.com` | `Student@123456` |
| SUPERVISOR | `supervisor@example.com` | `Supervisor@123456` |
| REVIEWER | `reviewer@example.com` | `Reviewer@123456` |
| FACULTY_MANAGER | `faculty@example.com` | `Faculty@123456` |
| COUNCIL_MEMBER | `council@example.com` | `Council@123456` |
| COUNCIL_SECRETARY | `secretary@example.com` | `Secretary@123456` |
| ARCHIVE_STAFF | `archive@example.com` | `Archive@123456` |

## 13. Luồng demo end-to-end

1. ADMIN đăng nhập và kiểm tra user/role.
2. FACULTY_MANAGER mở đợt đồ án và lập danh sách sinh viên đủ điều kiện.
3. SUPERVISOR tạo đề tài.
4. FACULTY_MANAGER duyệt và công bố đề tài.
5. STUDENT xem đề tài và đăng ký/đề xuất đề tài.
6. SUPERVISOR đồng ý hướng dẫn nếu có yêu cầu.
7. FACULTY_MANAGER xác nhận đề tài và GVHD chính thức.
8. STUDENT nộp đề cương.
9. SUPERVISOR duyệt hoặc yêu cầu chỉnh sửa đề cương.
10. STUDENT cập nhật tiến độ.
11. SUPERVISOR góp ý tiến độ.
12. STUDENT đăng ký bảo vệ và upload báo cáo/slide.
13. SUPERVISOR xác nhận điều kiện bảo vệ và nhập điểm GVHD.
14. FACULTY_MANAGER phân công GVPB.
15. REVIEWER nhận xét, nhập điểm phản biện và xác nhận đủ điều kiện.
16. FACULTY_MANAGER tạo hội đồng bảo vệ.
17. FACULTY_MANAGER thêm chủ tịch, thư ký và thành viên.
18. FACULTY_MANAGER lập lịch bảo vệ.
19. STUDENT xem lịch bảo vệ.
20. STUDENT nộp hồ sơ bảo vệ chính thức nếu cần.
21. COUNCIL_SECRETARY kiểm tra và xác nhận hồ sơ hợp lệ.
22. COUNCIL_SECRETARY hoặc COUNCIL_MEMBER nhập điểm hội đồng.
23. Hệ thống tính điểm hội đồng trung bình và điểm tổng kết.
24. FACULTY_MANAGER xác nhận và công bố kết quả.
25. STUDENT xem kết quả.
26. Nếu PASSED_WITH_REVISION, STUDENT nộp bản chỉnh sửa.
27. FACULTY_MANAGER hoặc người có quyền duyệt bản chỉnh sửa.
28. STUDENT nộp hồ sơ lưu trữ.
29. ARCHIVE_STAFF kiểm tra, yêu cầu bổ sung nếu thiếu, duyệt và hoàn tất lưu trữ.
30. ARCHIVE_STAFF khóa hồ sơ.
31. Hồ sơ đã khóa chỉ được tra cứu, không được chỉnh sửa.

## 14. Cách test upload file

1. Login đúng role có quyền upload.
2. Upload file PDF/DOC/DOCX/PPT/PPTX/ZIP tùy màn hình.
3. Kiểm tra metadata trong PostgreSQL:

```bash
docker compose exec postgres psql -U postgres -d graduation_project_db -c "SELECT id, original_name, type, owner_id, created_at FROM file_documents ORDER BY created_at DESC LIMIT 10;"
```

4. Kiểm tra object trong MinIO Console: `http://localhost:9001`.
5. Thử download bằng user đúng quyền và user sai quyền.

## 15. Swagger

Truy cập:

```text
http://localhost:8080/api/docs
```

Sau khi login lấy access token, bấm `Authorize` và nhập:

```text
Bearer <access_token>
```

## 16. MinIO

```text
Console: http://localhost:9001
User:    minioadmin
Pass:    minioadmin
```

Bucket không nên public. Frontend không được nhận MinIO secret.

## 17. Dừng hệ thống

Dừng container, giữ dữ liệu:

```bash
docker compose down
```

Dừng container và xóa volume development:

```bash
docker compose down -v
```

Không dùng `down -v` trên dữ liệu thật.

## 18. Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| Không có container `gpm_backend` | Backend build fail | Xem log build, sửa lỗi TypeScript/Prisma |
| `curl localhost:8080/api/health` fail | Backend chưa chạy hoặc port bị chiếm | `docker compose ps`, `docker compose logs backend` |
| Prisma migration drift | Database dev cũ không khớp migration | Dev có thể `docker compose down -v` rồi migrate lại |
| Student không đăng ký đề tài được | Thiếu student profile hoặc eligibility | Kiểm tra bảng `students`, `student_eligibilities` |
| Chưa có đề tài công bố | Không có topic PUBLISHED | Publish topic bằng Faculty Manager |
| File upload bị từ chối | Sai type hoặc vượt size | Kiểm tra `ALLOWED_FILE_TYPES`, `MAX_FILE_SIZE_MB` |
| 403 Forbidden | Sai role hoặc ownership | Kiểm tra token/user role và dữ liệu liên kết |
| PROJECT_RECORD_LOCKED | Hồ sơ đã khóa | Chỉ được tra cứu, không sửa |

## 19. Checklist trước khi kiểm thử

- [ ] Docker Compose chạy được.
- [ ] Backend health OK.
- [ ] Frontend truy cập được.
- [ ] Swagger truy cập được.
- [ ] PostgreSQL/Redis/MinIO running.
- [ ] Migration chạy từ database trống.
- [ ] Seed chạy được nhiều lần.
- [ ] Login được tất cả role demo.
- [ ] RBAC sai role bị 403.
- [ ] Ownership sai bị chặn.
- [ ] Upload/download file hoạt động.
- [ ] Audit log ghi thao tác quan trọng.
- [ ] Notification hiển thị theo user.
- [ ] Luồng end-to-end có thể demo.
- [ ] Hồ sơ LOCKED không thể chỉnh sửa.
- [ ] Không commit `.env` thật.

## 20. Tài liệu Sprint 9

- `SPRINT9_SUMMARY.md`
- `docs/INTEGRATION_PLAN_SPRINT9.md`
- `docs/WORKFLOW_STATE_TRANSITIONS.md`
- `docs/RBAC_OWNERSHIP_MATRIX.md`
- `docs/API_REVIEW_SPRINT9.md`
- `docs/DATABASE_MIGRATION_REVIEW.md`
- `docs/FRONTEND_REVIEW_SPRINT9.md`
- `docs/FILE_STORAGE_REVIEW.md`
- `docs/AUDIT_NOTIFICATION_REVIEW.md`
- `docs/DOCKER_ENV_REVIEW.md`
- `docs/SEED_DATA_DEMO.md`
- `docs/SMOKE_TEST_SPRINT9.md`
- `docs/BUG_FIXING_LIST.md`
- `docs/CODE_FREEZE_CHECKLIST.md`

## 21. Ghi chú code freeze

Sprint 9 là bản MVP code freeze trước Giai đoạn 7. Không thêm chức năng lớn mới sau thời điểm này nếu chưa được ghi nhận là change request. Các lỗi phát hiện trong Giai đoạn 7 cần được phân loại thành blocker, major, minor hoặc improvement.

## Eligibility and Council Validation Patch

Bản vá này bổ sung hai nhóm kiểm tra nghiệp vụ:

1. **Kiểm tra điều kiện làm đồ án bằng dữ liệu nhập thủ công**: khi Admin tạo tài khoản sinh viên, hệ thống cho nhập mã sinh viên, lớp, ngành, đợt đồ án, thực tập, trạng thái học vụ, số tín chỉ đã tích lũy, số tín chỉ yêu cầu, GPA/CPA, nợ môn tiên quyết, nợ học phí và tình trạng kỷ luật. Backend tự tạo hồ sơ sinh viên và bản ghi xét điều kiện trong `student_eligibilities`.
2. **Kiểm tra hội đồng bảo vệ**: một hội đồng tối đa 6 đề tài khi xếp lịch, khi chốt/đóng hội đồng phải có từ 4 đến 6 đề tài, đồng thời kiểm tra xung đột thời gian nếu thành viên tham gia nhiều hội đồng.
...
Các trang liên quan:

```text
/admin/users
/faculty/student-eligibilities
/faculty/councils
/faculty/defense-schedules
```
