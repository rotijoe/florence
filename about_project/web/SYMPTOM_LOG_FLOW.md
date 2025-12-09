# Symptom Logging Flow

## Overview

The symptom logging flow allows users to quickly log symptoms from the home page using a dialog form. When a user clicks the "Log symptom" button in the Quick Actions section, a dialog opens with a form to capture symptom details. Upon submission, a symptom event is created via the API.

## Location

- **Home Page:** `apps/web/src/app/[userId]/page.tsx`
- **Quick Actions Component:** `apps/web/src/components/hub_quick_actions/index.tsx`
- **Symptom Dialogue Component:** `apps/web/src/components/hub_quick_actions/symptom_dialogue/index.tsx`
- **API Endpoint:** `apps/api/src/routes/events/index.ts`

## Flow Description

### 1. Log Symptom Button

- **Location:** Home page (`/[userId]`)
- **Component:** `HubQuickActions` component
- **Action:** Opens `SymptomDialogue` dialog when clicked
- **Props Required:**
  - `tracks`: Array of track options with `slug`, `title`, and `lastUpdatedAt`
  - `userId`: Current user ID

### 2. Symptom Dialogue Form

- **Component:** `SymptomDialogue`
- **Fields:**
  - **Track:** Dropdown to select which health track to attach the symptom to
    - Defaults to the most recently updated track (based on `lastUpdatedAt`)
    - Falls back to first track if no dates available
  - **Symptom Type:** Combobox with hardcoded symptom types
    - Options: Headache, Fatigue, Nausea, Dizziness, Pain, Fever, Cough, Shortness of breath
  - **Severity:** Button group with numbers 1-5
    - 1 = Light
    - 2 = Mild
    - 3 = Moderate
    - 4 = Severe
    - 5 = Very severe
  - **Notes:** Textarea for additional details (optional)

### 3. Form Submission

- **Validation:**
  - Track must be selected
  - Symptom type must be selected
  - Severity must be selected (1-5)
  - Notes are optional
- **API Call:**
  - **Endpoint:** `POST /api/users/:userId/tracks/:slug/events`
  - **Method:** Client-side fetch with `credentials: 'include'`
  - **Request Body:**
    ```json
    {
      "type": "SYMPTOM",
      "title": "<symptom-type-label>",
      "symptomType": "<symptom-type-value>",
      "severity": <1-5>,
      "notes": "<notes-text>" | null
    }
    ```
- **Response:** Returns `ApiResponse<EventResponse>` with created symptom event

### 4. Success Handling

- On successful API response:
  - Calls `onSuccess` callback (if provided)
  - Closes the dialog
  - Form state is reset
- On error:
  - Displays error message in dialog
  - Keeps dialog open for retry
  - Submit button remains enabled after error

## Component Structure

### `SymptomDialogue` Props

```typescript
interface SymptomDialogueProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tracks: TrackOption[]
  userId: string
  onSuccess?: () => void
}

interface TrackOption {
  slug: string
  title: string
  lastUpdatedAt: Date | string
}
```

### `HubQuickActions` Props Update

```typescript
interface HubQuickActionsProps {
  symptomOptions: HubQuickActionOption[] // Deprecated, kept for compatibility
  eventOptions: HubQuickActionOption[]
  appointmentOptions: HubQuickActionOption[]
  tracks: TrackOption[] // New: Required for symptom logging
  userId: string // New: Required for API calls
  onSelectOption?: (args: { kind: HubQuickActionKind; value: string }) => void
}
```

## Database Schema

### Event Model Fields

- `type`: `EventType.SYMPTOM` for symptom events
- `symptomType`: `String?` - The type of symptom (e.g., "headache", "fatigue")
- `severity`: `Int?` - Severity level 1-5
- `title`: String - Display title (set to symptom type label)
- `notes`: `String?` - Optional notes

### EventType Enum

```prisma
enum EventType {
  NOTE
  APPOINTMENT
  RESULT
  LETTER
  FEELING
  EXERCISE
  SYMPTOM // New type for symptom events
}
```

## Constants

### Symptom Types

Defined in `apps/web/src/components/hub_quick_actions/symptom_dialogue/constants.ts`:

```typescript
export const SYMPTOM_TYPES = [
  { value: 'headache', label: 'Headache' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'dizziness', label: 'Dizziness' },
  { value: 'pain', label: 'Pain' },
  { value: 'fever', label: 'Fever' },
  { value: 'cough', label: 'Cough' },
  { value: 'shortness-of-breath', label: 'Shortness of breath' }
]
```

### Severity Labels

```typescript
export const SEVERITY_LABELS = {
  1: 'Light',
  2: 'Mild',
  3: 'Moderate',
  4: 'Severe',
  5: 'Very severe'
}
```

## Helper Functions

### `getDefaultTrack`

Located in `apps/web/src/components/hub_quick_actions/symptom_dialogue/helpers.ts`:

- Sorts tracks by `lastUpdatedAt` (most recent first)
- Returns the slug of the most recently updated track
- Handles both Date objects and ISO string dates
- Returns `undefined` if tracks array is empty

## Error Handling

- **Missing Required Fields:** Displays "Please fill in all required fields"
- **API Errors:** Displays error message from API response
- **Network Errors:** Displays "Failed to create symptom event"
- **Validation Errors:** API returns 400 with specific error message

## Testing

### Component Tests

Located in `apps/web/src/components/hub_quick_actions/symptom_dialogue/tests/`:

- `index.spec.tsx`: Tests for SymptomDialogue component
  - Renders dialog when open
  - Defaults to most recently updated track
  - Renders all symptom type options
  - Renders severity buttons 1-5
  - Allows selecting severity
  - Submits form with correct payload
  - Disables submit button while submitting
  - Displays error message on API failure
  - Calls onSuccess callback on success
  - Calls onOpenChange when dialog is closed

- `helpers.spec.ts`: Tests for helper functions
  - `getDefaultTrack`: Returns most recently updated track
  - Handles empty arrays
  - Handles string dates
  - Handles equal dates

### API Tests

- `POST /api/users/:userId/tracks/:slug/events` endpoint tests:
  - Validates severity is between 1-5
  - Validates symptomType is a string
  - Successfully creates symptom event with all fields
  - Returns 400 for invalid severity
  - Returns 400 for invalid symptomType

## Related Flows

- **Event Creation Flow:** See `EVENT_CREATE_FLOW.md` for general event creation
- **Quick Actions:** See `DASHBOARD.md` for Quick Actions section overview
