feat(sprint-8): implement post-defense revision archive and record locking

- Add Prisma schema and migration for revision requests, revision submissions, archive records and project record locks
- Add revision module for post-defense revision requests, student submissions and review workflow
- Add archive module for final archive submission, supplement request, approval, completion and locking
- Add record lock service to block updates after archive completion
- Extend file document types for revision reports, final reports, final slides, source code and archive documents
- Add notification and audit log events for revision, archive and record locking actions
- Add Sprint 8 seed data for archive staff, revision request and archive record demo
- Add frontend student revision and archive pages
- Add frontend faculty revision review and archive staff review pages
- Update dashboard links, README, run guide and Sprint 8 test cases
