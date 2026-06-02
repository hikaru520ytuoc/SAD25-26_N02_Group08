# Commit notes - Sprint 2

```text
feat(sprint-2): implement project period, eligibility and topic foundation

- Add Prisma schema and migration for faculties, students, lecturers, project periods, student eligibilities and topics
- Add seed data for faculty, student profile, lecturer profile, project period, eligibility and demo topic
- Add Project Period module with create, list, detail, update, open and close APIs
- Add Student Eligibility module with list, detail, create, update and current-student eligibility APIs
- Add Topic module with supervisor topic creation, submission and ownership checks
- Add faculty topic approval, rejection and publish workflow
- Add student published topic listing API
- Add audit logs for project period, eligibility and topic actions
- Add frontend pages for faculty project periods, student eligibilities and topic approval
- Add frontend supervisor topic management page and student published topic list page
- Update dashboard links, README, run commands and Sprint 2 test cases
```

## Commit command

```bash
git add .
git commit -m "feat(sprint-2): implement project period, eligibility and topic foundation" \
  -m "- Add Prisma schema and migration for faculties, students, lecturers, project periods, student eligibilities and topics
- Add seed data for faculty, student profile, lecturer profile, project period, eligibility and demo topic
- Add Project Period module with create, list, detail, update, open and close APIs
- Add Student Eligibility module with list, detail, create, update and current-student eligibility APIs
- Add Topic module with supervisor topic creation, submission and ownership checks
- Add faculty topic approval, rejection and publish workflow
- Add student published topic listing API
- Add audit logs for project period, eligibility and topic actions
- Add frontend pages for faculty project periods, student eligibilities and topic approval
- Add frontend supervisor topic management page and student published topic list page
- Update dashboard links, README, run commands and Sprint 2 test cases"
```

## Hotfix Commit Notes

```text
fix(sprint-2): fix TopicStatus enum build error in topic workflow

- Fix TypeScript TS2345 errors in topics service status validation
- Explicitly type topic workflow status arrays as TopicStatus[]
- Keep topic update, submit and reject business rules unchanged
- Add troubleshooting notes for Sprint 2 backend Docker build failure
- Update run guide for clean rebuild, migration deploy and seed workflow
```

## Hotfix Sprint 2 Runtime

```text
fix(sprint-2): fix JwtService provider resolution for Sprint 2 modules

- Import JwtModule in Project Period, Student Eligibility and Topic modules
- Fix backend restart caused by JwtAuthGuard dependency resolution at startup
- Keep Sprint 2 RBAC and ownership rules unchanged
- Add runtime troubleshooting notes for backend Restarting state
- Update run guide after Sprint 2 runtime hotfix
```
