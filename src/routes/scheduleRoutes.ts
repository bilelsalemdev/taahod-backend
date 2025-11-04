import { Router } from 'express';
import { body } from 'express-validator';
import {
  getUserSchedule,
  generateSchedule,
  updateScheduleEntry,
  deleteScheduleEntry,
} from '../controllers/scheduleController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All schedule routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/schedule
 * @desc    Get user's schedule
 * @access  Private
 */
router.get('/', getUserSchedule);

/**
 * @route   POST /api/schedule/generate
 * @desc    Generate schedule from selected subjects
 * @access  Private
 */
router.post(
  '/generate',
  [
    body('subjectIds')
      .isArray({ min: 1 })
      .withMessage('At least one subject must be selected'),
    body('subjectIds.*')
      .isMongoId()
      .withMessage('Valid subject IDs are required'),
    body('dailyStudyHours')
      .optional()
      .isFloat({ min: 0.5, max: 12 })
      .withMessage('Daily study hours must be between 0.5 and 12'),
    body('preferredStartTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Start time must be in HH:MM format'),
    body('daysPerWeek')
      .optional()
      .isArray()
      .withMessage('Days per week must be an array'),
    body('daysPerWeek.*')
      .optional()
      .isInt({ min: 0, max: 6 })
      .withMessage('Day of week must be between 0 and 6'),
    body('replaceExisting')
      .optional()
      .isBoolean()
      .withMessage('Replace existing must be a boolean'),
  ],
  generateSchedule
);

/**
 * @route   PUT /api/schedule/:id
 * @desc    Update schedule entry
 * @access  Private
 */
router.put(
  '/:id',
  [
    body('subjectId')
      .optional()
      .isMongoId()
      .withMessage('Valid subject ID is required'),
    body('dayOfWeek')
      .optional()
      .isInt({ min: 0, max: 6 })
      .withMessage('Day of week must be between 0 and 6'),
    body('startTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Start time must be in HH:MM format'),
    body('endTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('End time must be in HH:MM format'),
  ],
  updateScheduleEntry
);

/**
 * @route   DELETE /api/schedule/:id
 * @desc    Delete schedule entry
 * @access  Private
 */
router.delete('/:id', deleteScheduleEntry);

export default router;
