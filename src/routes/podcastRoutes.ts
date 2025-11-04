import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllPodcasts,
  getPodcastById,
  uploadPodcast,
  updatePodcast,
  deletePodcast,
  streamPodcast,
} from '../controllers/podcastController';
import { authenticate, adminOnly } from '../middleware/auth';
import { uploadAudio } from '../middleware/upload';

const router = Router();

/**
 * @route   GET /api/podcasts
 * @desc    Get all podcasts
 * @access  Public
 */
router.get('/', getAllPodcasts);

/**
 * @route   GET /api/podcasts/:id
 * @desc    Get podcast by ID
 * @access  Public
 */
router.get('/:id', getPodcastById);

/**
 * @route   GET /api/podcasts/:id/stream
 * @desc    Stream podcast audio
 * @access  Public
 */
router.get('/:id/stream', streamPodcast);

/**
 * @route   POST /api/podcasts
 * @desc    Upload new podcast
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  adminOnly,
  uploadAudio,
  [
    body('title')
      .trim()
      .isLength({ min: 2, max: 300 })
      .withMessage('Podcast title must be between 2 and 300 characters'),
    body('titleAr')
      .trim()
      .isLength({ min: 2, max: 300 })
      .withMessage('Arabic podcast title must be between 2 and 300 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('descriptionAr')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Arabic description cannot exceed 2000 characters'),
    body('speaker')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Speaker name must be between 2 and 200 characters'),
    body('duration')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative number'),
  ],
  uploadPodcast
);

/**
 * @route   PUT /api/podcasts/:id
 * @desc    Update podcast
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  adminOnly,
  [
    body('title')
      .trim()
      .isLength({ min: 2, max: 300 })
      .withMessage('Podcast title must be between 2 and 300 characters'),
    body('titleAr')
      .trim()
      .isLength({ min: 2, max: 300 })
      .withMessage('Arabic podcast title must be between 2 and 300 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('descriptionAr')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Arabic description cannot exceed 2000 characters'),
    body('speaker')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Speaker name must be between 2 and 200 characters'),
    body('duration')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative number'),
  ],
  updatePodcast
);

/**
 * @route   DELETE /api/podcasts/:id
 * @desc    Delete podcast
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, adminOnly, deletePodcast);

export default router;
