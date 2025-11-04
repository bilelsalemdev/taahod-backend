import mongoose, { Document, Schema } from 'mongoose';

export interface IAdhkar extends Document {
  titleAr: string;
  textAr: string;
  transliteration: string;
  translation: string;
  category: string;
  timeOfDay: string;
  repetitions: number;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const adhkarSchema = new Schema<IAdhkar>(
  {
    titleAr: {
      type: String,
      required: [true, 'Arabic title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    textAr: {
      type: String,
      required: [true, 'Arabic text is required'],
      trim: true,
      maxlength: [5000, 'Text cannot exceed 5000 characters'],
    },
    transliteration: {
      type: String,
      trim: true,
      maxlength: [5000, 'Transliteration cannot exceed 5000 characters'],
      default: '',
    },
    translation: {
      type: String,
      trim: true,
      maxlength: [5000, 'Translation cannot exceed 5000 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'morning',
        'evening',
        'sleep',
        'prayer',
        'general',
        'travel',
        'food',
        'other',
      ],
      index: true,
    },
    timeOfDay: {
      type: String,
      trim: true,
      enum: ['morning', 'evening', 'night', 'anytime', ''],
      default: 'anytime',
      index: true,
    },
    repetitions: {
      type: Number,
      default: 1,
      min: [1, 'Repetitions must be at least 1'],
    },
    source: {
      type: String,
      trim: true,
      maxlength: [500, 'Source cannot exceed 500 characters'],
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

// Indexes for efficient queries
adhkarSchema.index({ category: 1, timeOfDay: 1 });
adhkarSchema.index({ titleAr: 'text', textAr: 'text' });

const Adhkar = mongoose.model<IAdhkar>('Adhkar', adhkarSchema);

export default Adhkar;
