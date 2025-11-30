# API Endpoints

## Overview

This document describes all available API endpoints in the Florence API.

## Base URL

- **Development:** `http://localhost:8787`
- **Production:** TBD

## Authentication

All protected endpoints require authentication via Better Auth session cookies.

### Authentication Flow

1. User signs up or signs in
2. Better Auth creates a session and sets cookies
3. Session middleware extracts user from cookies on each request
4. Protected endpoints check for user in context

## Endpoints

### Authentication

#### POST /api/auth/sign-up

Create a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "session": {
    "token": "session-token",
    "expiresAt": "2024-01-08T00:00:00Z"
  }
}
```

#### POST /api/auth/sign-in

Authenticate a user.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "session": {
    "token": "session-token",
    "expiresAt": "2024-01-08T00:00:00Z"
  }
}
```

#### POST /api/auth/sign-out

Sign out the current user.

**Authentication:** Required

**Response:**

```json
{
  "success": true
}
```

#### GET /api/auth/session

Get current session information.

**Authentication:** Required

**Response:**

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "session": {
    "token": "session-token",
    "expiresAt": "2024-01-08T00:00:00Z"
  }
}
```

### Users

#### GET /api/users

Get all users with their health tracks.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "emailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "tracks": [
        {
          "id": "track-id",
          "title": "Track Title",
          "description": "Track Description",
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-01-01T00:00:00Z",
          "userId": "user-id",
          "events": []
        }
      ]
    }
  ]
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

#### GET /api/user/me

Get current user's information with their health tracks.

**Authentication:** Required

**Response:**

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

**Error Response (401):**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "User not found"
}
```

#### POST /api/user/tracks

Create a new health track for the authenticated user.

**Authentication:** Required

**Request Body:**

```json
{
  "title": "Sleep",
  "description": "Optional description for the track"
}
```

**Validation:**

- `title` - Required, must be a non-empty string after trimming
- `description` - Optional, can be a string or null

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "track-id",
    "userId": "user-id",
    "title": "Sleep",
    "slug": "sleep",
    "description": "Optional description for the track",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Slug Generation:**

- The `slug` is automatically generated from the `title`:
  - Converted to lowercase
  - Special characters removed
  - Spaces replaced with hyphens
  - Multiple hyphens collapsed to single hyphen
- If a track with the same slug already exists for the user, a numeric suffix is appended (e.g., `sleep-2`, `sleep-3`)

**Error Response (400):**

```json
{
  "success": false,
  "error": "Title is required and must be a non-empty string"
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Database connection failed"
}
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message"
}
```

### Common HTTP Status Codes

- **200 OK** - Request succeeded
- **401 Unauthorized** - Authentication required or failed
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

## CORS Configuration

CORS is configured for authentication endpoints:

- **Allowed Origins:** `http://localhost:3000` (development)
- **Allowed Methods:** POST, GET, OPTIONS
- **Credentials:** Enabled
- **Allowed Headers:** Content-Type, Authorization

## Session Middleware

All routes use session middleware that:

1. Extracts session from request headers
2. Sets `user` and `session` in context
3. Sets to `null` if no valid session found
4. Allows request to continue (individual routes handle auth)

### Health Tracks

#### GET /api/tracks/:slug

Get a health track by its unique slug.

**Authentication:** Not required (public endpoint)

**Path Parameters:**

- `slug` - Unique slug identifier for the track (e.g., `sleep`, `hydration`)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "track-id",
    "name": "Sleep",
    "slug": "sleep",
    "createdAt": "2025-10-21T00:00:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Track not found"
}
```

#### GET /api/tracks/:slug/events

Get all health events for a specific track, sorted by occurrence date (newest first).

**Authentication:** Not required (public endpoint)

**Path Parameters:**

- `slug` - Unique slug identifier for the track

**Query Parameters:**

- `limit` (optional) - Maximum number of events to return (default: 100)
- `sort` (optional) - Sort order: `desc` or `asc` (default: `desc`)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "event-id",
      "trackId": "track-id",
      "occurredAt": "2025-10-21T14:30:00.000Z",
      "title": "7h 45m",
      "notes": "Woke up refreshed",
      "type": "sleep",
      "metrics": {
        "durationMin": 465,
        "quality": "good"
      }
    }
  ]
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Track not found"
}
```

#### GET /api/tracks/:slug/events/:eventId

Get a specific health event by ID.

**Authentication:** Not required (public endpoint)

**Path Parameters:**

- `slug` - Unique slug identifier for the track
- `eventId` - Unique identifier for the event

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "event-id",
    "trackId": "track-id",
    "date": "2025-10-21T14:30:00.000Z",
    "type": "NOTE",
    "title": "Event Title",
    "notes": "Event Notes",
    "fileUrl": null,
    "createdAt": "2025-10-21T14:30:00.000Z",
    "updatedAt": "2025-10-21T14:30:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Event not found"
}
```

#### PATCH /api/tracks/:slug/events/:eventId

Update a health event's title and/or notes.

**Authentication:** Not required (public endpoint)

**Path Parameters:**

- `slug` - Unique slug identifier for the track
- `eventId` - Unique identifier for the event

**Request Body:**

```json
{
  "title": "Updated Event Title",
  "notes": "Updated notes or null"
}
```

Both fields are optional. Only provided fields will be updated.

**Validation:**

- `title` - If provided, must be a non-empty string after trimming
- `notes` - If provided, must be a string or null

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "event-id",
    "trackId": "track-id",
    "date": "2025-10-21T14:30:00.000Z",
    "type": "NOTE",
    "title": "Updated Event Title",
    "notes": "Updated notes",
    "fileUrl": null,
    "createdAt": "2025-10-21T14:30:00.000Z",
    "updatedAt": "2025-10-22T10:00:00.000Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Title is required and must be a non-empty string"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Event not found"
}
```

> **Note:** If the event has an attached document, the `fileUrl` field in all event responses is a **time‑limited presigned S3 URL** that can be used directly in the web app to view or download the file. The database stores the canonical S3 object URL; presigned URLs are generated dynamically on each read.

### Event Document Upload

#### POST /api/tracks/:slug/events/:eventId/upload-url

Create an upload intent and return a presigned S3 URL for uploading an event document directly from the browser.

- **Authentication:** Required (Better Auth session)

**Path Parameters:**

- `slug` - Unique slug identifier for the track
- `eventId` - Unique identifier for the event

**Request Body:**

```json
{
  "fileName": "report.pdf",
  "contentType": "application/pdf",
  "size": 123456
}
```

**Validation:**

- `fileName` - Required, non‑empty string
- `contentType` - Required, must be one of the allowed types:
  - `application/pdf`
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `image/webp`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `text/plain`
- `size` - Required, positive number, must not exceed **10 MB**
- Event must exist and belong to the specified track

**Response (200):**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://bucket.s3.amazonaws.com/....",
    "fileUrl": "https://bucket.s3.region.amazonaws.com/events/event-id/12345-random-report.pdf",
    "key": "events/event-id/12345-random-report.pdf",
    "expiresAt": "2025-10-22T10:15:00.000Z",
    "maxSize": 10485760,
    "allowedContentTypes": [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "contentType must be one of: application/pdf, image/jpeg, ..."
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Event not found"
}
```

#### POST /api/tracks/:slug/events/:eventId/upload-confirm

Confirm that an event document has been successfully uploaded to S3 and attach it to the event.

- **Authentication:** Required

**Path Parameters:**

- `slug` - Unique slug identifier for the track
- `eventId` - Unique identifier for the event

**Request Body:**

```json
{
  "fileUrl": "https://bucket.s3.region.amazonaws.com/events/event-id/12345-random-report.pdf",
  "key": "events/event-id/12345-random-report.pdf"
}
```

**Behavior:**

- Verifies the event exists and belongs to the track
- Issues a `HeadObject` request to S3 to ensure the object exists at `key`
- Updates the event’s `fileUrl` in the database to the canonical S3 URL
- Generates a **presigned S3 GET URL** for the updated event before returning the response

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "event-id",
    "trackId": "track-id",
    "date": "2025-10-21T14:30:00.000Z",
    "type": "NOTE",
    "title": "Event Title",
    "notes": "Event Notes",
    "fileUrl": "https://bucket.s3.region.amazonaws.com/....SIGNED....",
    "createdAt": "2025-10-21T14:30:00.000Z",
    "updatedAt": "2025-10-22T10:00:00.000Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "fileUrl is required and must be a string"
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "File not found in storage. Please upload the file first."
}
```

#### DELETE /api/tracks/:slug/events/:eventId

Delete a health event and its associated attachment (if any).

- **Authentication:** Not required (public endpoint)

**Path Parameters:**

- `slug` - Unique slug identifier for the track
- `eventId` - Unique identifier for the event

**Behavior:**

- Verifies the event exists and belongs to the track
- If the event has an attached document (`fileUrl`), deletes the file from S3
- Deletes the event from the database
- Returns success response

**Response (200):**

```json
{
  "success": true
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Event not found"
}
```

or

```json
{
  "success": false,
  "error": "Track not found"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Database connection failed"
}
```

> **Note:** If S3 file deletion fails, the event deletion will still proceed. The S3 error is logged but does not prevent the event from being deleted.

## Future Endpoints

### Health Tracks (Authenticated)

- POST /api/tracks - Create health track
- PUT /api/tracks/:id - Update track
- DELETE /api/tracks/:id - Delete track

### Events (Authenticated)

- POST /api/tracks/:trackId/events - Create event
