feat(sprint-1): implement auth, user and role foundation

- Add JWT authentication module with login and current user API
- Add user, role, user-role and audit log schema with Prisma
- Add password hashing with bcrypt and demo seed accounts
- Add JWT guard, role guard, @Roles decorator and @CurrentUser decorator
- Add admin user management APIs for create, update, lock, unlock and role assignment
- Add role management APIs and default role seed data
- Add audit log service for login and admin actions
- Add frontend login page, dashboard and admin users page
- Update environment examples with JWT and bcrypt settings
- Update README with Sprint 1 migration, seed and run guide
