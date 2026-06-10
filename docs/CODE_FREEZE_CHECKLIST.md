# Code freeze checklist Sprint 9

| Checklist | Trạng thái |
|---|---|
| Backend chạy ổn định | TODO khi chạy Docker thực tế |
| Frontend chạy ổn định | TODO khi chạy Docker thực tế |
| Docker Compose chạy được | TODO khi chạy Docker thực tế |
| Migration chạy được từ database trống | TODO khi chạy Docker thực tế |
| Seed chạy được nhiều lần | TODO khi chạy Docker thực tế |
| Auth/RBAC hoạt động | Ready for Phase 7 test |
| Ownership hoạt động | Ready for Phase 7 test |
| Luồng end-to-end có seed và smoke test | Done |
| File upload/download có checklist | Done |
| Audit log có checklist | Done |
| Notification có checklist | Done |
| Swagger cập nhật theo controller | Ready for Phase 7 test |
| README cập nhật | Done |
| Không commit `.env` thật | Done |
| Không hard-code secret production | Done |
| Source code có docs Sprint 9 | Done |
| Không còn lỗi blocker đã biết trong tài liệu | No confirmed blocker in static review |
| Đã tạo ZIP code freeze | Done |

## Gợi ý tag/version

```bash
git tag -a v0.9.0-mvp-code-freeze -m "MVP code freeze before SDLC phase 7 testing"
git push origin v0.9.0-mvp-code-freeze
```
