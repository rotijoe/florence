# Track detail page (`/[userId]/tracks/[trackSlug]`)

## Purpose
The track detail page is a **friendly, calming timeline** for a single health track. It’s designed to feel modern and relaxing (not clinical) while still being information-dense.

## Route
- `GET /[userId]/tracks/[trackSlug]`
- Page component: `apps/web/src/app/[userId]/tracks/[trackSlug]/page.tsx`

## Data sources
- **Track metadata**: `GET /api/users/:userId/tracks/:trackSlug`
  - Fetcher: `fetchTrack(userId, trackSlug)` in `apps/web/src/app/[userId]/tracks/[trackSlug]/helpers.ts`
- **Track events**: `GET /api/users/:userId/tracks/:trackSlug/events?sort=desc&limit=100`
  - Fetcher: `fetchTrackEvents(userId, trackSlug)` in `apps/web/src/app/[userId]/tracks/[trackSlug]/helpers.ts`
- **Reminders (UI-only panel)**: `GET /api/user/hub/notifications`
  - Fetcher: `fetchHubNotifications()` in `apps/web/src/app/[userId]/helpers.ts`
  - Filtering: `filterNotificationsForTrack(notifications, userId, trackSlug)` in `apps/web/src/app/[userId]/tracks/[trackSlug]/helpers.ts`

## Page layout
1. **Header**
   - Component: `apps/web/src/components/track_header/index.tsx`
2. **Quick add bar**
   - Component: `apps/web/src/components/track_quick_add_bar/index.tsx`
   - Renders one large, pastel “Add …” button per `EventType`
   - Links to: `/${userId}/tracks/${trackSlug}/new?returnTo=/${userId}/tracks/${trackSlug}&type=<EVENT_TYPE>`
3. **Track reminders panel (UI-only)**
   - Component: `apps/web/src/components/track_reminders_panel/index.tsx`
   - Uses hub notifications data, filtered to this track
4. **Unified timeline**
   - Component: `apps/web/src/components/track_timeline/index.tsx`

## Unified timeline rules
### Upcoming vs past (time-aware)
- **Upcoming appointments** appear at the top when:
  - `event.type === APPOINTMENT` and `new Date(event.date) > now`
  - Split helper: `splitEventsByTime(events, now)` in `apps/web/src/app/[userId]/tracks/[trackSlug]/helpers.ts`
- Upcoming appointments are sorted **ascending** (soonest first) with:
  - `sortFutureAppointments(events)`
- An in-list divider row labeled **“Past events”** separates upcoming from past, so the UI still feels like one list.

### Past grouping
- Past events are grouped by date (YYYY-MM-DD extracted from `event.date`) and rendered newest-first (API already returns `sort=desc`).

## Event tile behavior
- Tile component: `apps/web/src/components/track_event_tile/index.tsx`
- Each tile includes:
  - **Title**
  - **Notes preview** (as subtitle/description when present)
  - **Type badge**
  - **Event time**, **Created**, **Updated**
  - **Actions menu** (Edit/Delete)
- **Appointments**:
  - Calendar icon in the type badge
  - Upcoming appointments are visually tagged as “Upcoming”
- **Symptoms**:
  - Distinct “check-in” styling + left accent
  - Displays `symptomType` and `severity` when present

## Event creation prefill (`type=`)
The event creation page supports type preselection via query param:
- `GET /[userId]/tracks/[trackSlug]/new?type=<EVENT_TYPE>`
- Implemented in: `apps/web/src/app/[userId]/tracks/[trackSlug]/new/page.tsx`


