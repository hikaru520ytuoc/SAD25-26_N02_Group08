# Sprint 6 Hotfix - CouncilRole TypeScript Build Error

## Lỗi gặp phải

Docker build backend dừng tại bước:

```bash
RUN npm run build
```

Log lỗi:

```text
src/modules/councils/councils.service.ts:162:62 - error TS2345: Argument of type 'CouncilRole' is not assignable to parameter of type '"CHAIR" | "SECRETARY"'.
```

## Nguyên nhân

TypeScript suy luận mảng:

```ts
[CouncilRole.CHAIR, CouncilRole.SECRETARY]
```

thành union hẹp chỉ gồm `CHAIR | SECRETARY`. Khi truyền biến `role: CouncilRole` vào `.includes(role)`, TypeScript báo lỗi vì `CouncilRole` còn có thể là `MEMBER`.

## Cách sửa

Khai báo rõ kiểu mảng là `CouncilRole[]`:

```ts
const uniqueCouncilRoles: CouncilRole[] = [CouncilRole.CHAIR, CouncilRole.SECRETARY];
if (!uniqueCouncilRoles.includes(role)) return;
```

Business rule không đổi: chỉ kiểm tra unique role đối với `CHAIR` và `SECRETARY`; role `MEMBER` được phép có nhiều người.

## Lệnh chạy lại

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```
