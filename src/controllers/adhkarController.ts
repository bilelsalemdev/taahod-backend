import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Adhkar from '../models/Adhkar';

/**
 * Get all adhkar
 * GET /api/adhkar
 */
export const getAllAdhkar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category, timeOfDay, search } = req.query;
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (timeOfDay) {
      filter.timeOfDay = timeOfDay;
    }

    let query = Adhkar.find(filter);

    // Text search if provided
    if (search) {
      query = Adhkar.find({
        $text: { $search: search as string },
        ...filter,
      });
    }

    const adhkar = await query.sort({ category: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        adhkar,
        count: adhkar.length,
      },
    });
  } catch (error: any) {
    console.error('Get adhkar error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching adhkar',
        messageAr: 'حدث خطأ أثناء جلب الأذكار',
      },
    });
  }
};

/**
 * Get adhkar by ID
 * GET /api/adhkar/:id
 */
export const getAdhkarById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const adhkar = await Adhkar.findById(id);

    if (!adhkar) {
      res.status(404).json({
        success: false,
        error: {
          code: 'ADHKAR_NOT_FOUND',
          message: 'Adhkar not found',
          messageAr: 'الذكر غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        adhkar,
      },
    });
  } catch (error: any) {
    console.error('Get adhkar error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching the adhkar',
        messageAr: 'حدث خطأ أثناء جلب الذكر',
      },
    });
  }
};

/**
 * Get adhkar by category
 * GET /api/adhkar/category/:category
 */
export const getAdhkarByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category } = req.params;

    const adhkar = await Adhkar.find({ category }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        category,
        adhkar,
        count: adhkar.length,
      },
    });
  } catch (error: any) {
    console.error('Get adhkar by category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching adhkar',
        messageAr: 'حدث خطأ أثناء جلب الأذكار',
      },
    });
  }
};

/**
 * Create new adhkar (admin only)
 * POST /api/adhkar
 */
export const createAdhkar = async (
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

    const {
      titleAr,
      textAr,
      transliteration,
      translation,
      category,
      timeOfDay,
      repetitions,
      source,
    } = req.body;

    const adhkar = await Adhkar.create({
      titleAr,
      textAr,
      transliteration: transliteration || '',
      translation: translation || '',
      category,
      timeOfDay: timeOfDay || 'anytime',
      repetitions: repetitions || 1,
      source: source || '',
    });

    res.status(201).json({
      success: true,
      message: 'Adhkar created successfully',
      messageAr: 'تم إنشاء الذكر بنجاح',
      data: {
        adhkar,
      },
    });
  } catch (error: any) {
    console.error('Create adhkar error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while creating adhkar',
        messageAr: 'حدث خطأ أثناء إنشاء الذكر',
      },
    });
  }
};

/**
 * Update adhkar (admin only)
 * PUT /api/adhkar/:id
 */
export const updateAdhkar = async (
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
      titleAr,
      textAr,
      transliteration,
      translation,
      category,
      timeOfDay,
      repetitions,
      source,
    } = req.body;

    const adhkar = await Adhkar.findByIdAndUpdate(
      id,
      {
        titleAr,
        textAr,
        transliteration,
        translation,
        category,
        timeOfDay,
        repetitions,
        source,
      },
      { new: true, runValidators: true }
    );

    if (!adhkar) {
      res.status(404).json({
        success: false,
        error: {
          code: 'ADHKAR_NOT_FOUND',
          message: 'Adhkar not found',
          messageAr: 'الذكر غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Adhkar updated successfully',
      messageAr: 'تم تحديث الذكر بنجاح',
      data: {
        adhkar,
      },
    });
  } catch (error: any) {
    console.error('Update adhkar error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating adhkar',
        messageAr: 'حدث خطأ أثناء تحديث الذكر',
      },
    });
  }
};
