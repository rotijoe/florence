# Track Detail Page

## Route

`/[userId]/tracks/[trackSlug]`

**Page Component:** `apps/web/src/app/[userId]/tracks/[trackSlug]/page.tsx`

## Purpose

A timeline view for a single health track, showing upcoming appointments and past events grouped by date.

## Data Sources

- **Track metadata:** `GET /api/users/:userId/tracks/:trackSlug`
  - Fetcher: `fetchTrack(userId, trackSlug)`
- **Track events:** `GET /api/users/:userId/tracks/:trackSlug/events?sort=desc&limit=100`
  - Fetcher: `fetchTrackEvents(userId, trackSlug)`
- **Hub notifications:** `GET /api/users/:userId/hub/notifications`
  - Filtered to this track: `filterNotificationsForTrack(notifications, userId, trackSlug)`

## Page Layout

1. **Track Header**
   - Component: `apps/web/src/components/track_header/index.tsx`
   - Shows track title, description

2. **Quick Add Bar**
   - Component: `apps/web/src/components/track_quick_add_bar/index.tsx`
   - Type-specific "Add ..." buttons
   - Links to: `/${userId}/tracks/${trackSlug}/new?type=<EVENT_TYPE>`

3. **Track Reminders Panel**
   - Component: `apps/web/src/components/track_reminders_panel/index.tsx`
   - Shows filtered hub notifications for this track

4. **Unified Timeline**
   - Component: `apps/web/src/components/track_timeline/index.tsx`
   - Shows upcoming appointments + past events

## Timeline Rules

### Upcoming vs Past

- **Upcoming appointments** appear at top when:
  - `event.type === APPOINTMENT` and `new Date(event.date) > now`
  - Split helper: `splitEventsByTime(events, now)`
  - Sorted ascending (soonest first): `sortFutureAppointments(events)`
- **Divider:** "Past events" separator between upcoming and past
- **Past events:** Grouped by date (YYYY-MM-DD), newest first

## Event Tiles

**Component:** `apps/web/src/components/track_event_tile/index.tsx`

Each tile shows:
- Title
- Notes preview (subtitle)
- Type badge
- Event time, created, updated
- Actions menu (Edit/Delete)

**Special styling:**
- **Appointments:** Calendar icon, "Upcoming" tag for future
- **Symptoms:** Check-in styling, left accent, shows `symptomType` and `severity`

## See Also

- [Event Lifecycle](./EVENT_LIFECYCLE.md)
- [API Endpoints](../api/ENDPOINTS.md)
- [Web Routes](./README.md)
