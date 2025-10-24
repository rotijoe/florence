# Dashboard Feature

## Overview

The dashboard is the main page for authenticated users to view their profile information and manage their health tracks.

## Location

- **Route:** `/dashboard`
- **Page Component:** `apps/web/src/app/dashboard/page.tsx`

## Features

### User Information Display

- Shows the authenticated user's name in a welcome message
- Displays user email (from session)

### Health Tracks List

- Displays all health tracks belonging to the user
- Each track shows:
  - Title
  - Description (if available)
- Tracks are displayed in a responsive grid:
  - 1 column on mobile
  - 2 columns on tablet (md)
  - 3 columns on desktop (lg)

### Interactive Elements

- Each health track card is clickable
- Clicking a track navigates to `/dashboard/tracks/[trackId]` (events detail page)
- Cards have hover effects (scale up, shadow increase)

### State Management

- **Loading State:** Shows loading message while fetching data
- **Error State:** Displays error message if data fetch fails
- **Empty State:** Shows helpful message when user has no health tracks yet
- **Authentication Check:** Redirects to home page if user is not authenticated

## File Structure

```
apps/web/src/app/dashboard/
├── page.tsx           # Main dashboard component
├── helpers.ts         # API fetch and utility functions
├── types.ts           # TypeScript interfaces
└── test/
    ├── page.spec.tsx          # Dashboard component tests
    └── fetch_user_data.spec.ts # Helper function tests
```

## API Integration

### Endpoint

- **GET** `/api/user/me`
- **Authentication:** Required (uses session cookies)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "tracks": [
        {
          "id": "track-id",
          "title": "Track Title",
          "description": "Track Description",
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-01-01T00:00:00Z",
          "userId": "user-id"
        }
      ]
    }
  }
  ```

## Components Used

### shadcn/ui Components

- **Card:** For displaying health track information
  - `Card` - Container component
  - `CardHeader` - Header section
  - `CardTitle` - Track title
  - `CardDescription` - Track description

### Next.js Components

- **Link:** For client-side navigation to track detail pages
- **useRouter:** For programmatic navigation (redirect)

### Authentication

- **useSession:** Hook from Better Auth client for session management

## Helper Functions

### fetchUserData()

- Fetches current user's information including health tracks
- Throws error if authentication fails or request fails
- Returns `UserWithTracks` object

### formatTrackDate()

- Formats ISO date strings to readable format
- Returns formatted date string (e.g., "January 1, 2024")

## Testing

### Test Coverage

- ✅ Redirect when not authenticated
- ✅ Display loading state
- ✅ Display user name when authenticated
- ✅ Display health tracks list
- ✅ Display empty state
- ✅ Display error state
- ✅ Clickable links to track detail pages

### Running Tests

```bash
cd apps/web
pnpm test dashboard
```

## Component Structure

The dashboard page follows component-structure rules:

- Uses render functions to break down complex JSX
- Main return statement is clean with render function calls
- Separates concerns:
  - `renderLoading()` - Loading state UI
  - `renderError()` - Error state UI
  - `renderEmptyState()` - Empty state UI
  - `renderHealthTracks()` - Health tracks grid
  - `renderContent()` - Main content orchestration

## Styling

- Uses Tailwind CSS for all styling
- Responsive design with mobile-first approach
- Follows shadcn design tokens
- Accessible focus states and keyboard navigation
- Smooth transitions and hover effects

## Related Pages

### Health Track Detail Page

- **Route:** `/tracks/[trackSlug]`
- **Purpose:** Display a specific health track and its events
- **Page Component:** `apps/web/src/app/tracks/[trackSlug]/page.tsx`
- **Features:**
  - Displays track name and description
  - Lists all health events for the track (newest to oldest)
  - Each event shows: title, date/time, type, notes, and metrics
  - Uses ShadCN Card components for event display
  - Server-side rendered (RSC) for optimal performance
- **API Endpoints Used:**
  - `GET /api/tracks/:slug` - Fetch track metadata
  - `GET /api/tracks/:slug/events` - Fetch events sorted by date

### Track Event List Component

- **Location:** `apps/web/src/components/track_event_list/`
- **Purpose:** Reusable component for rendering health events
- **Features:**
  - Displays events in card format
  - Shows formatted dates using Intl.DateTimeFormat
  - Renders optional notes and metrics (JSON)
  - Empty state when no events exist
  - Type badge for each event
  - Fully tested with Jest + RTL

## Future Enhancements

1. Add ability to create new health tracks from dashboard
2. Add search/filter functionality for tracks
3. Display track statistics (number of events, last updated)
4. Add sorting options (by date, alphabetically)
5. Add bulk actions (delete, archive)
6. Display recent events across all tracks
7. Link dashboard health track cards to `/tracks/[slug]` pages
