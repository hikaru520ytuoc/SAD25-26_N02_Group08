# Rà soát file upload/download Sprint 9

## File types được dùng

- Outline/progress: PDF, DOC, DOCX.
- Defense: PDF, DOC/DOCX, PPT/PPTX.
- Revision: PDF/DOC/DOCX.
- Archive: PDF, PPT/PPTX, ZIP.

## ENV hiện tại

Backend:

```env
MAX_FILE_SIZE_MB=50
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/zip,application/x-zip-compressed
```

Frontend:

```env
NEXT_PUBLIC_MAX_FILE_SIZE_MB=50
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.ppt,.pptx,.zip
```

## Checklist MinIO

- Container MinIO chạy ở `http://localhost:9001`.
- Bucket không public.
- Frontend không nhận MinIO secret.
- Upload file đi qua backend.
- Download file đi qua backend và kiểm tra quyền.
- Metadata lưu trong PostgreSQL bảng `file_documents`.

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| 413 Payload Too Large | File vượt `MAX_FILE_SIZE_MB` | Giảm dung lượng file hoặc tăng cấu hình dev |
| FILE_UPLOAD_INVALID_TYPE | MIME type không nằm trong allow-list | Kiểm tra định dạng file |
| FILE_ACCESS_DENIED | User không sở hữu/không thuộc hội đồng | Kiểm tra ownership và role |
| MinIO connection failed | MinIO chưa chạy hoặc sai env | `docker compose logs minio`, kiểm tra endpoint |
