# Local Development Setup

## Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (Neon recommended)

## Initial Setup

1. **Install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your DATABASE_URL

# Database
cp packages/database/.env.example packages/database/.env
# Edit packages/database/.env with your DATABASE_URL
```

3. **Set up database:**

```bash
cd packages/database
pnpm db:sync  # Push schema, generate client, seed data
```

## Running Development Servers

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

## Database Operations

From `packages/database/`:

```bash
pnpm db:sync      # Push schema + generate + seed (recommended)
pnpm db:push      # Push schema changes only
pnpm db:generate  # Regenerate Prisma client
pnpm db:seed      # Seed test data
pnpm studio       # Open Prisma Studio (GUI)
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

## See Also

- [Prisma Workflow](./packages/PRISMA_WORKFLOW.md)
- [Root README](../../README.md)

