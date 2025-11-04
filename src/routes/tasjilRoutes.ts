import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllTasjil,
  getTasjilById,
  uploadTasjil,
  deleteTasjil,
  streamTasjil,
} from '../controllers/tasjilController';
import { authenticate } from '../middleware/auth';
import { uploadAudio } from '../middleware/upload';

const router = Router();

// All tasjil routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/tasjil
 * @desc    Get all user recordings
 * @access  Private
 */
router.get('/', getAllTasjil);

/**
 * @route   GET /api/tasjil/:id
 * @desc    Get recording by ID
 * @access  Private
 */
router.get('/:id', getTasjilById);

/**
 * @route   GET /api/tasjil/:id/stream
 * @desc    Stream audio file
 * @access  Private
 */
router.get('/:id/stream', streamTasjil);

/**
 * @route   POST /api/tasjil
 * @desc    Upload new recording
 * @access  Private
 */
router.post(
  '/',
  uploadAudio,
  [
    body('title')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Title must be between 2 and 200 characters'),
    body('surah')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Surah name must be between 2 and 100 characters'),
    body('ayahRange')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Ayah range must be between 1 and 50 characters'),
    body('duration')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative number'),
  ],
  uploadTasjil
);

/**
 * @route   DELETE /api/tasjil/:id
 * @desc    Delete recording
 * @access  Private
 */
router.delete('/:id', deleteTasjil);

export default router;
