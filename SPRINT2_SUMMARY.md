# Sprint 2 Summary

## Scope
Sprint 2 implements Phase 1 of Graduation Project Management: preparing project periods, eligible students and topics.

## In scope
- Project Period Module
- Student Eligibility Module
- Topic Module
- Faculty pages for project periods, eligibility and topic approval
- Supervisor topic page
- Student published topic list page
- Prisma schema, migration and seed data
- Audit logs for important Sprint 2 actions

## Out of scope
- Topic registration
- Supervisor assignment
- Outline submission
- Defense registration
- Reviewer workflow
- Council, scoring, result and archive modules

## Demo flow
1. Login as `faculty@example.com / Faculty@123456`.
2. Go to `/faculty/project-periods` to create/open/close project periods.
3. Go to `/faculty/student-eligibilities` to view demo eligible student.
4. Login as `supervisor@example.com / Supervisor@123456`.
5. Go to `/supervisor/topics` to create and submit topics.
6. Login again as faculty and go to `/faculty/topics` to approve/publish topics.
7. Login as `student@example.com / Student@123456` and go to `/topics` to view published topics.
