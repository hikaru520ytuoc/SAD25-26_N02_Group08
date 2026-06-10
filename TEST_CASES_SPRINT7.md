# Test Cases Sprint 7

| Nhóm | Test case | Kỳ vọng |
|---|---|---|
| Council Score | COUNCIL_SECRETARY nhập điểm cho thành viên hội đồng | Thành công |
| Council Score | COUNCIL_MEMBER nhập điểm của chính mình | Thành công nếu thuộc hội đồng |
| Council Score | COUNCIL_MEMBER nhập điểm thay người khác | 403 |
| Council Score | User ngoài hội đồng nhập điểm | 403 |
| Council Score | Điểm < 0 hoặc > 10 | 400 |
| Council Score | Sửa điểm sau khi result PUBLISHED | 409 |
| Score Summary | Tính điểm hội đồng trung bình | Đúng trung bình các council_scores |
| Score Summary | Tính điểm tổng kết | Đúng công thức `(HĐ*2 + GVHD + GVPB) / 4` |
| Score Summary | Thiếu điểm GVHD | 400 SCORE_MISSING_SUPERVISOR |
| Score Summary | Thiếu điểm GVPB | 400 SCORE_MISSING_REVIEWER |
| Score Summary | Thiếu điểm hội đồng | 400 SCORE_MISSING_COUNCIL |
| Result | FACULTY_MANAGER generate result | Thành công khi đủ điểm |
| Result | STUDENT generate result | 403 |
| Result | FACULTY_MANAGER confirm result | publicationStatus = CONFIRMED |
| Result | Publish result chưa confirm | 400 FINAL_RESULT_NOT_CONFIRMED |
| Result | Publish result đã confirm | publicationStatus = PUBLISHED |
| Result | STUDENT xem result sau khi published | Thành công |
| Result | STUDENT xem result người khác | 403/404 |
| Result | finalScore < 5.5 | FAILED |
| Result | finalScore >= 5.5 và revisionRequired | PASSED_WITH_REVISION |
| Result | finalScore >= 5.5 và không revision | PASSED |
| Defense Session | Secretary tạo/cập nhật biên bản | Thành công |
| Audit | Nhập điểm/generate/confirm/publish result | Có audit log |
| Notification | Publish result | Student nhận notification |
