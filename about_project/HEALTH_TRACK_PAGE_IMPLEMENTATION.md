# Health Track Page Implementation

## Overview

Implemented a complete health track detail page at `/tracks/[trackSlug]` that displays a specific health track and its events in reverse chronological order (newest first). The implementation follows TDD principles and adheres to the project's architectural patterns.

## Implementation Date

October 2025

## What Was Built

### 1. Database Schema Updates

**File:** `packages/database/prisma/schema.prisma`

- Added `slug` field to `HealthTrack` model (unique constraint)
- Created new `HealthEvent` model with:
  - `id`, `trackId`, `occurredAt`, `title`, `notes`, `type`, `metrics` (JSON)
  - Index on `trackId` and `occurredAt` for performance
  - Cascade delete when track is deleted

**Migration Notes:**

- Existing databases need to run the manual migration SQL script
- Location: `packages/database/prisma/manual_migration.sql`
- Adds slug column and creates health_events table safely

### 2. Seed Data

**File:** `packages/database/prisma/seed.ts`

Added two new health tracks with events for each user:

**Sleep Track** (`slug: sleep`)

- 4 health events with sleep duration and quality metrics
- Metrics: `{ durationMin: number, quality: string }`

**Hydration Track** (`slug: hydration`)

- 3 health events with water intake tracking
- Metrics: `{ liters: number, goal: number }`

### 3. Shared Types

**File:** `packages/types/src/index.ts`

- Added `slug` field to existing `HealthTrack` type
- Created `TrackResponse` type for API responses
- Created `HealthEvent` type with all event fields

### 4. API Endpoints

**Files:**

- `apps/api/src/routes/tracks/index.ts` (implementation)
- `apps/api/src/routes/tracks/index.test.ts` (tests)
- `apps/api/src/index.ts` (route wiring)

**Endpoints Implemented:**

#### GET /api/tracks/:slug

- Returns track metadata by slug
- Public endpoint (no auth required)
- Returns 404 if track not found

#### GET /api/tracks/:slug/events

- Returns events for a track sorted by occurredAt (desc)
- Query parameters: `limit` (default: 100), `sort` (desc/asc)
- Public endpoint
- Returns 404 if track not found

**Test Coverage:**

- ✅ Returns 200 and track for valid slug
- ✅ Returns 404 for missing slug
- ✅ Returns events in desc order
- ✅ Respects limit parameter
- ✅ Returns 404 for missing track on events endpoint

### 5. Track Event List Component

**Location:** `apps/web/src/components/track_event_list/`

**Files:**

- `index.tsx` - Main component
- `helpers.ts` - Date formatting and metrics formatting
- `types.ts` - Component prop types
- `tests/index.spec.tsx` - Component tests
- `tests/format_event_date.spec.ts` - Helper tests
- `tests/format_metrics.spec.ts` - Helper tests

**Features:**

- Renders events in card layout using ShadCN Card components
- Displays formatted date/time using Intl.DateTimeFormat
- Shows event type as a badge
- Displays optional notes
- Renders metrics as formatted JSON in a code block
- Empty state when no events exist

**Helper Functions:**

- `formatEventDate(isoString)` - Formats ISO date to readable format
- `formatMetrics(metrics)` - Converts metrics object to formatted JSON

**Test Coverage:**

- ✅ Renders all events
- ✅ Displays event notes when present
- ✅ Displays formatted dates
- ✅ Displays event type
- ✅ Renders empty state
- ✅ Displays metrics when available

### 6. Health Track Page

**Location:** `apps/web/src/app/tracks/[trackSlug]/`

**Files:**

- `page.tsx` - Server component page
- `helpers.ts` - API fetch functions
- `types.ts` - Page type definitions
- `constants.ts` - API base URL constant
- `test/page.spec.tsx` - Page component tests
- `test/fetch_track.spec.ts` - Helper tests
- `test/fetch_track_events.spec.ts` - Helper tests

**Features:**

- Server-side rendered (React Server Component)
- Parallel fetches for track and events
- Clean header with track name
- Uses TrackEventList component for event display
- Error handling for failed fetches

**Helper Functions:**

- `fetchTrack(slug)` - Fetches track metadata from API
- `fetchTrackEvents(slug)` - Fetches events from API

**Test Coverage:**

- ✅ Renders track name as heading
- ✅ Calls fetchTrack with correct slug
- ✅ Calls fetchTrackEvents with correct slug
- ✅ Renders TrackEventList component

### 7. Documentation Updates

**Files Updated:**

1. **`about_project/api/ENDPOINTS.md`**

   - Added documentation for two new endpoints
   - Included request/response examples
   - Noted endpoints are public (no auth required)

2. **`about_project/packages/DATABASE_SEEDING.md`**

   - Added Sleep and Hydration track details
   - Documented health event types and structure
   - Explained metrics field usage

3. **`about_project/web/DASHBOARD.md`**
   - Added "Related Pages" section
   - Documented health track detail page
   - Documented track event list component

## Architecture Decisions

### Separate API Endpoints (Option 2)

**Decision:** Use separate endpoints for track metadata and events

**Rationale:**

- Better scalability for pagination
- Independent caching strategies
- Cleaner API surface
- Easy to extend with filters/sorting

**Endpoints:**

- `GET /tracks/:slug` - Track metadata only
- `GET /tracks/:slug/events` - Events only

### URL Pattern: /tracks/[trackSlug]

**Decision:** Use slug-based routing instead of ID-based

**Rationale:**

- SEO-friendly URLs (e.g., `/tracks/sleep` vs `/tracks/abc123`)
- Human-readable and shareable
- Better UX for bookmarking
- Industry standard for content pages

### Server Components (RSC)

**Decision:** Implement page as React Server Component

**Rationale:**

- Data fetching on server (better performance)
- No client-side JavaScript for data loading
- Parallel fetch for track and events
- SEO benefits (fully rendered HTML)

### ShadCN Card Components

**Decision:** Use Card primitives for event display

**Rationale:**

- Consistent with project design system
- Accessible out of the box
- Responsive by default
- Easy to theme and customize

## Component Structure

Following project rules, components use render functions:

```tsx
export function Component() {
  // Early returns for edge cases
  if (someCondition) return renderEmptyState()

  // Main render with clean JSX
  return (
    <div>
      {renderHeader()}
      {renderContent()}
    </div>
  )
}

function renderHeader() {
  /* ... */
}
function renderContent() {
  /* ... */
}
function renderEmptyState() {
  /* ... */
}
```

## Testing Strategy

### API Tests

- Unit tests for each endpoint
- Test success and error cases
- Verify response structure
- Test query parameters

### Component Tests

- React Testing Library for UI components
- Test rendering logic
- Test helper functions separately
- Mock API calls in page tests

### Helper Tests

- Pure function tests for formatters
- Test edge cases (null, undefined, various inputs)
- Each helper has its own test file

## File Naming Conventions

- **Directories:** snake_case (`track_event_list`)
- **Test directory:** `tests/` (plural)
- **Test files:** snake_case (e.g., `format_event_date.spec.ts`)
- **Component files:** `index.tsx`
- **Supporting files:** `helpers.ts`, `types.ts`, `constants.ts`

## Environment Variables

**Required for Web App:**

- `NEXT_PUBLIC_API_URL` - API base URL (defaults to `http://localhost:8787`)

## Running the Implementation

### 1. Update Database Schema

If you have existing data:

```bash
cd packages/database
# Run the manual migration SQL script against your database
psql $DATABASE_URL -f prisma/manual_migration.sql
```

For fresh database:

```bash
cd packages/database
npx prisma db push
```

### 2. Regenerate Prisma Client

```bash
cd packages/database
npx prisma generate
```

### 3. Run Seed Script

```bash
cd packages/database
npx prisma db seed
```

### 4. Build Types Package

```bash
cd packages/types
pnpm build
```

### 5. Start API Server

```bash
cd apps/api
pnpm dev
```

### 6. Start Web App

```bash
cd apps/web
pnpm dev
```

### 7. Visit the Page

Navigate to:

- `http://localhost:3000/tracks/sleep`
- `http://localhost:3000/tracks/hydration`

## Running Tests

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

### Web Page Tests

```bash
cd apps/web
pnpm test src/app/tracks
```

## Future Enhancements

1. **Pagination** - Implement cursor-based pagination for events
2. **Filtering** - Filter events by type, date range
3. **Sorting** - Allow user to toggle sort order
4. **Create Events** - Add UI to create new events
5. **Edit/Delete** - CRUD operations for events
6. **Authentication** - Make tracks private per user
7. **File Uploads** - Support event attachments
8. **Real-time Updates** - WebSocket for live event updates
9. **Charts** - Visualize metrics over time
10. **Export** - Download events as CSV/PDF

## Notes

- All components follow Tailwind CSS styling
- No inline CSS or CSS files
- 100% TypeScript (no `any` types)
- All endpoints return consistent ApiResponse format
- Error handling at every layer
- Accessible keyboard navigation
- Mobile-responsive design

## Related Files

**Database:**

- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/seed.ts`
- `packages/database/prisma/manual_migration.sql`

**Types:**

- `packages/types/src/index.ts`

**API:**

- `apps/api/src/routes/tracks/index.ts`
- `apps/api/src/routes/tracks/index.test.ts`
- `apps/api/src/index.ts`

**Web Component:**

- `apps/web/src/components/track_event_list/index.tsx`
- `apps/web/src/components/track_event_list/helpers.ts`
- `apps/web/src/components/track_event_list/types.ts`
- `apps/web/src/components/track_event_list/tests/*.spec.ts(x)`

**Web Page:**

- `apps/web/src/app/tracks/[trackSlug]/page.tsx`
- `apps/web/src/app/tracks/[trackSlug]/helpers.ts`
- `apps/web/src/app/tracks/[trackSlug]/types.ts`
- `apps/web/src/app/tracks/[trackSlug]/constants.ts`
- `apps/web/src/app/tracks/[trackSlug]/test/*.spec.ts(x)`

**Documentation:**

- `about_project/api/ENDPOINTS.md`
- `about_project/packages/DATABASE_SEEDING.md`
- `about_project/web/DASHBOARD.md`
- `about_project/HEALTH_TRACK_PAGE_IMPLEMENTATION.md`
