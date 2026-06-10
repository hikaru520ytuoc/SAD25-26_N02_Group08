# Rà soát audit log và notification Sprint 9

## Audit action cần có

- Login thất bại nếu có triển khai audit auth.
- User/role update.
- Project period created/updated.
- Student eligibility checked.
- Topic submitted/approved/published.
- Topic registration created/confirmed/rejected.
- Outline submitted/approved/revision requested.
- Progress submitted/reviewed.
- Defense registration submitted/approved/rejected.
- Reviewer assigned/evaluated/scored.
- Council created/member assigned.
- Defense schedule created/updated.
- Defense document submitted/approved/supplement requested.
- Council score created/updated.
- Final result generated/confirmed/published.
- Revision request/submission/approve/change request.
- Archive submit/supplement/approve/complete/lock.

## Notification cần có

- Có đề tài/hội đồng/lịch liên quan.
- Có yêu cầu bổ sung/chỉnh sửa.
- Hồ sơ được duyệt/từ chối.
- Kết quả được công bố.
- Lưu trữ hoàn tất và hồ sơ bị khóa.

## Kiểm tra nhanh

```bash
docker compose exec postgres psql -U postgres -d graduation_project_db -c "SELECT action, result, COUNT(*) FROM audit_logs GROUP BY action, result ORDER BY action;"
docker compose exec postgres psql -U postgres -d graduation_project_db -c "SELECT type, COUNT(*) FROM notifications GROUP BY type ORDER BY type;"
```

## Bảo mật log

- Không log password.
- Không log JWT token.
- Không log MinIO secret.
- Audit log chỉ nên lưu action, entity, result, userId và metadata nghiệp vụ không nhạy cảm.
