# Event Creation Flow

## Overview

The event creation flow allows users to create new events within a health track. When a user clicks the "Create event" button, a new event is immediately created in the database, and the user is navigated to the event page in edit mode. If the user cancels without saving, the event is deleted from the database.

## Location

- **Track Page:** `apps/web/src/app/tracks/[trackSlug]/page.tsx`
- **Event Page:** `apps/web/src/app/tracks/[trackSlug]/[eventId]/page.tsx`
- **Event Detail Component:** `apps/web/src/components/event_detail/index.tsx`
- **Server Action:** `apps/web/src/app/tracks/[trackSlug]/[eventId]/actions.ts`
- **API Endpoint:** `apps/api/src/routes/events/index.ts`

## Flow Description

### 1. Create Event Button

- **Location:** Track page (`/tracks/[trackSlug]`)
- **Component:** Button in the header next to the track title
- **Action:** Submits a form with `createEventAction` server action
- **Form Data:** Contains `trackSlug` as a hidden input

### 2. Server Action: `createEventAction`

- **Purpose:** Creates a new event in the database via API call
- **API Endpoint:** `POST /api/tracks/:slug/events`
- **Request Body:** Empty JSON object `{}` (backend uses defaults)
- **Defaults Used:**
  - `title`: "Untitled event"
  - `type`: `EventType.NOTE`
  - `date`: Current date/time
  - `notes`: `null`
- **Response:** Returns `EventResponse` with the created event
- **Redirect:** Navigates to `/tracks/[trackSlug]/[eventId]?new=1`

### 3. API Endpoint: `POST /api/tracks/:slug/events`

- **Authentication:** Required (returns 401 if not authenticated)
- **Authorization:** Verifies track belongs to authenticated user
- **Validation:**
  - Validates `title` if provided (must be non-empty string)
  - Validates `type` if provided (must be valid `EventType`)
  - Validates `severity` if provided (must be integer between 1-5)
  - Validates `symptomType` if provided (must be string)
- **Request Body Fields:**
  - `type`: EventType (defaults to `EventType.NOTE`)
  - `title`: string (defaults to "Untitled event")
  - `notes`: string | null (optional)
  - `symptomType`: string | null (optional, used for `EventType.SYMPTOM`)
  - `severity`: number | null (optional, 1-5, used for `EventType.SYMPTOM`)
- **Response:** Returns `ApiResponse<EventResponse>` with status 201

### 4. Event Page with `?new=1` Flag

- **Location:** `/tracks/[trackSlug]/[eventId]?new=1`
- **Behavior:**
  - Reads `searchParams.new === '1'` to determine if event is newly created
  - Passes `isNew={true}` prop to `EventDetail` component

### 5. EventDetail Component Behavior

- **Initial State:** When `isNew={true}`, component starts in edit mode (`isEditing` state initialized to `true`)
- **Edit Mode:**
  - Title input field is visible and editable
  - Notes textarea is visible and editable
  - Save and Cancel buttons are displayed
- **Cancel Behavior:**
  - If `isNew={true}`: Calls `deleteEventAction` to delete the event from database
  - If `isNew={false}`: Simply exits edit mode without deleting
- **Save Behavior:**
  - Calls `updateEventAction` to save changes
  - Backend validates that title is non-empty
  - On success, exits edit mode

## Key Components

### `createEventAction`

Server action that:

1. Reads `trackSlug` from form data
2. Calls `POST /api/tracks/:slug/events` with cookies for authentication
3. On success, redirects to event page with `?new=1` query parameter
4. On error, returns error message

### `EventDetail` Component Props

```typescript
type EventDetailProps = {
  event: EventResponse
  trackSlug: string
  isNew?: boolean // New prop to indicate newly created event
}
```

### Cancel Handler Logic

```typescript
const handleCancel = async () => {
  if (isNew) {
    // Delete the event if it's a new event
    const result = await deleteEventAction(trackSlug, optimisticEvent.id)
    if (result.error) {
      setError(result.error)
      return
    }
    // If successful, redirect will happen in the server action
    return
  }
  setIsEditing(false)
  setError(null)
}
```

## Error Handling

- **Missing trackSlug:** Returns error "Missing required fields: trackSlug is required"
- **API Errors:** Returns error message from API response
- **Network Errors:** Returns "Failed to create event: [error message]"
- **Delete on Cancel Failure:** Displays error message and keeps event in edit mode

## Testing

### API Tests

- `POST /api/tracks/:slug/events` endpoint tests:
  - Returns 401 when user is not authenticated
  - Returns 404 when track does not exist
  - Successfully creates event with defaults
  - Successfully creates event with provided data
  - Returns 400 for invalid title
  - Handles database errors gracefully

### Web Tests

- `createEventAction` server action tests:
  - Creates event successfully and redirects
  - Returns error when trackSlug is missing
  - Handles API error response
  - Handles network errors
  - Handles empty cookies

- `EventDetail` component tests:
  - Starts in edit mode when `isNew={true}`
  - Calls `deleteEventAction` when cancel is clicked on new event
  - Displays error message when delete fails on cancel
  - Does not delete event when cancel is clicked on existing event

## Related Flows

- **Event Edit Flow:** See `EVENT_EDIT_FLOW.md` for details on editing existing events
- **Event Delete Flow:** See `EVENT_DELETE_FLOW.md` for details on deleting events
- **Upload Document Flow:** See `UPLOAD_DOCUMENT_FLOW.md` for details on uploading attachments
