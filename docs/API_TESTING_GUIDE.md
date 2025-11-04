# API Testing Guide

This guide provides examples for testing the Al-Hikmah Academy API endpoints.

## Prerequisites

- Server running on `http://localhost:5000`
- Tool for making HTTP requests (curl, Postman, or Swagger UI)

## Base URL

```
http://localhost:5000/api
```

## Authentication Flow

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alhikmah.com",
    "password": "admin123",
    "name": "Admin User",
    "language": "ar"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "messageAr": "تم تسجيل المستخدم بنجاح",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@alhikmah.com",
      "name": "Admin User",
      "role": "user",
      "language": "ar"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alhikmah.com",
    "password": "admin123"
  }'
```

### 3. Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Subject Management

### Create a Subject (Admin Only)

```bash
curl -X POST http://localhost:5000/api/subjects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Islamic Jurisprudence",
    "nameAr": "الفقه الإسلامي",
    "description": "Study of Islamic law and jurisprudence",
    "descriptionAr": "دراسة الفقه والشريعة الإسلامية"
  }'
```

### Get All Subjects

```bash
curl -X GET http://localhost:5000/api/subjects
```

### Get Subject by ID

```bash
curl -X GET http://localhost:5000/api/subjects/SUBJECT_ID
```

### Update Subject (Admin Only)

```bash
curl -X PUT http://localhost:5000/api/subjects/SUBJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Subject Name",
    "nameAr": "اسم المادة المحدث",
    "description": "Updated description",
    "descriptionAr": "الوصف المحدث"
  }'
```

### Delete Subject (Admin Only)

```bash
curl -X DELETE http://localhost:5000/api/subjects/SUBJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Book Management

### Upload a Book (Admin Only)

```bash
curl -X POST http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/book.pdf" \
  -F "title=Sahih Al-Bukhari" \
  -F "titleAr=صحيح البخاري" \
  -F "author=Imam Al-Bukhari" \
  -F "authorAr=الإمام البخاري" \
  -F "description=Collection of authentic hadith" \
  -F "descriptionAr=مجموعة من الأحاديث الصحيحة" \
  -F "subjectId=SUBJECT_ID" \
  -F "totalPages=500"
```

### Get All Books (Paginated)

```bash
# Default pagination (page 1, limit 10)
curl -X GET http://localhost:5000/api/books

# Custom pagination
curl -X GET "http://localhost:5000/api/books?page=2&limit=20"
```

### Get Book by ID

```bash
curl -X GET http://localhost:5000/api/books/BOOK_ID
```

### Get Books by Subject

```bash
curl -X GET http://localhost:5000/api/subjects/SUBJECT_ID/books
```

### Update Book Metadata (Admin Only)

```bash
curl -X PUT http://localhost:5000/api/books/BOOK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Book Title",
    "titleAr": "عنوان الكتاب المحدث",
    "author": "Updated Author",
    "authorAr": "المؤلف المحدث",
    "description": "Updated description",
    "descriptionAr": "الوصف المحدث",
    "totalPages": 600
  }'
```

### Download/Stream Book File

```bash
curl -X GET http://localhost:5000/api/books/BOOK_ID/file \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --output book.pdf
```

### Delete Book (Admin Only)

```bash
curl -X DELETE http://localhost:5000/api/books/BOOK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Progress Tracking

### Save Reading Progress

```bash
curl -X POST http://localhost:5000/api/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "BOOK_ID",
    "currentPage": 150,
    "totalPages": 500,
    "notes": "Finished chapter 5"
  }'
```

### Get All User Progress

```bash
curl -X GET http://localhost:5000/api/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Progress for Specific Book

```bash
curl -X GET http://localhost:5000/api/progress/book/BOOK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Progress Statistics

```bash
curl -X GET http://localhost:5000/api/progress/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing with Postman

### Import Collection

1. Create a new collection in Postman
2. Add environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: (will be set after login)

3. Create requests for each endpoint
4. Use `{{baseUrl}}` and `{{token}}` variables

### Setting Up Authorization

1. After login, copy the token from the response
2. Set it as an environment variable: `token`
3. In request headers, use: `Authorization: Bearer {{token}}`

## Common Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error or missing required fields
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions (admin required)
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (e.g., duplicate email)
- `500 Internal Server Error` - Server error

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message in English",
    "messageAr": "رسالة الخطأ بالعربية",
    "details": []
  }
}
```

## Tips for Testing

1. **Use Swagger UI** for interactive testing: `http://localhost:5000/api-docs`
2. **Save tokens** after login for subsequent requests
3. **Test validation** by sending invalid data
4. **Test permissions** by trying admin endpoints as regular user
5. **Test pagination** with different page and limit values
6. **Test file uploads** with different file types and sizes
7. **Monitor server logs** for detailed error information

## Automated Testing

For automated testing, see the test files in the `tests/` directory:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```
