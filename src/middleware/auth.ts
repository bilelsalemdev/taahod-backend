import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided',
          messageAr: 'لم يتم توفير رمز المصادقة',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: error.message || 'Invalid or expired token',
        messageAr: 'رمز المصادقة غير صالح أو منتهي الصلاحية',
      },
    });
  }
};

/**
 * Authorization middleware - checks if user has required role
 */
export const authorize = (...roles: Array<'user' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          messageAr: 'المستخدم غير مصادق عليه',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
          messageAr: 'ليس لديك صلاحية للوصول إلى هذا المورد',
        },
      });
      return;
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const adminOnly = authorize('admin');
