# Sprint 9 - Tích hợp tổng thể, ổn định hệ thống và đóng băng mã nguồn

## 1. Mục tiêu

Sprint 9 là sprint ổn định sau Sprint 0-8. Mục tiêu là nối toàn bộ module thành một MVP có thể demo end-to-end và sẵn sàng chuyển sang Giai đoạn 7: Kiểm thử và đánh giá chất lượng phần mềm.

## 2. Phạm vi

- Rà soát tích hợp module từ Auth, Project Period, Topic, Registration, Outline, Progress đến Defense, Result, Revision, Archive và Record Lock.
- Chuẩn hóa checklist workflow, RBAC, ownership, API response, file storage, audit log và notification.
- Chuẩn hóa tài liệu chạy Docker, migration, seed và smoke test.
- Tạo checklist code freeze và tài liệu bàn giao sang giai đoạn kiểm thử.

## 3. Ngoài phạm vi

- Không thêm chức năng nghiệp vụ lớn mới.
- Không thêm export PDF/Excel nâng cao.
- Không thêm dashboard thống kê nâng cao.
- Không thêm email thật, chữ ký số hoặc quy trình thanh toán.
- Không thay đổi kiến trúc Client-Server/Modular Monolith đã chốt.

## 4. Kết quả đầu ra

- Source code Sprint 9 ổn định từ Sprint 8.
- Bổ sung constants chuẩn hóa workflow transition và error code.
- Cập nhật dashboard code freeze message.
- README cuối Sprint 9.
- Bộ tài liệu kiểm thử trước Giai đoạn 7:
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
