# Tracks page (`/[userId]/tracks`)

## Purpose
The tracks page lists a user’s health tracks as **friendly, calming tiles** that are information-dense on desktop and condensed on mobile. It’s intentionally **not clinical** in tone and avoids medical terminology.

## UI structure
- **Header**
  - Title: “Your tracks”
  - Subtitle: “A simple place to keep health notes and uploads.”
  - Primary action: “Create track” (opens `TrackCreateDialog`)

- **Tiles grid**
  - Mobile: 1 column, condensed content + actions
  - Desktop: 2–3 columns, larger tiles

## Tile contents (per track)
- **Title** (links to track detail)
- **Description** (fallback copy if missing)
- **Start date** (uses `createdAt`)
- **Last updated** (uses `updatedAt`)
- **Last event details** (UI-only placeholder)
- **Add event** (routes to `/${userId}/tracks/${trackSlug}/new?returnTo=/${userId}/tracks`)
- **Delete track** (UI-only confirmation dialog; action disabled)
- **Notifications toggle** (UI-only switch, local state)

## Implementation notes
- **Server Component**: `apps/web/src/app/[userId]/tracks/page.tsx`
  - Fetches tracks data using `fetchTracksWithCookies()`
  - Passes data to client component
- **Client Component**: `apps/web/src/app/[userId]/tracks/tracks_page_client.tsx`
  - Handles interactive UI (dialog state, router refresh)
  - Renders tracks tiles and create dialog
- **Data Fetching**: `apps/web/src/lib/fetch_tracks.ts`
  - Server-side function to fetch tracks with cookie-based auth
- **Tiles**: `apps/web/src/components/track_tile/`
- UI-only states are labeled as "UI only" so users aren't misled.


