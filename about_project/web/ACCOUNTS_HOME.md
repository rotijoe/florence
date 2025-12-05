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

- The page reads the current session via `getServerSession` only to derive a friendly
  display name for the welcome header.
- All other content is mocked via `buildMockAccountOverviewData` in
  `apps/web/src/app/[userId]/helpers.ts`. No API calls or backend changes are performed.
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
- `AccountHealthTracks` – grid of small track summary cards with an empty state CTA to
  create a health track.
- `AccountUpcomingAppointments` – vertical list of upcoming appointment cards with an
  empty state when none are present.
- `AccountRecentActivity` – placeholder card describing where the future activity feed
  will appear.
- `AccountFooter` – subtle footer text with room for links such as Settings.

Types and shared configuration for these components live in `types.ts`, `constants.ts`,
and `helpers.ts` in the same directory.


