feat(sprint-5): implement defense registration and reviewer evaluation workflow

- Add Prisma schema and migration for defense registrations, reviewer assignments, reviewer evaluations, supervisor scores and reviewer scores
- Extend file document type for defense documents and support report/slide upload through MinIO
- Add Defense Registration module for student submission, resubmission and supervisor approval/revision workflow
- Add supervisor defense approval flow with supervisor score validation from 0 to 10
- Add Reviewer module for faculty reviewer assignment and reviewer evaluation workflow
- Add reviewer score validation and defense readiness status updates
- Add notification and audit log events for defense registration, supervisor review and reviewer evaluation
- Add Sprint 5 seed data for reviewer demo, approved outline, defense registration and reviewer assignment
- Add frontend student defense registration page
- Add frontend supervisor defense review page
- Add frontend faculty reviewer assignment page
- Add frontend reviewer evaluation page
- Update environment examples, README, run guide and Sprint 5 test cases
