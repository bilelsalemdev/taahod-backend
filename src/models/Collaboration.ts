import mongoose, { Document, Schema } from 'mongoose';

export interface ICollaboration extends Document {
  name: string;
  bookId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  targetCompletionDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const collaborationSchema = new Schema<ICollaboration>(
  {
    name: {
      type: String,
      required: [true, 'Collaboration name is required'],
      trim: true,
      minlength: [2, 'Collaboration name must be at least 2 characters long'],
      maxlength: [200, 'Collaboration name cannot exceed 200 characters'],
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book is required'],
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    targetCompletionDate: {
      type: Date,
      required: [true, 'Target completion date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
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
collaborationSchema.index({ creatorId: 1, isActive: 1 });
collaborationSchema.index({ participants: 1, isActive: 1 });
collaborationSchema.index({ bookId: 1 });

// Pre-save middleware to ensure creator is in participants
collaborationSchema.pre('save', function (next) {
  if (this.isNew) {
    // Add creator to participants if not already there
    const creatorIdStr = this.creatorId.toString();
    const hasCreator = this.participants.some(
      (p) => p.toString() === creatorIdStr
    );
    
    if (!hasCreator) {
      this.participants.push(this.creatorId);
    }
  }
  next();
});

const Collaboration = mongoose.model<ICollaboration>(
  'Collaboration',
  collaborationSchema
);

export default Collaboration;
