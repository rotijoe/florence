# API Testing Guide

This guide helps you test the Florence API endpoints using curl or GUI tools.

## Prerequisites

1. **Start the API server:**

```bash
cd apps/api
pnpm dev
```

Server runs on `http://localhost:8787`

2. **Set up environment variables:**

```bash
cp apps/api/.env.example apps/api/.env
# Edit .env with your DATABASE_URL
```

## Test Sequence

### 1. Create a Test User

```bash
curl -X POST http://localhost:8787/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@florence.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Expected:** User creation response with session cookie

### 2. Sign In and Save Session

```bash
curl -X POST http://localhost:8787/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@florence.com",
    "password": "password123"
  }'
```

**Expected:** Session response with authentication cookie saved to `cookies.txt`

### 3. Get User Profile

```bash
# Replace USER_ID with the user ID from sign-up response
curl http://localhost:8787/api/users/USER_ID \
  -b cookies.txt
```

**Expected:**

```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "Test User",
    "email": "test@florence.com",
    "tracks": []
  }
}
```

### 4. Test Unauthorized Access

```bash
# Try without cookies
curl http://localhost:8787/api/users/USER_ID
```

**Expected:** `{"success":false,"error":"Unauthorized"}` (401)

### 5. Test Wrong User Access

```bash
# Try accessing another user's data
curl http://localhost:8787/api/users/OTHER_USER_ID \
  -b cookies.txt
```

**Expected:** `{"success":false,"error":"Not found"}` (404 - hides resource existence)

### 6. Create a Health Track

```bash
curl -X POST http://localhost:8787/api/users/USER_ID/tracks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Sleep",
    "description": "Tracking sleep patterns"
  }'
```

**Expected (201):**

```json
{
  "success": true,
  "data": {
    "id": "track-id",
    "title": "Sleep",
    "slug": "sleep",
    "description": "Tracking sleep patterns",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 7. Get Track

```bash
curl http://localhost:8787/api/users/USER_ID/tracks/sleep \
  -b cookies.txt
```

### 8. Create an Event

```bash
curl -X POST http://localhost:8787/api/users/USER_ID/tracks/sleep/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "7h 30m",
    "type": "NOTE",
    "date": "2025-10-21T08:00:00.000Z",
    "notes": "Woke up refreshed"
  }'
```

**Expected (201):**

```json
{
  "success": true,
  "data": {
    "id": "event-id",
    "title": "7h 30m",
    "type": "NOTE",
    "date": "2025-10-21T08:00:00.000Z",
    "notes": "Woke up refreshed",
    "fileUrl": null,
    ...
  }
}
```

### 9. List Events

```bash
curl "http://localhost:8787/api/users/USER_ID/tracks/sleep/events?limit=10" \
  -b cookies.txt
```

### 10. Upload Document

```bash
# Step 1: Get upload URL
curl -X POST http://localhost:8787/api/users/USER_ID/tracks/sleep/events/EVENT_ID/upload-url \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "fileName": "report.pdf",
    "contentType": "application/pdf",
    "size": 12345
  }'

# Step 2: Upload to S3 (use uploadUrl from response)
curl -X PUT "UPLOAD_URL_FROM_RESPONSE" \
  --data-binary @report.pdf \
  -H "Content-Type: application/pdf"

# Step 3: Confirm upload
curl -X POST http://localhost:8787/api/users/USER_ID/tracks/sleep/events/EVENT_ID/upload-confirm \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "fileUrl": "CANONICAL_URL_FROM_STEP_1",
    "key": "KEY_FROM_STEP_1"
  }'
```

### 11. Sign Out

```bash
curl -X POST http://localhost:8787/api/auth/sign-out \
  -b cookies.txt
```

**Expected:** `{"success":true}`

### 12. Verify Sign Out

```bash
curl http://localhost:8787/api/users/USER_ID \
  -b cookies.txt
```

**Expected:** `{"success":false,"error":"Unauthorized"}` (401)

## Using Postman or Bruno

1. **Set Base URL:** `http://localhost:8787`

2. **Sign Up:**
   - Method: `POST`
   - URL: `/api/auth/sign-up`
   - Body: JSON with `email`, `password`, `name`

3. **Sign In:**
   - Method: `POST`
   - URL: `/api/auth/sign-in`
   - Body: JSON with `email`, `password`
   - Enable "Save Cookies" option

4. **Access Protected Routes:**
   - Use `/api/users/:userId/...` pattern
   - Replace `:userId` with actual user ID
   - Cookies will be sent automatically

## Testing Auth Behaviors

### Test Cases

1. **Unauthenticated request:**
   - No cookies → `401 Unauthorized`

2. **Wrong user ID:**
   - Authenticated but `userId` param ≠ session user ID → `404 Not found`

3. **Correct user:**
   - Authenticated and `userId` matches → Success

## Common Issues

### "Cannot find module @packages/database"

```bash
pnpm install
cd packages/database
npx prisma generate
```

### "Port 8787 already in use"

```bash
pkill -f "tsx watch"
```

### "Database connection error"

Verify `DATABASE_URL` is set correctly in `apps/api/.env`

### "401 Unauthorized" on protected routes

- Ensure you've signed in and cookies are saved
- Check cookies are being sent with requests (`-b cookies.txt` in curl)

## Unit Tests

For automated testing, see test files:

- `apps/api/src/routes/tracks/tests/`
- `apps/api/src/routes/events/tests/`
- `apps/api/src/routes/uploads/tests/`
- `apps/api/src/routes/user/tests/`

Run tests:

```bash
cd apps/api
pnpm test
```

### Fail-Fast Test Guards

The API test suite includes **fail-fast guards** that prevent accidental real database or S3 calls during unit tests. These guards are automatically enabled in `apps/api/jest.setup.js`.

#### How It Works

1. **Prisma Guard**: A Prisma middleware (`$use`) intercepts all database queries and throws an error if the query method hasn't been mocked with `jest.spyOn()`.

2. **S3 Guard**: The `s3Client.send()` method is overridden to throw an error by default. Tests that need S3 functionality must mock it explicitly.

#### Why This Exists

- **Prevents accidental real DB calls**: Ensures tests never hit the actual database, avoiding data corruption and test interdependencies
- **Prevents accidental S3 calls**: Avoids unnecessary AWS API calls and potential costs
- **Enforces proper mocking**: Makes it immediately obvious when a test is missing required mocks
- **Fast feedback**: Tests fail fast with clear error messages pointing to the unmocked call

#### Example Error

If a test calls `prisma.user.findUnique()` without mocking it:

```
Error: Unexpected Prisma query: user.findUnique.
This query was not mocked. Use jest.spyOn(prisma.user, 'findUnique') to mock it.
If this is an integration test, set ALLOW_EXTERNAL_IO=true.
```

#### Mocking Required Calls

All Prisma and S3 calls must be mocked in tests:

```typescript
// Mock Prisma calls
const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique')
findUniqueSpy.mockResolvedValue(mockUser)

// Mock S3 calls
const sendSpy = jest.spyOn(s3Client, 'send')
sendSpy.mockResolvedValue(undefined)
```

#### Opting Out for Integration Tests

For integration tests that need real database/S3 access, set the environment variable:

```bash
ALLOW_EXTERNAL_IO=true pnpm test
```

**Note**: Integration tests should be separate from unit tests and use a dedicated test database.

## See Also

- [API Endpoints Reference](./ENDPOINTS.md)
- [API Overview](./README.md)
- [Root README](../../README.md)
