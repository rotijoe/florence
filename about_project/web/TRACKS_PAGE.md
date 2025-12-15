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
- Page: `apps/web/src/app/[userId]/tracks/page.tsx`
- Tiles: `apps/web/src/components/track_tile/`
- UI-only states are labeled as “UI only” so users aren’t misled.


