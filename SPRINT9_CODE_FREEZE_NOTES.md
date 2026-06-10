# Sprint 9 Code Freeze Notes

## Trạng thái

Bản Sprint 9 là bản đóng băng mã nguồn MVP sau khi hoàn tất Sprint 0-8. Sprint này không thêm nghiệp vụ lớn mới; chỉ bổ sung tài liệu tích hợp, checklist smoke test, checklist code freeze và một số constants hỗ trợ chuẩn hóa workflow/error code.

## Nội dung code thay đổi

- Thêm `backend/src/common/constants/workflow-transitions.ts`.
- Thêm `backend/src/common/constants/error-codes.ts`.
- Cập nhật message dashboard sau Sprint 8 thành trạng thái Sprint 9 code freeze.
- Cập nhật README cuối cùng.
- Thêm bộ tài liệu kiểm thử và bàn giao trong thư mục `docs/`.

## Ghi chú kiểm thử

Môi trường sandbox không chạy Docker build thực tế. Cần chạy các lệnh trong `INSTALL_RUN_COMMANDS.md` trên máy dev để xác nhận build/runtime. Nếu lỗi, ghi vào `docs/BUG_FIXING_LIST.md` và fix theo mức độ ưu tiên trước khi bước sang Giai đoạn 7 chính thức.
