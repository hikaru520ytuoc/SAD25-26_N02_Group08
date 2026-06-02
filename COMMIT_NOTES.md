# Commit notes

## Sprint 1

```text
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
```

## Sprint 1 hotfix v1

```text
fix(sprint-1): fix Docker Prisma runtime and seed workflow

- Install OpenSSL in backend Docker image for Prisma query engine support
- Replace ts-node seed runner with tsx for Docker compatibility
- Add Prisma migration files for Sprint 1 auth, user, role and audit log schema
- Add prisma deploy and reset scripts for stable Docker workflow
- Add hotfix run commands for migration drift and backend restart loop recovery
```

## Sprint 1 hotfix v2

```text
fix(sprint-1): fix backend Docker start command for NestJS build output

- Support both dist/main.js and dist/src/main.js as NestJS Docker entrypoints
- Print dist build files when backend entrypoint cannot be found
- Update start:prod script to match Docker runtime behavior
- Add troubleshooting guide for backend Restarting state and MODULE_NOT_FOUND error
- Update run commands for clean rebuild, migration deploy and seed workflow
```
