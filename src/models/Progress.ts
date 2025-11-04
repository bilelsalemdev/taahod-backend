import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  currentPage: number;
  totalPages: number;
  percentComplete: number;
  lastReadAt: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required'],
      index: true,
    },
    currentPage: {
      type: Number,
      required: [true, 'Current page is required'],
      min: [0, 'Current page must be non-negative'],
      default: 0,
    },
    totalPages: {
      type: Number,
      required: [true, 'Total pages is required'],
      min: [1, 'Total pages must be at least 1'],
    },
    percentComplete: {
      type: Number,
      min: [0, 'Percent complete must be between 0 and 100'],
      max: [100, 'Percent complete must be between 0 and 100'],
      default: 0,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
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

// Compound index for efficient queries (one progress per user per book)
progressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

// Index for sorting by last read
progressSchema.index({ userId: 1, lastReadAt: -1 });

// Pre-save middleware to calculate percent complete
progressSchema.pre('save', function (next) {
  if (this.totalPages > 0) {
    this.percentComplete = Math.round((this.currentPage / this.totalPages) * 100);
    // Ensure it doesn't exceed 100%
    if (this.percentComplete > 100) {
      this.percentComplete = 100;
    }
  }
  next();
});

// Validation: currentPage should not exceed totalPages
progressSchema.pre('save', function (next) {
  if (this.currentPage > this.totalPages) {
    next(new Error('Current page cannot exceed total pages'));
  } else {
    next();
  }
});

const Progress = mongoose.model<IProgress>('Progress', progressSchema);

export default Progress;
