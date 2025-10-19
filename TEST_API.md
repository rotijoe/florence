# API Integration Test Guide

This guide will help you test the complete Hono + Neon + Prisma + Better Auth integration.

## Prerequisites

Make sure the API server is running:

```bash
cd apps/api
DATABASE_URL="postgresql://neondb_owner:npg_GoCBUvMD81TL@ep-solitary-shadow-abktkit3-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" pnpm dev
```

## Test Sequence

### 1. Test Basic Endpoints

```bash
# Test root endpoint
curl http://localhost:8787/
# Expected: "Hello Hono!"

# Test hello endpoint
curl http://localhost:8787/hello/World
# Expected: "Hello World"
```

### 2. Test Protected Endpoint (Should Fail)

```bash
# Try to access users without authentication
curl http://localhost:8787/api/users
# Expected: {"success":false,"error":"Unauthorized"}
```

### 3. Create a Test User

```bash
curl -X POST http://localhost:8787/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@florence.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
# Expected: User creation response with session
```

### 4. Sign In and Save Session

```bash
curl -X POST http://localhost:8787/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@florence.com",
    "password": "TestPassword123!"
  }'
# Expected: Session response with authentication cookie saved to cookies.txt
```

### 5. Access Protected Endpoint (Should Succeed)

```bash
curl http://localhost:8787/api/users \
  -b cookies.txt
# Expected: {"success":true,"data":[...]} with user list
```

### 6. Check Current Session

```bash
curl http://localhost:8787/api/auth/session \
  -b cookies.txt
# Expected: Current session details
```

### 7. Create a Health Track (Future Endpoint)

Once you implement the tracks endpoint:

```bash
curl -X POST http://localhost:8787/api/tracks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Blood Pressure Monitoring",
    "description": "Tracking my blood pressure over time"
  }'
```

### 8. Sign Out

```bash
curl -X POST http://localhost:8787/api/auth/sign-out \
  -b cookies.txt
# Expected: Sign out confirmation
```

### 9. Verify Sign Out

```bash
curl http://localhost:8787/api/users \
  -b cookies.txt
# Expected: {"success":false,"error":"Unauthorized"}
```

## Using Postman or Bruno

If you prefer a GUI tool:

1. **Import Base URL:** `http://localhost:8787`

2. **Sign Up:**

   - Method: POST
   - URL: `/api/auth/sign-up`
   - Body: JSON

   ```json
   {
     "email": "your@email.com",
     "password": "yourpassword",
     "name": "Your Name"
   }
   ```

3. **Sign In:**

   - Method: POST
   - URL: `/api/auth/sign-in`
   - Body: JSON
   - Enable "Save Cookies" option

4. **Access Protected Routes:**
   - Method: GET
   - URL: `/api/users`
   - Cookies will be sent automatically

## Verify Database

You can verify the data was created in Neon using the Neon SQL tool:

```bash
# Check users
SELECT * FROM users;

# Check sessions
SELECT * FROM sessions;

# Check accounts
SELECT * FROM accounts;
```

## Common Issues

### "Cannot find module @packages/database"

Run from root:

```bash
pnpm install
cd packages/database
npx prisma generate
```

### "Port 8787 already in use"

Kill existing processes:

```bash
pkill -f "tsx watch"
```

### "Database connection error"

Verify DATABASE_URL is set correctly and accessible.

## Success Criteria

✅ Basic endpoints respond correctly
✅ Protected endpoints require authentication
✅ User signup works
✅ Sign in creates session
✅ Authenticated requests succeed
✅ Sign out invalidates session
✅ Data persists in Neon database

## Next Steps

After verifying the basic integration:

1. Implement health tracks CRUD endpoints
2. Implement events CRUD endpoints
3. Add file upload functionality
4. Set up Next.js frontend integration
5. Add email verification
6. Configure production environment
