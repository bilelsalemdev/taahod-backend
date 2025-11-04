import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Subject from '../models/Subject';

/**
 * Get all subjects
 * GET /api/subjects
 */
export const getAllSubjects = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const subjects = await Subject.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        subjects,
        count: subjects.length,
      },
    });
  } catch (error: any) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching subjects',
        messageAr: 'حدث خطأ أثناء جلب المواد',
      },
    });
  }
};

/**
 * Get subject by ID
 * GET /api/subjects/:id
 */
export const getSubjectById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id).populate(
      'createdBy',
      'name email'
    );

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

    res.status(200).json({
      success: true,
      data: {
        subject,
      },
    });
  } catch (error: any) {
    console.error('Get subject error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching the subject',
        messageAr: 'حدث خطأ أثناء جلب المادة',
      },
    });
  }
};

/**
 * Create a new subject (admin only)
 * POST /api/subjects
 */
export const createSubject = async (
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

    const { name, nameAr, description, descriptionAr } = req.body;

    // Create subject
    const subject = await Subject.create({
      name,
      nameAr,
      description: description || '',
      descriptionAr: descriptionAr || '',
      createdBy: req.user!.userId,
    });

    // Populate creator info
    await subject.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      messageAr: 'تم إنشاء المادة بنجاح',
      data: {
        subject,
      },
    });
  } catch (error: any) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while creating the subject',
        messageAr: 'حدث خطأ أثناء إنشاء المادة',
      },
    });
  }
};

/**
 * Update subject (admin only)
 * PUT /api/subjects/:id
 */
export const updateSubject = async (
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
    const { name, nameAr, description, descriptionAr } = req.body;

    const subject = await Subject.findByIdAndUpdate(
      id,
      {
        name,
        nameAr,
        description,
        descriptionAr,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

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

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      messageAr: 'تم تحديث المادة بنجاح',
      data: {
        subject,
      },
    });
  } catch (error: any) {
    console.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating the subject',
        messageAr: 'حدث خطأ أثناء تحديث المادة',
      },
    });
  }
};

/**
 * Delete subject (admin only)
 * DELETE /api/subjects/:id
 */
export const deleteSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByIdAndDelete(id);

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

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
      messageAr: 'تم حذف المادة بنجاح',
    });
  } catch (error: any) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while deleting the subject',
        messageAr: 'حدث خطأ أثناء حذف المادة',
      },
    });
  }
};
