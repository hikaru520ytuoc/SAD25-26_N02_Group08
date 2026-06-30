# Hotfix: Sidebar jank and active dropdown collapse

## Problem

The grouped sidebar had two UI issues observed during navigation:

1. The page visually flickered/jumped when switching routes.
2. The dropdown group that contained the current active route could not be collapsed.

## Root causes

- Each page mounted its own `AppShell`, so changing routes recreated the sidebar and topbar.
- The sidebar initially rendered closed, then reopened after `useEffect` read `localStorage` and detected the active route.
- Active groups were effectively forced open by combining `openGroups[group] || active`, so clicking the current group could not collapse it.
- `transition-all` on the dropdown animated layout height changes and made the route transition feel more jittery.

## Fixes

- Moved `AppShell` into the root `app/layout.tsx` so the shell persists across route changes.
- Removed per-page `AppShell` wrappers from page files.
- Initialized sidebar open state synchronously from `localStorage` and the current active route.
- Changed dropdown logic so `active` only controls visual highlighting, while `openGroups` alone controls whether a group is expanded.
- Kept auto-open behavior when the active route changes, but still allows the user to collapse the active group after it opens.
- Replaced broad `transition-all` usage with narrower color/transform transitions.
- Used cached auth user in `AppShell` to avoid full-screen loading flicker while `/api/auth/me` refreshes in the background.

## Files changed

- `frontend/src/app/layout.tsx`
- `frontend/src/app/**/page.tsx`
- `frontend/src/components/layout/app-shell.tsx`
- `frontend/src/components/layout/sidebar.tsx`
- `frontend/src/components/layout/sidebar-group.tsx`
- `frontend/src/components/layout/sidebar-sub-item.tsx`

## Expected behavior

- Switching pages keeps the sidebar/topbar stable.
- The current active sidebar group opens automatically on page load/route change.
- The user can collapse the active group manually.
- Reloading a page opens the group containing the current route again.
