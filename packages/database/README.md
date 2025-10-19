# @packages/database

Shared database package for Florence using Prisma ORM with Neon PostgreSQL.

## Setup

1. Set the `DATABASE_URL` environment variable:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_GoCBUvMD81TL@ep-solitary-shadow-abktkit3-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
```

2. Generate Prisma Client:

```bash
pnpm db:generate
```

3. Push schema changes to the database:

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
