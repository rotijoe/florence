# Event Delete Flow

## Overview

The event delete flow allows users to delete health events with a confirmation dialog to prevent accidental deletions. Upon successful deletion, the user is redirected back to the track page.

## Architecture

### Server Actions Pattern

The implementation uses Next.js server actions with a confirmation dialog pattern:

- **Confirmation Dialog** - Uses Dialog component from shadcn/ui to confirm deletion
- **Server Action** - Calls backend API and handles redirect on success
- **Error Handling** - Displays error messages if deletion fails

## Components

### EventDetail Component

**Location:** `apps/web/src/components/event_detail/index.tsx`

**Key Features:**

- Client component that receives `event` and `trackSlug` props
- Manages delete dialog state with `showDeleteDialog`
- Handles delete confirmation and error display

**State Management:**

- `showDeleteDialog` - Boolean flag for delete confirmation dialog visibility
- `error` - Error message state for displaying deletion errors

### Server Action

**Location:** `apps/web/src/app/tracks/[trackSlug]/[eventId]/actions.ts`

**Function:** `deleteEventAction(trackSlug: string, eventId: string)`

**Responsibilities:**

- Validates `trackSlug` and `eventId` are provided
- Calls backend API endpoint (`DELETE /api/tracks/:slug/events/:eventId`)
- Handles errors and normalizes response
- Triggers `revalidatePath` for cache invalidation
- Uses `redirect` to navigate back to track page on success
- Returns `{ error?: string }` on failure

## Backend API

### DELETE /api/tracks/:slug/events/:eventId

**Location:** `apps/api/src/routes/events/index.ts`

**Features:**

- Validates event exists and belongs to track
- If event has an attached document (`fileUrl`), deletes the file from S3
- Deletes the event from the database
- Returns success response

**Behavior:**

- Verifies event exists and belongs to track before deletion
- Attempts to delete S3 file if `fileUrl` exists (continues even if S3 deletion fails)
- Deletes event record from database
- Returns 200 on success, 404 if event/track not found, 500 on server errors

## User Flow

1. **Initiate Deletion**
   - User clicks "Delete event" from dropdown menu in EventDetail component
   - Component sets `showDeleteDialog = true`
   - Confirmation dialog appears

2. **Confirm Deletion**
   - User clicks "Delete" button in confirmation dialog
   - `handleDeleteEvent` function is called
   - Server action `deleteEventAction` is invoked

3. **Success Path**
   - Server action calls backend DELETE API
   - Backend deletes event (and S3 file if present)
   - Server action calls `revalidatePath` for cache invalidation
   - Server action calls `redirect` to navigate to track page
   - User is redirected to `/tracks/:trackSlug`

4. **Error Path**
   - Server action returns `{ error: "..." }`
   - Dialog is closed
   - Error message displayed below event card
   - User remains on event page to retry or cancel

5. **Cancel Deletion**
   - User clicks "Cancel" button in confirmation dialog
   - Component sets `showDeleteDialog = false`
   - Dialog closes, no action taken

## Technical Details

### Delete Confirmation Dialog

```typescript
const [showDeleteDialog, setShowDeleteDialog] = useState(false)

const handleDeleteClick = () => {
  setShowDeleteDialog(true)
  setError(null)
}

const handleDeleteCancel = () => {
  setShowDeleteDialog(false)
}

const handleDeleteEvent = async () => {
  setError(null)
  const result = await deleteEventAction(trackSlug, optimisticEvent.id)

  if (result.error) {
    setError(result.error)
    setShowDeleteDialog(false)
    return
  }

  // If successful, redirect will happen in the server action
}
```

### Server Action Implementation

```typescript
export async function deleteEventAction(
  trackSlug: string,
  eventId: string
): Promise<DeleteEventResult> {
  // Validation
  if (!eventId || !trackSlug) {
    return { error: 'Missing required fields' }
  }

  // Call backend API
  const response = await fetch(`${API_BASE_URL}/api/tracks/${trackSlug}/events/${eventId}`, {
    method: 'DELETE'
  })

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      success: false,
      error: `Failed to delete event: ${response.statusText}`
    }))
    return { error: errorData.error || 'Failed to delete event' }
  }

  // Revalidate and redirect
  revalidatePath(`/tracks/${trackSlug}`)
  redirect(`/tracks/${trackSlug}`)
}
```

### Backend Deletion Logic

```typescript
// Verify event exists and belongs to track
const existingEvent = await prisma.event.findFirst({
  where: {
    id: eventId,
    track: { slug: slug }
  },
  select: { id: true, trackId: true, fileUrl: true }
})

// Delete S3 file if present
if (existingEvent.fileUrl) {
  const key = getObjectKeyFromUrl(existingEvent.fileUrl)
  if (key) {
    try {
      await deleteFile(key)
    } catch (error) {
      // Continue even if S3 deletion fails
      console.error('Error deleting file from S3:', error)
    }
  }
}

// Delete event from database
await prisma.event.delete({
  where: { id: eventId }
})
```

## Testing

**Test File:** `apps/web/src/components/event_detail/test/index.spec.tsx`

**Test Coverage:**

- ✅ Opens delete dialog when menu item clicked
- ✅ Closes delete dialog when cancel is clicked
- ✅ Calls deleteEventAction when delete button is clicked
- ✅ Displays error message when delete fails
- ✅ Clears error when delete dialog is opened

**Mocking:**

- Server action (`deleteEventAction`) is mocked in tests
- Tests verify dialog interactions and error handling

**Backend Test File:** `apps/api/src/routes/events/index.test.ts`

**Test Coverage:**

- ✅ Returns 404 for missing track
- ✅ Returns 404 for missing event
- ✅ Successfully deletes event without attachment
- ✅ Successfully deletes event with attachment
- ✅ Continues deletion even if S3 deletion fails
- ✅ Handles database errors gracefully

## Related Files

**Backend:**

- `apps/api/src/routes/events/index.ts` - DELETE endpoint implementation
- `apps/api/src/routes/events/index.test.ts` - Backend tests

**Frontend:**

- `apps/web/src/components/event_detail/index.tsx` - Main component with delete dialog
- `apps/web/src/components/event_detail/types.ts` - TypeScript types
- `apps/web/src/app/tracks/[trackSlug]/[eventId]/actions.ts` - Server action
- `apps/web/src/components/ui/dialog.tsx` - Dialog component

**Documentation:**

- `about_project/api/ENDPOINTS.md` - API endpoint documentation

## Future Enhancements

1. **Soft Delete** - Add option to soft-delete events (mark as deleted but keep data)
2. **Bulk Delete** - Allow deletion of multiple events at once
3. **Undo Delete** - Add ability to undo deletion within a time window
4. **Delete Confirmation with Event Details** - Show event title/date in confirmation dialog
5. **Delete Animation** - Add smooth transition animation when event is deleted
