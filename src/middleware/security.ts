import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.',
      messageAr: 'محاولات مصادقة كثيرة جدًا. يرجى المحاولة مرة أخرى لاحقًا.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please try again later.',
      messageAr: 'طلبات كثيرة جدًا. يرجى المحاولة مرة أخرى لاحقًا.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for file upload endpoints
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_UPLOADS',
      message: 'Too many file uploads. Please try again later.',
      messageAr: 'تحميلات ملفات كثيرة جدًا. يرجى المحاولة مرة أخرى لاحقًا.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Request sanitization middleware
 * Removes potentially dangerous characters from request data
 */
export const sanitizeRequest = (
  req: Request,
  _res: Response,
  next: Function
) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/[<>]/g, '')
          .trim();
      }
    });
  }

  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[<>]/g, '').trim();
      }
    });
  }

  next();
};

/**
 * Security headers configuration
 */
export const securityHeaders = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};
