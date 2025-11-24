# Event Document Upload & View Flow

## Overview

This document describes the end‑to‑end architecture for uploading and viewing event documents.  
It covers:

- **Frontend:** `UploadDocument` dialog, `useEventUpload` hook, and `DocumentViewer`
- **Server actions:** upload intent + confirm actions
- **API:** upload endpoints and event endpoints that now return **presigned S3 URLs**
- **Storage:** private S3 bucket configuration and object key strategy

The goal is to keep event attachments private in S3 while still allowing seamless upload and viewing from the web app.

---

## Frontend Architecture

### Components & Hooks

- **Upload dialog**
  - **Location:** `apps/web/src/components/upload_document/index.tsx`
  - **Component:** `UploadDocument`
  - **Responsibilities:**
    - Presents a modal dialog for selecting a single file
    - Delegates upload orchestration to `useEventUpload`
    - Enforces:
      - Required file selection
      - Disabled actions while an upload is in progress
    - Calls `onUploadComplete(updatedEvent)` when the backend confirms the upload

- **Upload state hook**
  - **Location:** `apps/web/src/hooks/use_event_upload/index.ts`
  - **Hook:** `useEventUpload`
  - **Inputs:**
    - `eventId: string`
    - `trackSlug: string`
    - `onComplete?: (event: EventResponse) => void`
  - **State:**
    - `status: UploadStatus` (`idle | getting-url | uploading | confirming | success | error`)
    - `error: string | null`
    - `isUploading: boolean` (derived from `status`)
  - **API:**
    - `upload(file: File): Promise<void>`
    - `reset(): void`
  - **Responsibilities:**
    1. **Create upload intent** via server action
    2. **Upload file directly to S3** using the presigned `uploadUrl`
    3. **Confirm upload** with the API so the event is updated with the file URL
    4. Surface progress (`status`) and errors to the UI

- **Document viewer**
  - **Location:** `apps/web/src/components/document_viewer/index.tsx`
  - **Component:** `DocumentViewer`
  - **Inputs:**
    - `url: string` (presigned S3 URL)
    - `fileType: 'image' | 'pdf' | 'text' | 'other'`
  - **Behavior:**
    - `image` → Renders `<img>` with `object-contain` inside a bordered container
    - `pdf` / `text` → Renders `<iframe>` in a fixed‑height container
    - Other types → Shows “cannot be previewed” message with a **Download** link to the `url`

---

## Server Actions

**Location:** `apps/web/src/app/tracks/[trackSlug]/[eventId]/actions.ts`

- **`createEventUploadIntentAction(formData)`**
  - Extracts: `eventId`, `trackSlug`, `fileName`, `contentType`, `size`
  - Sends `POST` to:
    - `/api/tracks/:slug/events/:eventId/upload-url`
  - Returns:
    - `uploadUrl` – presigned S3 `PUT` URL for direct browser upload
    - `fileUrl` – canonical S3 object URL (not presigned)
    - `key` – S3 object key
    - `expiresAt` – timestamp for upload URL expiration

- **`confirmEventUploadAction(formData)`**
  - Extracts: `eventId`, `trackSlug`, `fileUrl`, `key`
  - Sends `POST` to:
    - `/api/tracks/:slug/events/:eventId/upload-confirm`
  - On success:
    - Returns `event: EventResponse` with the stored `fileUrl`
    - Calls `revalidatePath` for:
      - `/tracks/:trackSlug/:eventId`
      - `/tracks/:trackSlug`

---

## API & Storage Architecture

### S3 Client & Helpers

- **Location:** `apps/api/src/lib/s3.ts`
- **Key pieces:**
  - `getStorageConfig()` – reads:
    - `AWS_REGION`
    - `S3_BUCKET_APP_DOCUMENTS`
  - `s3Client` – configured `S3Client` with:
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
  - `getEventDocumentKey(eventId, fileName)` – generates safe, unique keys:
    - Pattern: `events/{eventId}/{timestamp}-{random}-{normalizedName}.{ext}`
  - `getEventDocumentUrl(key)` – canonical S3 object URL (non‑presigned)
  - `getPresignedDownloadUrl(key, expiresInSeconds)` – presigned `GET` URL for viewing/downloading
  - `getObjectKeyFromUrl(url)` – extracts S3 key from the stored canonical URL

### Upload Endpoints

- **Location:** `apps/api/src/routes/uploads/index.ts`

1. **Create upload intent**
   - **Route:** `POST /api/tracks/:slug/events/:eventId/upload-url`
   - **Auth:** Required (Better Auth session)
   - **Request body:**
     - `fileName: string`
     - `contentType: string`
     - `size: number`
   - **Validations:**
     - Event exists **and** belongs to the track
     - `contentType` is in `ALLOWED_CONTENT_TYPES` (PDF, images, DOC/DOCX, text)
     - `size` > 0 and ≤ 10MB (`MAX_FILE_SIZE_BYTES`)
   - **Behavior:**
     - Generates S3 key via `getEventDocumentKey`
     - Creates a `PutObjectCommand` and presigned `uploadUrl` (15‑minute expiry)
     - Generates canonical `fileUrl` via `getEventDocumentUrl`
   - **Response:**
     - `uploadUrl` – presigned S3 upload URL
     - `fileUrl` – canonical S3 object URL to be stored on the event
     - `key` – S3 object key
     - `expiresAt` – upload URL expiration time
     - `maxSize`, `allowedContentTypes`

2. **Confirm upload**
   - **Route:** `POST /api/tracks/:slug/events/:eventId/upload-confirm`
   - **Auth:** Required
   - **Request body:**
     - `fileUrl: string` (canonical S3 URL)
     - `key: string` (S3 object key)
   - **Behavior:**
     - Verifies event + track membership
     - Performs `HeadObject` on S3 to ensure object exists
     - Updates the event `fileUrl` and `updatedAt`
     - Before returning, converts stored `fileUrl` to a **presigned GET URL**:
       - Uses `getObjectKeyFromUrl` + `getPresignedDownloadUrl`
   - **Response:**
     - `EventResponse` with `fileUrl` set to a presigned S3 URL (time‑limited)

### Event Retrieval Endpoints (Presigned View URLs)

- **Location:** `apps/api/src/routes/events/index.ts`

All event‑read endpoints now surface **presigned** `fileUrl` values:

1. `GET /api/tracks/:slug/events`
   - For each event with a stored `fileUrl`:
     - Extracts the S3 key from the canonical URL
     - Generates a presigned `GET` URL via `getPresignedDownloadUrl`
   - Response `fileUrl` is **always presigned**, never the raw bucket URL.

2. `GET /api/tracks/:slug/events/:eventId`
   - Same behavior as above for a single event.

3. `PATCH /api/tracks/:slug/events/:eventId`
   - After updating the event, if `fileUrl` is present:
     - Rewrites it to a presigned `GET` URL before returning the response.

**Result:** The database only stores **canonical S3 URLs**, while all **API responses** expose **time‑limited presigned URLs** safe for direct use in `DocumentViewer` or download links.

---

## End‑to‑End Upload Flow

1. **User opens upload dialog**
   - `EventDetail` (or parent) renders `UploadDocument` with `event` + `trackSlug`.

2. **User selects a file**
   - `UploadDocument` stores the selected `File` in local state.

3. **Create upload intent (server action)**
   - `useEventUpload.upload(file)` calls `createEventUploadIntentAction`:
     - Backend validates input and event/track
     - Returns `uploadUrl`, `fileUrl`, `key`.

4. **Direct S3 upload**
   - Browser issues `PUT` to `uploadUrl` with the file body.
   - No app server involvement in the file stream; the API only issues the presigned URL.

5. **Confirm upload (server action)**
   - `useEventUpload` calls `confirmEventUploadAction` with `fileUrl` + `key`.
   - API verifies the object exists, updates the event, and returns `EventResponse` with:
     - `fileUrl` → **presigned GET URL** for viewing/downloading.

6. **UI update**
   - `onComplete(updatedEvent)` is called from `useEventUpload`.
   - The calling component updates its local state / optimistic event and closes the dialog.
   - Subsequent fetches of the event or events list will return **fresh presigned URLs**.

---

## Security & Permissions

- S3 bucket is assumed to be **private**:
  - No public read on bucket or objects.
  - All access for uploads and downloads uses **presigned URLs**.
- Upload endpoints require an authenticated user:
  - Requests are authorized via Better Auth session cookies.
- Presigned GET URLs:
  - Are time‑limited (default 1 hour in `getPresignedDownloadUrl`)
  - Are regenerated whenever events are read via the events endpoints.

---

## Testing Notes

- **Frontend:**
  - `useEventUpload` has unit tests under:
    - `apps/web/src/hooks/use_event_upload/tests/index.spec.ts`
  - `UploadDocument` is tested in:
    - `apps/web/src/components/upload_document/tests/index.spec.tsx` (if added)
- **Backend:**
  - Upload endpoints are covered in:
    - `apps/api/src/routes/uploads/index.test.ts` (if present)
  - Events endpoints tests should assert:
    - `fileUrl` is non‑null and looks like a presigned URL when attachments exist.

When extending this feature (e.g., multiple files per event, deletion, or file type icons), update this document and the relevant tests to keep the architecture description accurate.


