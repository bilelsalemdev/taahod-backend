import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  titleAr: string;
  author: string;
  authorAr: string;
  description: string;
  descriptionAr: string;
  subjectId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  totalPages: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      minlength: [2, 'Book title must be at least 2 characters long'],
      maxlength: [300, 'Book title cannot exceed 300 characters'],
    },
    titleAr: {
      type: String,
      required: [true, 'Arabic book title is required'],
      trim: true,
      minlength: [2, 'Arabic book title must be at least 2 characters long'],
      maxlength: [300, 'Arabic book title cannot exceed 300 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [200, 'Author name cannot exceed 200 characters'],
    },
    authorAr: {
      type: String,
      required: [true, 'Arabic author name is required'],
      trim: true,
      maxlength: [200, 'Arabic author name cannot exceed 200 characters'],
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
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      enum: ['application/pdf', 'application/epub+zip', 'text/plain'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size must be positive'],
    },
    totalPages: {
      type: Number,
      default: 0,
      min: [0, 'Total pages must be positive'],
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
bookSchema.index({ title: 1 });
bookSchema.index({ titleAr: 1 });
bookSchema.index({ subjectId: 1, createdAt: -1 });

const Book = mongoose.model<IBook>('Book', bookSchema);

export default Book;
