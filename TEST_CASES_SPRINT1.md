# Sprint 1 Test Cases

| ID | Nhóm | Test case | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-01 | Auth | Đăng nhập đúng admin@example.com / Admin@123456 | Trả accessToken và user roles có ADMIN |
| TC-AUTH-02 | Auth | Đăng nhập sai mật khẩu | 401 AUTH_INVALID_CREDENTIALS |
| TC-AUTH-03 | Auth | Đăng nhập email không tồn tại | 401 AUTH_INVALID_CREDENTIALS |
| TC-AUTH-04 | Auth | Tài khoản LOCKED đăng nhập | 403 AUTH_ACCOUNT_LOCKED |
| TC-AUTH-05 | Auth | Gọi /api/auth/me không token | 401 AUTH_UNAUTHORIZED |
| TC-AUTH-06 | Auth | Gọi /api/auth/me với token hợp lệ | Trả user hiện tại, không có passwordHash |
| TC-RBAC-01 | RBAC | ADMIN gọi /api/users | Thành công |
| TC-RBAC-02 | RBAC | STUDENT gọi /api/users | 403 AUTH_FORBIDDEN |
| TC-USER-01 | User | Admin tạo user mới | Tạo thành công, password được hash |
| TC-USER-02 | User | Tạo user trùng email | 409 USER_EMAIL_EXISTS |
| TC-USER-03 | User | Admin khóa user | User chuyển LOCKED |
| TC-USER-04 | User | User bị khóa không đăng nhập được | 403 AUTH_ACCOUNT_LOCKED |
| TC-USER-05 | User | Admin mở khóa user | User chuyển ACTIVE |
| TC-USER-06 | User | Admin gán role cho user | User có role mới, không bị trùng |
| TC-ROLE-01 | Role | Admin xem danh sách role | Trả danh sách 8 role mặc định |
| TC-ROLE-02 | Role | Tạo role code trùng | 409 ROLE_CODE_EXISTS |
| TC-ROLE-03 | Role | Gán role không tồn tại | 404 ROLE_NOT_FOUND |
| TC-AUDIT-01 | Audit | Login thành công | Có audit log LOGIN_SUCCESS |
| TC-AUDIT-02 | Audit | Login thất bại | Có audit log LOGIN_FAILED |
| TC-AUDIT-03 | Audit | Tạo user | Có audit log USER_CREATED |
| TC-AUDIT-04 | Audit | Khóa user | Có audit log USER_LOCKED |
| TC-AUDIT-05 | Audit | Gán role | Có audit log USER_ROLES_ASSIGNED |
