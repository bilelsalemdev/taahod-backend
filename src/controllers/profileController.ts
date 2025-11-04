import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Progress from '../models/Progress';

/**
 * Get user profile with progress summary
 * GET /api/profile
 */
export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get user details
    const user = await User.findById(userId);

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

    // Get progress summary
    const progressList = await Progress.find({ userId }).populate({
      path: 'bookId',
      select: 'title titleAr',
    });

    const totalBooks = progressList.length;
    const completedBooks = progressList.filter(
      (p) => p.percentComplete === 100
    ).length;
    const inProgressBooks = progressList.filter(
      (p) => p.percentComplete > 0 && p.percentComplete < 100
    ).length;

    const averageProgress =
      totalBooks > 0
        ? Math.round(
            progressList.reduce((sum, p) => sum + p.percentComplete, 0) /
              totalBooks
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          language: user.language,
          createdAt: user.createdAt,
        },
        progressSummary: {
          totalBooks,
          completedBooks,
          inProgressBooks,
          averageProgress,
        },
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching profile',
        messageAr: 'حدث خطأ أثناء جلب الملف الشخصي',
      },
    });
  }
};

/**
 * Update user profile
 * PUT /api/profile
 */
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const userId = req.user!.userId;
    const { name, language } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        language,
      },
      { new: true, runValidators: true }
    );

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
      message: 'Profile updated successfully',
      messageAr: 'تم تحديث الملف الشخصي بنجاح',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          language: user.language,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating profile',
        messageAr: 'حدث خطأ أثناء تحديث الملف الشخصي',
      },
    });
  }
};
