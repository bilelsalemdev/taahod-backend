# Taahod - Backend API

Backend API for the Taahod Islamic Learning Platform.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Containerization**: Docker & Docker Compose

## Project Structure

```
backend/
├── src/
│   ├── models/         # Mongoose schemas and models
│   ├── routes/         # Express route definitions
│   ├── controllers/    # Request handlers and business logic
│   ├── middleware/     # Custom middleware functions
│   ├── utils/          # Utility functions and helpers
│   └── server.ts       # Application entry point
├── uploads/            # File upload directory
├── Dockerfile          # Development Docker configuration
├── Dockerfile.prod     # Production Docker configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development without Docker)

### Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### Running with Docker (Recommended)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Start all services:
```bash
docker-compose up -d
```

3. View logs:
```bash
docker-compose logs -f backend
```

4. Stop services:
```bash
docker-compose down
```

### Running Locally (Without Docker)

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB (ensure MongoDB is running locally)

3. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## API Documentation

### Interactive Documentation (Swagger UI)

Once the server is running, access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive testing interface
- Authentication support

### Documentation Files

API documentation is organized in the `docs/` directory:

```
docs/
├── swagger.ts          # Swagger configuration
├── schemas/            # Data model schemas (YAML)
├── paths/              # Endpoint documentation (YAML)
├── README.md           # Documentation guide
└── API_TESTING_GUIDE.md # Testing examples
```

### API Endpoints Overview

#### Health Check
- `GET /health` - Check API status

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

#### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject (admin)
- `GET /api/subjects/:id` - Get subject by ID
- `PUT /api/subjects/:id` - Update subject (admin)
- `DELETE /api/subjects/:id` - Delete subject (admin)
- `GET /api/subjects/:id/books` - Get books by subject

#### Books
- `GET /api/books` - Get all books (paginated)
- `POST /api/books` - Upload book (admin)
- `GET /api/books/:id` - Get book by ID
- `PUT /api/books/:id` - Update book (admin)
- `DELETE /api/books/:id` - Delete book (admin)
- `GET /api/books/:id/file` - Stream/download book file

#### Progress
- `GET /api/progress` - Get all user progress
- `POST /api/progress` - Save/update progress
- `GET /api/progress/stats` - Get progress statistics
- `GET /api/progress/book/:bookId` - Get progress for specific book

For detailed examples and testing instructions, see [API Testing Guide](docs/API_TESTING_GUIDE.md).

## Docker Commands

All commands should be run from the `backend` directory.

### Development
```bash
# Build and start services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Rebuild specific service
docker-compose build backend

# Access backend container shell
docker-compose exec backend sh

# View MongoDB logs
docker-compose logs mongodb

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Production
```bash
# Start production services (without NGINX)
docker-compose -f docker-compose.prod.yml up -d

# Start with NGINX reverse proxy
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

## Database

MongoDB is configured to run in a Docker container. Data is persisted in Docker volumes.

- **Database Name**: al-hikmah-academy
- **Connection String**: mongodb://mongodb:27017/al-hikmah-academy

## License

MIT
