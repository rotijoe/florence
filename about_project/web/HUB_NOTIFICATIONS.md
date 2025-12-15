# Hub Notifications Architecture

## Overview

The hub notifications system displays contextual reminders on the user's home page, prompting them to complete actions like adding appointment details or logging symptoms. Notifications are fetched server-side and rendered with optimistic UI updates for instant feedback when dismissed.

## Location

- **Home Page:** `apps/web/src/app/[userId]/page.tsx`
- **Notifications Component:** `apps/web/src/components/hub_notifications/index.tsx`
- **API Handler:** `apps/api/src/routes/user/handlers/hub_notifications.ts`
- **API Endpoint:** `GET /api/user/hub/notifications` and `POST /api/user/hub/notifications/dismiss`

## Notification Types

Two notification types are supported:

| Type                 | Purpose                                 | Trigger                                    |
| -------------------- | --------------------------------------- | ------------------------------------------ |
| `appointmentDetails` | Prompt to add details to an appointment | Appointment event missing notes/location   |
| `symptomReminder`    | Prompt to log symptoms for a track      | Track hasn't had a symptom logged recently |

### Type Definition

```typescript
// apps/web/src/app/[userId]/types.ts
type NotificationType = 'appointmentDetails' | 'symptomReminder'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  ctaLabel?: string
  href?: string
  entityId?: string
  notificationType?: 'EVENT_MISSING_DETAILS' | 'TRACK_MISSING_SYMPTOM'
  trackSlug?: string
}
```

## Data Flow

### Fetching Notifications

1. **Server-side:** `page.tsx` calls `fetchHubNotifications()` in `helpers.ts`
2. **API:** `GET /api/user/hub/notifications` returns notifications based on:
   - Events needing details (appointments without notes)
   - Tracks needing symptom logs
3. **Props:** Notifications are passed to `HubNotifications` component

### Dismissing Notifications

1. **User action:** Click dismiss button (X icon)
2. **Optimistic update:** Notification removed from UI immediately
3. **API call:** `POST /api/user/hub/notifications/dismiss` with `{ type, entityId }`
4. **On success:** `router.refresh()` syncs with server
5. **On error:** Notification restored to UI

## Optimistic Update Pattern

The component uses React 19's `useOptimistic` hook for instant UI feedback:

```typescript
// apps/web/src/components/hub_notifications/index.tsx
const [optimisticNotifications, updateOptimisticNotifications] = useOptimistic(
  initialNotifications,
  notificationsOptimisticReducer
)
```

### Reducer Actions

```typescript
// apps/web/src/components/hub_notifications/helpers.ts
type NotificationOptimisticAction =
  | { type: 'REMOVE_BY_ID'; id: string }
  | { type: 'REMOVE_BY_TRACK_SLUG'; trackSlug: string }
  | { type: 'RESTORE'; notification: Notification }
```

| Action                 | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `REMOVE_BY_ID`         | Remove notification when dismiss button clicked |
| `REMOVE_BY_TRACK_SLUG` | Remove symptom reminder after logging a symptom |
| `RESTORE`              | Rollback on API error, maintains sort order     |

### Why `router.refresh()`?

`useOptimistic` shows optimistic state only during the pending transition. Once the async operation completes, state reverts to props. Calling `router.refresh()` triggers a server re-render with fresh data, ensuring the dismissed notification stays gone.

## Component Structure

### `HubNotifications` Props

```typescript
interface HubNotificationsProps {
  notifications: Notification[]
  tracks: TrackOption[]
  userId: string
}
```

### Component Flow

```
HubNotifications
├── Empty state card (when no notifications)
└── Notifications card
    ├── Header (title + description)
    └── Content
        └── renderItems() → notification list
            ├── Title
            ├── Dismiss button (X)
            ├── CTA button (optional)
            └── Separator (between items)
```

### CTA Button Behavior

| Notification Type    | CTA Action                                      |
| -------------------- | ----------------------------------------------- |
| `symptomReminder`    | Opens `SymptomDialogue` with pre-selected track |
| `appointmentDetails` | Navigates to `notification.href`                |

## API Endpoints

### GET `/api/user/hub/notifications`

Returns notifications for the authenticated user.

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-1",
        "type": "appointmentDetails",
        "title": "Add details to your upcoming appointment",
        "message": "...",
        "ctaLabel": "Add details",
        "href": "/user-123/tracks/cardiology/event-456",
        "entityId": "event-456",
        "notificationType": "EVENT_MISSING_DETAILS"
      }
    ]
  }
}
```

### POST `/api/user/hub/notifications/dismiss`

Marks a notification as dismissed.

**Request:**

```json
{
  "type": "EVENT_MISSING_DETAILS",
  "entityId": "event-456"
}
```

**Response:**

```json
{
  "success": true,
  "data": { "ok": true }
}
```

## File Structure

```
apps/web/src/components/hub_notifications/
├── index.tsx           # Main component with useOptimistic
├── helpers.ts          # Reducer and utility functions
├── constants.ts        # Section titles
├── types.ts            # Props interface
└── tests/
    ├── index.spec.tsx                          # Component tests
    ├── hub_has_notifications.spec.ts           # Helper tests
    └── notifications_optimistic_reducer.spec.ts # Reducer tests
```

## Testing

### Component Tests (`index.spec.tsx`)

- Renders empty state when no notifications
- Renders notifications when present
- Renders dismiss button for each notification
- Renders CTA button when notification has `ctaLabel`
- Calls `router.refresh()` on successful dismiss
- Does not call `router.refresh()` on failure
- Triggers network call on dismiss
- Notification remains visible after failed dismiss

### Reducer Tests (`notifications_optimistic_reducer.spec.ts`)

- `REMOVE_BY_ID`: Removes notification by ID
- `REMOVE_BY_TRACK_SLUG`: Removes symptom reminders matching track
- `RESTORE`: Adds notification back in sorted order
- Default case: Returns state unchanged

## Integration with Symptom Logging

When a user logs a symptom via `SymptomDialogue`, the notification component receives an `onSuccess` callback:

```typescript
function handleSymptomSuccess() {
  setIsSymptomDialogOpen(false)
  if (selectedSymptomTrackSlug) {
    startTransition(() => {
      updateOptimisticNotifications({
        type: 'REMOVE_BY_TRACK_SLUG',
        trackSlug: selectedSymptomTrackSlug
      })
      router.refresh()
    })
  }
  setSelectedSymptomTrackSlug(undefined)
}
```

This removes the symptom reminder notification after the user completes the action.

## Related Documentation

- **Symptom Logging:** See `SYMPTOM_LOG_FLOW.md`
- **Home Page:** See `ACCOUNTS_HOME.md`
- **Event Editing:** See `EVENT_EDIT_FLOW.md`
