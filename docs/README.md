# Al-Hikmah Academy API Documentation

This directory contains the OpenAPI (Swagger) documentation for the Al-Hikmah Academy API.

## Structure

```
docs/
├── swagger.ts          # Main Swagger configuration
├── schemas/            # Data model schemas
│   ├── common.yaml     # Common schemas (errors, responses)
│   ├── user.yaml       # User and authentication schemas
│   ├── subject.yaml    # Subject schemas
│   ├── book.yaml       # Book schemas
│   └── progress.yaml   # Progress tracking schemas
└── paths/              # API endpoint documentation
    ├── auth.yaml       # Authentication endpoints
    ├── subjects.yaml   # Subject endpoints
    ├── books.yaml      # Book endpoints
    └── progress.yaml   # Progress endpoints
```

## Accessing the Documentation

### Interactive Documentation (Swagger UI)

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

This provides a user-friendly interface where you can:
- Browse all available endpoints
- View request/response schemas
- Test API endpoints directly from the browser
- Authenticate using JWT tokens

### JSON Specification

The raw OpenAPI JSON specification is available at:

```
http://localhost:5000/api-docs.json
```

## Authentication

Most endpoints require authentication using JWT tokens. To authenticate:

1. Register a new user or login using the `/api/auth/register` or `/api/auth/login` endpoints
2. Copy the JWT token from the response
3. In Swagger UI, click the "Authorize" button at the top
4. Enter your token in the format: `Bearer YOUR_TOKEN_HERE`
5. Click "Authorize" to apply the token to all requests

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject (admin)
- `GET /api/subjects/:id` - Get subject by ID
- `PUT /api/subjects/:id` - Update subject (admin)
- `DELETE /api/subjects/:id` - Delete subject (admin)
- `GET /api/subjects/:id/books` - Get books by subject

### Books
- `GET /api/books` - Get all books (paginated)
- `POST /api/books` - Upload book (admin)
- `GET /api/books/:id` - Get book by ID
- `PUT /api/books/:id` - Update book (admin)
- `DELETE /api/books/:id` - Delete book (admin)
- `GET /api/books/:id/file` - Stream/download book file

### Progress
- `GET /api/progress` - Get all user progress
- `POST /api/progress` - Save/update progress
- `GET /api/progress/stats` - Get progress statistics
- `GET /api/progress/book/:bookId` - Get progress for specific book

## Adding New Documentation

When adding new endpoints:

1. **Create/Update Schema** (if needed):
   - Add new schemas to appropriate file in `schemas/` directory
   - Follow existing naming conventions
   - Include all required fields and validation rules

2. **Document Endpoint**:
   - Add endpoint documentation to appropriate file in `paths/` directory
   - Include all HTTP methods, parameters, request bodies, and responses
   - Add proper tags for organization
   - Document authentication requirements

3. **Update Tags** (if needed):
   - Add new tags to `swagger.ts` if creating a new API section

## Best Practices

- Keep schemas DRY by using `$ref` to reference common schemas
- Document all possible response codes
- Include example values for all fields
- Add clear descriptions for complex operations
- Keep Arabic translations for user-facing messages
- Document file upload requirements and limits
- Specify authentication requirements for each endpoint

## Validation

The API uses `express-validator` for request validation. Ensure that:
- All validation rules in the code match the documentation
- Required fields are marked as required in schemas
- Min/max lengths and other constraints are documented
- Error responses include validation details

## Maintenance

When updating the API:
1. Update the corresponding YAML files
2. Test the changes in Swagger UI
3. Verify all examples work correctly
4. Update version number in `swagger.ts` if needed
5. Keep the documentation in sync with the actual implementation
