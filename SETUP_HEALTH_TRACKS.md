# Quick Setup: Health Track Page Feature

This guide will help you get the new `/tracks/[trackSlug]` feature running.

## Prerequisites

- Database is already set up and running
- API and Web apps are configured
- Node.js and pnpm are installed

## Step-by-Step Setup

### 1. Update Database Schema

**Option A: Fresh Database (no existing data)**

```bash
cd packages/database
npx prisma db push
npx prisma generate
```

**Option B: Existing Database (has data)**

```bash
cd packages/database

# Run manual migration SQL
# Replace $DATABASE_URL with your actual connection string
psql $DATABASE_URL -f prisma/manual_migration.sql

# Generate Prisma client
npx prisma generate
```

### 2. Seed the Database

```bash
cd packages/database
npx prisma db seed
```

This will create:

- Sleep track with 4 events (slug: `sleep`)
- Hydration track with 3 events (slug: `hydration`)
- Plus existing Vitals and Medication tracks

### 3. Build Shared Packages

```bash
# From project root
cd packages/types
pnpm build
```

### 4. Start the Services

**Terminal 1 - API Server:**

```bash
cd apps/api
pnpm dev
```

**Terminal 2 - Web App:**

```bash
cd apps/web
pnpm dev
```

### 5. Test the Feature

Open your browser and visit:

- http://localhost:3000/tracks/sleep
- http://localhost:3000/tracks/hydration

You should see:

- Track name as the page heading
- List of events sorted newest to oldest
- Each event showing: title, date/time, type badge, notes, and metrics

## Verify API Endpoints

Test the API directly:

```bash
# Get track metadata
curl http://localhost:8787/api/tracks/sleep

# Get track events
curl http://localhost:8787/api/tracks/sleep/events
```

## Run Tests

### API Tests

```bash
cd apps/api
pnpm test src/routes/tracks/index.test.ts
```

### Web Component Tests

```bash
cd apps/web
pnpm test src/components/track_event_list
```

### Page Tests

```bash
cd apps/web
pnpm test src/app/tracks
```

## Troubleshooting

### "Track not found" error

- Verify the database was seeded: Check if `health_tracks` table has records with slugs
- Check if slug column exists: `\d health_tracks` in psql

### API connection errors

- Verify `NEXT_PUBLIC_API_URL` environment variable (default: http://localhost:8787)
- Check if API server is running on port 8787
- Check CORS settings in `apps/api/src/index.ts`

### "slug must be unique" error during seed

- Database already has tracks without slugs
- Run the manual migration SQL first to add slug column
- Or use `npx prisma migrate reset --force` (⚠️ WARNING: destroys all data)

### Type errors in web app

- Rebuild types package: `cd packages/types && pnpm build`
- Restart Next.js dev server

### Events not showing

- Check API response: `curl http://localhost:8787/api/tracks/sleep/events`
- Verify `health_events` table exists and has data
- Check browser console for errors

## Database Migration (Existing Data)

If you have existing `health_tracks` data without slugs:

```sql
-- Connect to your database
psql $DATABASE_URL

-- Add slug column
ALTER TABLE health_tracks ADD COLUMN slug VARCHAR(255);

-- Generate slugs from titles
UPDATE health_tracks
SET slug = LOWER(REPLACE(title, ' ', '-'))
WHERE slug IS NULL;

-- Make slug unique
ALTER TABLE health_tracks
ADD CONSTRAINT health_tracks_slug_unique UNIQUE (slug);

-- Make slug NOT NULL
ALTER TABLE health_tracks
ALTER COLUMN slug SET NOT NULL;

-- Create health_events table
CREATE TABLE health_events (
    id TEXT PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    notes TEXT,
    type TEXT NOT NULL,
    metrics JSONB,
    CONSTRAINT health_events_trackId_fkey
    FOREIGN KEY ("trackId")
    REFERENCES health_tracks(id)
    ON DELETE CASCADE
);

-- Create index
CREATE INDEX health_events_trackId_occurredAt_idx
ON health_events("trackId", "occurredAt" DESC);
```

## Quick Test

After setup, verify everything works:

```bash
# Check API
curl http://localhost:8787/api/tracks/sleep | jq

# Check events
curl http://localhost:8787/api/tracks/sleep/events | jq

# Open web app
open http://localhost:3000/tracks/sleep
```

## What You Should See

**Sleep Track Page:**

- Heading: "Sleep"
- Subheading: "View all events for this health track"
- 4 event cards showing sleep durations (7h 45m, 6h 30m, etc.)
- Each card has: timestamp, type badge, notes, and metrics

**Hydration Track Page:**

- Heading: "Hydration"
- 3 event cards showing water intake (2.5L, 2.0L, 3.0L)
- Metrics showing liters consumed and daily goal

## Next Steps

1. Explore the code structure in `apps/web/src/app/tracks/[trackSlug]/`
2. Review the API implementation in `apps/api/src/routes/tracks/`
3. Check the component in `apps/web/src/components/track_event_list/`
4. Read the full documentation in `about_project/HEALTH_TRACK_PAGE_IMPLEMENTATION.md`

## Need Help?

- See full documentation: `about_project/HEALTH_TRACK_PAGE_IMPLEMENTATION.md`
- Check API docs: `about_project/api/ENDPOINTS.md`
- Review seed data: `about_project/packages/DATABASE_SEEDING.md`
