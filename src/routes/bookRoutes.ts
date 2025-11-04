import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookFile,
} from '../controllers/bookController';
import { authenticate, adminOnly } from '../middleware/auth';
import { uploadBook } from '../middleware/upload';

const router = Router();

/**
 * @route   GET /api/books
 * @desc    Get all books with pagination
 * @access  Public
 */
router.get('/', getAllBooks);

/**
 * @route   GET /api/books/:id
 * @desc    Get book by ID
 * @access  Public
 */
router.get('/:id', getBookById);

/**
 * @route   GET /api/books/:id/file
 * @desc    Stream/download book file
 * @access  Private
 */
router.get('/:id/file', authenticate, getBookFile);

/**
 * @route   POST /api/books
 * @desc    Upload a new book
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  adminOnly,
  uploadBook,
  [
    body('title')
      .trim()
      .isLength({ min: 2, max: 300 })
      .withMessage('Book title must be between 2 and 300 characters'),
    body('titleAr')
      .trim()
      .isLength({ min: 2, max: 300 })
      .withMessage('Arabic book title must be between 2 and 300 characters'),
    body('author')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Author name must be between 2 and 200 characters'),
    body('authorAr')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Arabic author name must be between 2 and 200 characters'),
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
    body('subjectId')
      .isMongoId()
      .withMessage('Valid subject ID is required'),
    body('totalPages')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Total pages must be a positive number'),
  ],
  createBook
);

/**
 * @route   PUT /api/books/:id
 * @desc    Update book
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
      .withMessage('Book title must be between 2 and 300 characters'),
    body('titleAr')
      .trim()
      .isLength({ min: 2, max: 300 })
      .withMessage('Arabic book title must be between 2 and 300 characters'),
    body('author')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Author name must be between 2 and 200 characters'),
    body('authorAr')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Arabic author name must be between 2 and 200 characters'),
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
    body('subjectId')
      .optional()
      .isMongoId()
      .withMessage('Valid subject ID is required'),
    body('totalPages')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Total pages must be a positive number'),
  ],
  updateBook
);

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete book
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, adminOnly, deleteBook);

export default router;
