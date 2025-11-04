import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController';
import { getBooksBySubject } from '../controllers/bookController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/subjects
 * @desc    Get all subjects
 * @access  Public
 */
router.get('/', getAllSubjects);

/**
 * @route   GET /api/subjects/:id
 * @desc    Get subject by ID
 * @access  Public
 */
router.get('/:id', getSubjectById);

/**
 * @route   GET /api/subjects/:id/books
 * @desc    Get books by subject
 * @access  Public
 */
router.get('/:id/books', getBooksBySubject);

/**
 * @route   POST /api/subjects
 * @desc    Create a new subject
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  adminOnly,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Subject name must be between 2 and 200 characters'),
    body('nameAr')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Arabic subject name must be between 2 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('descriptionAr')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Arabic description cannot exceed 1000 characters'),
  ],
  createSubject
);

/**
 * @route   PUT /api/subjects/:id
 * @desc    Update subject
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  adminOnly,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Subject name must be between 2 and 200 characters'),
    body('nameAr')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Arabic subject name must be between 2 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('descriptionAr')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Arabic description cannot exceed 1000 characters'),
  ],
  updateSubject
);

/**
 * @route   DELETE /api/subjects/:id
 * @desc    Delete subject
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, adminOnly, deleteSubject);

export default router;
