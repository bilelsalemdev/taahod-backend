import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Schedule from '../models/Schedule';
import Subject from '../models/Subject';
import {
  generateBalancedSchedule,
  validateSchedule,
} from '../utils/scheduleGenerator';

/**
 * Get user's schedule
 * GET /api/schedule
 */
export const getUserSchedule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const schedule = await Schedule.find({ userId })
      .populate('subjectId', 'name nameAr description descriptionAr')
      .sort({ dayOfWeek: 1, startTime: 1 });

    // Group by day of week
    const scheduleByDay: { [key: number]: any[] } = {};
    schedule.forEach((entry) => {
      if (!scheduleByDay[entry.dayOfWeek]) {
        scheduleByDay[entry.dayOfWeek] = [];
      }
      scheduleByDay[entry.dayOfWeek].push(entry);
    });

    res.status(200).json({
      success: true,
      data: {
        schedule,
        scheduleByDay,
        count: schedule.length,
      },
    });
  } catch (error: any) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching schedule',
        messageAr: 'حدث خطأ أثناء جلب الجدول',
      },
    });
  }
};

/**
 * Generate schedule from selected subjects
 * POST /api/schedule/generate
 */
export const generateSchedule = async (
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

    const userId = req.user!.userId;
    const {
      subjectIds,
      dailyStudyHours,
      preferredStartTime,
      daysPerWeek,
      replaceExisting,
    } = req.body;

    // Verify all subjects exist
    const subjects = await Subject.find({ _id: { $in: subjectIds } });
    if (subjects.length !== subjectIds.length) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SUBJECT_NOT_FOUND',
          message: 'One or more subjects not found',
          messageAr: 'لم يتم العثور على مادة واحدة أو أكثر',
        },
      });
      return;
    }

    // Generate schedule
    let generatedEntries;
    try {
      generatedEntries = generateBalancedSchedule({
        subjectIds,
        dailyStudyHours,
        preferredStartTime,
        daysPerWeek,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: error.message,
          messageAr: 'خطأ في إنشاء الجدول',
        },
      });
      return;
    }

    // Validate generated schedule
    const validation = validateSchedule(generatedEntries);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SCHEDULE_CONFLICT',
          message: 'Generated schedule has conflicts',
          messageAr: 'الجدول المُنشأ يحتوي على تعارضات',
          details: validation.conflicts,
        },
      });
      return;
    }

    // Delete existing schedule if requested
    if (replaceExisting) {
      await Schedule.deleteMany({ userId });
    }

    // Create schedule entries
    const scheduleEntries = generatedEntries.map((entry) => ({
      userId,
      subjectId: entry.subjectId,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      duration: entry.duration,
      isCustom: false,
    }));

    const createdSchedule = await Schedule.insertMany(scheduleEntries);

    // Populate subject details
    const populatedSchedule = await Schedule.find({
      _id: { $in: createdSchedule.map((s) => s._id) },
    }).populate('subjectId', 'name nameAr');

    res.status(201).json({
      success: true,
      message: 'Schedule generated successfully',
      messageAr: 'تم إنشاء الجدول بنجاح',
      data: {
        schedule: populatedSchedule,
        count: populatedSchedule.length,
      },
    });
  } catch (error: any) {
    console.error('Generate schedule error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while generating schedule',
        messageAr: 'حدث خطأ أثناء إنشاء الجدول',
      },
    });
  }
};

/**
 * Update schedule entry
 * PUT /api/schedule/:id
 */
export const updateScheduleEntry = async (
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

    const userId = req.user!.userId;
    const { id } = req.params;
    const { subjectId, dayOfWeek, startTime, endTime } = req.body;

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

    // Find and verify ownership
    const scheduleEntry = await Schedule.findOne({ _id: id, userId });
    if (!scheduleEntry) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SCHEDULE_NOT_FOUND',
          message: 'Schedule entry not found',
          messageAr: 'إدخال الجدول غير موجود',
        },
      });
      return;
    }

    // Update fields
    if (subjectId) scheduleEntry.subjectId = subjectId;
    if (dayOfWeek !== undefined) scheduleEntry.dayOfWeek = dayOfWeek;
    if (startTime) scheduleEntry.startTime = startTime;
    if (endTime) scheduleEntry.endTime = endTime;
    scheduleEntry.isCustom = true;

    await scheduleEntry.save();
    await scheduleEntry.populate('subjectId', 'name nameAr');

    res.status(200).json({
      success: true,
      message: 'Schedule entry updated successfully',
      messageAr: 'تم تحديث إدخال الجدول بنجاح',
      data: {
        schedule: scheduleEntry,
      },
    });
  } catch (error: any) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating schedule',
        messageAr: 'حدث خطأ أثناء تحديث الجدول',
      },
    });
  }
};

/**
 * Delete schedule entry
 * DELETE /api/schedule/:id
 */
export const deleteScheduleEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const scheduleEntry = await Schedule.findOneAndDelete({ _id: id, userId });

    if (!scheduleEntry) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SCHEDULE_NOT_FOUND',
          message: 'Schedule entry not found',
          messageAr: 'إدخال الجدول غير موجود',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Schedule entry deleted successfully',
      messageAr: 'تم حذف إدخال الجدول بنجاح',
    });
  } catch (error: any) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while deleting schedule entry',
        messageAr: 'حدث خطأ أثناء حذف إدخال الجدول',
      },
    });
  }
};
