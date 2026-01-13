# Row-Level Security (RLS) Implementation

## Overview

Florence implements PostgreSQL Row-Level Security (RLS) to enforce data isolation at the database level. This provides defense-in-depth security, ensuring that even if application-level checks are bypassed, users can only access their own data.

## Architecture

### Dual-Role Setup

We use a dual-role architecture:

1. **Migration Role** (`DATABASE_URL`)
   - Used by `prisma migrate` and `prisma db push`
   - Has `BYPASSRLS` privilege
   - Full database access for schema management

2. **Runtime Role** (`DATABASE_URL_RUNTIME`)
   - Used by application queries
   - No `BYPASSRLS` privilege
   - Limited to SELECT, INSERT, UPDATE, DELETE on domain tables
   - RLS policies are enforced

### Tables with RLS

RLS is enabled on domain tables that contain user-scoped data:

- `health_tracks` - Direct `userId` column
- `hub_dismissals` - Direct `userId` column
- `events` - Indirect via `trackId` → `health_tracks.userId`

### Tables Without RLS

Auth tables are excluded from RLS because they require access before user context exists:

- `users` - Better Auth user accounts
- `sessions` - Better Auth session tokens
- `accounts` - OAuth account linking
- `verifications` - Email verification/password reset tokens

These tables are protected by:
- Application-level authentication (Better Auth)
- Middleware (`userScopeGuard`) enforcing ownership
- Cascade deletes ensuring data consistency

## Implementation Details

### RLS Policies

Policies use PostgreSQL's `current_setting('app.user_id', true)` to check user context. The `true` parameter ensures the setting is transaction-local, preventing context leakage in connection pools.

#### Health Tracks Policy

```sql
CREATE POLICY "health_tracks_user_isolation"
ON "health_tracks"
FOR ALL
TO app_runtime
USING ("userId" = current_setting('app.user_id', true))
WITH CHECK ("userId" = current_setting('app.user_id', true));
```

#### Hub Dismissals Policy

```sql
CREATE POLICY "hub_dismissals_user_isolation"
ON "hub_dismissals"
FOR ALL
TO app_runtime
USING ("userId" = current_setting('app.user_id', true))
WITH CHECK ("userId" = current_setting('app.user_id', true));
```

#### Events Policy

Events are scoped indirectly through their parent track:

```sql
CREATE POLICY "events_user_isolation"
ON "events"
FOR ALL
TO app_runtime
USING (
  EXISTS (
    SELECT 1 FROM "health_tracks" ht
    WHERE ht."id" = "events"."trackId"
      AND ht."userId" = current_setting('app.user_id', true)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "health_tracks" ht
    WHERE ht."id" = "events"."trackId"
      AND ht."userId" = current_setting('app.user_id', true)
  )
);
```

### Prisma Integration

We use a transaction wrapper `withUserRls` to set user context before executing queries:

```typescript
import { prismaRuntime, withUserRls } from '@packages/database'

const tracks = await withUserRls(prismaRuntime, userId, async (tx) => {
  return tx.healthTrack.findMany()
})
```

The wrapper:
1. Starts a transaction
2. Sets `app.user_id` using `set_config` (transaction-local)
3. Executes the query function
4. Returns the result

### Helper Functions

Helper functions that query domain tables accept a transaction client:

```typescript
// Before
await verifyTrackExists(userId, slug)

// After
await verifyTrackExists(tx, slug)
```

This ensures all queries within a handler share the same RLS context.

## Setup Instructions

For new developers setting up the project, see [SETUP.md](../SETUP.md) for complete instructions. Below is a summary:

### 1. Create Runtime Role

Run in [Neon SQL Editor](https://console.neon.tech):

```sql
-- Create runtime role (choose a strong password)
CREATE ROLE app_runtime WITH LOGIN PASSWORD 'your-secure-password';

-- Grant permissions
GRANT CONNECT ON DATABASE neondb TO app_runtime;
GRANT USAGE ON SCHEMA public TO app_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON 
  health_tracks, events, hub_dismissals 
TO app_runtime;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_runtime;
```

### 2. Enable RLS and Create Policies

Run in Neon SQL Editor:

```sql
-- Enable RLS on domain tables
ALTER TABLE "health_tracks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hub_dismissals" ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Force RLS even for table owners
ALTER TABLE "health_tracks" FORCE ROW LEVEL SECURITY;
ALTER TABLE "events" FORCE ROW LEVEL SECURITY;
ALTER TABLE "hub_dismissals" FORCE ROW LEVEL SECURITY;

-- Policy: health_tracks
CREATE POLICY "health_tracks_user_isolation"
ON "health_tracks"
FOR ALL
USING ("userId" = current_setting('app.user_id', true))
WITH CHECK ("userId" = current_setting('app.user_id', true));

-- Policy: hub_dismissals
CREATE POLICY "hub_dismissals_user_isolation"
ON "hub_dismissals"
FOR ALL
USING ("userId" = current_setting('app.user_id', true))
WITH CHECK ("userId" = current_setting('app.user_id', true));

-- Policy: events (scoped via track ownership)
CREATE POLICY "events_user_isolation"
ON "events"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "health_tracks" ht
    WHERE ht."id" = "events"."trackId"
      AND ht."userId" = current_setting('app.user_id', true)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "health_tracks" ht
    WHERE ht."id" = "events"."trackId"
      AND ht."userId" = current_setting('app.user_id', true)
  )
);
```

### 3. Configure Environment

Add to `apps/api/.env`:

```bash
# Migration role (full access, used by Prisma for schema changes)
DATABASE_URL="postgresql://neondb_owner:password@your-neon-host/neondb?sslmode=require"

# Runtime role (RLS enforced, used by application)
DATABASE_URL_RUNTIME="postgresql://app_runtime:password@your-neon-host/neondb?sslmode=require"
```

**Note:** If your password contains special characters like `@`, URL-encode them (e.g., `@` becomes `%40`).

### 4. Verify Setup

Run these queries in Neon SQL Editor to verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('health_tracks', 'events', 'hub_dismissals');
-- All should show 't' (true)

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
-- Should show 3 policies

-- Check runtime role exists
SELECT rolname, rolbypassrls 
FROM pg_roles 
WHERE rolname = 'app_runtime';
-- Should show rolbypassrls = 'f' (false)
```

### 5. Use Runtime Client

Import and use `prismaRuntime` for all application queries:

```typescript
import { prismaRuntime, withUserRls } from '@packages/database'
```

## Adding RLS to New Tables

When adding a new user-scoped table:

1. **Grant privileges** to `app_runtime` role:
   ```sql
   GRANT SELECT, INSERT, UPDATE, DELETE ON new_table TO app_runtime;
   ```

2. **Enable RLS**:
   ```sql
   ALTER TABLE "new_table" ENABLE ROW LEVEL SECURITY;
   ```

3. **Create policy**:
   ```sql
   CREATE POLICY "new_table_user_isolation"
   ON "new_table"
   FOR ALL
   TO app_runtime
   USING ("userId" = current_setting('app.user_id', true))
   WITH CHECK ("userId" = current_setting('app.user_id', true));
   ```

4. **Update handlers** to use `withUserRls` wrapper

5. **Update helpers** to accept transaction client if they query the table

## Future Considerations

### Integration Testing

Consider adding integration tests to verify RLS enforcement:

- Query with correct `userId` returns data
- Query with wrong `userId` returns empty
- Query with no `userId` context throws/returns empty
- Cross-user data access is prevented

These tests would require:
- Test database with RLS enabled
- Ability to switch between different user contexts
- Verification that policies correctly filter rows

### Monitoring

Consider monitoring:
- Failed queries due to missing RLS context
- Performance impact of RLS policies (especially EXISTS subqueries)
- Policy effectiveness through query logs

### Policy Optimization

The events policy uses an EXISTS subquery which may impact performance on large datasets. Consider:
- Adding indexes on `health_tracks.id` and `events.trackId` (already present)
- Monitoring query performance
- Optimizing policy if needed (e.g., denormalizing `userId` on events table)
