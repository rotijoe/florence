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

Each user gets 4 health tracks:

**1. Vitals Track**

- Slug: `vitals`
- Description: Blood pressure, heart rate, temperature
- Events: NOTE (Morning notes), RESULT (BP reading), FEELING (Mood check-in)

**2. Medication Track**

- Slug: `medication`
- Description: Prescriptions and adherence logs
- Events: NOTE (Refill reminder), APPOINTMENT (Pharmacy visit), LETTER (Doctor letter)

**3. Sleep Track**

- Slug: `sleep`
- Description: Sleep tracking and quality monitoring
- Health Events: 4 sleep entries with duration, quality ratings, and notes
- Metrics: `{ durationMin: number, quality: string }`

**4. Hydration Track**

- Slug: `hydration`
- Description: Daily water intake tracking
- Health Events: 3 hydration entries with daily goals
- Metrics: `{ liters: number, goal: number }`

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

**Health Event Types (new system):**

- Health events use a flexible string-based type system
- Common types: `sleep`, `hydration`, `exercise`, `medication`, etc.
- Events include optional `notes` and `metrics` (JSON) fields
- Events are sorted by `occurredAt` timestamp (newest first)
