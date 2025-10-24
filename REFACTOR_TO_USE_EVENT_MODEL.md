# Refactoring: Using Existing Event Model

## Summary

Refactored the health track page implementation to use the existing `Event` model instead of creating a new `HealthEvent` model. This aligns with the existing database schema and maintains consistency across the application.

## Key Changes

### Database Schema

**Before:**

- Created new `HealthEvent` model with `occurredAt`, `notes`, `type` (string), and `metrics` (JSON)

**After:**

- Uses existing `Event` model with `date`, `description`, `type` (EventType enum), and `fileUrl`
- Added index on `trackId` and `date` for performance
- Removed `HealthEvent` model entirely

### Type Differences

| HealthEvent (Old)       | Event (New)             |
| ----------------------- | ----------------------- |
| `occurredAt` (DateTime) | `date` (DateTime)       |
| `notes` (String?)       | `description` (String?) |
| `type` (String)         | `type` (EventType enum) |
| `metrics` (JSON?)       | N/A                     |
| N/A                     | `fileUrl` (String?)     |
| N/A                     | `createdAt` (DateTime)  |
| N/A                     | `updatedAt` (DateTime)  |

### EventType Enum

```typescript
enum EventType {
  NOTE
  APPOINTMENT
  RESULT
  LETTER
  FEELING
  EXERCISE
}
```

## Files Modified

### Database

- ✅ `packages/database/prisma/schema.prisma` - Removed HealthEvent model, kept Event model
- ✅ `packages/database/prisma/seed.ts` - Updated to use Event instead of HealthEvent
- ✅ `packages/database/prisma/manual_migration.sql` - Simplified to only add slug and index

### Types

- ✅ `packages/types/src/index.ts` - Changed `HealthEvent` to `EventResponse`

### API

- ✅ `apps/api/src/routes/tracks/index.ts` - Updated to query `prisma.event` instead of `prisma.healthEvent`
- ✅ `apps/api/src/routes/tracks/index.test.ts` - Updated tests to use EventType enum

### Web Component

- ✅ `apps/web/src/components/track_event_list/types.ts` - Changed to use `EventResponse`
- ✅ `apps/web/src/components/track_event_list/helpers.ts` - Removed `formatMetrics` function
- ✅ `apps/web/src/components/track_event_list/index.tsx` - Updated to show `description` and `fileUrl`
- ✅ `apps/web/src/components/track_event_list/tests/index.spec.tsx` - Updated tests
- ✅ Deleted `apps/web/src/components/track_event_list/tests/format_metrics.spec.ts`

### Web Page

- ✅ `apps/web/src/app/tracks/[trackSlug]/types.ts` - Changed to use `EventResponse`
- ✅ `apps/web/src/app/tracks/[trackSlug]/helpers.ts` - Updated return types
- ✅ `apps/web/src/app/tracks/[trackSlug]/test/fetch_track_events.spec.ts` - Updated tests
- ✅ `apps/web/src/app/tracks/[trackSlug]/test/page.spec.tsx` - Updated tests

## UI Changes

### Before (HealthEvent)

- Displayed: title, occurredAt, type (string), notes, metrics (JSON)
- Metrics shown as formatted JSON code block

### After (Event)

- Displays: title, date, type (enum badge), description, fileUrl (link)
- File URL shown as clickable link if present
- Type shown as enum value (NOTE, RESULT, FEELING, etc.)

## Seed Data Updates

### Sleep Track

Events now use EventType enum:

- `EventType.NOTE` - "7h 45m sleep"
- `EventType.FEELING` - "6h 30m sleep"
- Descriptions instead of notes/metrics

### Hydration Track

Events use `EventType.RESULT` for water intake measurements

## Benefits of This Refactor

1. **Consistency** - Uses existing Event model throughout the app
2. **Type Safety** - EventType enum prevents invalid event types
3. **Simplicity** - No need to maintain two separate event models
4. **File Support** - Can attach files to events via fileUrl
5. **Timestamps** - Automatic createdAt/updatedAt tracking
6. **Less Code** - Removed duplicate helper functions and test files

## API Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "event-1",
      "trackId": "track-1",
      "date": "2025-10-21T00:00:00.000Z",
      "type": "NOTE",
      "title": "7h 45m sleep",
      "description": "Woke up refreshed, good quality sleep",
      "fileUrl": null,
      "createdAt": "2025-10-21T00:00:00.000Z",
      "updatedAt": "2025-10-21T00:00:00.000Z"
    }
  ]
}
```

## Migration Path

If you have existing data:

1. Run the simplified manual migration SQL to add slug column and index
2. Run `npx prisma generate` to regenerate client
3. Run `npx prisma db seed` to add Sleep and Hydration tracks
4. Rebuild types: `cd packages/types && pnpm build`
5. Restart API and Web servers

## Testing

All tests have been updated to reflect the new Event model:

- API tests use `EventType` enum
- Component tests expect `description` instead of `notes`
- Component tests expect `type` to be enum value
- Added test for fileUrl display

## Documentation Updates Needed

The following documentation files should be updated to reflect this change:

- `about_project/HEALTH_TRACK_PAGE_IMPLEMENTATION.md`
- `about_project/packages/DATABASE_SEEDING.md`
- `about_project/api/ENDPOINTS.md`

Update references from:

- `HealthEvent` → `Event`
- `occurredAt` → `date`
- `notes` → `description`
- `metrics` → N/A (removed)
- String type → EventType enum
