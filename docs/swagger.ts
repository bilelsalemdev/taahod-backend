import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Al-Hikmah Academy API',
    version: '1.0.0',
    description: 'Islamic Learning Platform API Documentation',
    contact: {
      name: 'Al-Hikmah Academy',
      email: 'support@alhikmah.academy',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://api.alhikmah.academy',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Subjects',
      description: 'Subject management endpoints',
    },
    {
      name: 'Books',
      description: 'Book management and file operations',
    },
    {
      name: 'Progress',
      description: 'Reading progress tracking',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, './schemas/*.yaml'),
    path.join(__dirname, './paths/*.yaml'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
