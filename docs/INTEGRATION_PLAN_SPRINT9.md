# Kế hoạch tích hợp tổng thể Sprint 9

## Module tích hợp

| Nhóm | Module | Mục tiêu kiểm tra |
|---|---|---|
| Nền tảng | Auth, User, Role, RBAC, Audit Log, Notification | Đăng nhập, phân quyền, log thao tác, thông báo |
| Giai đoạn chuẩn bị | Project Period, Student Eligibility, Topic | Mở đợt, xét đủ điều kiện, tạo/duyệt/công bố đề tài |
| Đăng ký | Topic Registration, Supervisor Assignment | Đăng ký đề tài, phân công GVHD chính thức |
| Thực hiện | Outline, Project Progress | Nộp/duyệt đề cương, cập nhật tiến độ |
| Bảo vệ | Defense Registration, Reviewer, Council, Schedule, Defense Document | Đăng ký bảo vệ, phản biện, hội đồng, lịch, hồ sơ |
| Chấm điểm | Scores, Results, Defense Session | Điểm GVHD/GVPB/hội đồng, tính tổng kết, công bố |
| Sau bảo vệ | Revision, Archive, Record Lock | Chỉnh sửa, lưu trữ, khóa hồ sơ |
| Hạ tầng | File Storage, Docker, Prisma Migration, Seed | Upload/download, migration sạch, seed demo đầy đủ |

## Thứ tự kiểm tra tích hợp

1. Chạy Docker Compose và kiểm tra health.
2. Chạy migration deploy từ database trống.
3. Chạy seed nhiều lần để xác nhận idempotent.
4. Đăng nhập từng role demo.
5. Chạy luồng end-to-end từ đăng ký đề tài đến khóa hồ sơ.
6. Kiểm tra trạng thái không cho nhảy bước.
7. Kiểm tra role sai bị 403 và ownership sai bị chặn.
8. Kiểm tra upload/download file qua backend.
9. Kiểm tra audit log/notification ở các mốc chính.
10. Đóng băng source và chuyển sang Giai đoạn 7.

## Luồng end-to-end chuẩn

ADMIN kiểm tra user/role → FACULTY mở đợt và xét đủ điều kiện → SUPERVISOR tạo đề tài → FACULTY công bố → STUDENT đăng ký → FACULTY xác nhận → STUDENT nộp đề cương → SUPERVISOR duyệt → STUDENT cập nhật tiến độ → STUDENT đăng ký bảo vệ → SUPERVISOR nhập điểm GVHD → FACULTY phân công GVPB → REVIEWER nhập điểm phản biện → FACULTY tạo hội đồng/lịch → SECRETARY duyệt hồ sơ → SECRETARY/COUNCIL nhập điểm hội đồng → FACULTY công bố kết quả → STUDENT xem kết quả → REVISION nếu cần → ARCHIVE nộp/duyệt/khóa.

## Điểm phụ thuộc quan trọng

- Student phải có `Student` profile và `StudentEligibility = ELIGIBLE` trước khi đăng ký đề tài.
- Topic phải `PUBLISHED` thì student mới thấy.
- Topic Registration phải `OFFICIALLY_ASSIGNED` thì mới có GVHD chính thức.
- Outline phải `APPROVED` thì mới cập nhật tiến độ và đăng ký bảo vệ.
- Defense Registration phải đủ điểm GVHD và GVPB, status `READY_FOR_COUNCIL`, mới lập lịch.
- Defense Document phải `APPROVED` trước khi nhập điểm hội đồng.
- Result chỉ publish sau khi có đủ supervisor score, reviewer score và council score.
- Archive chỉ nhận hồ sơ nếu result đã `PASSED`, hoặc `PASSED_WITH_REVISION` nhưng revision đã `APPROVED`.
- Archive `LOCKED` thì toàn bộ hồ sơ chỉ còn tra cứu.
