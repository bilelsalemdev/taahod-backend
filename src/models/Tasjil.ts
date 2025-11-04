import mongoose, { Document, Schema } from 'mongoose';

export interface ITasjil extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  surah: string;
  ayahRange: string;
  fileUrl: string;
  duration: number;
  uploadedAt: Date;
}

const tasjilSchema = new Schema<ITasjil>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    surah: {
      type: String,
      required: [true, 'Surah name is required'],
      trim: true,
      maxlength: [100, 'Surah name cannot exceed 100 characters'],
    },
    ayahRange: {
      type: String,
      required: [true, 'Ayah range is required'],
      trim: true,
      maxlength: [50, 'Ayah range cannot exceed 50 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [0, 'Duration must be non-negative'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: function (_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Index for efficient user queries
tasjilSchema.index({ userId: 1, uploadedAt: -1 });

const Tasjil = mongoose.model<ITasjil>('Tasjil', tasjilSchema);

export default Tasjil;
