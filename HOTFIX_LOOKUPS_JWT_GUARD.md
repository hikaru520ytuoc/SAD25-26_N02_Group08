# Hotfix: LookupsModule JwtAuthGuard dependency

## Problem

Backend container restarted because `LookupsController` uses `@UseGuards(JwtAuthGuard)`, but `LookupsModule` did not import `JwtModule`. Nest could not inject `JwtService` into `JwtAuthGuard` within the LookupsModule context.

Error:

```text
Nest can\'t resolve dependencies of the JwtAuthGuard (?, ConfigService, PrismaService).
Please make sure that the argument JwtService at index [0] is available in the LookupsModule context.
```

## Fix

Updated `backend/src/modules/lookups/lookups.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LookupsController } from './lookups.controller';
import { LookupsService } from './lookups.service';

@Module({
  imports: [JwtModule],
  controllers: [LookupsController],
  providers: [LookupsService],
})
export class LookupsModule {}
```

## Scope

- No database change.
- No RBAC change.
- No route change.
- No business workflow change.
- Only fixes NestJS dependency injection for the lookup endpoints.
