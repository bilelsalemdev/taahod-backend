import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Podcast from '../models/Podcast';
import path from 'path';
import fs from 'fs';
import { deleteFile } from '../middleware/upload';

/**
 * Get all podcasts
 * GET /api/podcasts
 */
export const getAllPodcasts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const podcasts = await Podcast.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        podcasts,
        count: podcasts.length,
      },
    });
  } catch (error: any) {
    console.error('Get podcasts error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching podcasts',
        messageAr: 'حدث خطأ أثناء جلب البودكاست',
      },
    });
  }
};

/**
 * Get podcast by ID
 * GET /api/podcasts/:id
 */
export const getPodcastById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findById(id).populate(
      'uploadedBy',
      'name email'
    );

    if (!podcast) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PODCAST_NOT_FOUND',
          message: 'Podcast not found',
          messageAr: 'البودكاست غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        podcast,
      },
    });
  } catch (error: any) {
    console.error('Get podcast error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching the podcast',
        messageAr: 'حدث خطأ أثناء جلب البودكاست',
      },
    });
  }
};

/**
 * Upload new podcast (admin only)
 * POST /api/podcasts
 */
export const uploadPodcast = async (
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

    const { title, titleAr, description, descriptionAr, speaker, duration } =
      req.body;

    // Create podcast
    const podcast = await Podcast.create({
      title,
      titleAr,
      description: description || '',
      descriptionAr: descriptionAr || '',
      speaker,
      fileUrl: `/uploads/audio/${req.file.filename}`,
      duration: parseInt(duration) || 0,
      uploadedBy: req.user!.userId,
    });

    // Populate uploader info
    await podcast.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Podcast uploaded successfully',
      messageAr: 'تم رفع البودكاست بنجاح',
      data: {
        podcast,
      },
    });
  } catch (error: any) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    console.error('Upload podcast error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while uploading the podcast',
        messageAr: 'حدث خطأ أثناء رفع البودكاست',
      },
    });
  }
};

/**
 * Update podcast (admin only)
 * PUT /api/podcasts/:id
 */
export const updatePodcast = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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

    const { id } = req.params;
    const { title, titleAr, description, descriptionAr, speaker, duration } =
      req.body;

    const podcast = await Podcast.findByIdAndUpdate(
      id,
      {
        title,
        titleAr,
        description,
        descriptionAr,
        speaker,
        duration: duration ? parseInt(duration) : undefined,
      },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name email');

    if (!podcast) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PODCAST_NOT_FOUND',
          message: 'Podcast not found',
          messageAr: 'البودكاست غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Podcast updated successfully',
      messageAr: 'تم تحديث البودكاست بنجاح',
      data: {
        podcast,
      },
    });
  } catch (error: any) {
    console.error('Update podcast error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating the podcast',
        messageAr: 'حدث خطأ أثناء تحديث البودكاست',
      },
    });
  }
};

/**
 * Delete podcast (admin only)
 * DELETE /api/podcasts/:id
 */
export const deletePodcast = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findByIdAndDelete(id);

    if (!podcast) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PODCAST_NOT_FOUND',
          message: 'Podcast not found',
          messageAr: 'البودكاست غير موجود',
        },
      });
      return;
    }

    // Delete the file from filesystem
    const filePath = path.join(__dirname, '../../', podcast.fileUrl);
    deleteFile(filePath);

    res.status(200).json({
      success: true,
      message: 'Podcast deleted successfully',
      messageAr: 'تم حذف البودكاست بنجاح',
    });
  } catch (error: any) {
    console.error('Delete podcast error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while deleting the podcast',
        messageAr: 'حدث خطأ أثناء حذف البودكاست',
      },
    });
  }
};

/**
 * Stream podcast audio
 * GET /api/podcasts/:id/stream
 */
export const streamPodcast = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findById(id);

    if (!podcast) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PODCAST_NOT_FOUND',
          message: 'Podcast not found',
          messageAr: 'البودكاست غير موجود',
        },
      });
      return;
    }

    const filePath = path.join(__dirname, '../../', podcast.fileUrl);

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
    console.error('Stream podcast error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while streaming the podcast',
        messageAr: 'حدث خطأ أثناء بث البودكاست',
      },
    });
  }
};
