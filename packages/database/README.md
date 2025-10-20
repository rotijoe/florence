# @packages/database

Shared database package for Florence using Prisma ORM with Neon PostgreSQL.

## Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update `.env` with your actual `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
```

3. Generate Prisma Client:

```bash
pnpm db:generate
```

4. Push schema changes to the database:

```bash
pnpm db:push
```

Or create a migration:

```bash
pnpm db:migrate
```

## Usage

Import the Prisma client in your code:

```typescript
import { prisma } from '@packages/database'

const users = await prisma.user.findMany()
```

## Schema

The database includes tables for:

- Users (Better Auth)
- Sessions (Better Auth)
- Accounts (Better Auth)
- Verifications (Better Auth)
- Health Tracks
- Events

See `prisma/schema.prisma` for the full schema definition.
