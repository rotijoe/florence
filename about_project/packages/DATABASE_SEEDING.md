# Database Seeding

## Overview

The database package includes a seeding script that populates the database with test data for development. The seed is safe to run multiple times—it uses upsert operations to avoid duplicates.

## What Gets Seeded

### Users & Authentication

Creates 3 test users with email/password authentication:

- `alice@example.com`
- `bob@example.com`
- `carol@example.com`

**Default Password:** `123456`

### Health Data

Each user gets 2 health tracks:

**1. Vitals Track**

- Description: Blood pressure, heart rate, temperature
- Events: NOTE (Morning notes), RESULT (BP reading), FEELING (Mood check-in)

**2. Medication Track**

- Description: Prescriptions and adherence logs
- Events: NOTE (Refill reminder), APPOINTMENT (Pharmacy visit), LETTER (Doctor letter)

## Usage

### Run Seed Directly

```bash
pnpm --filter @packages/database db:seed
```

### Run After Migrations

```bash
pnpm --filter @packages/database db:push
pnpm --filter @packages/database db:seed
```

### Automatic Seeding

Prisma can automatically run seeds after migrations if configured with the `prisma.seed` field in `package.json`.

## Implementation Details

**Location:** `packages/database/prisma/seed.ts`

**Key Features:**

- Uses `upsert` operations to safely handle re-runs
- Hashes passwords with Better Auth's crypto utilities
- Creates nested relations (tracks → events) in single operations
- Skips duplicate health tracks for existing users

**Event Types Used:**

- `NOTE` - General notes and observations
- `RESULT` - Test results and measurements
- `FEELING` - Mood and wellness check-ins
- `APPOINTMENT` - Scheduled visits
- `LETTER` - Correspondence from providers
