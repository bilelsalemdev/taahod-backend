import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllAdhkar,
  getAdhkarById,
  getAdhkarByCategory,
  createAdhkar,
  updateAdhkar,
} from '../controllers/adhkarController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/adhkar
 * @desc    Get all adhkar (with optional filters)
 * @access  Public
 */
router.get('/', getAllAdhkar);

/**
 * @route   GET /api/adhkar/category/:category
 * @desc    Get adhkar by category
 * @access  Public
 */
router.get('/category/:category', getAdhkarByCategory);

/**
 * @route   GET /api/adhkar/:id
 * @desc    Get adhkar by ID
 * @access  Public
 */
router.get('/:id', getAdhkarById);

/**
 * @route   POST /api/adhkar
 * @desc    Create new adhkar
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  adminOnly,
  [
    body('titleAr')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Arabic title must be between 2 and 200 characters'),
    body('textAr')
      .trim()
      .isLength({ min: 2, max: 5000 })
      .withMessage('Arabic text must be between 2 and 5000 characters'),
    body('transliteration')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Transliteration cannot exceed 5000 characters'),
    body('translation')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Translation cannot exceed 5000 characters'),
    body('category')
      .isIn([
        'morning',
        'evening',
        'sleep',
        'prayer',
        'general',
        'travel',
        'food',
        'other',
      ])
      .withMessage('Invalid category'),
    body('timeOfDay')
      .optional()
      .isIn(['morning', 'evening', 'night', 'anytime', ''])
      .withMessage('Invalid time of day'),
    body('repetitions')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Repetitions must be at least 1'),
    body('source')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Source cannot exceed 500 characters'),
  ],
  createAdhkar
);

/**
 * @route   PUT /api/adhkar/:id
 * @desc    Update adhkar
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  adminOnly,
  [
    body('titleAr')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Arabic title must be between 2 and 200 characters'),
    body('textAr')
      .trim()
      .isLength({ min: 2, max: 5000 })
      .withMessage('Arabic text must be between 2 and 5000 characters'),
    body('transliteration')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Transliteration cannot exceed 5000 characters'),
    body('translation')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Translation cannot exceed 5000 characters'),
    body('category')
      .isIn([
        'morning',
        'evening',
        'sleep',
        'prayer',
        'general',
        'travel',
        'food',
        'other',
      ])
      .withMessage('Invalid category'),
    body('timeOfDay')
      .optional()
      .isIn(['morning', 'evening', 'night', 'anytime', ''])
      .withMessage('Invalid time of day'),
    body('repetitions')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Repetitions must be at least 1'),
    body('source')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Source cannot exceed 500 characters'),
  ],
  updateAdhkar
);

export default router;
