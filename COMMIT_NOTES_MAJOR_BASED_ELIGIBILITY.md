# Commit notes

## Suggested commit

```text
refactor(eligibility): replace stored eligibility records with major-based live evaluation
```

## Details

- remove the `student_eligibilities` Prisma model, migration table, backend module, frontend service and old form/table;
- add fixed database majors KTPM (134 credits) and CNTT (136 credits);
- calculate the credit threshold as `ceil(totalCredits * 0.8)` and require GPA >= 2.5;
- store current academic data directly on the student profile;
- remove project-period selection from student account create/edit;
- add student self-registration for OPEN project periods after server-side eligibility validation;
- derive topic-registration period from the student's active period registration;
- add ADMIN/FACULTY_MANAGER live academic-condition overview;
- preserve existing topic workflows by backfilling period registrations for existing topic registrations;
- keep major data read-only with no CRUD module or management page.
