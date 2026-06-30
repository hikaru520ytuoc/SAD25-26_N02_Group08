# Eligibility and Council Validation Patch

## 1. Kiểm tra điều kiện làm đồ án

Bản vá bổ sung dữ liệu học vụ nhập thủ công khi tạo tài khoản sinh viên hoặc khi Khoa xét điều kiện:

- `completedCredits`: số tín chỉ đã tích lũy
- `requiredCredits`: số tín chỉ yêu cầu
- `gpa`: GPA/CPA
- `hasPrerequisiteDebt`: còn nợ môn tiên quyết
- `hasTuitionDebt`: còn nợ học phí
- `hasDisciplinaryAction`: có tình trạng kỷ luật

Các trường này được thêm vào cả `students` và `student_eligibilities`. Khi Admin tạo tài khoản có role `STUDENT`, frontend hiển thị phần hồ sơ sinh viên để nhập thủ công các dữ liệu trên. Backend sẽ tự tạo:

1. `users`
2. `user_roles`
3. `students`
4. `student_eligibilities`

Logic xét điều kiện mới:

Sinh viên chỉ được đánh dấu `ELIGIBLE` khi thỏa toàn bộ điều kiện:

- Thực tập đã `COMPLETED` hoặc `WAIVED`
- Trạng thái học vụ là `ACTIVE`
- Số tín chỉ đã tích lũy >= số tín chỉ yêu cầu
- GPA/CPA >= 2.0
- Không nợ môn tiên quyết
- Không nợ học phí
- Không có tình trạng kỷ luật

Nếu không đạt, hệ thống tự ghi `NOT_ELIGIBLE` hoặc chặn thao tác đánh dấu `ELIGIBLE` kèm lý do cụ thể.

## 2. Thành lập hội đồng và xếp lịch bảo vệ

Bản vá bổ sung validate ở `DefenseSchedulesService` và `CouncilsService`:

- Một hội đồng chỉ được xếp tối đa 6 đề tài.
- Khi đóng/chốt hội đồng (`CLOSED`), hội đồng phải có từ 4 đến 6 đề tài.
- Khi lập lịch, hệ thống kiểm tra trùng phòng, trùng hội đồng và trùng thành viên hội đồng.
- Nếu một giảng viên tham gia nhiều hội đồng, hệ thống không cho xếp lịch bị trùng thời gian.

Điều kiện trùng thời gian:

```text
newStartTime < existingEndTime
AND
newEndTime > existingStartTime
```

Nếu có xung đột, backend trả lỗi `COUNCIL_MEMBER_TIME_CONFLICT` hoặc `DEFENSE_SCHEDULE_CONFLICT`.
