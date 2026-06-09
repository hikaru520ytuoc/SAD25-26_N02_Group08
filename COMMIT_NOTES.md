feat(sprint-6): implement defense council scheduling and document review workflow

- Add Prisma schema and migration for defense councils, council members, defense schedules and defense documents
- Extend file document types for final defense reports, slides and supplements
- Add Council module with council creation, update and member management APIs
- Add Defense Schedule module for assigning ready defense registrations to active councils
- Add Defense Document module for student submission, resubmission and secretary review workflow
- Add RBAC and ownership checks for faculty, students, council members and council secretaries
- Add notifications and audit logs for council, schedule and defense document actions
- Add seed data for council chair, secretary, active council and demo defense schedule
- Add frontend faculty council and defense schedule management pages
- Add frontend student defense schedule and document submission page
- Add frontend council schedule and secretary document review pages
- Update dashboard links, README, run guide and Sprint 6 test cases

## Hotfix Sprint 6 TypeScript

```text
fix(sprint-6): fix CouncilRole enum build error in council service

- Fix TypeScript TS2345 error in council role validation
- Explicitly type unique council role array as CouncilRole[]
- Keep unique chair and secretary business rule unchanged
- Preserve multiple member support in council membership workflow
- Add troubleshooting note for Sprint 6 backend Docker build failure
```
