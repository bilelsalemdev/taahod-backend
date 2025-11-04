import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          messageAr: 'فشل التحقق من البيانات',
          details: errors.array(),
        },
      });
      return;
    }

    const { email, password, name, language } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
          messageAr: 'المستخدم بهذا البريد الإلكتروني موجود بالفعل',
        },
      });
      return;
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      language: language || 'ar',
      role: 'user',
    });

    // Generate token
    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      messageAr: 'تم تسجيل المستخدم بنجاح',
      data: {
        user: {
          id: user._id as any,
          email: user.email,
          name: user.name,
          role: user.role,
          language: user.language,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during registration',
        messageAr: 'حدث خطأ أثناء التسجيل',
      },
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          messageAr: 'فشل التحقق من البيانات',
          details: errors.array(),
        },
      });
      return;
    }

    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          messageAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        },
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          messageAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        },
      });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      messageAr: 'تم تسجيل الدخول بنجاح',
      data: {
        user: {
          id: user._id as any,
          email: user.email,
          name: user.name,
          role: user.role,
          language: user.language,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
        messageAr: 'حدث خطأ أثناء تسجيل الدخول',
      },
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint is here for consistency and can be extended for token blacklisting
  res.status(200).json({
    success: true,
    message: 'Logout successful',
    messageAr: 'تم تسجيل الخروج بنجاح',
  });
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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

    // Find user by ID
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          messageAr: 'المستخدم غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id as any,
          email: user.email,
          name: user.name,
          role: user.role,
          language: user.language,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching user data',
        messageAr: 'حدث خطأ أثناء جلب بيانات المستخدم',
      },
    });
  }
};
