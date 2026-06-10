feat(sprint-7): implement council scoring and final result publication

- Add Prisma schema and migration for council scores, score summaries, final results and defense sessions
- Extend scoring module with council score management and score summary calculation
- Add final result module with generate, confirm and publish workflow
- Add defense session module for basic defense minutes and revision note capture
- Add RBAC and ownership checks for council secretary, council member, faculty manager and student result access
- Add notification and audit log events for council scoring and result publication
- Add Sprint 7 seed data for council scores, score summary and draft final result
- Add frontend secretary council scoring page and council member score page
- Add frontend faculty result publication page and student result page
- Update dashboard links, README, run guide and Sprint 7 test cases
