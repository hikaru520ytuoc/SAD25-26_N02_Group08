# Commit Notes

## Sprint 3

```text
feat(sprint-3): implement topic registration and supervisor assignment workflow

- Add Prisma schema and migration for topic registrations, supervisor assignments and notifications
- Add topic registration module for existing topic registration and student topic proposal
- Add supervisor response flow for accepting or rejecting supervision requests
- Add faculty processing flow for assigning supervisor, confirming and rejecting registrations
- Add supervisor assignment module for official assignment lookup by faculty, supervisor and student
- Add basic notification module with current-user notifications and read actions
- Add audit logs for registration, supervisor response, faculty confirmation and assignment actions
- Add Sprint 3 seed data for second supervisor and additional published topic
- Add frontend student topic registration and proposal page
- Add frontend supervisor request, faculty registration processing and assignment pages
- Update dashboard links, README, run guide and Sprint 3 test cases
```

### Lệnh commit

```bash
git add .
git commit -m "feat(sprint-3): implement topic registration and supervisor assignment workflow" \
  -m "- Add Prisma schema and migration for topic registrations, supervisor assignments and notifications
- Add topic registration module for existing topic registration and student topic proposal
- Add supervisor response flow for accepting or rejecting supervision requests
- Add faculty processing flow for assigning supervisor, confirming and rejecting registrations
- Add supervisor assignment module for official assignment lookup by faculty, supervisor and student
- Add basic notification module with current-user notifications and read actions
- Add audit logs for registration, supervisor response, faculty confirmation and assignment actions
- Add Sprint 3 seed data for second supervisor and additional published topic
- Add frontend student topic registration and proposal page
- Add frontend supervisor request, faculty registration processing and assignment pages
- Update dashboard links, README, run guide and Sprint 3 test cases"
```

---

## Sprint 3 Hotfix Commit

```text
fix(sprint-3): fix TypeScript build errors in topic registration workflow

- Fix enum literal type inference errors in topic registration service
- Explicitly type supervisor response status, registration status and assignment type variables
- Fix student notification message by querying student user profile explicitly
- Keep Sprint 3 workflow and business rules unchanged
- Add troubleshooting notes for backend Docker build failure
```
