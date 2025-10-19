# Florence API

Hono-based API for the Florence health tracking application.

## Setup

### Environment Variables

Set the following environment variables:

```bash
PORT=8787
BASE_URL=http://localhost:8787
DATABASE_URL="postgresql://neondb_owner:npg_GoCBUvMD81TL@ep-solitary-shadow-abktkit3-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
```

### Development

```bash
pnpm dev
```

The server will start on `http://localhost:8787`

## Features

### Better Auth Integration

The API uses Better Auth for authentication with the following configuration:

- Email/password authentication
- Session management (7-day expiry)
- Cross-subdomain cookie support
- Prisma database adapter

### Authentication Endpoints

Better Auth provides these endpoints automatically:

- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Sign in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

### API Endpoints

#### GET /api/users

Returns all users with their health tracks and events. Requires authentication.

**Response:**

```json
{
  "success": true,
  "data": [...]
}
```

**Error (Unauthorized):**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

## Architecture

- **Framework:** Hono
- **Auth:** Better Auth with Prisma adapter
- **Database:** Neon PostgreSQL via Prisma ORM
- **Session Management:** Cookie-based sessions with CORS support

## CORS Configuration

CORS is configured for the Next.js frontend at `http://localhost:3000` with:

- Credentials support
- POST, GET, OPTIONS methods
- Content-Type and Authorization headers
