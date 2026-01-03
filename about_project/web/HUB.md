# Home Hub (`/[userId]`)

## Route

`/[userId]`

**Page Component:** `apps/web/src/app/[userId]/page.tsx`

## Purpose

The main landing page for authenticated users, showing an overview of tracks, upcoming appointments, notifications, and quick actions.

## Layout

- **Shell:** `UserLayout` provides sidebar and top navigation
- **Content:** Centered container (`max-w-5xl`) with responsive padding
- **Sections:**
  - Welcome header (greeting + subtitle)
  - Quick actions row (log symptom, create event, add appointment)
  - Two-column main area (md+):
    - Left: Health tracks list, upcoming appointments
    - Right: Notifications, recent activity placeholder
  - Footer

## Data Sources

- **User session:** `getServerSession()` for display name
- **Health tracks:** `GET /api/users/:userId`
  - Fetcher: `fetchUserMeWithCookies(userId)` in `apps/web/src/app/[userId]/helpers.ts`
  - Falls back to mock data on error
- **Upcoming appointments:** `GET /api/users/:userId/appointments/upcoming?limit=3`
  - Fetcher: `fetchUpcomingAppointmentsForHub(userId)` in `apps/web/src/app/[userId]/helpers.ts`
  - Returns `UpcomingEvent[]` (first 3 future `APPOINTMENT` events across all tracks, sorted soonest-first)
  - No "show more" functionality - displays only the first 3 appointments
- **Notifications:** `GET /api/users/:userId/hub/notifications`
  - Fetcher: `fetchHubNotifications(userId)`
  - See [Hub Notifications](./HUB_NOTIFICATIONS.md) for details
- **Recent activity:** Mocked (placeholder)

## Components

**Location:** `apps/web/src/components/`

- **HubWelcomeHeader** - Greeting card
- **HubQuickActions** - Action buttons (symptom, event, appointment)
- **HubHealthTracks** - Grid of track summary cards
- **UpcomingEventsPanel** - List of upcoming appointment cards (shows first 3 appointments)
- **RemindersPanel** - Notification list with dismiss
- **HubRecentActivity** - Placeholder card
- **HubFooter** - Footer text

## Quick Actions

- **Log symptom:** Opens symptom dialogue
- **Create event:** Opens event creation flow
- **Add appointment:** Opens appointment creation flow

## See Also

- [Tracks Page](./TRACKS_PAGE.md)
- [Hub Notifications](./HUB_NOTIFICATIONS.md)
- [Web Routes](./README.md)
