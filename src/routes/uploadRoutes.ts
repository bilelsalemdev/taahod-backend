import { Router } from 'express';
import multer from 'multer';
import {
  initializeChunkedUpload,
  uploadChunk,
  getUploadProgress,
} from '../controllers/chunkUploadController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Multer configuration for chunk uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per chunk
  },
});

/**
 * @route   POST /api/upload/init
 * @desc    Initialize chunked upload
 * @access  Private (Admin only)
 */
router.post('/init', authenticate, adminOnly, initializeChunkedUpload);

/**
 * @route   POST /api/upload/chunk
 * @desc    Upload a chunk
 * @access  Private (Admin only)
 */
router.post('/chunk', authenticate, adminOnly, upload.single('chunk'), uploadChunk);

/**
 * @route   GET /api/upload/progress/:uploadId
 * @desc    Get upload progress
 * @access  Private (Admin only)
 */
router.get('/progress/:uploadId', authenticate, adminOnly, getUploadProgress);

export default router;
