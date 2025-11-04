import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllProgress,
  getProgressByBook,
  saveProgress,
  getProgressStats,
} from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All progress routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/progress
 * @desc    Get all progress for current user
 * @access  Private
 */
router.get('/', getAllProgress);

/**
 * @route   GET /api/progress/stats
 * @desc    Get progress statistics
 * @access  Private
 */
router.get('/stats', getProgressStats);

/**
 * @route   GET /api/progress/book/:bookId
 * @desc    Get progress for specific book
 * @access  Private
 */
router.get('/book/:bookId', getProgressByBook);

/**
 * @route   POST /api/progress
 * @desc    Save or update reading progress
 * @access  Private
 */
router.post(
  '/',
  [
    body('bookId').isMongoId().withMessage('Valid book ID is required'),
    body('currentPage')
      .isInt({ min: 0 })
      .withMessage('Current page must be a non-negative number'),
    body('totalPages')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Total pages must be at least 1'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Notes cannot exceed 5000 characters'),
  ],
  saveProgress
);

export default router;
