# Hotfix: redesign admin user management

## Problems fixed

- The user list did not provide an edit action after account creation.
- Role assignment controls were rendered directly in every table row, making the list wide and difficult to use.
- Account lock behavior could leave an administrator unable to recover access when locking the current or last active admin account.
- Lock/unlock errors were not surfaced clearly in the user interface.

## New behavior

- The user list now contains only account, profile, role, status and action columns.
- Account roles are displayed as read-only badges in the table.
- Account information and roles are edited in a dedicated modal.
- Admin can update full name, email, phone, optional password and roles.
- Locked accounts always show an explicit `Mở khóa` action.
- The current logged-in account cannot be locked.
- The final active administrator cannot be locked or stripped of the ADMIN role.
- Lock and unlock operations are idempotent and produce clear Vietnamese messages.
- The create-user form is opened from a dedicated `Thêm tài khoản` button rather than occupying the page permanently.

## API compatibility

Existing endpoints remain available:

- `PATCH /api/users/:id`
- `PATCH /api/users/:id/lock`
- `PATCH /api/users/:id/unlock`
- `PATCH /api/users/:id/roles`

`PATCH /api/users/:id` now optionally accepts `roleIds`, allowing account profile and role changes to be saved in one transaction.
