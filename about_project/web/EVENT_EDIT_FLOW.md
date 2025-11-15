# Event Edit Flow

## Overview

The event edit flow allows users to update event titles and descriptions with an optimistic UI pattern that provides instant feedback without full-page refreshes.

## Architecture

### Server Actions Pattern

The implementation uses Next.js server actions with React's `useOptimistic` and `useActionState` hooks to provide a seamless editing experience:

- **No per-field React state** - Uses uncontrolled form inputs with `defaultValue`
- **Optimistic updates** - UI updates immediately before server confirmation
- **Automatic error handling** - Rolls back optimistic updates on error
- **Framework-provided pending state** - Uses `useFormStatus` instead of manual `isSaving` flag

## Components

### EventDetail Component

**Location:** `apps/web/src/components/event_detail/index.tsx`

**Key Features:**

- Client component that receives `event` and `trackSlug` props
- Uses `useOptimistic` to maintain optimistic event state
- Uses `useActionState` to wire server action to form
- Uses `useFormStatus` in `SaveButton` for pending state
- Renders both read-only and edit views from `optimisticEvent`

**State Management:**

- `isEditing` - Boolean flag for edit mode toggle
- `optimisticEvent` - Current event state (optimistic or confirmed)
- `state` - Server action result (success/error)

### Server Action

**Location:** `apps/web/src/app/tracks/[trackSlug]/[eventId]/actions.ts`

**Function:** `updateEventAction(prevState, formData)`

**Responsibilities:**

- Extracts `eventId`, `trackSlug`, `title`, and `description` from FormData
- Validates input (non-empty title, string/null description)
- Calls backend API endpoint (`PATCH /api/tracks/:slug/events/:eventId`)
- Handles errors and normalizes response
- Triggers `revalidatePath` for cache invalidation
- Returns `{ event?: EventResponse, error?: string }`

## Backend API

### PATCH /api/tracks/:slug/events/:eventId

**Location:** `apps/api/src/routes/events/index.ts`

**Features:**

- Validates event exists and belongs to track
- Validates title (non-empty string) and description (string or null)
- Updates only provided fields (partial updates)
- Returns updated event with new `updatedAt` timestamp

**Validation:**

- Title must be non-empty after trimming
- Description must be string or null
- Returns 400 for validation errors
- Returns 404 if event or track not found

## User Flow

1. **Enter Edit Mode**
   - User clicks "Edit event" from dropdown menu
   - Component sets `isEditing = true`
   - Form inputs appear with current values

2. **Make Changes**
   - User edits title and/or description in uncontrolled inputs
   - No state updates occur during typing

3. **Save Changes**
   - User clicks "Save" button
   - Form submission triggers `handleSubmit`
   - Optimistic update: `updateOptimisticEvent` called immediately with form values
   - UI updates instantly showing new title/description
   - Server action called via `formAction(formData)`
   - `SaveButton` shows "Saving..." via `useFormStatus().pending`

4. **Success Path**
   - Server action returns `{ event: updatedEvent }`
   - `useEffect` detects success and updates `optimisticEvent` with server-confirmed data
   - `isEditing` set to `false` (exits edit mode)
   - Read-only view displays updated values

5. **Error Path**
   - Server action returns `{ error: "..." }`
   - `useEffect` detects error and rolls back `optimisticEvent` to original `event` prop
   - Error message displayed below form
   - User remains in edit mode to retry

## Technical Details

### Optimistic Updates

```typescript
const optimisticEvent = useOptimistic(event, optimisticReducer)

// On submit, update optimistically before server call
const optimisticUpdate = {
  ...optimisticEvent,
  title: formData.get('title'),
  description: formData.get('description'),
  updatedAt: new Date().toISOString(),
}
updateOptimisticEvent(optimisticUpdate)
```

### Form Submission

```typescript
const [state, formAction] = useActionState(updateEventAction, null)

const handleSubmit = async (formData: FormData) => {
  // Optimistic update
  updateOptimisticEvent(optimisticUpdate)
  
  // Server action
  startTransition(async () => {
    await formAction(formData)
  })
}
```

### Pending State

```typescript
function SaveButton({ onCancel, isPending }) {
  const { pending } = useFormStatus()
  const disabled = pending || isPending
  
  return (
    <Button type="submit" disabled={disabled}>
      {disabled ? 'Saving...' : 'Save'}
    </Button>
  )
}
```

## Testing

**Test File:** `apps/web/src/components/event_detail/test/index.spec.tsx`

**Test Coverage:**

- ✅ Enters edit mode when menu item clicked
- ✅ Displays form inputs with current values
- ✅ Saves changes and calls server action
- ✅ Shows saving state while submitting
- ✅ Displays error message on failure
- ✅ Cancels changes and exits edit mode

**Mocking:**

- Server action (`updateEventAction`) is mocked in tests
- Tests verify optimistic updates and error handling

## Related Files

**Backend:**
- `apps/api/src/routes/events/index.ts` - PATCH endpoint implementation
- `apps/api/src/routes/events/index.test.ts` - Backend tests

**Frontend:**
- `apps/web/src/components/event_detail/index.tsx` - Main component
- `apps/web/src/components/event_detail/types.ts` - TypeScript types
- `apps/web/src/app/tracks/[trackSlug]/[eventId]/actions.ts` - Server action
- `apps/web/src/app/tracks/[trackSlug]/[eventId]/page.tsx` - Page component

**Documentation:**
- `about_project/api/ENDPOINTS.md` - API endpoint documentation

## Future Enhancements

1. **Document Upload** - Add file upload field (separate from title/description edit)
2. **Field-Level Validation** - Show validation errors per field
3. **Auto-save Draft** - Save changes automatically as user types
4. **Undo/Redo** - Allow users to undo changes
5. **Conflict Resolution** - Handle concurrent edits from multiple users

