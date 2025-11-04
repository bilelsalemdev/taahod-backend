import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: [true, 'Day of week is required'],
      min: [0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'],
      max: [6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient user schedule queries
scheduleSchema.index({ userId: 1, dayOfWeek: 1 });
scheduleSchema.index({ userId: 1, subjectId: 1 });

// Pre-save validation: endTime must be after startTime
scheduleSchema.pre('save', function (next) {
  const [startHour, startMin] = this.startTime.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (endMinutes <= startMinutes) {
    next(new Error('End time must be after start time'));
  } else {
    // Calculate duration in minutes
    this.duration = endMinutes - startMinutes;
    next();
  }
});

const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema);

export default Schedule;
