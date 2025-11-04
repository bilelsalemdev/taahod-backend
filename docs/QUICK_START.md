# Quick Start Guide - Al-Hikmah Academy Backend

Get the backend API up and running in minutes!

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

## 5-Minute Setup

### 1. Start the Services

```bash
cd backend
docker-compose up -d
```

This will start:
- Backend API on port 5000
- MongoDB on port 27017

### 2. Verify It's Running

Open your browser and visit:
```
http://localhost:5000/health
```

You should see:
```json
{
  "success": true,
  "message": "Al-Hikmah Academy API is running",
  "timestamp": "2024-...",
  "database": "connected",
  "environment": "development"
}
```

### 3. Access API Documentation

Visit the interactive API documentation:
```
http://localhost:5000/api-docs
```

## First API Calls

### 1. Register a User

Using curl:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'
```

Or use the Swagger UI at `/api-docs` - it's easier!

### 2. Copy Your Token

From the response, copy the `token` value. You'll need it for authenticated requests.

### 3. Test an Authenticated Endpoint

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Using Swagger UI (Recommended)

1. Go to `http://localhost:5000/api-docs`
2. Click on `/api/auth/register`
3. Click "Try it out"
4. Fill in the request body
5. Click "Execute"
6. Copy the token from the response
7. Click "Authorize" button at the top
8. Enter: `Bearer YOUR_TOKEN_HERE`
9. Click "Authorize"
10. Now you can test all authenticated endpoints!

## Common Tasks

### View Logs
```bash
docker-compose logs -f backend
```

### Restart Services
```bash
docker-compose restart
```

### Stop Services
```bash
docker-compose down
```

### Reset Database (WARNING: Deletes all data)
```bash
docker-compose down -v
docker-compose up -d
```

### Access MongoDB
```bash
docker-compose exec mongodb mongosh al-hikmah-academy
```

## Project Structure

```
backend/
├── src/
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, upload, etc.
│   └── server.ts       # Main app
├── docs/               # API documentation
├── uploads/            # Uploaded files
└── docker-compose.yml  # Docker config
```

## Available Endpoints

### Public Endpoints
- `GET /health` - Health check
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/subjects` - List subjects
- `GET /api/books` - List books

### Authenticated Endpoints
- `GET /api/auth/me` - Current user
- `GET /api/progress` - User progress
- `POST /api/progress` - Save progress
- `GET /api/books/:id/file` - Download book

### Admin Only Endpoints
- `POST /api/subjects` - Create subject
- `POST /api/books` - Upload book
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/books/:id` - Delete book

## Testing Admin Features

To test admin features, you need to manually set a user's role to 'admin' in MongoDB:

```bash
# Access MongoDB
docker-compose exec mongodb mongosh al-hikmah-academy

# Update user role
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { role: "admin" } }
)

# Exit
exit
```

Then login again to get a new token with admin privileges.

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "5001:5000"  # Use 5001 instead
```

### Database Connection Failed
Make sure MongoDB container is running:
```bash
docker-compose ps
```

If not running:
```bash
docker-compose up -d mongodb
```

### Can't Upload Files
Check if uploads directory exists and has proper permissions:
```bash
ls -la uploads/
```

### Swagger UI Not Loading
Clear browser cache or try incognito mode.

## Next Steps

1. **Read the full documentation**: Check `docs/README.md`
2. **Test all endpoints**: Use the API Testing Guide
3. **Explore the code**: Start with `src/server.ts`
4. **Add features**: Follow the implementation tasks

## Need Help?

- Check `docs/API_TESTING_GUIDE.md` for detailed examples
- Review `docs/IMPLEMENTATION_SUMMARY.md` for feature overview
- Look at Swagger UI for interactive documentation
- Check server logs: `docker-compose logs -f backend`

## Development Workflow

1. Make code changes
2. Server auto-restarts (hot reload)
3. Test in Swagger UI
4. Check logs for errors
5. Commit changes

That's it! You're ready to develop with Al-Hikmah Academy API! 🚀
