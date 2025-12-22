# Event Lifecycle

## Overview

Events can be created, edited, and deleted within health tracks. All operations use user-scoped API endpoints and server actions for seamless UX.

## Routes

- **Create:** `/[userId]/tracks/[trackSlug]/new`
- **View/Edit:** `/[userId]/tracks/[trackSlug]/[eventId]`
- **List:** `/[userId]/tracks/[trackSlug]` (timeline view)

## Create Event

### Flow

1. **Entry Points:**
   - Track page: "Create event" button → navigates to `/new`
   - Quick add bar: Type-specific buttons → `/new?type=<EVENT_TYPE>`

2. **Create Page:**
   - **Location:** `apps/web/src/app/[userId]/tracks/[trackSlug]/new/page.tsx`
   - Reads `type` query param for preselection
   - Form with title, type, date, notes, symptom fields

3. **Server Action:**
   - **Location:** `apps/web/src/app/[userId]/tracks/[trackSlug]/actions.ts`
   - **Function:** `createEventAction`
   - **API:** `POST /api/users/:userId/tracks/:slug/events`
   - Creates event, redirects to event detail page

### API Endpoint

**POST /api/users/:userId/tracks/:slug/events**

**Auth:** Required (middleware enforces `userId` match)

**Body:**

```json
{
  "title": "Event Title",
  "type": "NOTE",
  "date": "2025-10-21T08:00:00.000Z",
  "notes": "Optional notes",
  "symptomType": "headache", // Optional, for SYMPTOM type
  "severity": 5 // Optional, 1-10, for SYMPTOM type
}
```

**Event Types:** `NOTE`, `APPOINTMENT`, `RESULT`, `LETTER`, `FEELING`, `EXERCISE`, `SYMPTOM`

## Edit Event

### Flow

1. **Enter Edit Mode:**
   - User clicks "Edit" from event detail page menu
   - Component sets `isEditing = true`

2. **Optimistic Updates:**
   - Uses `useOptimistic` hook for instant UI feedback
   - Updates UI before server confirmation
   - Rolls back on error

3. **Save Changes:**
   - Server action: `updateEventAction`
   - **API:** `PATCH /api/users/:userId/tracks/:slug/events/:eventId`
   - Updates title and/or notes
   - Exits edit mode on success

### Components

- **EventDetail:** `apps/web/src/components/event_detail/index.tsx`
- **Server Action:** `apps/web/src/app/[userId]/tracks/[trackSlug]/[eventId]/actions.ts`

### API Endpoint

**PATCH /api/users/:userId/tracks/:slug/events/:eventId**

**Auth:** Required

**Body:**

```json
{
  "title": "Updated Title", // Optional
  "notes": "Updated notes" // Optional, null to clear
}
```

## Delete Event

### Flow

1. **Initiate:**
   - User clicks "Delete" from event detail menu
   - Confirmation dialog appears

2. **Confirm:**
   - User confirms deletion
   - Server action: `deleteEventAction`
   - **API:** `DELETE /api/users/:userId/tracks/:slug/events/:eventId`

3. **Cleanup:**
   - Backend deletes S3 attachment (if present)
   - Deletes event from database
   - Redirects to track page

### API Endpoint

**DELETE /api/users/:userId/tracks/:slug/events/:eventId**

**Auth:** Required

**Behavior:**

- Deletes S3 attachment if `fileUrl` exists
- Deletes event record
- Returns success response

## Cancel New Event

When creating a new event, if user cancels without saving:

- Event is deleted via `deleteEventAction`
- User redirected back to track page
- Only applies to newly created events (`isNew` flag)

## See Also

- [API Endpoints](../api/ENDPOINTS.md)
- [Document Upload](./UPLOAD_DOCUMENT_FLOW.md)
- [Track Detail Page](./TRACK_DETAIL_PAGE.md)
