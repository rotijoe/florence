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

## Future Endpoints

### Health Tracks (Authenticated)

- POST /api/tracks - Create health track
- PUT /api/tracks/:id - Update track
- DELETE /api/tracks/:id - Delete track

### Events (Authenticated)

- POST /api/tracks/:trackId/events - Create event
- GET /api/events/:id - Get event by ID
- PUT /api/events/:id - Update event
- DELETE /api/events/:id - Delete event
- POST /api/events/:id/upload - Upload file for event
