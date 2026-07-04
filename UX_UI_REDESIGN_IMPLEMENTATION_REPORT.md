# Báo cáo triển khai tái thiết kế UX/UI tổng thể

## 1. Phạm vi đã kiểm tra trước khi sửa

- Frontend: Next.js 15 App Router, TypeScript, Tailwind CSS, React Hook Form và Zod.
- Backend: NestJS, Prisma ORM, PostgreSQL, JWT/RBAC và MinIO.
- Cơ chế gọi API: service layer dùng access token hiện tại; source không dùng React Query/SWR.
- Cache/state: giữ kiến trúc hiện có, chuẩn hóa refetch cục bộ và cập nhật state an toàn sau mutation thay vì đưa thêm thư viện cache mới.
- Prisma schema, migrations, seed, route, enum và quan hệ nghiệp vụ đã được đọc trước khi sửa.
- Không xóa migration/dữ liệu cũ; không thêm migration vì thay đổi này không yêu cầu field/model/index mới.

## 2. Tóm tắt thay đổi

- Xây dựng design system dùng chung cho các màn hình danh sách, chi tiết, form, xác nhận, lý do, file, trạng thái và phản hồi thao tác.
- Tái thiết kế các module từ Quản lý đợt đồ án đến điều kiện học vụ, đăng ký đợt, đề tài, phân công GVHD, đề cương, tiến độ, bảo vệ, phản biện, hội đồng, lịch, hồ sơ, điểm, kết quả, revision, archive và notification.
- Form dài chỉ xuất hiện sau hành động chủ động; form tạo mới khởi tạo rỗng và reset sau thành công.
- Card danh sách chỉ giữ thông tin nhận diện, dữ liệu quan trọng, trạng thái và “Xem chi tiết”.
- Hành động theo đúng trạng thái; có confirm/reason modal, loading, chống double submit, toast và đồng bộ state/list/detail/stats.
- Sửa lỗi `AUTH_UNAUTHORIZED` khi xem/tải file bằng signed URL có kiểm tra quyền quan hệ nghiệp vụ.
- Bổ sung test policy và guardrail, lint config và scripts test/typecheck.

## 3. Module frontend đã tái thiết kế

1. Quản lý đợt đồ án và chi tiết sinh viên/đề tài trong đợt.
2. Điều kiện học vụ và sinh viên đăng ký đợt.
3. Đề tài GVHD, duyệt/công bố đề tài và danh sách đề tài công bố.
4. Sinh viên đăng ký đề tài theo hai lựa chọn; yêu cầu hướng dẫn; Khoa xử lý đăng ký.
5. Phân công GVHD chính thức và danh sách sinh viên hướng dẫn.
6. Nộp/duyệt đề cương và lịch sử phiên bản.
7. Cập nhật/phản hồi tiến độ.
8. Đăng ký/xác nhận bảo vệ và điểm GVHD.
9. Phân công/phản biện hồ sơ.
10. Hội đồng, thành viên, lịch bảo vệ và kiểm tra xung đột theo API hiện có.
11. Thư ký kiểm tra hồ sơ và nhập điểm hội đồng.
12. Tạo/xác nhận/công bố kết quả.
13. Chỉnh sửa sau bảo vệ.
14. Lưu trữ, hoàn tất và khóa hồ sơ.
15. Notification center và dropdown thông báo.

## 4. Component dùng chung mới/chuẩn hóa

- `PageHeader`
- `SummaryStatCard`
- `FilterBar`
- `SearchInput`
- `StatusBadge`
- `CompactEntityCard`
- `DetailDrawer`
- `ConfirmActionModal`
- `ReasonModal`
- `FormModal`
- `FileCard`
- `FileActions`
- `FileViewerModal`
- `HistoryTimeline`
- `WorkflowStepper`
- `LoadingSkeleton`
- `EmptyState`
- `ErrorState`
- `Pagination`
- `DropdownSelect`
- `VietnameseDateInput`
- `ToastProvider`

## 5. Endpoint mới

- `GET /api/files/:id/access-url?mode=preview|download`
- `GET /api/project-periods/:id/students`
- `GET /api/project-periods/:id/topics`
- `PATCH /api/project-periods/:id/extend`
- `DELETE /api/project-periods/:id` — chỉ xóa bản nháp trống theo kiểm tra backend.
- `GET /api/topic-registrations/supervisor/requests`

Các endpoint cũ được giữ nguyên. Một số response/service cũ được mở rộng để trả thống kê, sức chứa, workflow và quan hệ cần thiết cho màn hình chi tiết.

## 6. Sửa lỗi xem/tải file

- Frontend không còn mở trực tiếp `/api/files/{fileId}/download` bằng `window.open` hoặc anchor.
- Request signed URL đi qua API có bearer token hiện tại.
- Backend kiểm tra metadata, soft delete, object key và quan hệ người dùng trước khi tạo URL.
- Signed URL có TTL cấu hình bằng `FILE_SIGNED_URL_TTL_SECONDS` (mặc định 180 giây, giới hạn 60–300 giây trong service).
- Preview/download có `Content-Type` và `Content-Disposition` phù hợp.
- Ảnh/TXT có viewer modal; PDF mở tab signed URL; ZIP và file không hỗ trợ chỉ tải xuống.
- Có fallback Blob với Authorization nếu signed URL không dùng được.

## 7. Ánh xạ trạng thái tiếng Việt

- DRAFT → Bản nháp
- OPEN → Đang mở
- CLOSED → Đã đóng
- ARCHIVED → Đã lưu trữ
- PUBLISHED → Đã công bố
- LOCKED → Đã khóa
- SUBMITTED/PENDING → Chờ xử lý
- IN_PROGRESS → Đang xử lý
- APPROVED → Đã duyệt
- CONFIRMED → Đã xác nhận
- COMPLETED → Đã hoàn tất
- REJECTED → Đã từ chối
- NEEDS_REVISION → Cần chỉnh sửa
- NEEDS_SUPPLEMENT → Cần bổ sung
- PENDING_SUPERVISOR → Chờ GVHD phản hồi
- PENDING_FACULTY → Chờ Khoa xử lý
- OFFICIALLY_ASSIGNED → Đã chốt đề tài & GVHD
- READY_FOR_COUNCIL → Sẵn sàng xếp hội đồng
- DOCUMENT_PENDING → Chờ kiểm tra hồ sơ
- DOCUMENT_APPROVED → Hồ sơ hợp lệ
- PASSED → Đạt
- FAILED → Không đạt
- PASSED_WITH_REVISION → Đạt, cần chỉnh sửa

Ngoài các trạng thái trên, file `frontend/src/lib/status-labels.ts` còn ánh xạ các enum chi tiết của điều kiện, bảo vệ, phản biện, lịch, hồ sơ, revision và archive. Enum chưa được biết sẽ hiển thị “Trạng thái chưa được ánh xạ”, không lộ chuỗi enum thô.

## 8. Prisma migration

- Không thêm migration.
- Không sửa/xóa migration cũ.
- Không thay đổi model/field/index trong `schema.prisma`.

## 9. Test và kết quả chạy

### Đạt

- Frontend unit/guardrail test: **9/9 đạt**.
  - Chuẩn hóa `dd/MM/yyyy`, paste dạng slash/dash/ISO và validation ngày không hợp lệ.
  - Ánh xạ status tiếng Việt và không lộ enum không biết.
  - Form login khởi tạo rỗng, không hiển thị tài khoản demo.
  - File action dùng signed URL, không mở protected API trực tiếp.
- Backend policy test: **7/7 đạt**.
  - Owner được truy cập file.
  - GVHD/GVPB/thành viên hội đồng liên quan được truy cập.
  - Người không liên quan bị từ chối.
  - Faculty/Admin và Archive Staff tuân theo policy.
  - Điểm hội đồng bị khóa sau khi session hoàn tất.
- `npm run typecheck` frontend: **đạt**.
- `npm run lint` frontend: **đạt**, còn cảnh báo hook dependency và tối ưu ảnh không chặn lint.
- `git diff --check`: **đạt**, không có lỗi whitespace.

### Giới hạn môi trường kiểm thử hiện tại

- `next build` đã **compile và typecheck thành công**, nhưng môi trường thực thi dừng ở `Collecting page data` cho đến khi hết giới hạn 240 giây. Không có lỗi TypeScript/compile được báo trước thời điểm này.
- Backend `nest build` chưa thể xác nhận trong sandbox vì `@prisma/client` chưa được generate. `prisma generate` cần tải Prisma engine từ `binaries.prisma.sh`, nhưng môi trường không có DNS/Internet; do đó TypeScript báo hàng loạt model/enum không tồn tại từ client rỗng. Cần chạy `npm install && npm run prisma:generate` trong máy/Docker có Internet rồi build lại.
- Docker daemon không có trong sandbox nên chưa chạy được `docker compose up/build` end-to-end.
- Chưa bổ sung full browser E2E cho toàn bộ role/workflow; các test mới tập trung vào policy bảo mật và guardrail có rủi ro cao.

## 10. Lệnh cài đặt và chạy

### Docker Compose — khuyến nghị

```bash
docker compose down -v
docker compose build --no-cache backend frontend
docker compose up -d postgres redis minio
docker compose run --rm backend npm run prisma:deploy
docker compose run --rm backend npm run prisma:seed
docker compose up -d --build
```

### Backend local

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run start:dev
```

### Frontend local

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Kiểm thử/build

```bash
cd frontend
npm run test
npm run typecheck
npm run lint
npm run build

cd ../backend
npm run test:policy
npm run build
```

## 11. Commit notes

Chi tiết tại `COMMIT_NOTES_UX_UI_REDESIGN.md`, được chia theo:

- `feat(ui)`
- `feat(workflow)`
- `fix(file-auth)`
- `fix(state-sync)`
- `refactor(shared-components)`
- `test`

## 12. Danh sách file frontend sửa/thêm/xóa

- `frontend/.eslintrc.json` — thêm mới
- `frontend/next-env.d.ts` — sửa
- `frontend/package.json` — sửa
- `frontend/src/app/archive/records/page.tsx` — sửa
- `frontend/src/app/council/my-scores/page.tsx` — sửa
- `frontend/src/app/council/schedules/page.tsx` — sửa
- `frontend/src/app/dashboard/page.tsx` — sửa
- `frontend/src/app/faculty/academic-eligibility/page.tsx` — sửa
- `frontend/src/app/faculty/councils/page.tsx` — sửa
- `frontend/src/app/faculty/defense-schedules/page.tsx` — sửa
- `frontend/src/app/faculty/project-periods/page.tsx` — sửa
- `frontend/src/app/faculty/results/page.tsx` — sửa
- `frontend/src/app/faculty/reviewer-assignments/page.tsx` — sửa
- `frontend/src/app/faculty/revisions/page.tsx` — sửa
- `frontend/src/app/faculty/supervisor-assignments/page.tsx` — sửa
- `frontend/src/app/faculty/topic-registrations/page.tsx` — sửa
- `frontend/src/app/faculty/topics/page.tsx` — sửa
- `frontend/src/app/globals.css` — sửa
- `frontend/src/app/layout.tsx` — sửa
- `frontend/src/app/login/page.tsx` — sửa
- `frontend/src/app/notifications/page.tsx` — sửa
- `frontend/src/app/profile/page.tsx` — sửa
- `frontend/src/app/reviewer/assignments/page.tsx` — sửa
- `frontend/src/app/secretary/council-scoring/page.tsx` — sửa
- `frontend/src/app/secretary/defense-documents/page.tsx` — sửa
- `frontend/src/app/student/archive/page.tsx` — sửa
- `frontend/src/app/student/defense-registration/page.tsx` — sửa
- `frontend/src/app/student/defense-schedule/page.tsx` — sửa
- `frontend/src/app/student/outline/page.tsx` — sửa
- `frontend/src/app/student/progress/page.tsx` — sửa
- `frontend/src/app/student/project-period-registration/page.tsx` — sửa
- `frontend/src/app/student/result/page.tsx` — sửa
- `frontend/src/app/student/revision/page.tsx` — sửa
- `frontend/src/app/student/supervisor-assignment/page.tsx` — sửa
- `frontend/src/app/student/topic-registration/page.tsx` — sửa
- `frontend/src/app/supervisor/defense-registrations/page.tsx` — sửa
- `frontend/src/app/supervisor/my-students/page.tsx` — sửa
- `frontend/src/app/supervisor/outlines/page.tsx` — sửa
- `frontend/src/app/supervisor/progress/page.tsx` — sửa
- `frontend/src/app/supervisor/registration-requests/page.tsx` — sửa
- `frontend/src/app/supervisor/topics/page.tsx` — sửa
- `frontend/src/app/topics/page.tsx` — sửa
- `frontend/src/components/common/compact-entity-card.tsx` — thêm mới
- `frontend/src/components/common/confirm-action-modal.tsx` — thêm mới
- `frontend/src/components/common/confirm-dialog.tsx` — xóa
- `frontend/src/components/common/detail-drawer.tsx` — thêm mới
- `frontend/src/components/common/dropdown-select.tsx` — thêm mới
- `frontend/src/components/common/error-state.tsx` — sửa
- `frontend/src/components/common/file-actions.tsx` — thêm mới
- `frontend/src/components/common/file-card.tsx` — sửa
- `frontend/src/components/common/file-viewer-modal.tsx` — thêm mới
- `frontend/src/components/common/filter-bar.tsx` — thêm mới
- `frontend/src/components/common/form-modal.tsx` — thêm mới
- `frontend/src/components/common/history-timeline.tsx` — thêm mới
- `frontend/src/components/common/loading-skeleton.tsx` — thêm mới
- `frontend/src/components/common/pagination.tsx` — thêm mới
- `frontend/src/components/common/reason-modal.tsx` — thêm mới
- `frontend/src/components/common/search-input.tsx` — thêm mới
- `frontend/src/components/common/status-badge.tsx` — sửa
- `frontend/src/components/common/summary-stat-card.tsx` — thêm mới
- `frontend/src/components/common/vietnamese-date-input.tsx` — thêm mới
- `frontend/src/components/common/workflow-stepper.tsx` — thêm mới
- `frontend/src/components/providers/` — thêm mới
- `frontend/src/components/sprint2/project-period-form.tsx` — sửa
- `frontend/src/components/sprint2/topic-form.tsx` — sửa
- `frontend/src/components/sprint2/topic-table.tsx` — sửa
- `frontend/src/components/sprint3/faculty-registration-table.tsx` — xóa
- `frontend/src/components/sprint3/notification-dropdown.tsx` — sửa
- `frontend/src/components/sprint3/propose-new-topic-form.tsx` — sửa
- `frontend/src/components/sprint3/register-existing-topic-form.tsx` — sửa
- `frontend/src/components/sprint3/student-registration-status-card.tsx` — sửa
- `frontend/src/components/sprint3/supervisor-assignment-table.tsx` — sửa
- `frontend/src/components/sprint3/supervisor-request-table.tsx` — xóa
- `frontend/src/components/sprint3/topic-registration-card.tsx` — thêm mới
- `frontend/src/components/sprint3/topic-registration-detail.tsx` — thêm mới
- `frontend/src/components/sprint4/file-download-button.tsx` — sửa
- `frontend/src/components/sprint4/supervisor-outline-table.tsx` — sửa
- `frontend/src/components/sprint5/defense-registration-form.tsx` — sửa
- `frontend/src/components/sprint5/defense-registration-status-card.tsx` — sửa
- `frontend/src/components/sprint5/file-download-button.tsx` — sửa
- `frontend/src/components/sprint5/reviewer-assignment-table.tsx` — sửa
- `frontend/src/components/sprint5/reviewer-evaluation-form.tsx` — sửa
- `frontend/src/components/sprint5/reviewer-score-form.tsx` — sửa
- `frontend/src/components/sprint5/supervisor-defense-table.tsx` — sửa
- `frontend/src/components/sprint5/supervisor-score-form.tsx` — sửa
- `frontend/src/components/sprint6/council-member-table.tsx` — sửa
- `frontend/src/components/sprint6/defense-file-list.tsx` — sửa
- `frontend/src/components/sprint6/defense-schedule-form.tsx` — sửa
- `frontend/src/components/sprint6/student-defense-schedule-card.tsx` — sửa
- `frontend/src/components/sprint7/council-score-form.tsx` — sửa
- `frontend/src/components/sprint8/archive-complete-dialog.tsx` — xóa
- `frontend/src/components/sprint8/archive-record-table.tsx` — xóa
- `frontend/src/components/sprint8/archive-review-dialog.tsx` — xóa
- `frontend/src/components/sprint8/lock-record-dialog.tsx` — xóa
- `frontend/src/components/sprint8/revision-review-dialog.tsx` — xóa
- `frontend/src/components/users/create-user-form.tsx` — sửa
- `frontend/src/components/users/user-table.tsx` — sửa
- `frontend/src/lib/cn.ts` — thêm mới
- `frontend/src/lib/sidebar-menu.ts` — sửa
- `frontend/src/lib/status-labels.ts` — sửa
- `frontend/src/lib/vietnamese-date.ts` — thêm mới
- `frontend/src/services/files.service.ts` — sửa
- `frontend/src/services/project-periods.service.ts` — sửa
- `frontend/src/services/topic-registrations.service.ts` — sửa
- `frontend/src/services/topics.service.ts` — sửa
- `frontend/src/types/sprint2.ts` — sửa
- `frontend/src/types/sprint8.ts` — sửa
- `frontend/tests/` — thêm mới
- `frontend/tsconfig.json` — sửa

## 13. Danh sách file backend sửa/thêm

- `backend/.env.example` — sửa
- `backend/package.json` — sửa
- `backend/src/modules/defense-schedules/defense-schedules.service.ts` — sửa
- `backend/src/modules/files/dto/file-access-url.dto.ts` — thêm mới
- `backend/src/modules/files/files.controller.ts` — sửa
- `backend/src/modules/files/files.service.ts` — sửa
- `backend/src/modules/files/minio.service.ts` — sửa
- `backend/src/modules/files/policies/` — thêm mới
- `backend/src/modules/project-periods/dto/extend-project-period.dto.ts` — thêm mới
- `backend/src/modules/project-periods/project-periods.controller.ts` — sửa
- `backend/src/modules/project-periods/project-periods.service.ts` — sửa
- `backend/src/modules/scores/policies/` — thêm mới
- `backend/src/modules/scores/scores.service.ts` — sửa
- `backend/src/modules/topic-registrations/topic-registrations.controller.ts` — sửa
- `backend/src/modules/topic-registrations/topic-registrations.service.ts` — sửa
- `backend/src/modules/topics/topics.service.ts` — sửa
- `backend/test/` — thêm mới

## 14. File cấu hình/root sửa/thêm

- `docker-compose.yml` — sửa

## 15. Vấn đề còn tồn tại

1. Cần chạy lại Prisma generate/backend build trên môi trường có Internet hoặc Docker image có Prisma engine cache.
2. Cần chạy frontend production build trên máy không bị giới hạn worker/static page generation để xác nhận bước cuối sau `Collecting page data`.
3. Nên bổ sung Playwright/Cypress E2E cho toàn bộ matrix role × trạng thái × mutation; hiện source chưa có framework E2E browser.
4. Lint còn một số warning không chặn: dependency của hook và tối ưu `<img>` bằng `next/image`.

## 16. Bảo toàn dữ liệu và workflow

- Không xóa dữ liệu/migration/seed cũ.
- Không thay enum backend.
- Không thay cơ chế JWT/RBAC hiện tại.
- Không thêm input UUID thủ công trên UI.
- Không hardcode mock data trên frontend.
- Các thay đổi backend mới đều nằm trong service/controller/policy hiện có và kiểm tra quan hệ trước mutation hoặc truy cập file.
