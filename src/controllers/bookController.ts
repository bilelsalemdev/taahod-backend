import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Book from '../models/Book';
import Subject from '../models/Subject';
import path from 'path';
import fs from 'fs';
import { deleteFile } from '../middleware/upload';

/**
 * Get all books with pagination
 * GET /api/books
 */
export const getAllBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .populate('subjectId', 'name nameAr')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        books,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching books',
        messageAr: 'حدث خطأ أثناء جلب الكتب',
      },
    });
  }
};

/**
 * Get book by ID
 * GET /api/books/:id
 */
export const getBookById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id)
      .populate('subjectId', 'name nameAr description descriptionAr')
      .populate('uploadedBy', 'name email');

    if (!book) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: 'Book not found',
          messageAr: 'الكتاب غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        book,
      },
    });
  } catch (error: any) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching the book',
        messageAr: 'حدث خطأ أثناء جلب الكتاب',
      },
    });
  }
};

/**
 * Get books by subject
 * GET /api/subjects/:id/books
 */
export const getBooksBySubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Verify subject exists
    const subject = await Subject.findById(id);
    if (!subject) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SUBJECT_NOT_FOUND',
          message: 'Subject not found',
          messageAr: 'المادة غير موجودة',
        },
      });
      return;
    }

    const books = await Book.find({ subjectId: id })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        subject: {
          id: subject._id,
          name: subject.name,
          nameAr: subject.nameAr,
        },
        books,
        count: books.length,
      },
    });
  } catch (error: any) {
    console.error('Get books by subject error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching books',
        messageAr: 'حدث خطأ أثناء جلب الكتب',
      },
    });
  }
};

/**
 * Create a new book (admin only)
 * POST /api/books
 */
export const createBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
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
          message: 'Book file is required',
          messageAr: 'ملف الكتاب مطلوب',
        },
      });
      return;
    }

    const {
      title,
      titleAr,
      author,
      authorAr,
      description,
      descriptionAr,
      subjectId,
      totalPages,
    } = req.body;

    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      deleteFile(req.file.path);
      res.status(404).json({
        success: false,
        error: {
          code: 'SUBJECT_NOT_FOUND',
          message: 'Subject not found',
          messageAr: 'المادة غير موجودة',
        },
      });
      return;
    }

    // Create book
    const book = await Book.create({
      title,
      titleAr,
      author,
      authorAr,
      description: description || '',
      descriptionAr: descriptionAr || '',
      subjectId,
      fileUrl: `/uploads/books/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      totalPages: parseInt(totalPages) || 0,
      uploadedBy: req.user!.userId,
    });

    // Populate references
    await book.populate('subjectId', 'name nameAr');
    await book.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Book uploaded successfully',
      messageAr: 'تم رفع الكتاب بنجاح',
      data: {
        book,
      },
    });
  } catch (error: any) {
    // Delete uploaded file if error occurs
    if (req.file) {
      deleteFile(req.file.path);
    }
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while uploading the book',
        messageAr: 'حدث خطأ أثناء رفع الكتاب',
      },
    });
  }
};

/**
 * Update book (admin only)
 * PUT /api/books/:id
 */
export const updateBook = async (
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
    const {
      title,
      titleAr,
      author,
      authorAr,
      description,
      descriptionAr,
      subjectId,
      totalPages,
    } = req.body;

    // Verify subject exists if provided
    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SUBJECT_NOT_FOUND',
            message: 'Subject not found',
            messageAr: 'المادة غير موجودة',
          },
        });
        return;
      }
    }

    const book = await Book.findByIdAndUpdate(
      id,
      {
        title,
        titleAr,
        author,
        authorAr,
        description,
        descriptionAr,
        subjectId,
        totalPages: totalPages ? parseInt(totalPages) : undefined,
      },
      { new: true, runValidators: true }
    )
      .populate('subjectId', 'name nameAr')
      .populate('uploadedBy', 'name email');

    if (!book) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: 'Book not found',
          messageAr: 'الكتاب غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      messageAr: 'تم تحديث الكتاب بنجاح',
      data: {
        book,
      },
    });
  } catch (error: any) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating the book',
        messageAr: 'حدث خطأ أثناء تحديث الكتاب',
      },
    });
  }
};

/**
 * Delete book (admin only)
 * DELETE /api/books/:id
 */
export const deleteBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: 'Book not found',
          messageAr: 'الكتاب غير موجود',
        },
      });
      return;
    }

    // Delete the file from filesystem
    const filePath = path.join(__dirname, '../../', book.fileUrl);
    deleteFile(filePath);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      messageAr: 'تم حذف الكتاب بنجاح',
    });
  } catch (error: any) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while deleting the book',
        messageAr: 'حدث خطأ أثناء حذف الكتاب',
      },
    });
  }
};

/**
 * Stream/download book file
 * GET /api/books/:id/file
 */
export const getBookFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);

    if (!book) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: 'Book not found',
          messageAr: 'الكتاب غير موجود',
        },
      });
      return;
    }

    const filePath = path.join(__dirname, '../../', book.fileUrl);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Book file not found',
          messageAr: 'ملف الكتاب غير موجود',
        },
      });
      return;
    }

    // Get file stats for proper streaming
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Set appropriate headers
    res.setHeader('Content-Type', book.fileType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Use safe ASCII filename with UTF-8 encoded alternative
    const fileExtension = book.fileType.split('/')[1] || 'pdf';
    const safeFilename = `book-${book._id}.${fileExtension}`;
    const arabicFilename = encodeURIComponent(
      (book.titleAr || book.title).substring(0, 100) + `.${fileExtension}`
    );

    res.setHeader(
      'Content-Disposition',
      `inline; filename="${safeFilename}"; filename*=UTF-8''${arabicFilename}`
    );

    // Handle range requests for better streaming
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunksize);

      const fileStream = fs.createReadStream(filePath, { start, end, highWaterMark: 64 * 1024 }); // 64KB chunks
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
    } else {
      // Stream the entire file with optimized chunk size
      const fileStream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }); // 64KB chunks

      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: {
              code: 'STREAM_ERROR',
              message: 'An error occurred while streaming the file',
              messageAr: 'حدث خطأ أثناء بث الملف',
            },
          });
        }
      });

      fileStream.pipe(res);
    }
  } catch (error: any) {
    console.error('Get book file error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving the book file',
          messageAr: 'حدث خطأ أثناء استرجاع ملف الكتاب',
        },
      });
    }
  }
};
