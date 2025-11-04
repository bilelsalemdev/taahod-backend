import { Router } from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/profile
 * @desc    Get user profile with progress summary
 * @access  Private
 */
router.get('/', getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('language')
      .isIn(['ar', 'en', 'fr'])
      .withMessage('Language must be ar, en, or fr'),
  ],
  updateProfile
);

export default router;
