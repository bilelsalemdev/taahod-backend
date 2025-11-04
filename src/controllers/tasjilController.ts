import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Tasjil from '../models/Tasjil';
import path from 'path';
import fs from 'fs';
import { deleteFile } from '../middleware/upload';

/**
 * Get all user recordings
 * GET /api/tasjil
 */
export const getAllTasjil = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const recordings = await Tasjil.find({ userId }).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        recordings,
        count: recordings.length,
      },
    });
  } catch (error: any) {
    console.error('Get tasjil error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching recordings',
        messageAr: 'حدث خطأ أثناء جلب التسجيلات',
      },
    });
  }
};

/**
 * Get recording by ID
 * GET /api/tasjil/:id
 */
export const getTasjilById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const recording = await Tasjil.findOne({ _id: id, userId });

    if (!recording) {
      res.status(404).json({
        success: false,
        error: {
          code: 'RECORDING_NOT_FOUND',
          message: 'Recording not found',
          messageAr: 'التسجيل غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        recording,
      },
    });
  } catch (error: any) {
    console.error('Get tasjil error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching the recording',
        messageAr: 'حدث خطأ أثناء جلب التسجيل',
      },
    });
  }
};

/**
 * Upload new recording
 * POST /api/tasjil
 */
export const uploadTasjil = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          messageAr: 'فشل التحقق من البيانات',
          details: errors.array(),
        },
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'FILE_REQUIRED',
          message: 'Audio file is required',
          messageAr: 'ملف الصوت مطلوب',
        },
      });
      return;
    }

    const userId = req.user!.userId;
    const { title, surah, ayahRange, duration } = req.body;

    // Create tasjil record
    const tasjil = await Tasjil.create({
      userId,
      title,
      surah,
      ayahRange,
      fileUrl: `/uploads/audio/${req.file.filename}`,
      duration: parseInt(duration) || 0,
      uploadedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Recording uploaded successfully',
      messageAr: 'تم رفع التسجيل بنجاح',
      data: {
        recording: tasjil,
      },
    });
  } catch (error: any) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    console.error('Upload tasjil error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while uploading the recording',
        messageAr: 'حدث خطأ أثناء رفع التسجيل',
      },
    });
  }
};

/**
 * Delete recording
 * DELETE /api/tasjil/:id
 */
export const deleteTasjil = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const recording = await Tasjil.findOneAndDelete({ _id: id, userId });

    if (!recording) {
      res.status(404).json({
        success: false,
        error: {
          code: 'RECORDING_NOT_FOUND',
          message: 'Recording not found',
          messageAr: 'التسجيل غير موجود',
        },
      });
      return;
    }

    // Delete the file from filesystem
    const filePath = path.join(__dirname, '../../', recording.fileUrl);
    deleteFile(filePath);

    res.status(200).json({
      success: true,
      message: 'Recording deleted successfully',
      messageAr: 'تم حذف التسجيل بنجاح',
    });
  } catch (error: any) {
    console.error('Delete tasjil error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while deleting the recording',
        messageAr: 'حدث خطأ أثناء حذف التسجيل',
      },
    });
  }
};

/**
 * Stream audio file
 * GET /api/tasjil/:id/stream
 */
export const streamTasjil = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const recording = await Tasjil.findOne({ _id: id, userId });

    if (!recording) {
      res.status(404).json({
        success: false,
        error: {
          code: 'RECORDING_NOT_FOUND',
          message: 'Recording not found',
          messageAr: 'التسجيل غير موجود',
        },
      });
      return;
    }

    const filePath = path.join(__dirname, '../../', recording.fileUrl);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Audio file not found',
          messageAr: 'ملف الصوت غير موجود',
        },
      });
      return;
    }

    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range requests for audio streaming
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      });

      file.pipe(res);
    } else {
      // Stream entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error: any) {
    console.error('Stream tasjil error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while streaming the audio',
        messageAr: 'حدث خطأ أثناء بث الصوت',
      },
    });
  }
};
