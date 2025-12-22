# Web Documentation

## Overview

Florence web app is built with Next.js (App Router) and uses user-scoped routing: `/[userId]/...`. All pages are server components (RSC) where possible for optimal performance.

## Quick Links

- [Route Structure](#route-structure) - Web route map
- [Event Lifecycle](./EVENT_LIFECYCLE.md) - Creating, editing, deleting events
- [Document Upload](./UPLOAD_DOCUMENT_FLOW.md) - File upload flow

## Route Structure

All routes are user-scoped under `/[userId]/`:

```mermaid
flowchart TD
  root[`/[userId]`] -->|Home Hub| home[Home Hub]
  root -->|Tracks List| tracks[`/[userId]/tracks`]
  tracks -->|Track Detail| trackDetail[`/[userId]/tracks/[trackSlug]`]
  trackDetail -->|Create Event| newEvent[`/[userId]/tracks/[trackSlug]/new`]
  trackDetail -->|Event Detail| eventDetail[`/[userId]/tracks/[trackSlug]/[eventId]`]
```

### Route Details

- **`/[userId]`** - Home hub (dashboard) with tracks, notifications, quick actions
- **`/[userId]/tracks`** - Tracks list page (client component)
- **`/[userId]/tracks/[trackSlug]`** - Track detail with timeline (server component)
- **`/[userId]/tracks/[trackSlug]/new`** - Create new event form
- **`/[userId]/tracks/[trackSlug]/[eventId]`** - Event detail/edit page

## Component Structure

Each page/component follows this structure:

```
[component-name]/
├── index.tsx          # Main component
├── helpers.ts         # Utility functions
├── types.ts           # TypeScript types
├── constants.ts       # Constants (optional)
└── test/              # Tests
    ├── index.spec.tsx
    └── [helper].spec.ts
```

## Key Flows

### Event Lifecycle

See [Event Lifecycle](./EVENT_LIFECYCLE.md) for:
- Creating events
- Editing events
- Deleting events
- Uploading documents

### Document Upload

See [Document Upload Flow](./UPLOAD_DOCUMENT_FLOW.md) for:
- Upload URL generation
- S3 direct upload
- Upload confirmation
- Presigned download URLs

## API Integration

All API calls use the user-scoped endpoints:

- `GET /api/users/:userId` - User profile
- `GET /api/users/:userId/tracks/:slug` - Track metadata
- `GET /api/users/:userId/tracks/:slug/events` - Track events
- `POST /api/users/:userId/tracks/:slug/events` - Create event
- `PATCH /api/users/:userId/tracks/:slug/events/:eventId` - Update event
- `DELETE /api/users/:userId/tracks/:slug/events/:eventId` - Delete event

## See Also

- [API Documentation](../api/README.md)
- [Root README](../../README.md)

