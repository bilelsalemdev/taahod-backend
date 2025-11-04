import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

/**
 * Custom error class
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
  messageAr: string;
  isOperational: boolean;

  constructor(
    message: string,
    messageAr: string,
    statusCode: number,
    code: string
  ) {
    super(message);
    this.messageAr = messageAr;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (_err: MongooseError.ValidationError) => {
  return new AppError(
    'Validation failed',
    'فشل التحقق من البيانات',
    400,
    'VALIDATION_ERROR'
  );
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (err: any) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(
    `${field} already exists`,
    `${field} موجود بالفعل`,
    409,
    'DUPLICATE_KEY'
  );
};

/**
 * Handle Mongoose cast errors
 */
const handleCastError = (err: MongooseError.CastError) => {
  return new AppError(
    `Invalid ${err.path}: ${err.value}`,
    `قيمة غير صالحة`,
    400,
    'INVALID_ID'
  );
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new AppError(
    'Invalid token. Please log in again',
    'رمز غير صالح. يرجى تسجيل الدخول مرة أخرى',
    401,
    'INVALID_TOKEN'
  );
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = () => {
  return new AppError(
    'Your token has expired. Please log in again',
    'انتهت صلاحية الرمز. يرجى تسجيل الدخول مرة أخرى',
    401,
    'TOKEN_EXPIRED'
  );
};

/**
 * Send error response in development
 */
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code,
      message: err.message,
      messageAr: err.messageAr,
      stack: err.stack,
    },
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        messageAr: err.messageAr,
      },
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        messageAr: 'حدث خطأ ما',
      },
    });
  }
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.code = err.code || 'INTERNAL_ERROR';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.messageAr = err.messageAr || 'حدث خطأ';

    // Handle specific error types
    if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    }
    if (err.code === 11000) {
      error = handleDuplicateKeyError(err);
    }
    if (err.name === 'CastError') {
      error = handleCastError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};

/**
 * Handle 404 errors
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    `المسار ${req.originalUrl} غير موجود`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Async error wrapper
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
