# Event Content Encryption Implementation

## Overview

Event content has been split into queryable metadata (`Event` table) and encrypted payload (`EventContent` table). This provides stronger security boundaries and easier RLS configuration.

## Schema Changes

### Event Model (Metadata Only)

- `id`, `trackId`, `date`, `type`, `createdAt`, `updatedAt`
- Removed: `title`, `notes`, `fileUrl`, `symptomType`, `severity`
- Added: `content` relation (one-to-one with `EventContent`)

### EventContent Model (Encrypted Payload)

- `eventId` (primary key, foreign key to `Event.id`)
- `contentEnc` (Bytes) - Single encrypted blob containing JSON payload

### Encrypted Payload Structure

```typescript
{
  title: string
  notes: string | null
  fileUrl: string | null
  symptomType: string | null
  severity: number | null
}
```

## Encryption Implementation

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Management**: Master key from KMS (via `ENCRYPTION_KEY` env var)
- **Location**: `apps/api/src/lib/crypto/encrypt.ts`
- **No DB extensions**: Encryption handled entirely in API layer

## API Changes

All event handlers now:

1. Encrypt content before writing to `EventContent`
2. Decrypt content when reading from `EventContent`
3. Return plaintext fields to clients (API response shape unchanged)

### Updated Handlers

- `create.ts` - Encrypts content on event creation
- `detail.ts` (get/update/remove) - Decrypts/encrypts content
- `list.ts` - Decrypts content for all events
- `attachment.ts` - Updates encrypted content when fileUrl changes
- `upload.ts` - Updates encrypted content when file attached
- `hub_notifications.ts` - Decrypts content to check for missing details
- `upcoming_appointments.ts` - Decrypts content to get title
- `delete.ts` (tracks) - Decrypts content to delete S3 files

## RLS Configuration

`EventContent` table requires RLS policy scoped via event → track ownership:

```sql
CREATE POLICY "event_contents_user_isolation"
ON "event_contents"
FOR ALL
TO app_runtime
USING (
  EXISTS (
    SELECT 1 FROM "events" e
    JOIN "health_tracks" ht ON ht."id" = e."trackId"
    WHERE e."id" = "event_contents"."eventId"
      AND ht."userId" = current_setting('app.user_id', true)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "events" e
    JOIN "health_tracks" ht ON ht."id" = e."trackId"
    WHERE e."id" = "event_contents"."eventId"
      AND ht."userId" = current_setting('app.user_id', true)
  )
);
```

## Neon Dashboard Setup

When ready to deploy schema changes:

1. **Enable RLS on EventContent table:**

   ```sql
   ALTER TABLE "event_contents" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "event_contents" FORCE ROW LEVEL SECURITY;
   ```

2. **Grant permissions to app_runtime role:**

   ```sql
   GRANT SELECT, INSERT, UPDATE, DELETE ON event_contents TO app_runtime;
   ```

3. **Create RLS policy** (see SQL above)

4. **Run Prisma commands:**
   ```bash
   cd packages/database
   pnpm db:push    # Push schema changes
   pnpm db:generate # Generate Prisma Client
   pnpm db:seed     # Reseed database (if needed)
   ```

## Environment Variables

Add to `apps/api/.env`:

```bash
# Encryption key (32 bytes as hex string, or 32-byte UTF-8 string)
ENCRYPTION_KEY=your-32-byte-key-here
```

For production, use KMS to provide the key securely.

## Token Hashing (Deferred)

Token hashing for `Session.token` and `Verification.value` was planned but **deferred** because:

- Better Auth's Prisma adapter expects `token` field directly
- Requires custom Better Auth adapter to hash tokens on write and compare hashes on lookup
- This is a separate, more complex task

Token hashing utilities are available in `apps/api/src/lib/crypto/hash.ts` for future implementation.

## Testing

Unit tests added:

- `apps/api/src/lib/crypto/tests/encrypt.spec.ts` - Encryption/decryption tests
- `apps/api/src/lib/crypto/tests/hash.spec.ts` - Token hashing tests

Existing API handler tests will need updates to mock encrypted content.

## Migration Notes

- **No backfill**: Existing events will have empty `content` until updated
- **API response shape unchanged**: Frontend requires no changes
- **Database reset recommended**: Since this is dev-only, reset and reseed is acceptable
