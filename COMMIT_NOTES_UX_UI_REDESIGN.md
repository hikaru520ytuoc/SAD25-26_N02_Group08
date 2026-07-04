# Commit notes — UX/UI redesign & workflow hardening

## feat(ui)

- Tái thiết kế các màn hình nghiệp vụ theo cấu trúc thống nhất: page header, summary cards, filter bar, tabs, card/bảng responsive, detail drawer, modal tạo mới và trạng thái tải/rỗng/lỗi.
- Không hiển thị form dài ngay khi mở trang; chuyển form tạo đợt, đề tài, đề cương, tiến độ, bảo vệ, hội đồng, lịch, revision và archive vào modal/drawer.
- Thiết kế lại luồng sinh viên đăng ký đề tài thành hai lựa chọn độc lập: “Đề tài có sẵn” và “Đề xuất đề tài mới”.
- Thêm `VietnameseDateInput` hiển thị `dd/MM/yyyy`, hỗ trợ nhập/paste nhiều định dạng và chuyển sang ISO khi gọi API.
- Xóa dữ liệu đăng nhập/form mẫu được điền sẵn; bổ sung loading skeleton, empty state, error state và pagination dùng chung.
- Nâng cấp notification center với số chưa đọc động, bộ lọc và đánh dấu đã đọc.

## feat(workflow)

- Bổ sung chi tiết đợt đồ án, danh sách sinh viên/đề tài theo đợt, thống kê sức chứa và modal gia hạn có lý do.
- Chuẩn hóa hành động theo trạng thái cho phê duyệt đề tài, yêu cầu hướng dẫn, Khoa xử lý đăng ký, đề cương, tiến độ, bảo vệ, phản biện, hội đồng, lịch, điểm, kết quả, revision và archive.
- Bổ sung kiểm tra khóa điểm hội đồng sau khi phiên bảo vệ hoàn tất.
- Bảo toàn enum, RBAC và quan hệ dữ liệu hiện có; chỉ ánh xạ nhãn tiếng Việt ở lớp UI.

## fix(file-auth)

- Thêm `GET /api/files/:id/access-url?mode=preview|download` để cấp signed URL MinIO thời hạn ngắn.
- Kiểm tra quyền file theo chủ sở hữu và quan hệ nghiệp vụ: sinh viên, GVHD, GVPB, thành viên/thư ký hội đồng, Khoa, lưu trữ và admin.
- Loại bỏ mở trực tiếp protected download URL trong tab mới; frontend lấy signed URL bằng API có Authorization.
- Bổ sung fallback Blob có Authorization, preview ảnh/TXT, mở PDF và tải file không hỗ trợ.
- Bổ sung biến môi trường public MinIO endpoint và TTL signed URL; không log secret/signed URL.

## fix(state-sync)

- Sau mutation, khóa nút chống double submit, hiển thị trạng thái xử lý, toast thành công/lỗi và refetch hoặc cập nhật state cục bộ.
- Chuyển item sang tab phù hợp và cập nhật summary count ngay sau duyệt/từ chối/xác nhận/công bố/khóa.
- Ẩn hành động không còn hợp lệ sau khi trạng thái thay đổi.

## refactor(shared-components)

- Chuẩn hóa các component: `PageHeader`, `SummaryStatCard`, `FilterBar`, `SearchInput`, `StatusBadge`, `CompactEntityCard`, `DetailDrawer`, `ConfirmActionModal`, `ReasonModal`, `FormModal`, `FileCard`, `FileActions`, `FileViewerModal`, `HistoryTimeline`, `WorkflowStepper`, `LoadingSkeleton`, `EmptyState`, `ErrorState`, `Pagination`, `DropdownSelect`, `VietnameseDateInput`, `ToastProvider`.
- Xóa các dialog/table cũ trùng chức năng ở Sprint 3 và Sprint 8.
- Tập trung ánh xạ trạng thái tại `frontend/src/lib/status-labels.ts`.

## test

- Thêm test định dạng ngày Việt Nam, ánh xạ enum, form đăng nhập trống và guardrail signed URL.
- Thêm test policy quyền truy cập file và policy khóa điểm hội đồng.
- Kết quả: frontend 9/9 test đạt; backend policy 7/7 test đạt; frontend typecheck đạt; lint đạt với cảnh báo không chặn build.
