import { Request, Response } from 'express';
import chunkUploadService from '../services/chunkUploadService';
import logger from '../utils/logger';

/**
 * Initialize chunked upload
 * POST /api/upload/init
 */
export const initializeChunkedUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { filename, totalChunks, fileSize, mimeType } = req.body;

    if (!filename || !totalChunks || !fileSize || !mimeType) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'Missing required parameters',
          messageAr: 'معلمات مطلوبة مفقودة',
        },
      });
      return;
    }

    const uploadId = chunkUploadService.initializeUpload(
      filename,
      parseInt(totalChunks),
      parseInt(fileSize),
      mimeType
    );

    res.status(200).json({
      success: true,
      data: {
        uploadId,
      },
    });
  } catch (error: any) {
    logger.error('Initialize chunked upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to initialize upload',
        messageAr: 'فشل في تهيئة الرفع',
      },
    });
  }
};

/**
 * Upload a chunk
 * POST /api/upload/chunk
 */
export const uploadChunk = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { uploadId, chunkIndex } = req.body;

    if (!uploadId || chunkIndex === undefined) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'Missing uploadId or chunkIndex',
          messageAr: 'معرف الرفع أو فهرس الجزء مفقود',
        },
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No chunk data provided',
          messageAr: 'لم يتم توفير بيانات الجزء',
        },
      });
      return;
    }

    await chunkUploadService.saveChunk(
      uploadId,
      parseInt(chunkIndex),
      req.file.buffer
    );

    const progress = chunkUploadService.getProgress(uploadId);

    res.status(200).json({
      success: true,
      data: {
        progress,
        isComplete: chunkUploadService.isUploadComplete(uploadId),
      },
    });
  } catch (error: any) {
    logger.error('Upload chunk error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to upload chunk',
        messageAr: 'فشل في رفع الجزء',
      },
    });
  }
};

/**
 * Get upload progress
 * GET /api/upload/progress/:uploadId
 */
export const getUploadProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { uploadId } = req.params;

    const progress = chunkUploadService.getProgress(uploadId);

    if (!progress) {
      res.status(404).json({
        success: false,
        error: {
          code: 'UPLOAD_NOT_FOUND',
          message: 'Upload not found',
          messageAr: 'الرفع غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        progress,
        isComplete: chunkUploadService.isUploadComplete(uploadId),
      },
    });
  } catch (error: any) {
    logger.error('Get upload progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get progress',
        messageAr: 'فشل في الحصول على التقدم',
      },
    });
  }
};
