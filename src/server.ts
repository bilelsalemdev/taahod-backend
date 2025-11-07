import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import database from './config/database';
import authRoutes from './routes/authRoutes';
import subjectRoutes from './routes/subjectRoutes';
import bookRoutes from './routes/bookRoutes';
import progressRoutes from './routes/progressRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import tasjilRoutes from './routes/tasjilRoutes';
import podcastRoutes from './routes/podcastRoutes';
import adhkarRoutes from './routes/adhkarRoutes';
import collaborationRoutes from './routes/collaborationRoutes';
import profileRoutes from './routes/profileRoutes';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter, authLimiter, sanitizeRequest } from './middleware/security';

const app: Application = express();

// Middleware
app.use(helmet());

// CORS configuration - handle multiple origins
const allowedOrigins = config.cors.origin.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(sanitizeRequest);
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  const dbStatus = database.isConnectionActive();

  res.status(dbStatus ? 200 : 503).json({
    success: true,
    message: 'Taahod API is running',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'disconnected',
    environment: config.nodeEnv
  });
});

// Test route
app.get('/api/test', (_req, res) => {
  res.json({ success: true, message: 'Test route works' });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Taahod API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/tasjil', tasjilRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/adhkar', adhkarRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/profile', profileRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Handle 404 errors
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Initialize server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📚 Taahod API`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} signal received: closing HTTP server`);

  try {
    await database.disconnect();
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();

export default app;
