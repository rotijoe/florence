## Accounts homepage (`/app/[userId]`)

The accounts homepage is the main landing view for an authenticated user inside the app
shell provided by `[userId]/layout.tsx`. It is implemented as a server component in
`apps/web/src/app/[userId]/page.tsx` and composed from shared UI in
`apps/web/src/components/account_overview`.

### Layout

- **Shell**: `UserLayout` adds the sidebar and top navigation. The page content scrolls
  within this shell.
- **Content container**: the page uses a centered container with max width of `max-w-5xl`
  and responsive padding to keep the layout calm on both mobile and desktop.
- **Sections**:
  - Welcome header (greeting + short copy).
  - Quick actions row (log symptom, create event, add appointment).
  - Two-column main area on `md+`:
    - Left: health tracks list, recent activity placeholder.
    - Right: notifications, upcoming appointments.
  - Low-emphasis footer.

### Data flow

- The page reads the current session via `getServerSession` to derive a friendly
  display name for the welcome header.
- **Health tracks** are fetched from the API via `GET /api/user/me` (server-side with cookies)
  using `fetchUserMeWithCookies` in `apps/web/src/app/[userId]/helpers.ts`. Tracks are mapped
  to `HealthTrackSummary` format with computed `lastUpdatedLabel` values. If the API call fails,
  the page falls back to mock tracks from `buildMockAccountOverviewData`.
- **Upcoming appointments** are fetched from the API via `GET /api/user/appointments/upcoming`
  (server-side with cookies) using `fetchUpcomingAppointmentsForHub` in `apps/web/src/app/[userId]/helpers.ts`.
  This endpoint returns future appointment events (`type=APPOINTMENT`, `date > now`) across all tracks,
  sorted soonest-first. Each appointment is mapped to `AppointmentSummary` with a formatted `datetimeLabel`
  and an `href` linking to `/${userId}/tracks/${trackSlug}/${eventId}`. If the API call fails,
  the page falls back to an empty array.
- Other content (notifications, recent activity) remains mocked via `buildMockAccountOverviewData`
  in `apps/web/src/app/[userId]/helpers.ts`.
- Core data types (tracks, appointments, notifications, recent activity) live in
  `apps/web/src/app/[userId]/types.ts` under the `AccountOverviewData` container type.

### Components

`apps/web/src/components/account_overview` provides the building blocks for the page:

- `AccountWelcomeHeader` – calm hero-style card with greeting and subtitle.
- `AccountQuickActions` – three shadcn buttons with dropdown menus for:
  - logging a symptom
  - creating an event
  - adding an appointment
    The dropdown options use static lists from `constants.ts` and currently call a no-op
    handler (ready for future navigation or modals).
- `AccountNotifications` – card listing appointment-detail and symptom-log reminders, with
  an empty state when there are no notifications.
- `AccountHealthTracks` (`HubHealthTracks`) – grid of small track summary cards that link to
  their respective track detail pages (`/${userId}/tracks/${trackSlug}`). Each card shows title,
  description (if present), and last updated label. Includes a plus button (when tracks exist)
  and empty state CTA button that both open the `TrackCreateDialog` for creating new tracks.
- `AccountUpcomingAppointments` (`HubUpcomingAppointments`) – vertical list of upcoming appointment cards
  that link to their respective event detail pages (`/${userId}/tracks/${trackSlug}/${eventId}`).
  Each card shows title, formatted datetime, and optional location. Includes an empty state when none
  are present. Appointments are sourced from the `GET /api/user/appointments/upcoming` endpoint.
- `AccountRecentActivity` – placeholder card describing where the future activity feed
  will appear.
- `AccountFooter` – subtle footer text with room for links such as Settings.

Types and shared configuration for these components live in `types.ts`, `constants.ts`,
and `helpers.ts` in the same directory.
