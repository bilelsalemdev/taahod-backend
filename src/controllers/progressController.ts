import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Progress from '../models/Progress';
import Book from '../models/Book';

/**
 * Get all progress for current user
 * GET /api/progress
 */
export const getAllProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const progressList = await Progress.find({ userId })
      .populate({
        path: 'bookId',
        select: 'title titleAr author authorAr subjectId',
        populate: {
          path: 'subjectId',
          select: 'name nameAr',
        },
      })
      .sort({ lastReadAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        progress: progressList,
        count: progressList.length,
      },
    });
  } catch (error: any) {
    console.error('Get all progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching progress',
        messageAr: 'حدث خطأ أثناء جلب التقدم',
      },
    });
  }
};

/**
 * Get progress for specific book
 * GET /api/progress/book/:bookId
 */
export const getProgressByBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { bookId } = req.params;

    // Verify book exists
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: 'Book not found',
          messageAr: 'الكتاب غير موجود',
        },
      });
      return;
    }

    const progress = await Progress.findOne({ userId, bookId }).populate({
      path: 'bookId',
      select: 'title titleAr author authorAr subjectId',
      populate: {
        path: 'subjectId',
        select: 'name nameAr',
      },
    });

    if (!progress) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PROGRESS_NOT_FOUND',
          message: 'No progress found for this book',
          messageAr: 'لم يتم العثور على تقدم لهذا الكتاب',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        progress,
      },
    });
  } catch (error: any) {
    console.error('Get progress by book error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching progress',
        messageAr: 'حدث خطأ أثناء جلب التقدم',
      },
    });
  }
};

/**
 * Save or update reading progress
 * POST /api/progress
 */
export const saveProgress = async (
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
    const { bookId, currentPage, totalPages, notes } = req.body;

    // Verify book exists
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: 'Book not found',
          messageAr: 'الكتاب غير موجود',
        },
      });
      return;
    }

    // Use totalPages from book if not provided
    const pagesToUse = totalPages || book.totalPages || 1;

    // Find existing progress or create new
    let progress = await Progress.findOne({ userId, bookId });

    if (progress) {
      // Update existing progress
      progress.currentPage = currentPage;
      progress.totalPages = pagesToUse;
      progress.lastReadAt = new Date();
      if (notes !== undefined) {
        progress.notes = notes;
      }
      await progress.save();
    } else {
      // Create new progress
      progress = await Progress.create({
        userId,
        bookId,
        currentPage,
        totalPages: pagesToUse,
        notes: notes || '',
        lastReadAt: new Date(),
      });
    }

    // Populate book details
    await progress.populate({
      path: 'bookId',
      select: 'title titleAr author authorAr subjectId',
      populate: {
        path: 'subjectId',
        select: 'name nameAr',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Progress saved successfully',
      messageAr: 'تم حفظ التقدم بنجاح',
      data: {
        progress,
      },
    });
  } catch (error: any) {
    console.error('Save progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while saving progress',
        messageAr: 'حدث خطأ أثناء حفظ التقدم',
      },
    });
  }
};

/**
 * Get progress statistics
 * GET /api/progress/stats
 */
export const getProgressStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const progressList = await Progress.find({ userId });

    // Calculate statistics
    const totalBooks = progressList.length;
    const completedBooks = progressList.filter(
      (p) => p.percentComplete === 100
    ).length;
    const inProgressBooks = progressList.filter(
      (p) => p.percentComplete > 0 && p.percentComplete < 100
    ).length;
    const notStartedBooks = progressList.filter(
      (p) => p.percentComplete === 0
    ).length;

    // Calculate average progress
    const averageProgress =
      totalBooks > 0
        ? Math.round(
            progressList.reduce((sum, p) => sum + p.percentComplete, 0) /
              totalBooks
          )
        : 0;

    // Get recently read books (last 5)
    const recentlyRead = await Progress.find({ userId })
      .populate({
        path: 'bookId',
        select: 'title titleAr author authorAr',
      })
      .sort({ lastReadAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalBooks,
          completedBooks,
          inProgressBooks,
          notStartedBooks,
          averageProgress,
        },
        recentlyRead,
      },
    });
  } catch (error: any) {
    console.error('Get progress stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching statistics',
        messageAr: 'حدث خطأ أثناء جلب الإحصائيات',
      },
    });
  }
};
