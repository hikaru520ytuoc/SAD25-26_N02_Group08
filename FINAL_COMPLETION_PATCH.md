# Final Completion Patch

## Scope
This patch completes the current graduation-project-management source for formal testing without changing the approved architecture or workflow.

## Completed items
- Added a dynamic notification bell count in Topbar.
- Added `/admin/roles` read-only role/permission overview page.
- Added role count in backend `RolesService.findAll()`.
- Completed Sprint 8 UI components for revision requests, revision submissions, archive submissions, archive review, archive completion and record locking.
- Reworked student revision/archive pages to use upload-driven hidden file ID binding instead of visible file ID input.
- Reworked faculty revision and archive staff pages to use per-record dialogs, avoiding shared `reason`/`feedback` state across table rows.
- Standardized Sprint 8 and defense-document status display through shared Vietnamese `StatusBadge`.
- Extended record-lock checks to defense registrations, defense documents, scores and final results in addition to revisions and archives.
- Kept Hướng 2 eligibility model: internship, credits, GPA/CPA, prerequisite debt, tuition debt and disciplinary status remain eligibility input data.

## Runtime notes
- The previous Docker/Prisma/Lookups hotfixes remain included.
- Docker is not available in this sandbox, so build commands must be run locally.
