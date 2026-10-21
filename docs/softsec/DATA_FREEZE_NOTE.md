# Verified mapping and unresolved semantics (GitHub public source, Oct 2026)

| CSV field | C parser rule | Real Prisma mapping |
|---|---|---|
| `student_id` | ASCII 1–15 bytes | `Student.studentCode` unique |
| `student_name` | valid UTF-8, 1–63 bytes | `Student.user.fullName` warning only |
| `project_id` | ASCII 1–15 bytes | explicit alias -> `Topic.id` UUID; no DB short code |
| `supervisor_score` | finite float 0–10 | supervisor-owned `SupervisorScore`, no overwrite |
| `reviewer_score` | finite float 0–10 | assigned reviewer-owned `ReviewerScore`, no overwrite |
| `council_score` | finite float 0–10 | preview only; real `CouncilScore` per member |

The app already computes `finalScore=round((councilAverageScore*2+supervisorScore+reviewerScore)/4,2)` in `ScoresService`. This package **does not change weights** or auto-publish results. It does not authorize faculty/admin to impersonate graders. All score writes are role-specific and atomic (all-or-nothing).

To enable council bulk import one day, a new approved CSV format MUST include council member IDs and exact score provenance, with new domain policy. Do not invent member votes from aggregate.
