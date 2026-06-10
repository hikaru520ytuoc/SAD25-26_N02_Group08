# Bug fixing list Sprint 9

| Bug ID | Module | Mô tả lỗi | Mức độ | Nguyên nhân dự kiến | Cách sửa | Trạng thái |
|---|---|---|---|---|---|---|
| BUG-001 | Build | Chưa xác nhận Docker build thực tế trong sandbox | Medium | Môi trường sandbox không chạy Docker build đầy đủ | Chạy trên máy dev, gửi log nếu lỗi | Open |
| BUG-002 | Seed | Demo student ở trạng thái cuối có thể không test được luồng đầu | Low | Seed phục vụ demo toàn quy trình | Tạo student mới khi test từ đầu hoặc reset DB | Known |
| BUG-003 | Workflow | Một số module cũ cần áp dụng record lock dần | Medium | Record lock thêm ở Sprint 8 | Giai đoạn 7 thêm test và chặn update bổ sung nếu còn sót | Open |
| BUG-004 | UI | Một số màn hình có thể cần tối ưu responsive | Low | MVP ưu tiên nghiệp vụ | Kiểm thử UI trong Giai đoạn 7 | Open |
