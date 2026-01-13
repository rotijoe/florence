# Local Development Setup

## Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL database (Neon)
- Access to Neon SQL Editor (for RLS setup)

## Initial Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up Neon database

If you don't have a Neon database yet:

1. Create an account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard

### 3. Set up environment variables

Create `.env` files in both locations:

**`apps/api/.env`:**

```bash
PORT=8787
BASE_URL=http://localhost:8787
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require"
DATABASE_URL_RUNTIME="postgresql://app_runtime:YOUR_RUNTIME_PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require"

# AWS S3 (for document uploads)
AWS_REGION=eu-west-2
S3_BUCKET_APP_DOCUMENTS=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

**`packages/database/.env`:**

```bash
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require"
```

**Important:** If your password contains special characters like `@`, URL-encode them (e.g., `@` becomes `%40`).

### 4. Set up Row-Level Security (RLS)

Florence uses PostgreSQL RLS for data isolation. You must set this up before the app will work correctly.

**Step 1: Create the runtime role**

Run in [Neon SQL Editor](https://console.neon.tech) (select your project → SQL Editor):

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

**Step 2: Enable RLS and create policies**

Run in Neon SQL Editor:

```sql
-- Enable RLS on domain tables
ALTER TABLE "health_tracks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hub_dismissals" ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners
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

-- Policy: events (scoped via track)
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

### 5. Set up database schema

```bash
cd packages/database
pnpm db:sync  # Push schema, generate client, seed data
```

## Running Development Servers

**Terminal: ALL**

```bash
pnpm dev  # Runs on http://localhost:8787
```

**Terminal 1: API server**

```bash
cd apps/api
pnpm dev  # Runs on http://localhost:8787
```

**Terminal 2: Web app**

```bash
cd apps/web
pnpm dev  # Runs on http://localhost:3000
```

## Easy Reset Development Servers

**Terminal**

```bash
pnpm dev:reset  # Runs on http://localhost:8787
```

## Database Operations

From `packages/database/`:

```bash
pnpm db:sync      # Push schema + generate + seed (recommended)
pnpm db:push      # Push schema changes only
pnpm db:generate  # Regenerate Prisma client
pnpm db:seed      # Seed test data
pnpm studio       # Open Prisma Studio (GUI)
pnpm reset       # Easy, BUT only LOCAL)
```

## Test Users

After seeding, you can use these test accounts:

- `alice@example.com` / `123456`
- `bob@example.com` / `123456`
- `carol@example.com` / `123456`

## Common Issues

### "Cannot find module @packages/database"

```bash
pnpm install
cd packages/database
npx prisma generate
```

### "Port 8787 already in use"

```bash
pkill -f "tsx watch"
```

### "Database connection error"

- Verify `DATABASE_URL` is set correctly in both `apps/api/.env` and `packages/database/.env`
- Ensure your Neon database is accessible

### "Failed to fetch tracks: Internal Server Error"

This usually means RLS is blocking queries. Check:

1. **RLS is set up correctly** - Run in Neon SQL Editor:

   ```sql
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE schemaname = 'public' AND tablename IN ('health_tracks', 'events', 'hub_dismissals');
   ```

   All should show `rowsecurity = true`.

2. **Policies exist** - Run in Neon SQL Editor:

   ```sql
   SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
   ```

   You should see 3 policies.

3. **`DATABASE_URL_RUNTIME` is configured** - Check `apps/api/.env` has the runtime connection string pointing to `app_runtime` role.

4. **Password is URL-encoded** - If your password contains `@`, replace it with `%40` in the connection string.

### "Still seeing all users' data"

Your database role is bypassing RLS. Check:

1. Verify you're using `app_runtime` role (not `neondb_owner`) in `DATABASE_URL_RUNTIME`
2. Run `FORCE ROW LEVEL SECURITY` on all tables (see Step 2 above)

## Verifying RLS is Working

After setup, log in as a test user (e.g., `alice@example.com`). You should only see Alice's tracks, not Bob's or Carol's.

## See Also

- [RLS Documentation](./compliance/RLS.md) - Detailed RLS architecture and policies
- [Prisma Workflow](./packages/PRISMA_WORKFLOW.md)
- [Root README](../../README.md)
