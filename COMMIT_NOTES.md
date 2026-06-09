# Commit notes - Sprint 4

## Commit chính

```text
feat(sprint-4): implement outline submission and project progress workflow

- Add Prisma schema and migration for outlines, outline versions, project progress, progress comments and file documents
- Add file storage module with MinIO upload, metadata persistence and permission-checked download
- Add outline module for student submission, resubmission, supervisor approval and revision requests
- Add project progress module for student progress updates and supervisor comments
- Add notification and audit log events for outline, progress and file actions
- Add Sprint 4 seed data to ensure demo student has official supervisor assignment
- Add frontend student outline and progress pages
- Add frontend supervisor outline review and progress tracking pages
- Add reusable file upload and file download components
- Update environment examples, Docker Compose, README, run guide and Sprint 4 test cases
```

## Lệnh commit

```bash
git add .

git commit -m "feat(sprint-4): implement outline submission and project progress workflow" \
  -m "- Add Prisma schema and migration for outlines, outline versions, project progress, progress comments and file documents
- Add file storage module with MinIO upload, metadata persistence and permission-checked download
- Add outline module for student submission, resubmission, supervisor approval and revision requests
- Add project progress module for student progress updates and supervisor comments
- Add notification and audit log events for outline, progress and file actions
- Add Sprint 4 seed data to ensure demo student has official supervisor assignment
- Add frontend student outline and progress pages
- Add frontend supervisor outline review and progress tracking pages
- Add reusable file upload and file download components
- Update environment examples, Docker Compose, README, run guide and Sprint 4 test cases"
```

## Hotfix Sprint 4 - Prisma schema duplicate relation fields

```text
fix(sprint-4): fix duplicate Prisma relations in Student schema

- Remove duplicated outlines relation field from Student model
- Remove duplicated projectProgresses relation field from Student model
- Fix Prisma P1012 schema validation error during npx prisma generate
- Keep Sprint 4 outline and project progress schema relations unchanged
- Add troubleshooting notes for Sprint 4 Prisma schema build failure
```


## Sprint 4 Hotfix - Prisma Topic Relations

```text
fix(sprint-4): fix invalid Topic relations in Prisma schema

- Remove invalid direct Topic.outlines relation without opposite Outline field
- Remove invalid direct Topic.projectProgresses relation without opposite ProjectProgress field
- Fix Prisma P1012 schema validation error during prisma generate
- Keep Sprint 4 outline and progress workflow relations through registration and assignment
- Update troubleshooting notes for Sprint 4 Prisma relation validation
```
