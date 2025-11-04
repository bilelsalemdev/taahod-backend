import { Router } from 'express';
import { body } from 'express-validator';
import {
  getUserCollaborations,
  getCollaborationById,
  createCollaboration,
  joinCollaboration,
  leaveCollaboration,
  getCollaborationProgress,
} from '../controllers/collaborationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All collaboration routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/collaborations
 * @desc    Get user's collaborations
 * @access  Private
 */
router.get('/', getUserCollaborations);

/**
 * @route   GET /api/collaborations/:id
 * @desc    Get collaboration by ID
 * @access  Private
 */
router.get('/:id', getCollaborationById);

/**
 * @route   GET /api/collaborations/:id/progress
 * @desc    Get collaboration progress
 * @access  Private
 */
router.get('/:id/progress', getCollaborationProgress);

/**
 * @route   POST /api/collaborations
 * @desc    Create new collaboration
 * @access  Private
 */
router.post(
  '/',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Collaboration name must be between 2 and 200 characters'),
    body('bookId').isMongoId().withMessage('Valid book ID is required'),
    body('targetCompletionDate')
      .isISO8601()
      .withMessage('Valid target completion date is required'),
  ],
  createCollaboration
);

/**
 * @route   POST /api/collaborations/:id/join
 * @desc    Join collaboration
 * @access  Private
 */
router.post('/:id/join', joinCollaboration);

/**
 * @route   DELETE /api/collaborations/:id/leave
 * @desc    Leave collaboration
 * @access  Private
 */
router.delete('/:id/leave', leaveCollaboration);

export default router;
