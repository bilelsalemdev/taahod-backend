import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      minlength: [2, 'Subject name must be at least 2 characters long'],
      maxlength: [200, 'Subject name cannot exceed 200 characters'],
    },
    nameAr: {
      type: String,
      required: [true, 'Arabic subject name is required'],
      trim: true,
      minlength: [2, 'Arabic subject name must be at least 2 characters long'],
      maxlength: [200, 'Arabic subject name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    descriptionAr: {
      type: String,
      trim: true,
      maxlength: [1000, 'Arabic description cannot exceed 1000 characters'],
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
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

// Index for efficient queries
subjectSchema.index({ name: 1 });
subjectSchema.index({ nameAr: 1 });

const Subject = mongoose.model<ISubject>('Subject', subjectSchema);

export default Subject;
