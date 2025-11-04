import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Collaboration from '../models/Collaboration';
import Book from '../models/Book';
import Progress from '../models/Progress';

/**
 * Get user's collaborations
 * GET /api/collaborations
 */
export const getUserCollaborations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const collaborations = await Collaboration.find({
      participants: userId,
      isActive: true,
    })
      .populate('bookId', 'title titleAr author authorAr')
      .populate('creatorId', 'name email')
      .populate('participants', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        collaborations,
        count: collaborations.length,
      },
    });
  } catch (error: any) {
    console.error('Get collaborations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching collaborations',
        messageAr: 'حدث خطأ أثناء جلب التعاونات',
      },
    });
  }
};

/**
 * Get collaboration by ID
 * GET /api/collaborations/:id
 */
export const getCollaborationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const collaboration = await Collaboration.findOne({
      _id: id,
      participants: userId,
    })
      .populate('bookId', 'title titleAr author authorAr totalPages')
      .populate('creatorId', 'name email')
      .populate('participants', 'name email');

    if (!collaboration) {
      res.status(404).json({
        success: false,
        error: {
          code: 'COLLABORATION_NOT_FOUND',
          message: 'Collaboration not found',
          messageAr: 'التعاون غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        collaboration,
      },
    });
  } catch (error: any) {
    console.error('Get collaboration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching the collaboration',
        messageAr: 'حدث خطأ أثناء جلب التعاون',
      },
    });
  }
};

/**
 * Create new collaboration
 * POST /api/collaborations
 */
export const createCollaboration = async (
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
    const { name, bookId, targetCompletionDate } = req.body;

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

    // Create collaboration
    const collaboration = await Collaboration.create({
      name,
      bookId,
      creatorId: userId,
      participants: [userId],
      targetCompletionDate: new Date(targetCompletionDate),
      isActive: true,
    });

    // Populate references
    await collaboration.populate('bookId', 'title titleAr author authorAr');
    await collaboration.populate('creatorId', 'name email');
    await collaboration.populate('participants', 'name email');

    res.status(201).json({
      success: true,
      message: 'Collaboration created successfully',
      messageAr: 'تم إنشاء التعاون بنجاح',
      data: {
        collaboration,
      },
    });
  } catch (error: any) {
    console.error('Create collaboration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while creating the collaboration',
        messageAr: 'حدث خطأ أثناء إنشاء التعاون',
      },
    });
  }
};

/**
 * Join collaboration
 * POST /api/collaborations/:id/join
 */
export const joinCollaboration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const collaboration = await Collaboration.findOne({
      _id: id,
      isActive: true,
    });

    if (!collaboration) {
      res.status(404).json({
        success: false,
        error: {
          code: 'COLLABORATION_NOT_FOUND',
          message: 'Collaboration not found',
          messageAr: 'التعاون غير موجود',
        },
      });
      return;
    }

    // Check if already a participant
    const isParticipant = collaboration.participants.some(
      (p) => p.toString() === userId
    );

    if (isParticipant) {
      res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_PARTICIPANT',
          message: 'You are already a participant in this collaboration',
          messageAr: 'أنت بالفعل مشارك في هذا التعاون',
        },
      });
      return;
    }

    // Add user to participants
    collaboration.participants.push(userId as any);
    await collaboration.save();

    // Populate references
    await collaboration.populate('bookId', 'title titleAr author authorAr');
    await collaboration.populate('creatorId', 'name email');
    await collaboration.populate('participants', 'name email');

    res.status(200).json({
      success: true,
      message: 'Joined collaboration successfully',
      messageAr: 'تم الانضمام إلى التعاون بنجاح',
      data: {
        collaboration,
      },
    });
  } catch (error: any) {
    console.error('Join collaboration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while joining the collaboration',
        messageAr: 'حدث خطأ أثناء الانضمام إلى التعاون',
      },
    });
  }
};

/**
 * Leave collaboration
 * DELETE /api/collaborations/:id/leave
 */
export const leaveCollaboration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const collaboration = await Collaboration.findOne({
      _id: id,
      participants: userId,
    });

    if (!collaboration) {
      res.status(404).json({
        success: false,
        error: {
          code: 'COLLABORATION_NOT_FOUND',
          message: 'Collaboration not found',
          messageAr: 'التعاون غير موجود',
        },
      });
      return;
    }

    // Check if user is the creator
    if (collaboration.creatorId.toString() === userId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATOR_CANNOT_LEAVE',
          message: 'Creator cannot leave the collaboration. Delete it instead.',
          messageAr: 'لا يمكن للمنشئ مغادرة التعاون. احذفه بدلاً من ذلك.',
        },
      });
      return;
    }

    // Remove user from participants
    collaboration.participants = collaboration.participants.filter(
      (p) => p.toString() !== userId
    );
    await collaboration.save();

    res.status(200).json({
      success: true,
      message: 'Left collaboration successfully',
      messageAr: 'تم مغادرة التعاون بنجاح',
    });
  } catch (error: any) {
    console.error('Leave collaboration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while leaving the collaboration',
        messageAr: 'حدث خطأ أثناء مغادرة التعاون',
      },
    });
  }
};

/**
 * Get collaboration progress
 * GET /api/collaborations/:id/progress
 */
export const getCollaborationProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const collaboration = await Collaboration.findOne({
      _id: id,
      participants: userId,
    }).populate('bookId', 'title titleAr totalPages');

    if (!collaboration) {
      res.status(404).json({
        success: false,
        error: {
          code: 'COLLABORATION_NOT_FOUND',
          message: 'Collaboration not found',
          messageAr: 'التعاون غير موجود',
        },
      });
      return;
    }

    // Get progress for all participants
    const participantProgress = await Progress.find({
      userId: { $in: collaboration.participants },
      bookId: collaboration.bookId,
    }).populate('userId', 'name email');

    // Calculate overall progress
    const totalProgress = participantProgress.reduce(
      (sum, p) => sum + p.percentComplete,
      0
    );
    const averageProgress =
      participantProgress.length > 0
        ? Math.round(totalProgress / participantProgress.length)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        collaboration: {
          id: collaboration._id,
          name: collaboration.name,
          book: collaboration.bookId,
          targetCompletionDate: collaboration.targetCompletionDate,
        },
        participantProgress,
        averageProgress,
        participantCount: collaboration.participants.length,
      },
    });
  } catch (error: any) {
    console.error('Get collaboration progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching collaboration progress',
        messageAr: 'حدث خطأ أثناء جلب تقدم التعاون',
      },
    });
  }
};
