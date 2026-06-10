# Sprint 7 Summary - Chấm điểm và công bố kết quả bảo vệ

## Mục tiêu
Sprint 7 triển khai phần chấm điểm hội đồng, tính điểm tổng hợp, xác nhận và công bố kết quả bảo vệ.

## Phạm vi đã triển khai
- Council Score: nhập/cập nhật điểm hội đồng theo từng thành viên.
- Score Summary: tính điểm hội đồng trung bình và điểm tổng kết.
- Final Result: generate, confirm và publish kết quả.
- Defense Session cơ bản: ghi nhận nhận xét/kết luận buổi bảo vệ.
- Frontend cho thư ký nhập điểm, thành viên hội đồng nhập điểm cá nhân, Khoa công bố kết quả, sinh viên xem kết quả.

## Ngoài phạm vi
- Quy trình chỉnh sửa sau bảo vệ.
- Nộp bản chỉnh sửa.
- Kiểm tra bản chỉnh sửa.
- Lưu trữ hồ sơ cuối cùng.

## Công thức điểm
Điểm tổng kết = (Điểm hội đồng trung bình × 2 + Điểm GVHD + Điểm GVPB) / 4.

Giả định Sprint 7:
- Ngưỡng đạt: 5.5.
- Điểm làm tròn 2 chữ số thập phân.
- Có thể tính điểm khi có ít nhất một điểm hội đồng, điểm GVHD và điểm GVPB.
