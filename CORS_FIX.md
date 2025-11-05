# CORS and Server Crash Fix - RESOLVED ✅

## Issues Fixed

1. **CORS Error**: Backend wasn't allowing requests from frontend
2. **EPIPE/SIGSEGV Error**: Server crash when handling requests
3. **TypeScript compilation errors**: JWT type issues

## Root Cause

The main issue was using Alpine Linux base image with bcrypt, which caused segmentation faults. Alpine uses musl libc instead of glibc, which can cause compatibility issues with native Node.js modules like bcrypt.

## Changes Made

### 1. Backend CORS Configuration (.env)
- Added multiple allowed origins for development
- Supports localhost:3000, localhost:5173, and 127.0.0.1 variants

### 2. Server CORS Middleware (src/server.ts)
- Updated to handle multiple origins dynamically
- More permissive in development mode
- Proper OPTIONS handling for preflight requests
- Added explicit methods and headers configuration

### 3. Dockerfile
- **Changed base image from `node:20-alpine` to `node:20-slim`**
- Added build dependencies for bcrypt (python3, make, g++)
- Pre-builds TypeScript during image build
- Runs compiled JavaScript instead of ts-node

### 4. Package.json
- Updated dev script to build and run compiled code
- Fixed TypeScript configuration for production builds

### 5. TypeScript Fixes
- Fixed JWT sign options type casting in `src/utils/jwt.ts`
- Fixed unused parameter warning in `src/middleware/errorHandler.ts`

### 6. Docker Compose (docker-compose.yml)
- Added CORS_ORIGIN environment variable
- Passes through JWT configuration
- Environment variables properly configured

## How to Restart

### Using Docker (Recommended):
```bash
cd backend
docker compose down
docker compose up -d --build
```

### Check logs:
```bash
docker compose logs backend -f
```

## Testing

### Test CORS Preflight:
```bash
curl -X OPTIONS http://localhost:5000/api/auth/register \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### Test Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "language": "ar"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "messageAr": "تم تسجيل المستخدم بنجاح",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "role": "user",
      "language": "ar"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Frontend Configuration

Supported origins (configured in `backend/.env`):
- http://localhost:3000
- http://localhost:5173
- http://127.0.0.1:3000
- http://127.0.0.1:5173

To add more origins, update `CORS_ORIGIN` in `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://your-custom-port
```

## Status

✅ CORS working correctly
✅ Registration endpoint functional
✅ Server stable (no more crashes)
✅ TypeScript compilation successful
✅ Docker container running smoothly
