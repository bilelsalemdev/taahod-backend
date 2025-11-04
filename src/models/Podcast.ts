import mongoose, { Document, Schema } from 'mongoose';

export interface IPodcast extends Document {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  speaker: string;
  fileUrl: string;
  duration: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const podcastSchema = new Schema<IPodcast>(
  {
    title: {
      type: String,
      required: [true, 'Podcast title is required'],
      trim: true,
      minlength: [2, 'Podcast title must be at least 2 characters long'],
      maxlength: [300, 'Podcast title cannot exceed 300 characters'],
    },
    titleAr: {
      type: String,
      required: [true, 'Arabic podcast title is required'],
      trim: true,
      minlength: [2, 'Arabic podcast title must be at least 2 characters long'],
      maxlength: [300, 'Arabic podcast title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    descriptionAr: {
      type: String,
      trim: true,
      maxlength: [2000, 'Arabic description cannot exceed 2000 characters'],
      default: '',
    },
    speaker: {
      type: String,
      required: [true, 'Speaker name is required'],
      trim: true,
      maxlength: [200, 'Speaker name cannot exceed 200 characters'],
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
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
      index: true,
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
podcastSchema.index({ title: 1 });
podcastSchema.index({ titleAr: 1 });
podcastSchema.index({ createdAt: -1 });

const Podcast = mongoose.model<IPodcast>('Podcast', podcastSchema);

export default Podcast;
