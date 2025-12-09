# Prisma Schema Change Workflow

## Available Scripts

Run from `packages/database/`:

| Script | Command | Description |
|--------|---------|-------------|
| `db:push` | `prisma db push` | Push schema changes to database |
| `db:generate` | `prisma generate` | Regenerate Prisma Client types |
| `db:seed` | `tsx prisma/seed.ts` | Seed database with test data |
| `db:sync` | push + generate + seed | **Full sync (recommended)** |
| `db:reset` | force-reset + seed | Destructive reset |
| `db:migrate` | `prisma migrate dev` | Create migration (production) |
| `studio` | `prisma studio` | Open database GUI on port 5555 |

## After Schema Changes

```bash
# Quick way (does everything)
cd packages/database && pnpm db:sync

# Or manually
cd packages/database
pnpm db:push      # Push schema to DB
pnpm db:generate  # Regenerate TS types
pnpm db:seed      # Re-seed data
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 on login | Users don't exist | `pnpm db:seed` |
| Missing field errors | Stale Prisma Client | `pnpm db:generate` |
| Constraint violations | Schema not pushed | `pnpm db:push` |
| Shadow database errors | Neon limitation | Use `db:push` instead of `db:migrate` |

## Notes

- Using Neon PostgreSQL (serverless) which has shadow database limitations
- `db:push` is preferred over `db:migrate` for development
- Test users: `alice@example.com`, `bob@example.com`, `carol@example.com` (password: `123456`)

